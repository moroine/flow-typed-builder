// @flow

import generate from '@babel/generator';
import { parse } from '@babel/parser';
import { emptyStatement, file, interfaceDeclaration, numberTypeAnnotation, objectTypeAnnotation, objectTypeProperty, program, stringTypeAnnotation } from '@babel/types';
import type { FlowType, InterfaceDeclaration, ObjectTypeAnnotation, ObjectTypeProperty, Program, Statement, TSInterfaceBody, TSInterfaceDeclaration, TSPropertySignature, TSTypeAnnotation, TSTypeElement } from '@babel/types';

function transformTSTypeAnnotation(input: TSTypeAnnotation): FlowType {
  switch (input.typeAnnotation.type) {
    case 'TSStringKeyword':
      return stringTypeAnnotation();
    case 'TSNumberKeyword':
      return numberTypeAnnotation();
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
    default: {
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

export function hello(): string {
  const typescriptAst = parse(`interface Person {
    firstName: string;
    lastName: string;
    age: number;
};`, { plugins: ['typescript'], tokens: true });

  const flowAst = file(
    transformProgram(typescriptAst.program),
  );

  const { code } = generate(flowAst);

  return code;
}
