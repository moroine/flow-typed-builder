// @flow

/* eslint-disable no-use-before-define, no-console */

import generate from '@babel/generator';
import { parse } from '@babel/parser';
import type { ArrayPattern,
  ClassBody,
  ClassDeclaration,
  ClassImplements,
  Declaration,
  DeclareClass,
  DeclareInterface,
  DeclareVariable,
  Expression,
  Flow,
  FlowType,
  FunctionTypeAnnotation,
  FunctionTypeParam,
  Identifier,
  InterfaceDeclaration,
  InterfaceExtends,
  MemberExpression,
  ObjectPattern,
  ObjectProperty,
  ObjectTypeAnnotation,
  ObjectTypeCallProperty,
  ObjectTypeIndexer,
  ObjectTypeProperty,
  ObjectTypeSpreadProperty,
  Pattern,
  PatternLike,
  Program,
  QualifiedTypeIdentifier,
  RestElement,
  Statement,
  TSCallSignatureDeclaration,
  TSConstructSignatureDeclaration,
  TSEntityName,
  TSExpressionWithTypeArguments,
  TSInterfaceBody,
  TSInterfaceDeclaration,
  TSLiteralType,
  TSMethodSignature,
  TSParameterProperty,
  TSPropertySignature,
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
  VariableDeclaration,
  VariableDeclarator } from '@babel/types';
import {
  anyTypeAnnotation,
  arrayTypeAnnotation,
  booleanLiteralTypeAnnotation,
  booleanTypeAnnotation,
  classBody,
  classDeclaration,
  classMethod,
  classProperty,
  declareClass,
  declareExportDeclaration,
  declareInterface,
  declareVariable,
  emptyStatement,
  emptyTypeAnnotation,
  exportNamedDeclaration,
  file,
  functionTypeAnnotation,
  functionTypeParam,
  genericTypeAnnotation,
  identifier,
  importDeclaration,
  interfaceDeclaration,
  interfaceExtends,
  intersectionTypeAnnotation,
  mixedTypeAnnotation,
  nullLiteralTypeAnnotation,
  nullableTypeAnnotation,
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
  thisTypeAnnotation,
  tupleTypeAnnotation,
  typeAlias,
  typeAnnotation,
  typeParameter,
  typeParameterDeclaration,
  typeParameterInstantiation,
  typeofTypeAnnotation,
  unaryExpression,
  unionTypeAnnotation,
  variableDeclaration,
  variableDeclarator,
  variance,
  voidTypeAnnotation,
} from "@babel/types";

type TransformTypeFlags = {|
  readOnly?: boolean,
|};

type TransformContext = {|
  interfaces: { [key: string]: DeclareInterface | InterfaceDeclaration, ... },
  variables: { [key: string]: DeclareVariable | VariableDeclarator, ... },
|};

function transformTSTypeAnnotation(
  input: TSTypeAnnotation | TypeAnnotation,
  ctx: TransformContext,
): FlowType {
  if (input.type === 'TypeAnnotation') {
    return input.typeAnnotation;
  }

  return transformTsType(input.typeAnnotation, ctx);
}

function convertMemberExpressionIdentifier(
  input: MemberExpression,
): Identifier | null {
  const { object, property } = input;
  if (object.type !== 'Identifier') {
    console.log(`[convertMemberExpressionIdentifier]: not supported object type ${object.type}`);
    return null;
  }

  if (object.name !== 'Symbol') {
    console.log(`[convertMemberExpressionIdentifier]: not supported object name ${object.name}`);
    return null;
  }

  if (property.type !== 'Identifier') {
    console.log(`[convertMemberExpressionIdentifier]: not supported property type ${property.type}`);
    return null;
  }

  const knownSymbols = [
    'asyncIterator',
    'prototype.description',
    'hasInstance',
    'isConcatSpreadable',
    'iterator',
    'match',
    'matchAll',
    'replace',
    'search',
    'species',
    'split',
    'toPrimitive',
    'toStringTag',
    'unscopables',
  ];

  if (!knownSymbols.includes(property.name)) {
    console.log(`[convertMemberExpressionIdentifier]: not supported property name ${property.name}`);
    return null;
  }

  return identifier(`@@${property.name}`);
}

function getObjectPropertyKey(
  inputKey,
  // eslint-disable-next-line no-unused-vars
  ctx: TransformContext,
) {
  if (inputKey.type !== 'Identifier' && inputKey.type !== 'StringLiteral' && inputKey.type !== 'MemberExpression') {
    throw new Error(`getObjectPropertyKey: TSPropertySignature not supported key ${inputKey.type}`);
  }

  const key = inputKey.type === 'MemberExpression'
    ? convertMemberExpressionIdentifier(inputKey)
    : inputKey;

  if (key === null) {
    throw new Error(`getObjectPropertyKey: TSPropertySignature not supported key ${inputKey.type}`);
  }

  if (key.type === 'StringLiteral') {
    return identifier(key.value);
  }

  return key;
}

function transformTSMethodSignature(
  input: TSMethodSignature,
  ctx: TransformContext,
): ObjectTypeCallProperty | ObjectTypeIndexer | ObjectTypeProperty {
  const key = getObjectPropertyKey(input.key, ctx);

  const value = transformFunctionTypeAnnotation(
    input,
    ctx,
  );

  if (
    input.computed !== true
    || (key.type === 'Identifier' && ctx.variables[key.name] == null)
  ) {
    const prop = objectTypeProperty(
      key,
      value,
      null,
    );

    if (input.optional === true) {
      prop.optional = true;
    } else {
      prop.method = true;
    }

    return prop;
  }

  return objectTypeIndexer(
    null,
    typeofTypeAnnotation(genericTypeAnnotation(key)),
    input.optional === true
      ? nullableTypeAnnotation(value)
      : value,
  );
}

function transformTSPropertySignature(
  input: TSPropertySignature,
  ctx: TransformContext,
): ObjectTypeCallProperty | ObjectTypeIndexer | ObjectTypeProperty {
  const key = getObjectPropertyKey(input.key, ctx);

  if (input.typeAnnotation == null) {
    throw new Error('transformTSTypeElement: TSPropertySignature not supported empty typeAnnotation');
  }

  const value = transformTSTypeAnnotation(input.typeAnnotation, ctx);

  if (
    input.computed !== true
    || (key.type === 'Identifier' && ctx.variables[key.name] == null)
  ) {
    const prop = objectTypeProperty(
      key,
      value,
      input.readonly === true ? variance('plus') : null,
    );

    if (input.optional === true) {
      prop.optional = true;
    }

    return prop;
  }

  return objectTypeIndexer(
    null,
    typeofTypeAnnotation(genericTypeAnnotation(key)),
    input.optional === true
      ? nullableTypeAnnotation(value)
      : value,
  );
}

function transformTSTypeElement(
  input: TSTypeElement,
  ctx: TransformContext,
): ObjectTypeCallProperty | ObjectTypeIndexer | ObjectTypeProperty {
  switch (input.type) {
    case 'TSCallSignatureDeclaration': {
      return objectTypeCallProperty(
        transformFunctionTypeAnnotation(
          input,
          ctx,
        ),
      );
    }
    case 'TSPropertySignature': {
      return transformTSPropertySignature(input, ctx);
    }
    case 'TSMethodSignature': {
      return transformTSMethodSignature(input, ctx);
    }
    case 'TSConstructSignatureDeclaration': {
      if (input.typeAnnotation == null) {
        throw new Error('transformTSTypeElement: TSConstructSignatureDeclaration not supported empty typeAnnotation');
      }

      const prop = objectTypeProperty(
        identifier('constructor'),
        transformFunctionTypeAnnotation(
          input,
          ctx,
        ),
        null,
      );
      prop.method = true;

      return prop;
    }
    case 'TSIndexSignature': {
      if (input.parameters.length !== 1) {
        throw new Error('[transformTSTypeElement]: TSIndexSignature supports only identifiers');
      }
      const [id] = input.parameters;
      if (id == null && id.type !== 'Identifier') {
        throw new Error(`[transformTSTypeElement]: TSIndexSignature non-identifier not supported ${id.type}`);
      }

      if (id.typeAnnotation == null) {
        throw new Error('[transformTSTypeElement]: TSIndexSignature not supported empty typeAnnotation');
      }

      if (id.typeAnnotation.type !== 'TSTypeAnnotation') {
        throw new Error(`[transformTSTypeElement]: TSIndexSignature not supported typeAnnotation ${id.typeAnnotation.type}`);
      }

      // console.log(id.typeAnnotation);
      // if (key.type === 'Identifier') {
      //   if (ctx.variables[key.name] != null) {
      //     return typeofTypeAnnotation(genericTypeAnnotation(inputKey));
      //   }
      // }

      const key = id.type === 'Identifier' && ctx.variables[id.name] != null
        ? typeofTypeAnnotation(genericTypeAnnotation(id))
        : transformTSTypeAnnotation(id.typeAnnotation, ctx);

      if (input.typeAnnotation == null || input.typeAnnotation.type === 'Noop') {
        throw new Error('[transformTSTypeElement]: TSIndexSignature not supported empty typeAnnotation');
      }
      const value = transformTSTypeAnnotation(input.typeAnnotation, ctx);

      return objectTypeIndexer(id, key, value, null);
    }
    default: {
      throw new Error(`[transformTSTypeElement]: not supported ${input.type}`);
    }
  }
}

function transformRestElement(input: RestElement, ctx: TransformContext): FunctionTypeParam {
  if (input.argument != null && input.argument.type !== 'Identifier') {
    throw new Error(`[transformRestElement]: not supported ${input.argument.type}`);
  }

  if (input.typeAnnotation == null || input.typeAnnotation.type === 'Noop') {
    throw new Error('[transformRestElement]: not supported typeAnnotation');
  }

  const p = functionTypeParam(
    input.argument,
    transformTSTypeAnnotation(input.typeAnnotation, ctx),
  );

  if (input.optional === true) {
    p.optional = true;
  }

  return p;
}

function transformObjectProperties(
  input: Array<ObjectProperty | RestElement>,
  ctx: TransformContext,
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
        transformRestElement(p, ctx).typeAnnotation,
      );
    }

    throw new Error(`[transformObjectProperties]: not supported ${p.type}`);
  });
}

function transformArrayPattern(input: ArrayPattern, ctx: TransformContext): FunctionTypeParam {
  const p = functionTypeParam(
    null,
    input.typeAnnotation == null || input.typeAnnotation.type !== 'TSTypeAnnotation'
      ? tupleTypeAnnotation(input.elements.map(e => transformPatternLike(e, ctx)))
      : transformTSTypeAnnotation(input.typeAnnotation, ctx),
  );
  if (input.optional === true) {
    p.optional = true;
  }

  return p;
}

function transformObjectPattern(input: ObjectPattern, ctx: TransformContext): FunctionTypeParam {
  const p = functionTypeParam(
    null,
    input.typeAnnotation == null || input.typeAnnotation.type === 'Noop'
      ? objectTypeAnnotation(transformObjectProperties(input.properties, ctx))
      : transformTSTypeAnnotation(input.typeAnnotation, ctx),
  );

  return p;
}

function transformPatternLike(input: PatternLike | null, ctx: TransformContext): FlowType {
  if (input == null) {
    return nullLiteralTypeAnnotation();
  }

  switch (input.type) {
    case 'ArrayPattern':
      return transformArrayPattern(input, ctx).typeAnnotation;
    case 'ObjectPattern':
      return transformObjectPattern(input, ctx).typeAnnotation;
    case 'RestElement':
      return transformRestElement(input, ctx).typeAnnotation;
    default: {
      throw new Error(`[transformPatternLike]: not supported ${input.type}`);
    }
  }
}

function transformFunctionParams(
  parameters: $ReadOnlyArray<
    Identifier | ObjectPattern | Pattern | RestElement | TSParameterProperty>,
  ctx: TransformContext,
): [FunctionTypeParam[], FunctionTypeParam | null] {
  const [params, restParams] = parameters.reduce(
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
          `[transformFunctionParams]: not supported param type ${param.type}`,
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
          ? objectTypeAnnotation(transformObjectProperties(param.properties, ctx))
          : transformTSTypeAnnotation(param.typeAnnotation, ctx),
      );

      return p;
    }

    if (param.type === 'ArrayPattern') {
      return transformArrayPattern(param, ctx);
    }

    if (param.typeAnnotation == null || param.typeAnnotation.type !== 'TSTypeAnnotation') {
      throw new Error(`[transformFunctionTypeAnnotation]: not supported param type ${param.type}`);
    }

    const p = functionTypeParam(
      param,
      transformTSTypeAnnotation(param.typeAnnotation, ctx),
    );
    if (param.optional === true) {
      p.optional = true;
    }

    return p;
  });

  return [
    paramsList,
    restParams.length === 0
      ? null
      : transformRestElement(restParams[0], ctx),
  ];
}

function transformFunctionTypeAnnotation(
  input: TSCallSignatureDeclaration | TSConstructSignatureDeclaration | TSMethodSignature,
  ctx: TransformContext,
): FunctionTypeAnnotation {
  if (input.typeAnnotation == null) {
    throw new Error('transformFunctionTypeAnnotation: TSCallSignatureDeclaration not supported empty typeAnnotation');
  }

  const returnType = transformTSTypeAnnotation(input.typeAnnotation, ctx);

  const [params, restParam] = transformFunctionParams(input.parameters, ctx);

  return functionTypeAnnotation(
    input.typeParameters == null
      ? null
      : transformTSTypeParameterDeclaration(input.typeParameters, ctx),
    params,
    restParam,
    returnType,
  );
}

function createObjectTypeAnnotation(
  statements: $ReadOnlyArray<ObjectTypeCallProperty | ObjectTypeIndexer | ObjectTypeProperty>,
): ObjectTypeAnnotation {
  const [props, indexers, callProps] = statements.reduce(
    (acc, statement) => {
      switch (statement.type) {
        case 'ObjectTypeCallProperty':
          acc[2].push(statement);
          return acc;
        case 'ObjectTypeIndexer':
          acc[1].push(statement);
          return acc;
        default:
          acc[0].push(statement);
          return acc;
      }
    },
    [[], [], []],
  );

  const value = objectTypeAnnotation(
    props,
    indexers.length === 0 ? null : indexers,
    callProps.length === 0 ? null : callProps,
    null,
    false,
  );
  value.inexact = true;
  return value;
}

function transformTSInterfaceBody(
  input: TSInterfaceBody,
  ctx: TransformContext,
): ObjectTypeAnnotation {
  const out = createObjectTypeAnnotation(input.body.map(s => transformTSTypeElement(s, ctx)));
  out.inexact = null;
  return out;
}

function transformTSTypeParameterInstantiation(
  input: TSTypeParameterInstantiation,
  ctx: TransformContext,
): TypeParameterInstantiation {
  return typeParameterInstantiation(
    input.params.map(p => transformTsType(p, ctx)),
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

function transformTsType(
  input: TSType,
  ctx: TransformContext,
  flags?: TransformTypeFlags = { ...null },
): FlowType {
  switch (input.type) {
    case 'TSTypeLiteral': {
      return createObjectTypeAnnotation(
        input.members.map(m => transformTSTypeElement(m, ctx)),
      );
    }
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
      return unionTypeAnnotation(input.types.map(t => transformTsType(t, ctx)));
    case 'TSObjectKeyword': {
      const t = objectTypeAnnotation([], null, null, null, false);
      t.inexact = true;

      if (flags.readOnly === true) {
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
          return transformTsType(input.typeAnnotation, ctx);
        case 'readonly':
          return transformTsType(input.typeAnnotation, ctx, { readOnly: true });
        default:
          throw new Error(`transformTSTypeAnnotation/TSTypeOperator: not supported ${input.operator}`);
      }
    }
    case 'TSTupleType': {
      return tupleTypeAnnotation(input.elementTypes.map(el => transformTsType(
        el.type === 'TSNamedTupleMember'
          ? el.elementType
          : el,
        ctx,
      )));
    }
    case 'TSArrayType': {
      if (flags.readOnly === true) {
        return genericTypeAnnotation(
          identifier('$ReadOnlyArray'),
          typeParameterInstantiation(
            [transformTsType(input.elementType, ctx)],
          ),
        );
      }

      return arrayTypeAnnotation(transformTsType(input.elementType, ctx));
    }
    case 'TSTypeReference': {
      return genericTypeAnnotation(
        transformTSEntityName(input.typeName),
        input.typeParameters == null
          ? null
          : transformTSTypeParameterInstantiation(input.typeParameters, ctx),
      );
    }
    case 'TSFunctionType': {
      const [params, restParam] = transformFunctionParams(input.parameters, ctx);
      return functionTypeAnnotation(
        input.typeParameters == null
          ? null
          : transformTSTypeParameterDeclaration(input.typeParameters, ctx),
        params,
        restParam,
        input.typeAnnotation === null
          ? voidTypeAnnotation()
          : transformTSTypeAnnotation(input.typeAnnotation, ctx),
      );
    }
    case 'TSIntersectionType': {
      return intersectionTypeAnnotation(input.types.map(t => transformTsType(t, ctx)));
    }
    case 'TSThisType': {
      return thisTypeAnnotation();
    }
    default: {
      console.log(`transformTsType: not supported ${input.type}`, input);
      // eslint-disable-next-line no-unused-vars
      const n: empty = input.type;
      return anyTypeAnnotation();
    }
  }
}

function transformTSTypeParameter(input: TSTypeParameter, ctx: TransformContext): TypeParameter {
  const ast = typeParameter(
    input.constraint == null
      ? null
      : typeAnnotation(
        transformTsType(input.constraint, ctx),
      ),
    input.default == null ? null : transformTsType(input.default, ctx),
    null,
  );

  ast.name = input.name;

  return ast;
}

function transformTSTypeParameterDeclaration(
  input: TSTypeParameterDeclaration,
  ctx: TransformContext,
): TypeParameterDeclaration {
  return typeParameterDeclaration(
    input.params.map(p => transformTSTypeParameter(p, ctx)),
  );
}

function transformTSTypeAliasDeclaration(
  input: TSTypeAliasDeclaration,
  ctx: TransformContext,
): TypeAlias {
  return typeAlias(
    input.id,
    input.typeParameters == null
      ? null
      : transformTSTypeParameterDeclaration(input.typeParameters, ctx),
    transformTsType(input.typeAnnotation, ctx),
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
    : transformTSTypeParameterDeclaration(input.typeParameters, ctx);
  const ext = input.extends == null
    ? null
    : input.extends.map(transformTSExpressionWithTypeArguments);
  const body = transformTSInterfaceBody(input.body, ctx);

  if (ctx.interfaces[input.id.name] != null) {
    // Flow doesn't allow duplicated interface names, we need to merge them
    const ast = ctx.interfaces[input.id.name];
    if (params != null) {
      if (ast.typeParameters == null) {
        ast.typeParameters = params;
      } else {
        ast.typeParameters.params.push(...params.params);
      }
    }
    if (ext != null) {
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
    case 'StringLiteral':
      return input;
    default: {
      console.log(`transformExpression: not supported ${input.type}`, input);
      // eslint-disable-next-line no-unused-vars
      const n: empty = input.type;
      return input;
    }
  }
}

function transformExpressionTypeElement(input: Expression): FlowType {
  switch (input.type) {
    case 'BooleanLiteral':
      return transformTSLiteralTypeElement(input);
    case 'StringLiteral':
      return transformTSLiteralTypeElement(input);
    case 'NumericLiteral':
      return transformTSLiteralTypeElement(input);
    case 'UnaryExpression':
      return transformTSLiteralTypeElement(input);
    default: {
      console.log(`transformExpressionTypeElement: not supported ${input.type}`, input);
      // eslint-disable-next-line no-unused-vars
      const n: empty = input.type;
      return anyTypeAnnotation();
    }
  }
}

function transformVariableDeclarator(
  input: VariableDeclarator, ctx: TransformContext,
): VariableDeclarator {
  const output = variableDeclarator(
    input.id,
    input.init == null ? null : transformExpression(input.init),
  );
  if (output.id.type === 'Identifier') {
    ctx.variables[output.id.name] = output;
  }
  return output;
}

function transformClassMethod(input: ClassBody['body'][number], ctx: TransformContext): ClassBody['body'][number] {
  switch (input.type) {
    case 'ClassMethod': {
      const key = input.key.type === 'Identifier' && ctx.variables[input.key.name] != null
        ? unaryExpression('typeof', input.key)
        : input.key;

      return classMethod(
        input.kind,
        key,
        input.params,
        input.body,
      );
    }
    case 'ClassProperty': {
      const key = input.key.type === 'Identifier' && ctx.variables[input.key.name] != null
        ? unaryExpression('typeof', input.key)
        : input.key;

      return classProperty(
        key,
        input.value,
        input.typeAnnotation?.type === 'TSTypeAnnotation'
          ? typeAnnotation(transformTSTypeAnnotation(input.typeAnnotation, ctx))
          : input.typeAnnotation,
        input.decorators,
        input.computed,
        input.static,
      );
    }
    default:
      console.log(`[transformClassMethod]: not supported ${input.type}`);
      return input;
  }
}

function transformClassDeclarationBody(
  input: ClassBody['body'][number],
  ctx: TransformContext,
): ObjectTypeCallProperty | ObjectTypeIndexer | ObjectTypeProperty | null {
  switch (input.type) {
    case 'ClassMethod': {
      const [params, restParam] = transformFunctionParams(input.params, ctx);

      const fn = functionTypeAnnotation(
        input.typeParameters != null && input.typeParameters.type === 'TSTypeParameterDeclaration'
          ? transformTSTypeParameterDeclaration(input.typeParameters, ctx)
          : null,
        params,
        restParam,
        input.returnType != null && input.returnType.type === 'TSTypeAnnotation'
          ? transformTSTypeAnnotation(input.returnType, ctx)
          : anyTypeAnnotation(),
      );

      if (input.kind === 'constructor') {
        return objectTypeCallProperty(
          fn,
        );
      }

      if (input.key.type !== 'Identifier' && input.key.type !== 'StringLiteral') {
        throw new Error(`transformClassDeclarationBody: ClassMethod not supported key ${input.key.type}`);
      }

      if (input.key.type === 'Identifier' && ctx.variables[input.key.name] != null) {
        return objectTypeIndexer(
          null,
          typeofTypeAnnotation(genericTypeAnnotation(input.key)),
          input.optional === true
            ? nullableTypeAnnotation(fn)
            : fn,
        );
      }

      const prop = objectTypeProperty(
        input.key,
        fn,
        variance('plus'),
      );

      if (input.optional === true) {
        prop.optional = true;
      } else {
        prop.method = true;
      }

      if (input.static === true) {
        prop.static = true;
      }

      return prop;
    }
    case 'ClassProperty': {
      if (input.key.type !== 'Identifier' && input.key.type !== 'StringLiteral' && input.key.type !== 'MemberExpression') {
        throw new Error(`transformClassDeclarationBody: ClassProperty not supported key ${input.key.type}`);
      }

      const key = input.key.type === 'MemberExpression' ? convertMemberExpressionIdentifier(input.key) : input.key;
      if (key === null) {
        throw new Error(`transformTSTypeElement: TSPropertySignature not supported key ${input.key.type}`);
      }

      const value = input.typeAnnotation != null && input.typeAnnotation.type === 'TSTypeAnnotation'
        ? transformTSTypeAnnotation(input.typeAnnotation, ctx)
        : anyTypeAnnotation();

      if (
        input.computed === true
        && (key.type === 'Identifier' && ctx.variables[key.name] != null)
      ) {
        return objectTypeIndexer(
          null,
          typeofTypeAnnotation(genericTypeAnnotation(key)),
          input.optional === true
            ? nullableTypeAnnotation(value)
            : value,
        );
      }

      const prop = objectTypeProperty(
        key,
        value,
        input.readonly === true ? variance('plus') : null,
      );

      if (input.optional === true) {
        prop.optional = true;
      }

      if (input.static === true) {
        prop.static = true;
      }

      return prop;
    }
    case 'TSDeclareMethod': {
      const returnType = input.returnType != null && input.returnType.type === 'TSTypeAnnotation'
        ? transformTSTypeAnnotation(input.returnType, ctx)
        : anyTypeAnnotation();
      const [params, restParam] = transformFunctionParams(input.params, ctx);

      const value = input.kind === 'get'
        ? returnType
        : functionTypeAnnotation(
          input.typeParameters != null && input.typeParameters.type === 'TSTypeParameterDeclaration'
            ? transformTSTypeParameterDeclaration(input.typeParameters, ctx)
            : null,
          params,
          restParam,
          returnType,
        );

      if (input.kind === 'constructor') {
        return objectTypeCallProperty(value);
      }

      if (input.key.type !== 'Identifier' && input.key.type !== 'StringLiteral' && input.key.type !== 'MemberExpression') {
        throw new Error(`transformClassDeclarationBody: ClassMethod not supported key ${input.key.type}`);
      }

      const key = input.key.type === 'MemberExpression' ? convertMemberExpressionIdentifier(input.key) : input.key;
      if (key === null) {
        throw new Error(`transformTSTypeElement: TSPropertySignature not supported key ${input.key.type}`);
      }

      if (input.key.type === 'Identifier' && ctx.variables[input.key.name] != null) {
        return objectTypeIndexer(
          null,
          typeofTypeAnnotation(genericTypeAnnotation(input.key)),
          input.optional === true
            ? nullableTypeAnnotation(value)
            : value,
        );
      }

      const prop = objectTypeProperty(
        key,
        value,
        variance('plus'),
      );

      if (input.optional === true) {
        prop.optional = true;
      } else if (input.kind !== 'get') {
        prop.method = true;
        prop.variance = null;
      }

      if (input.static === true) {
        prop.static = true;
      }

      return prop;
    }
    default:
      console.log(`[transformClassDeclarationBody]: not supported ${input.type}`);
      return null;
  }
}

function transformInterfaceExtends(
  input: ClassImplements | TSExpressionWithTypeArguments,
  ctx: TransformContext,
): InterfaceExtends {
  if (input.type === 'TSExpressionWithTypeArguments') {
    return interfaceExtends(
      transformTSEntityName(input.expression),
      input.typeParameters == null
        ? null
        : transformTSTypeParameterInstantiation(input.typeParameters, ctx),
    );
  }

  return interfaceExtends(
    input.id,
    input.typeParameters,
  );
}

function transformClassDeclaration(
  input: ClassDeclaration,
  ctx: TransformContext,
): ClassDeclaration | DeclareClass {
  const isDeclare = input.declare === true
  || input.body.body.some(s => s.type === 'TSDeclareMethod');

  const typeParameters = input.typeParameters != null && input.typeParameters.type === 'TSTypeParameterDeclaration'
    ? transformTSTypeParameterDeclaration(input.typeParameters, ctx)
    : null;

  if (isDeclare) {
    const [props, indexers, calls] = input.body.body
      .map(s => transformClassDeclarationBody(s, ctx))
      .reduce((acc, s) => {
        if (s != null) {
          if (s.type === 'ObjectTypeCallProperty') {
            acc[2].push(s);
          } else if (s.type === 'ObjectTypeIndexer') {
            acc[1].push(s);
          } else {
            acc[0].push(s);
          }
        }

        return acc;
      }, [[], [], []]);

    const ext = input.implements == null || input.implements.length === 0
      ? null
      : input.implements.map(i => transformInterfaceExtends(i, ctx));

    const output = declareClass(
      input.id,
      typeParameters,
      null,
      objectTypeAnnotation(
        props,
        indexers,
        calls,
      ),
    );

    if (ext != null) {
      output.mixins = ext;
    }

    return output;
  }

  const t = classDeclaration(
    input.id,
    input.superClass,
    classBody(
      input.body.body.map(s => transformClassMethod(s, ctx)),
    ),
    input.decorators,
  );

  if (typeParameters != null) {
    t.typeParameters = typeParameters;
  }

  if (input.superTypeParameters != null && input.superTypeParameters.type === 'TSTypeParameterDeclaration') {
    t.superTypeParameters = transformTSTypeParameterInstantiation(input.superTypeParameters, ctx);
  }

  return t;
}

function transformVariableDeclaratorToDeclareVariable(
  input: VariableDeclarator,
  ctx: TransformContext,
) {
  if (input.id.type !== 'Identifier') {
    throw new Error('transformVariableDeclaratorToDeclareVariable: declaration variable not supported');
  }
  const inputId = input.id;
  const id = identifier(inputId.name);
  const output = declareVariable(id);
  if (inputId.typeAnnotation != null && inputId.typeAnnotation.type !== 'Noop') {
    id.typeAnnotation = typeAnnotation(
      transformTSTypeAnnotation(inputId.typeAnnotation, ctx),
    );
  } else if (input.init != null) {
    id.typeAnnotation = typeAnnotation(
      transformExpressionTypeElement(input.init),
    );
  }

  return output;
}

function transformVariableDeclaration(
  input: VariableDeclaration, ctx: TransformContext,
): Array<DeclareVariable | VariableDeclaration> {
  if (input.declare === true) {
    return input.declarations.map(d => transformVariableDeclaratorToDeclareVariable(d, ctx));
  }

  return [
    variableDeclaration(
      input.kind,
      input.declarations.map(d => transformVariableDeclarator(d, ctx)),
    ),
  ];
}

function transformDeclaration(
  input: Declaration | null,
  ctx: TransformContext,
): Array<DeclareVariable | VariableDeclaration> {
  if (input === null) {
    return [];
  }

  switch (input.type) {
    case 'VariableDeclaration':
      return transformVariableDeclaration(input, ctx);
    default:
      console.log('[transformDeclaration]: not supported', input.type);
      return [];
  }
}

function transformStatement(input: Statement, ctx: TransformContext): $ReadOnlyArray<Statement> {
  switch (input.type) {
    case 'TSInterfaceDeclaration': {
      const output = transformInterfaceDeclaration(input, ctx);
      if (output != null) {
        ctx.interfaces[output.id.name] = output;
        return [output];
      }
      return [];
    }
    case 'TSTypeAliasDeclaration':
      return [transformTSTypeAliasDeclaration(input, ctx)];
    case 'EmptyStatement':
      return [input];
    case 'ClassDeclaration':
      return [transformClassDeclaration(input, ctx)];
    case 'VariableDeclaration': {
      return transformVariableDeclaration(input, ctx);
    }
    case 'ImportDeclaration': {
      if (input.importKind === 'type') {
        return [input];
      }

      const output = importDeclaration(
        input.specifiers,
        input.source,
      );

      if (output.specifiers.some(s => s.type === 'ImportNamespaceSpecifier')) {
        output.importKind = 'typeof';
      } else {
        output.importKind = 'type';
      }

      return [output];
    }
    case 'ExportNamedDeclaration': {
      if (input.specifiers.length > 0) {
        console.log('Unsupported ExportNamedDeclaration: has specifiers');
        return [emptyStatement()];
      }

      const declarations = transformDeclaration(input.declaration, ctx);

      return declarations.map(
        (declaration) => {
          if (declaration !== null && declaration.type === 'VariableDeclaration') {
            console.log('Unsupported ExportNamedDeclaration: declaration is not declare');
            return emptyStatement();
          }

          return declareExportDeclaration(
            declaration,
            [],
            input.source,
          );
        },
      );
    }
    default: {
      console.log(`transformStatement: not supported ${input.type}`);
      // eslint-disable-next-line no-unused-vars
      const n: empty = input.type;
      return [emptyStatement()];
    }
  }
}

function transformProgram(input: Program): Program {
  const ctx = {
    interfaces: {},
    variables: {},
  };

  return program(
    input.body.reduce((acc, s) => {
      acc.push(...transformStatement(s, ctx));
      return acc;
    }, []),
  );
}

export function tsToFlow(input: string): string {
  const typescriptAst = parse(input, { plugins: ['typescript'], tokens: true, sourceType: 'module' });

  const flowAst = file(
    transformProgram(typescriptAst.program),
  );

  const { code } = generate(flowAst, { jsescOption: { compact: false, es6: true } });

  return code;
}
