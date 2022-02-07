// @flow

import generate from '@babel/generator';
import { parse } from '@babel/parser';
import {
  anyTypeAnnotation,
  booleanLiteralTypeAnnotation,
  stringLiteralTypeAnnotation,
  booleanTypeAnnotation,
  numberLiteralTypeAnnotation,
  emptyStatement,
  file,
  interfaceDeclaration,
  mixedTypeAnnotation,
  nullLiteralTypeAnnotation,
  numberTypeAnnotation,
  numericLiteral,
  objectTypeAnnotation,
  objectTypeProperty,
  program,
  stringTypeAnnotation,
  typeAlias,
  typeParameter,
  typeParameterDeclaration,
  voidTypeAnnotation,
  emptyTypeAnnotation,
  symbolTypeAnnotation,
} from "@babel/types";
import type { FlowType,TSLiteralType, Literal, InterfaceDeclaration, ObjectTypeAnnotation, ObjectTypeProperty, Program, Statement, TSInterfaceBody, TSInterfaceDeclaration, TSType, TSTypeAliasDeclaration, TSTypeAnnotation, TSTypeElement, TSTypeParameter, TSTypeParameterDeclaration, TypeAlias, TypeParameter, TypeParameterDeclaration } from '@babel/types';

function transformTSTypeAnnotation(input: TSTypeAnnotation): FlowType {
  switch (input.typeAnnotation.type) {
    case 'TSStringKeyword':
      return stringTypeAnnotation();
    case 'TSNumberKeyword':
      return numberTypeAnnotation();
    case 'TSVoidKeyword':
      return voidTypeAnnotation();
    case 'TSAnyKeyword':
      return mixedTypeAnnotation();
    case 'TSBooleanKeyword':
      return booleanTypeAnnotation();
    case 'TSNullKeyword':
      return nullLiteralTypeAnnotation();
    case 'TSUndefinedKeyword':
      return voidTypeAnnotation();
    case 'TSObjectKeyword': {
      const t = objectTypeAnnotation([], null, null, null, false);
      t.inexact = true;
      return t;
    }
    case 'TSLiteralType': {
      switch (input.typeAnnotation.literal.type) {
        case 'NumericLiteral':
          return numberLiteralTypeAnnotation(input.typeAnnotation.literal.value);
        case 'BooleanLiteral':
          return booleanLiteralTypeAnnotation(input.typeAnnotation.literal.value);
        case 'StringLiteral':
          return stringLiteralTypeAnnotation(input.typeAnnotation.literal.value);
        default: {
          throw new Error(`transformTSTypeAnnotation/TSLiteralType: not supported ${input.typeAnnotation.literal.type}`);
        }
      }
    }
    case 'TSNeverKeyword': 
      return emptyTypeAnnotation();
    case 'TSUnknownKeyword': 
      return mixedTypeAnnotation();
    case 'TSSymbolKeyword': 
      return symbolTypeAnnotation();
    default: {
      throw new Error(`transformTSTypeAnnotation: not supported ${input.typeAnnotation.type}`);
    }
  }
}

function transformTSTypeElement(input: TSTypeElement): ObjectTypeProperty {
  switch (input.type) {
    case 'TSPropertySignature': {
      if (input.key.type !== 'Identifier') {
        throw new Error(`transformTSTypeElement: TSPropertySignature not supported key ${input.key.type}`);
      }

      if (input.typeAnnotation === null) {
        throw new Error('transformTSTypeElement: TSPropertySignature not supported empty typeAnnotation');
      }

      return objectTypeProperty(
        input.key,
        transformTSTypeAnnotation(input.typeAnnotation),
      );
    }
    default: {
      throw new Error('not supported');
    }
  }
}

function transformTSInterfaceBody(input: TSInterfaceBody): ObjectTypeAnnotation {
  return objectTypeAnnotation(
    input.body.map(transformTSTypeElement),
  );
}

function transformTsType(input: TSType): FlowType {
  switch (input.type) {
    case 'TSTypeLiteral':
      return objectTypeAnnotation(
        input.members.map(transformTSTypeElement),
        null,
        null,
        null,
        true,
      );
    default: {
      console.log(`transformTsType: not supported ${input.type}`, input);
      // eslint-disable-next-line no-unused-vars
      const n: empty = input.type;
      return anyTypeAnnotation();
    }
  }
}

function transformTSTypeParameter(input: TSTypeParameter): TypeParameter {
  return typeParameter(
    null, // todo: support constraints
    input.default == null ? null : transformTsType(input.default),
    null,
  );
}

function transformTSTypeParameterDeclaration(
  input: TSTypeParameterDeclaration,
): TypeParameterDeclaration {
  return typeParameterDeclaration(
    input.params.map(transformTSTypeParameter),
  );
}

function transformTSTypeAliasDeclaration(input: TSTypeAliasDeclaration): TypeAlias {
  return typeAlias(
    input.id,
    input.typeParameters == null
      ? null
      : transformTSTypeParameterDeclaration(input.typeParameters),
    transformTsType(input.typeAnnotation),
  );
}

function transformInterfaceDeclaration(input: TSInterfaceDeclaration): InterfaceDeclaration {
  return interfaceDeclaration(
    input.id,
    null,
    null,
    transformTSInterfaceBody(input.body),
  );
}

function transformStatement(input: Statement): Statement {
  switch (input.type) {
    case 'TSInterfaceDeclaration':
      return transformInterfaceDeclaration(input);
    case 'TSTypeAliasDeclaration':
      return transformTSTypeAliasDeclaration(input);
    case 'EmptyStatement':
      return input;
    default: {
      console.log(`transformStatement: not supported ${input.type}`);
      // eslint-disable-next-line no-unused-vars
      const n: empty = input.type;
      return emptyStatement();
    }
  }
}

function transformProgram(input: Program): Program {
  return program(
    input.body.map(transformStatement),
  );
}

export function tsToFlow(input: string): string {
  const typescriptAst = parse(input, { plugins: ['typescript'], tokens: true });

  const flowAst = file(
    transformProgram(typescriptAst.program),
  );

  const { code } = generate(flowAst, { jsescOption: { compact: false } });

  return code;
}
