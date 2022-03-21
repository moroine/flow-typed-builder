// @flow

/* eslint-disable no-use-before-define, no-console */

import generate from '@babel/generator';
import { parse } from '@babel/parser';
import type { ArrayPattern,
  ClassBody,
  ClassDeclaration,
  ClassImplements,
  DeclareClass,
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
import { anyTypeAnnotation,
  arrayTypeAnnotation,
  booleanLiteralTypeAnnotation,
  booleanTypeAnnotation,
  classBody,
  classDeclaration,
  classMethod,
  classProperty,
  declareClass,
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

function transformTSTypeElement(
  input: TSTypeElement,
): ObjectTypeCallProperty | ObjectTypeIndexer | ObjectTypeProperty {
  switch (input.type) {
    case 'TSCallSignatureDeclaration': {
      return objectTypeCallProperty(
        transformFunctionTypeAnnotation(
          input,
        ),
      );
    }
    case 'TSPropertySignature': {
      if (input.key.type !== 'Identifier' && input.key.type !== 'StringLiteral') {
        throw new Error(`transformTSTypeElement: TSPropertySignature not supported key ${input.key.type}`);
      }

      if (input.typeAnnotation == null) {
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
      if (input.typeAnnotation == null) {
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

      const key = transformTSTypeAnnotation(id.typeAnnotation);

      if (input.typeAnnotation == null || input.typeAnnotation.type === 'Noop') {
        throw new Error('[transformTSTypeElement]: TSIndexSignature not supported empty typeAnnotation');
      }
      const value = transformTSTypeAnnotation(input.typeAnnotation);

      return objectTypeIndexer(id, key, value, null);
    }
    default: {
      throw new Error(`[transformTSTypeElement]: not supported ${input.type}`);
    }
  }
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
  if (input == null) {
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

function transformFunctionParams(
  parameters: $ReadOnlyArray<
  Identifier | ObjectPattern | Pattern | RestElement | TSParameterProperty
>,
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

  return [
    paramsList,
    restParams.length === 0
      ? null
      : transformRestElement(restParams[0]),
  ];
}

function transformFunctionTypeAnnotation(
  input: TSCallSignatureDeclaration | TSConstructSignatureDeclaration | TSMethodSignature,
): FunctionTypeAnnotation {
  if (input.typeAnnotation == null) {
    throw new Error('transformFunctionTypeAnnotation: TSCallSignatureDeclaration not supported empty typeAnnotation');
  }

  const returnType = transformTSTypeAnnotation(input.typeAnnotation);

  const [params, restParam] = transformFunctionParams(input.parameters);

  return functionTypeAnnotation(
    input.typeParameters == null
      ? null
      : transformTSTypeParameterDeclaration(input.typeParameters),
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

function transformTSInterfaceBody(input: TSInterfaceBody): ObjectTypeAnnotation {
  const out = createObjectTypeAnnotation(input.body.map(transformTSTypeElement));
  out.inexact = null;
  return out;
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
    case 'TSTypeLiteral': {
      return createObjectTypeAnnotation(input.members.map(transformTSTypeElement));
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
    input.init == null ? null : transformExpression(input.init),
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
    case 'ClassProperty':
      return classProperty(
        input.key,
        input.value,
        input.typeAnnotation?.type === 'TSTypeAnnotation'
          ? typeAnnotation(transformTSTypeAnnotation(input.typeAnnotation))
          : input.typeAnnotation,
        input.decorators,
        input.computed,
        input.static,
      );
    default:
      console.log(`[transformClassMethod]: not supported ${input.type}`);
      return input;
  }
}

function transformClassDeclarationBody(input: ClassBody['body'][number]): ObjectTypeCallProperty | ObjectTypeProperty | null {
  switch (input.type) {
    case 'ClassMethod': {
      const [params, restParam] = transformFunctionParams(input.params);

      const fn = functionTypeAnnotation(
        input.typeParameters != null && input.typeParameters.type === 'TSTypeParameterDeclaration'
          ? transformTSTypeParameterDeclaration(input.typeParameters)
          : null,
        params,
        restParam,
        input.returnType != null && input.returnType.type === 'TSTypeAnnotation'
          ? transformTSTypeAnnotation(input.returnType)
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
      if (input.key.type !== 'Identifier' && input.key.type !== 'StringLiteral') {
        throw new Error(`transformClassDeclarationBody: ClassProperty not supported key ${input.key.type}`);
      }

      const prop = objectTypeProperty(
        input.key,
        input.typeAnnotation != null && input.typeAnnotation.type === 'TSTypeAnnotation'
          ? transformTSTypeAnnotation(input.typeAnnotation)
          : anyTypeAnnotation(),
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
        ? transformTSTypeAnnotation(input.returnType)
        : anyTypeAnnotation();
      const [params, restParam] = transformFunctionParams(input.params);

      const value = input.kind === 'get'
        ? returnType
        : functionTypeAnnotation(
          input.typeParameters != null && input.typeParameters.type === 'TSTypeParameterDeclaration'
            ? transformTSTypeParameterDeclaration(input.typeParameters)
            : null,
          params,
          restParam,
          returnType,
        );

      if (input.kind === 'constructor') {
        return objectTypeCallProperty(value);
      }

      if (input.key.type !== 'Identifier' && input.key.type !== 'StringLiteral') {
        throw new Error(`transformClassDeclarationBody: ClassMethod not supported key ${input.key.type}`);
      }

      const prop = objectTypeProperty(
        input.key,
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
): InterfaceExtends {
  if (input.type === 'TSExpressionWithTypeArguments') {
    return interfaceExtends(
      transformTSEntityName(input.expression),
      input.typeParameters == null
        ? null
        : transformTSTypeParameterInstantiation(input.typeParameters),
    );
  }

  return interfaceExtends(
    input.id,
    input.typeParameters,
  );
}

function transformClassDeclaration(input: ClassDeclaration): ClassDeclaration | DeclareClass {
  const isDeclare = input.declare === true
  || input.body.body.some(s => s.type === 'TSDeclareMethod');

  const typeParameters = input.typeParameters != null && input.typeParameters.type === 'TSTypeParameterDeclaration'
    ? transformTSTypeParameterDeclaration(input.typeParameters)
    : null;

  if (isDeclare) {
    const [props, calls] = input.body.body
      .map(s => transformClassDeclarationBody(s))
      .reduce((acc, s) => {
        if (s != null) {
          if (s.type === 'ObjectTypeCallProperty') {
            acc[1].push(s);
          } else {
            acc[0].push(s);
          }
        }

        return acc;
      }, [[], []]);

    const ext = input.implements == null || input.implements.length === 0
      ? null
      : input.implements.map(transformInterfaceExtends);

    const output = declareClass(
      input.id,
      typeParameters,
      null,
      objectTypeAnnotation(
        props,
        null,
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
      input.body.body.map(s => transformClassMethod(s)),
    ),
    input.decorators,
  );

  if (typeParameters != null) {
    t.typeParameters = typeParameters;
  }

  if (input.superTypeParameters != null && input.superTypeParameters.type === 'TSTypeParameterDeclaration') {
    t.superTypeParameters = transformTSTypeParameterInstantiation(input.superTypeParameters);
  }

  return t;
}

function transformStatement(input: Statement, ctx: TransformContext): Statement | null {
  switch (input.type) {
    case 'TSInterfaceDeclaration': {
      const output = transformInterfaceDeclaration(input, ctx);
      if (output != null) {
        ctx.interfaces[output.id.name] = output;
      }
      return output;
    }
    case 'TSTypeAliasDeclaration':
      return transformTSTypeAliasDeclaration(input);
    case 'EmptyStatement':
      return input;
    case 'ClassDeclaration':
      return transformClassDeclaration(input);
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
      if (output != null) {
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
