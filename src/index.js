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
  isTSTypeAnnotation,
  variance,
  tupleExpression,
  tupleTypeAnnotation,
  genericTypeAnnotation,
  identifier,
  typeParameterInstantiation,
  arrayTypeAnnotation,
} from "@babel/types";
import type { FlowType,TSLiteralType, Literal, InterfaceDeclaration, ObjectTypeAnnotation, ObjectTypeProperty, Program, Statement, TSInterfaceBody, TSInterfaceDeclaration, TSType, TSTypeAliasDeclaration, TSTypeAnnotation, TSTypeElement, TSTypeParameter, TSTypeParameterDeclaration, TypeAlias, TypeParameter, TypeParameterDeclaration } from '@babel/types';

type Context = {|
  readOnly?: boolean,
|};

function transformTSTypeAnnotation(input: TSTypeAnnotation): FlowType {
  return transformTsType(input.typeAnnotation);
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
        input.readonly === true ? variance("plus") : null,
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

function transformTsType(input: TSType, ctx?: Context = {...null}): FlowType {
  switch (input.type) {
    case 'TSTypeLiteral':
      return objectTypeAnnotation(
        input.members.map(transformTSTypeElement),
        null,
        null,
        null,
        true,
      );
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

      if (ctx.readOnly === true) {
        return genericTypeAnnotation(
          identifier('$ReadOnly'),
          typeParameterInstantiation([t]),
        );
      }

      return t;
    }
    case 'TSLiteralType': {
      switch (input.literal.type) {
        case 'NumericLiteral':
          return numberLiteralTypeAnnotation(input.literal.value);
        case 'BooleanLiteral':
          return booleanLiteralTypeAnnotation(input.literal.value);
        case 'StringLiteral':
          return stringLiteralTypeAnnotation(input.literal.value);
        case 'UnaryExpression': {
          const exp = input.literal;
          if (exp.argument.type !== 'NumericLiteral' || exp.operator !== '-') {
            throw new Error(`transformTSTypeAnnotation/TSLiteralType/UnaryExpression: not supported ${exp.operator} ${exp.argument.type}`);
          }
          return numberLiteralTypeAnnotation(- exp.argument.value);
        }
        default: {
          throw new Error(`transformTSTypeAnnotation/TSLiteralType: not supported ${input.literal.type}`);
        }
      }
    }
    case 'TSNeverKeyword': 
      return emptyTypeAnnotation();
    case 'TSUnknownKeyword': 
      return mixedTypeAnnotation();
    case 'TSSymbolKeyword': 
      return symbolTypeAnnotation();
    case 'TSTypeOperator': {
      switch (input.operator) {
        case 'unique':
          return transformTsType(input.typeAnnotation);
        case 'readonly':
          return transformTsType(input.typeAnnotation, { readOnly: true })
        default:
          throw new Error(`transformTSTypeAnnotation/TSTypeOperator: not supported ${input.operator}`);
      }
    }
    case 'TSTupleType': {
      return tupleTypeAnnotation(input.elementTypes.map(el => transformTsType(
        el.type === 'TSNamedTupleMember'
          ? el.elementType
          : el,
      )));
    }
    case 'TSArrayType': {
      if (ctx.readOnly === true) {
        return genericTypeAnnotation(
          identifier('$ReadOnlyArray'),
          typeParameterInstantiation(
            [transformTsType(input.elementType)],
          ),
        );
      }

      return arrayTypeAnnotation(transformTsType(input.elementType));
    }
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
