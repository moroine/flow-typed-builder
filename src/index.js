// @flow

/* eslint-disable no-use-before-define, no-console */

import generate from '@babel/generator';
import { parse } from '@babel/parser';
import type { ArrayPattern,
  ArrayTypeAnnotation,
  ClassBody,
  DeclareInterface,
  Expression,
  FlowType,
  FunctionTypeAnnotation,
  FunctionTypeParam,
  Identifier,
  InterfaceDeclaration,
  InterfaceExtends,
  ObjectPattern,
  ObjectProperty,
  ObjectTypeAnnotation,
  ObjectTypeCallProperty,
  ObjectTypeIndexer,
  ObjectTypeProperty,
  ObjectTypeSpreadProperty,
  PatternLike,
  Program,
  QualifiedTypeIdentifier,
  RestElement,
  Statement,
  TSCallSignatureDeclaration,
  TSConstructSignatureDeclaration,
  TSEntityName,
  TSExpressionWithTypeArguments,
  TSIndexSignature,
  TSInterfaceBody,
  TSInterfaceDeclaration,
  TSLiteralType,
  TSMethodSignature,
  TSType,
  TSTypeAliasDeclaration,
  TSTypeAnnotation,
  TSTypeElement,
  TSTypeParameter,
  TSTypeParameterDeclaration,
  TSTypeParameterInstantiation,
  TypeAlias,
  TypeAnnotation,
  TypeParameter,
  TypeParameterDeclaration,
  TypeParameterInstantiation,
  VariableDeclarator } from '@babel/types';
import { anyTypeAnnotation, arrayTypeAnnotation,
  booleanLiteralTypeAnnotation,
  booleanTypeAnnotation,
  classBody,
  classDeclaration,
  classMethod,
  declareInterface,
  declareVariable,
  emptyStatement,
  emptyTypeAnnotation,
  file,
  functionTypeAnnotation,
  functionTypeParam,
  genericTypeAnnotation,
  identifier,
  interfaceDeclaration,
  interfaceExtends,
  mixedTypeAnnotation,
  nullLiteralTypeAnnotation,
  numberLiteralTypeAnnotation,
  numberTypeAnnotation,
  objectTypeAnnotation,
  objectTypeCallProperty,
  objectTypeIndexer,
  objectTypeProperty,
  objectTypeSpreadProperty,
  program,
  qualifiedTypeIdentifier,
  stringLiteralTypeAnnotation,
  stringTypeAnnotation,
  symbolTypeAnnotation,
  tupleTypeAnnotation,
  typeAlias,
  typeAnnotation,
  typeParameter,
  typeParameterDeclaration,
  typeParameterInstantiation,
  unionTypeAnnotation,
  variableDeclaration,
  variableDeclarator,
  variance,
  voidTypeAnnotation } from '@babel/types';

type TransformTypeContext = {|
  readOnly?: boolean,
|};

type TransformContext = {|
  interfaces: { [key: string]: DeclareInterface | InterfaceDeclaration, ... },
|};

function transformTSTypeAnnotation(input: TSTypeAnnotation | TypeAnnotation): FlowType {
  if (input.type === 'TypeAnnotation') {
    return input.typeAnnotation;
  }

  return transformTsType(input.typeAnnotation);
}

function transformTSTypeElement(input: TSTypeElement): ObjectTypeProperty {
  switch (input.type) {
    case 'TSPropertySignature': {
      if (input.key.type !== 'Identifier' && input.key.type !== 'StringLiteral') {
        throw new Error(`transformTSTypeElement: TSPropertySignature not supported key ${input.key.type}`);
      }

      if (input.typeAnnotation === null) {
        throw new Error('transformTSTypeElement: TSPropertySignature not supported empty typeAnnotation');
      }

      return objectTypeProperty(
        input.key,
        transformTSTypeAnnotation(input.typeAnnotation),
        input.readonly === true ? variance('plus') : null,
      );
    }
    case 'TSMethodSignature': {
      if (input.key.type !== 'Identifier' && input.key.type !== 'StringLiteral') {
        throw new Error(`transformTSTypeElement: TSMethodSignature not supported key ${input.key.type}`);
      }

      const prop = objectTypeProperty(
        input.key,
        transformFunctionTypeAnnotation(
          input,
        ),
        null,
      );

      if (input.optional === true) {
        prop.optional = true;
      } else {
        prop.method = true;
      }

      return prop;
    }
    case 'TSConstructSignatureDeclaration': {
      if (input.typeAnnotation === null) {
        throw new Error('transformTSTypeElement: TSConstructSignatureDeclaration not supported empty typeAnnotation');
      }

      const prop = objectTypeProperty(
        identifier('constructor'),
        transformFunctionTypeAnnotation(
          input,
        ),
        null,
      );
      prop.method = true;

      return prop;
    }
    default: {
      throw new Error(`[transformTSTypeElement]: not supported ${input.type}`);
    }
  }
}

function transformTSIndexSignature(input: TSIndexSignature): ObjectTypeIndexer {
  if (input.parameters.length !== 1) {
    throw new Error('[transformTSTypeElement]: TSIndexSignature supports only identifiers');
  }
  const [id] = input.parameters;
  if (id === null && id.type !== 'Identifier') {
    throw new Error(`[transformTSTypeElement]: TSIndexSignature non-identifier not supported ${id.type}`);
  }

  if (id.typeAnnotation === null) {
    throw new Error('[transformTSTypeElement]: TSIndexSignature not supported empty typeAnnotation');
  }

  if (id.typeAnnotation.type !== 'TSTypeAnnotation') {
    throw new Error(`[transformTSTypeElement]: TSIndexSignature not supported typeAnnotation ${id.typeAnnotation.type}`);
  }

  const key = transformTSTypeAnnotation(id.typeAnnotation);

  if (input.typeAnnotation == null || input.typeAnnotation.type === 'Noop') {
    throw new Error('[transformTSTypeElement]: TSIndexSignature not supported empty typeAnnotation');
  }
  const value = transformTSTypeAnnotation(input.typeAnnotation);

  return objectTypeIndexer(id, key, value, null);
}

function transformRestElement(input: RestElement): FunctionTypeParam {
  if (input.argument != null && input.argument.type !== 'Identifier') {
    throw new Error(`[transformRestElement]: not supported ${input.argument.type}`);
  }

  if (input.typeAnnotation == null || input.typeAnnotation.type === 'Noop') {
    throw new Error('[transformRestElement]: not supported typeAnnotation');
  }

  const p = functionTypeParam(
    input.argument,
    transformTSTypeAnnotation(input.typeAnnotation),
  );

  if (input.optional === true) {
    p.optional = true;
  }

  return p;
}

function transformObjectProperties(
  input: Array<ObjectProperty | RestElement>,
): Array<ObjectTypeProperty | ObjectTypeSpreadProperty> {
  return input.map((p) => {
    if (p.type === 'ObjectProperty') {
      if (p.key.type !== 'Identifier' && p.key.type !== 'StringLiteral') {
        throw new Error(`transformObjectProperties: ObjectProperty not supported key ${p.key.type}`);
      }

      if (p.value.type !== 'NumericLiteral' || p.value.type !== 'StringLiteral') {
        throw new Error(`transformObjectProperties: ObjectProperty not supported value ${p.value.type}`);
      }

      return objectTypeProperty(
        p.key,
        transformTSLiteralTypeElement(p.value),
        null,
      );
    }

    if (p.type === 'RestElement') {
      return objectTypeSpreadProperty(
        transformRestElement(p).typeAnnotation,
      );
    }

    throw new Error(`[transformObjectProperties]: not supported ${p.type}`);
  });
}

function transformArrayPattern(input: ArrayPattern): FunctionTypeParam {
  const p = functionTypeParam(
    null,
    input.typeAnnotation == null || input.typeAnnotation.type !== 'TSTypeAnnotation'
      ? tupleTypeAnnotation(input.elements.map(transformPatternLike))
      : transformTSTypeAnnotation(input.typeAnnotation),
  );
  if (input.optional === true) {
    p.optional = true;
  }

  return p;
}

function transformObjectPattern(input: ObjectPattern): FunctionTypeParam {
  const p = functionTypeParam(
    null,
    input.typeAnnotation == null || input.typeAnnotation.type === 'Noop'
      ? objectTypeAnnotation(transformObjectProperties(input.properties))
      : transformTSTypeAnnotation(input.typeAnnotation),
  );

  return p;
}

function transformPatternLike(input: PatternLike | null): FlowType {
  if (input === null) {
    return nullLiteralTypeAnnotation();
  }

  switch (input.type) {
    case 'ArrayPattern':
      return transformArrayPattern(input).typeAnnotation;
    case 'ObjectPattern':
      return transformObjectPattern(input).typeAnnotation;
    case 'RestElement':
      return transformRestElement(input).typeAnnotation;
    default: {
      throw new Error(`[transformPatternLike]: not supported ${input.type}`);
    }
  }
}

function transformFunctionTypeAnnotation(
  input: TSCallSignatureDeclaration | TSConstructSignatureDeclaration | TSMethodSignature,
): FunctionTypeAnnotation {
  if (input.typeAnnotation == null) {
    throw new Error('transformFunctionTypeAnnotation: TSCallSignatureDeclaration not supported empty typeAnnotation');
  }

  const returnType = transformTSTypeAnnotation(input.typeAnnotation);

  const [params, restParams] = input.parameters.reduce(
    (acc, param) => {
      if (param.type === 'Identifier') {
        acc[0].push(param);
      } else if (param.type === 'ObjectPattern') {
        acc[0].push(param);
      } else if (param.type === 'ArrayPattern') {
        acc[0].push(param);
      } else if (param.type === 'RestElement') {
        acc[1].push(param);
      } else {
        console.log(
          `[transformFunctionTypeAnnotation]: not supported param type ${param.type}`,
          param,
        );
      }

      return acc;
    },
    [[], []],
  );

  const paramsList = params.map((param) => {
    if (param.type === 'ObjectPattern') {
      const p = functionTypeParam(
        null,
        param.typeAnnotation == null || param.typeAnnotation.type === 'Noop'
          ? objectTypeAnnotation(transformObjectProperties(param.properties))
          : transformTSTypeAnnotation(param.typeAnnotation),
      );

      return p;
    }

    if (param.type === 'ArrayPattern') {
      return transformArrayPattern(param);
    }

    if (param.typeAnnotation == null || param.typeAnnotation.type !== 'TSTypeAnnotation') {
      throw new Error(`[transformFunctionTypeAnnotation]: not supported param type ${param.type}`);
    }

    const p = functionTypeParam(
      param,
      transformTSTypeAnnotation(param.typeAnnotation),
    );
    if (param.optional === true) {
      p.optional = true;
    }

    return p;
  });

  return functionTypeAnnotation(
    input.typeParameters == null
      ? null
      : transformTSTypeParameterDeclaration(input.typeParameters),
    paramsList,
    restParams.length === 0
      ? null
      : transformRestElement(restParams[0]),
    returnType,
  );
}

function transformTSCallSignatureDeclaration(
  input: TSCallSignatureDeclaration,
): ObjectTypeCallProperty {
  return objectTypeCallProperty(
    transformFunctionTypeAnnotation(
      input,
    ),
  );
}

function transformTSInterfaceBody(input: TSInterfaceBody): ObjectTypeAnnotation {
  const [props, indexers, callProps] = input.body.reduce(
    (acc, statement) => {
      switch (statement.type) {
        case 'TSIndexSignature':
          acc[1].push(statement);
          return acc;
        case 'TSCallSignatureDeclaration':
          acc[2].push(statement);
          return acc;
        default:
          acc[0].push(statement);
          return acc;
      }
    },
    [[], [], [], []],
  );

  return objectTypeAnnotation(
    props.map(transformTSTypeElement),
    indexers.length === 0
      ? null
      : indexers.map(transformTSIndexSignature),
    callProps.length === 0
      ? null
      : callProps.map(transformTSCallSignatureDeclaration),
    null,
    false,
  );
}

function transformTSTypeParameterInstantiation(
  input: TSTypeParameterInstantiation,
): TypeParameterInstantiation {
  return typeParameterInstantiation(
    input.params.map(p => transformTsType(p)),
  );
}

function transformTSLiteralTypeElement(input: TSLiteralType['literal']): FlowType {
  switch (input.type) {
    case 'NumericLiteral':
      return numberLiteralTypeAnnotation(input.value);
    case 'BooleanLiteral':
      return booleanLiteralTypeAnnotation(input.value);
    case 'StringLiteral':
      return stringLiteralTypeAnnotation(input.value);
    case 'UnaryExpression': {
      if (input.argument.type !== 'NumericLiteral' || input.operator !== '-') {
        throw new Error(`transformTSLiteralTypeElement/UnaryExpression: not supported ${input.operator} ${input.argument.type}`);
      }
      return numberLiteralTypeAnnotation(-input.argument.value);
    }
    default: {
      throw new Error(`transformTSLiteralTypeElement: not supported ${input.type}`);
    }
  }
}

function transformTsType(input: TSType, ctx?: TransformTypeContext = { ...null }): FlowType {
  switch (input.type) {
    case 'TSTypeLiteral':
      return objectTypeAnnotation(
        input.members.map(transformTSTypeElement),
        null,
        null,
        null,
        false,
      );
    case 'TSStringKeyword':
      return stringTypeAnnotation();
    case 'TSNumberKeyword':
      return numberTypeAnnotation();
    case 'TSVoidKeyword':
      return voidTypeAnnotation();
    case 'TSAnyKeyword':
      // TODO: add option to return mixedTypeAnnotation
      return anyTypeAnnotation();
    case 'TSBooleanKeyword':
      return booleanTypeAnnotation();
    case 'TSNullKeyword':
      return nullLiteralTypeAnnotation();
    case 'TSUndefinedKeyword':
      return voidTypeAnnotation();
    case 'TSUnionType':
      return unionTypeAnnotation(input.types.map(t => transformTsType(t)));
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
      return transformTSLiteralTypeElement(input.literal);
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
          return transformTsType(input.typeAnnotation, { readOnly: true });
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
    case 'TSTypeReference': {
      return genericTypeAnnotation(
        transformTSEntityName(input.typeName),
        input.typeParameters == null
          ? null
          : transformTSTypeParameterInstantiation(input.typeParameters),
      );
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
  const ast = typeParameter(
    input.constraint == null
      ? null
      : typeAnnotation(
        transformTsType(input.constraint),
      ),
    input.default == null ? null : transformTsType(input.default),
    null,
  );

  ast.name = input.name;

  return ast;
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

function transformTSEntityName(input: TSEntityName): Identifier | QualifiedTypeIdentifier {
  if (input.type === 'Identifier') {
    return input;
  }

  return qualifiedTypeIdentifier(
    input.right,
    transformTSEntityName(input.left),
  );
}

function transformTSExpressionWithTypeArguments(
  input: TSExpressionWithTypeArguments,
): InterfaceExtends {
  return interfaceExtends(
    transformTSEntityName(input.expression),
  );
}

function transformInterfaceDeclaration(
  input: TSInterfaceDeclaration, ctx: TransformContext,
): DeclareInterface | InterfaceDeclaration | null {
  const params = input.typeParameters == null
    ? null
    : transformTSTypeParameterDeclaration(input.typeParameters);
  const ext = input.extends == null
    ? null
    : input.extends.map(transformTSExpressionWithTypeArguments);
  const body = transformTSInterfaceBody(input.body);

  if (ctx.interfaces[input.id.name] != null) {
    // Flow doesn't allow duplicated interface names, we need to merge them
    const ast = ctx.interfaces[input.id.name];
    if (params !== null) {
      if (ast.typeParameters == null) {
        ast.typeParameters = params;
      } else {
        ast.typeParameters.params.push(...params.params);
      }
    }
    if (ext !== null) {
      if (ast.extends == null) {
        ast.extends = ext;
      } else {
        ast.extends.push(...ext);
      }
    }
    if (body.callProperties != null) {
      if (ast.body.callProperties == null) {
        ast.body.callProperties = body.callProperties;
      } else {
        ast.body.callProperties.push(...body.callProperties);
      }
    }
    if (body.indexers != null) {
      if (ast.body.indexers == null) {
        ast.body.indexers = body.indexers;
      } else {
        ast.body.indexers.push(...body.indexers);
      }
    }
    if (body.internalSlots != null) {
      if (ast.body.internalSlots == null) {
        ast.body.internalSlots = body.internalSlots;
      } else {
        ast.body.internalSlots.push(...body.internalSlots);
      }
    }
    if (body.properties != null) {
      if (ast.body.properties == null) {
        ast.body.properties = body.properties;
      } else {
        ast.body.properties.push(...body.properties);
      }
    }

    return null;
  }

  const ast = input.declare === true
    ? declareInterface(input.id, params, ext, body)
    : interfaceDeclaration(input.id, params, ext, body);

  ast.leadingComments = input.leadingComments;
  ast.innerComments = input.innerComments;

  return ast;
}

function transformExpression<E: Expression>(input: E): E {
  switch (input.type) {
    case 'BooleanLiteral':
      return input;
    default: {
      console.log(`transformExpression: not supported ${input.type}`);
      // eslint-disable-next-line no-unused-vars
      const n: empty = input.type;
      return input;
    }
  }
}

function transformVariableDeclarator(input: VariableDeclarator): VariableDeclarator {
  return variableDeclarator(
    input.id,
    input.init === null ? null : transformExpression(input.init),
  );
}

function transformClassMethod(input: ClassBody['body'][number]): ClassBody['body'][number] {
  switch (input.type) {
    case 'ClassMethod':
      return classMethod(
        input.kind,
        input.key,
        input.params,
        input.body,
      );
    default:
      return input;
  }
}

function transformClassBody(input: ClassBody): ClassBody {
  return classBody(
    input.body.map(t => transformClassMethod(t)),
  );
}

function transformStatement(input: Statement, ctx: TransformContext): Statement | null {
  switch (input.type) {
    case 'TSInterfaceDeclaration': {
      const output = transformInterfaceDeclaration(input, ctx);
      if (output !== null) {
        ctx.interfaces[output.id.name] = output;
      }
      return output;
    }
    case 'TSTypeAliasDeclaration':
      return transformTSTypeAliasDeclaration(input);
    case 'EmptyStatement':
      return input;
    case 'ClassDeclaration': {
      const t = classDeclaration(
        input.id,
        input.superClass,
        transformClassBody(input.body),
        input.decorators,
      );

      if (input.typeParameters != null && input.typeParameters.type === 'TSTypeParameterDeclaration') {
        t.typeParameters = transformTSTypeParameterDeclaration(input.typeParameters);
      }
      if (input.superTypeParameters != null && input.superTypeParameters.type === 'TSTypeParameterDeclaration') {
        t.superTypeParameters = transformTSTypeParameterInstantiation(input.superTypeParameters);
      }

      return t;
    }
    case 'VariableDeclaration': {
      if (input.declare === true) {
        if (input.declarations.length !== 1) {
          throw new Error('transformStatement/VariableDeclaration: declaration variable not supported');
        }
        const [declaration] = input.declarations;
        if (declaration.id.type !== 'Identifier') {
          throw new Error('transformStatement/VariableDeclaration: declaration variable not supported');
        }
        return declareVariable(
          declaration.id,
        );
      }
      return variableDeclaration(
        input.kind,
        input.declarations.map(transformVariableDeclarator),
      );
    }
    default: {
      console.log(`transformStatement: not supported ${input.type}`);
      // eslint-disable-next-line no-unused-vars
      const n: empty = input.type;
      return emptyStatement();
    }
  }
}

function transformProgram(input: Program): Program {
  const ctx = {
    interfaces: {},
  };

  return program(
    input.body.reduce((acc, s) => {
      const output = transformStatement(s, ctx);
      if (output !== null) {
        acc.push(output);
      }
      return acc;
    }, []),
  );
}

export function tsToFlow(input: string): string {
  const typescriptAst = parse(input, { plugins: ['typescript'], tokens: true });

  const flowAst = file(
    transformProgram(typescriptAst.program),
  );

  const { code } = generate(flowAst, { jsescOption: { compact: false, es6: true } });

  return code;
}
