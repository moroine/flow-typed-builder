// @flow

/* eslint-disable no-use-before-define, no-console */

import generate from '@babel/generator';
import { parse } from '@babel/parser';
import type { ArrayPattern,
  BlockStatement,
  ClassBody,
  ClassDeclaration,
  ClassImplements,
  Declaration,
  DeclareClass,
  DeclareFunction,
  DeclareInterface,
  DeclareTypeAlias,
  DeclareVariable,
  ExportNamespaceSpecifier,
  ExportSpecifier,
  Expression,
  FlowType,
  FunctionDeclaration,
  FunctionTypeAnnotation,
  FunctionTypeParam,
  GenericTypeAnnotation,
  Identifier,
  InterfaceDeclaration,
  InterfaceExtends,
  MemberExpression,
  Node,
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
  ReturnStatement,
  Statement,
  TSCallSignatureDeclaration,
  TSConditionalType,
  TSConstructSignatureDeclaration,
  TSDeclareFunction,
  TSEntityName,
  TSExpressionWithTypeArguments,
  TSInterfaceBody,
  TSInterfaceDeclaration,
  TSLiteralType,
  TSMappedType,
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
  TSTypeQuery,
  TSTypeReference,
  TypeAlias,
  TypeAnnotation,
  TypeParameter,
  TypeParameterDeclaration,
  TypeParameterInstantiation,
  TypeofTypeAnnotation,
  UnaryExpression,
  VariableDeclaration,
  VariableDeclarator } from '@babel/types';
import { addComment,
  anyTypeAnnotation,
  arrayTypeAnnotation,
  blockStatement,
  booleanLiteralTypeAnnotation,
  booleanTypeAnnotation,
  classBody,
  classDeclaration,
  classMethod,
  classProperty,
  declareClass,
  declareExportDeclaration,
  declareFunction,
  declareInterface,
  declareModule,
  declareTypeAlias,
  declareVariable,
  emptyStatement,
  emptyTypeAnnotation,
  exportAllDeclaration,
  exportDefaultDeclaration,
  exportNamedDeclaration,
  exportNamespaceSpecifier,
  exportSpecifier,
  file,
  functionDeclaration,
  functionTypeAnnotation,
  functionTypeParam,
  genericTypeAnnotation,
  identifier,
  importDeclaration,
  indexedAccessType,
  inheritsComments,
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
  returnStatement,
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
  variableDeclaration, variableDeclarator,
  variance,
  voidTypeAnnotation } from '@babel/types';
import { toFlowModuleBlockStatement } from './toFlowModule/toFlowModule';

type TransformTypeFlags = {|
  readOnly?: boolean,
|};

type TransformContext = {|
  interfaces: { [key: string]: DeclareInterface | InterfaceDeclaration, ... },
  requireIfHelper: boolean,
  variables: { [key: string]: DeclareVariable | VariableDeclarator, ... },
|};

function copyComments<T: Node>(input: Node, output: T): T {
  inheritsComments<T>(output, input);
  return output;
}

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
    console.log(
      `[convertMemberExpressionIdentifier]: not supported object type ${object.type}`,
    );
    return null;
  }

  if (object.name !== 'Symbol') {
    console.log(
      `[convertMemberExpressionIdentifier]: not supported object name ${object.name}`,
    );
    return null;
  }

  if (property.type !== 'Identifier') {
    console.log(
      `[convertMemberExpressionIdentifier]: not supported property type ${property.type}`,
    );
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
    console.log(
      `[convertMemberExpressionIdentifier]: not supported property name ${property.name}`,
    );
    return null;
  }

  return copyComments(input, identifier(`@@${property.name}`));
}

function getObjectPropertyKey(
  inputKey,
  // eslint-disable-next-line no-unused-vars
  ctx: TransformContext,
) {
  if (
    inputKey.type !== 'Identifier'
    && inputKey.type !== 'StringLiteral'
    && inputKey.type !== 'MemberExpression'
  ) {
    console.log(
      `getObjectPropertyKey: TSPropertySignature not supported key ${inputKey.type}`,
    );
    return null;
  }

  const key = inputKey.type === 'MemberExpression'
    ? convertMemberExpressionIdentifier(inputKey)
    : inputKey;

  if (key === null) {
    console.log(
      `getObjectPropertyKey: TSPropertySignature not supported key ${inputKey.type}`,
    );
    return null;
  }

  if (key.type === 'StringLiteral') {
    return copyComments(inputKey, identifier(key.value));
  }

  return key;
}

function transformTSMethodSignature(
  input: TSMethodSignature,
  ctx: TransformContext,
): ObjectTypeCallProperty | ObjectTypeIndexer | ObjectTypeProperty {
  const key = getObjectPropertyKey(input.key, ctx);

  const value = transformFunctionTypeAnnotation(input, ctx);

  // Not supported
  if (key === null) {
    return copyComments(
      input,
      objectTypeIndexer(null, anyTypeAnnotation(), value),
    );
  }

  if (
    input.computed !== true
    || (key.type === 'Identifier' && ctx.variables[key.name] == null)
  ) {
    const prop = copyComments(
      input,
      objectTypeProperty(key, value, null),
    );

    if (input.optional === true) {
      prop.optional = true;
    } else {
      prop.method = true;
    }

    return prop;
  }

  return copyComments(
    input,
    objectTypeIndexer(
      null,
      typeofTypeAnnotation(genericTypeAnnotation(key)),
      input.optional === true ? nullableTypeAnnotation(value) : value,
    ),
  );
}

function transformTSPropertySignature(
  input: TSPropertySignature,
  ctx: TransformContext,
): ObjectTypeCallProperty | ObjectTypeIndexer | ObjectTypeProperty {
  const key = getObjectPropertyKey(input.key, ctx);

  if (input.typeAnnotation == null) {
    console.log(
      'transformTSTypeElement: TSPropertySignature not supported empty typeAnnotation',
    );
  }

  const value = input.typeAnnotation == null
    ? anyTypeAnnotation()
    : transformTSTypeAnnotation(input.typeAnnotation, ctx);

  if (key === null || input.typeAnnotation === null) {
    return copyComments(
      input,
      objectTypeIndexer(
        null,
        anyTypeAnnotation(),
        input.optional === true ? nullableTypeAnnotation(value) : value,
      ),
    );
  }

  if (
    input.computed !== true
    || (key.type === 'Identifier' && ctx.variables[key.name] == null)
  ) {
    const prop = copyComments(
      input,
      objectTypeProperty(
        key,
        value,
        input.readonly === true ? variance('plus') : null,
      ),
    );

    if (input.optional === true) {
      prop.optional = true;
    }

    return prop;
  }

  return copyComments(
    input,
    objectTypeIndexer(
      null,
      typeofTypeAnnotation(genericTypeAnnotation(key)),
      input.optional === true ? nullableTypeAnnotation(value) : value,
    ),
  );
}

function transformTSTypeElement(
  input: TSTypeElement,
  ctx: TransformContext,
): ObjectTypeCallProperty | ObjectTypeIndexer | ObjectTypeProperty {
  switch (input.type) {
    case 'TSCallSignatureDeclaration': {
      return copyComments(
        input,
        objectTypeCallProperty(
          transformFunctionTypeAnnotation(input, ctx),
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
        throw new Error(
          'transformTSTypeElement: TSConstructSignatureDeclaration not supported empty typeAnnotation',
        );
      }

      const prop = copyComments(
        input,
        objectTypeProperty(
          identifier('constructor'),
          transformFunctionTypeAnnotation(input, ctx),
          null,
        ),
      );
      prop.method = true;

      return prop;
    }
    case 'TSIndexSignature': {
      if (input.parameters.length !== 1) {
        throw new Error(
          '[transformTSTypeElement]: TSIndexSignature supports only identifiers',
        );
      }
      const [id] = input.parameters;
      if (id == null && id.type !== 'Identifier') {
        throw new Error(
          `[transformTSTypeElement]: TSIndexSignature non-identifier not supported ${id.type}`,
        );
      }

      if (id.typeAnnotation == null) {
        throw new Error(
          '[transformTSTypeElement]: TSIndexSignature not supported empty typeAnnotation',
        );
      }

      if (id.typeAnnotation.type !== 'TSTypeAnnotation') {
        throw new Error(
          `[transformTSTypeElement]: TSIndexSignature not supported typeAnnotation ${id.typeAnnotation.type}`,
        );
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

      if (
        input.typeAnnotation == null
        || input.typeAnnotation.type === 'Noop'
      ) {
        throw new Error(
          '[transformTSTypeElement]: TSIndexSignature not supported empty typeAnnotation',
        );
      }
      const value = transformTSTypeAnnotation(input.typeAnnotation, ctx);

      return copyComments(
        input,
        objectTypeIndexer(id, key, value, null),
      );
    }
    default: {
      throw new Error(`[transformTSTypeElement]: not supported ${input.type}`);
    }
  }
}

function transformRestElement(
  input: RestElement,
  ctx: TransformContext,
): FunctionTypeParam {
  if (input.argument != null && input.argument.type !== 'Identifier') {
    throw new Error(
      `[transformRestElement]: not supported ${input.argument.type}`,
    );
  }

  if (input.typeAnnotation == null || input.typeAnnotation.type === 'Noop') {
    throw new Error('[transformRestElement]: not supported typeAnnotation');
  }

  const p = copyComments(
    input,
    functionTypeParam(
      input.argument,
      transformTSTypeAnnotation(input.typeAnnotation, ctx),
    ),
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
        throw new Error(
          `transformObjectProperties: ObjectProperty not supported key ${p.key.type}`,
        );
      }

      if (
        p.value.type !== 'NumericLiteral'
        || p.value.type !== 'StringLiteral'
      ) {
        throw new Error(
          `transformObjectProperties: ObjectProperty not supported value ${p.value.type}`,
        );
      }

      return copyComments(
        p,
        objectTypeProperty(
          p.key,
          transformTSLiteralTypeElement(p.value),
          null,
        ),
      );
    }

    if (p.type === 'RestElement') {
      return copyComments(
        p,
        objectTypeSpreadProperty(
          transformRestElement(p, ctx).typeAnnotation,
        ),
      );
    }

    throw new Error(`[transformObjectProperties]: not supported ${p.type}`);
  });
}

function transformArrayPattern(
  input: ArrayPattern,
  ctx: TransformContext,
): FunctionTypeParam {
  const p = copyComments(
    input,
    functionTypeParam(
      null,
      input.typeAnnotation == null
      || input.typeAnnotation.type !== 'TSTypeAnnotation'
        ? tupleTypeAnnotation(
          input.elements.map(e => transformPatternLike(e, ctx)),
        )
        : transformTSTypeAnnotation(input.typeAnnotation, ctx),
    ),
  );
  if (input.optional === true) {
    p.optional = true;
  }

  return p;
}

function transformObjectPattern(
  input: ObjectPattern,
  ctx: TransformContext,
): FunctionTypeParam {
  const p = copyComments(
    input,
    functionTypeParam(
      null,
      input.typeAnnotation == null || input.typeAnnotation.type === 'Noop'
        ? objectTypeAnnotation(transformObjectProperties(input.properties, ctx))
        : transformTSTypeAnnotation(input.typeAnnotation, ctx),
    ),
  );

  return p;
}

function transformPatternLike(
  input: PatternLike | null,
  ctx: TransformContext,
): FlowType {
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
      const p = copyComments(
        param,
        functionTypeParam(
          null,
          param.typeAnnotation == null || param.typeAnnotation.type === 'Noop'
            ? objectTypeAnnotation(
              transformObjectProperties(param.properties, ctx),
            )
            : transformTSTypeAnnotation(param.typeAnnotation, ctx),
        ),
      );

      return p;
    }

    if (param.type === 'ArrayPattern') {
      return transformArrayPattern(param, ctx);
    }

    if (
      param.typeAnnotation == null
      || param.typeAnnotation.type !== 'TSTypeAnnotation'
    ) {
      throw new Error(
        `[transformFunctionTypeAnnotation]: not supported param type ${param.type}`,
      );
    }

    const p = copyComments(
      param,
      functionTypeParam(
        param,
        transformTSTypeAnnotation(param.typeAnnotation, ctx),
      ),
    );
    if (param.optional === true) {
      p.optional = true;
    }

    return p;
  });

  return [
    paramsList,
    restParams.length === 0 ? null : transformRestElement(restParams[0], ctx),
  ];
}

function transformFunctionTypeAnnotation(
  input: | TSCallSignatureDeclaration
    | TSConstructSignatureDeclaration
    | TSMethodSignature,
  ctx: TransformContext,
): FunctionTypeAnnotation {
  if (input.typeAnnotation == null) {
    throw new Error(
      'transformFunctionTypeAnnotation: TSCallSignatureDeclaration not supported empty typeAnnotation',
    );
  }

  const returnType = transformTSTypeAnnotation(input.typeAnnotation, ctx);

  const [params, restParam] = transformFunctionParams(input.parameters, ctx);

  return copyComments(
    input,
    functionTypeAnnotation(
      input.typeParameters == null
        ? null
        : transformTSTypeParameterDeclaration(input.typeParameters, ctx),
      params,
      restParam,
      returnType,
    ),
  );
}

function createObjectTypeAnnotation(
  statements: $ReadOnlyArray<
    ObjectTypeCallProperty | ObjectTypeIndexer | ObjectTypeProperty>,
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
  const out = copyComments(
    input,
    createObjectTypeAnnotation(
      input.body.map(s => transformTSTypeElement(s, ctx)),
    ),
  );
  out.inexact = null;
  return out;
}

function transformTSTypeParameterInstantiation(
  input: TSTypeParameterInstantiation,
  ctx: TransformContext,
): TypeParameterInstantiation {
  return copyComments(
    input,
    typeParameterInstantiation(
      input.params.map(p => transformTsType(p, ctx)),
    ),
  );
}

function transformTSLiteralTypeElement(
  input: TSLiteralType['literal'],
): FlowType {
  switch (input.type) {
    case 'NumericLiteral':
      return copyComments(
        input,
        numberLiteralTypeAnnotation(input.value),
      );
    case 'BooleanLiteral':
      return copyComments(
        input,
        booleanLiteralTypeAnnotation(input.value),
      );
    case 'StringLiteral':
      return copyComments(
        input,
        stringLiteralTypeAnnotation(input.value),
      );
    case 'UnaryExpression': {
      if (input.argument.type !== 'NumericLiteral' || input.operator !== '-') {
        throw new Error(
          `transformTSLiteralTypeElement/UnaryExpression: not supported ${input.operator} ${input.argument.type}`,
        );
      }
      return copyComments(
        input,
        numberLiteralTypeAnnotation(-input.argument.value),
      );
    }
    case 'TemplateLiteral': {
      return addComment(
        copyComments(
          input,
          anyTypeAnnotation(),
        ),
        'inner',
        'TemplateLiteral is not supported by flow',
      );
    }
    default: {
      console.log(input);
      throw new Error(
        `transformTSLiteralTypeElement: not supported ${input.type}`,
      );
    }
  }
}

function transformTSMappedType(
  input: TSMappedType,
  ctx: TransformContext,
) {
  const {
    typeParameter: {
      name,
      constraint,
    },
  } = input;

  if (input.typeAnnotation == null) {
    console.error('transformTSMappedType: typeAnnotation is null');
  }

  const returnType = input.typeAnnotation == null
    ? copyComments(
      input,
      anyTypeAnnotation(),
    )
    : copyComments(
      input,
      transformTsType(input.typeAnnotation, ctx),
    );

  if (constraint == null) {
    console.error('transformTSMappedType: constraint is null');
  }

  const objType = constraint != null && constraint.type === 'TSTypeOperator' && constraint.operator === 'keyof'
    ? transformTsType(constraint.typeAnnotation, ctx)
    : objectTypeAnnotation(
      [],
      [
        objectTypeIndexer(
          identifier('k'),
          constraint == null ? anyTypeAnnotation() : transformTsType(constraint, ctx),
          anyTypeAnnotation(),
        ),
      ],
    );

  const fnTypeParam = typeParameter(
    null,
    null,
    null,
  );
  fnTypeParam.name = name;

  return copyComments(
    input,
    genericTypeAnnotation(
      identifier('$ObjMapi'),
      typeParameterInstantiation([
        objType,
        functionTypeAnnotation(
          typeParameterDeclaration([fnTypeParam]),
          [functionTypeParam(
            null,
            genericTypeAnnotation(
              identifier(input.typeParameter.name),
            ),
          )],
          null,
          returnType,
        ),
      ]),
    ),
  );
}

function transformTSConditionalType(
  input: TSConditionalType,
  ctx: TransformContext,
): GenericTypeAnnotation {
  ctx.requireIfHelper = true;
  return copyComments(
    input,
    genericTypeAnnotation(
      identifier('$If'),
      typeParameterInstantiation([
        genericTypeAnnotation(
          identifier('$Assignable'),
          typeParameterInstantiation([
            transformTsType(input.checkType, ctx),
            transformTsType(input.extendsType, ctx),
          ]),
        ),
        transformTsType(input.trueType, ctx),
        transformTsType(input.falseType, ctx),
      ]),
    ),
  );
}

function transformTSTypeReference(
  input: TSTypeReference,
  ctx: TransformContext,
): GenericTypeAnnotation {
  return copyComments(
    input,
    genericTypeAnnotation(
      transformTSEntityName(input.typeName),
      input.typeParameters == null
        ? null
        : transformTSTypeParameterInstantiation(input.typeParameters, ctx),
    ),
  );
}

function transformTSTypeQuery(
  input: TSTypeQuery,
  ctx: TransformContext,
): TypeofTypeAnnotation {
  if (input.exprName.type === 'TSImportType') {
    console.warn('transformTSTypeQuery: TSImportType not supported');
  }

  return copyComments(
    input,
    typeofTypeAnnotation(
      input.exprName.type === 'TSImportType'
        ? anyTypeAnnotation()
        : genericTypeAnnotation(
          transformTSEntityName(input.exprName),
        ),
    ),
  );
}

function transformTsType(
  input: TSType,
  ctx: TransformContext,
  flags?: TransformTypeFlags = { ...null },
): FlowType {
  switch (input.type) {
    case 'TSTypeLiteral': {
      return copyComments(
        input,
        createObjectTypeAnnotation(
          input.members.map(m => transformTSTypeElement(m, ctx)),
        ),
      );
    }
    case 'TSStringKeyword':
      return copyComments(
        input,
        stringTypeAnnotation(),
      );
    case 'TSNumberKeyword':
      return copyComments(
        input,
        numberTypeAnnotation(),
      );
    case 'TSVoidKeyword':
      return copyComments(
        input,
        voidTypeAnnotation(),
      );
    case 'TSAnyKeyword':
      // TODO: add option to return mixedTypeAnnotation
      return copyComments(
        input,
        anyTypeAnnotation(),
      );
    case 'TSBooleanKeyword':
      return copyComments(
        input,
        booleanTypeAnnotation(),
      );
    case 'TSNullKeyword':
      return copyComments(
        input,
        nullLiteralTypeAnnotation(),
      );
    case 'TSUndefinedKeyword':
      return copyComments(
        input,
        voidTypeAnnotation(),
      );
    case 'TSUnionType':
      return copyComments(
        input,
        unionTypeAnnotation(
          input.types.map(t => transformTsType(t, ctx)),
        ),
      );
    case 'TSObjectKeyword': {
      const t = objectTypeAnnotation([], null, null, null, false);
      t.inexact = true;

      if (flags.readOnly === true) {
        return copyComments(
          input,
          genericTypeAnnotation(
            identifier('$ReadOnly'),
            typeParameterInstantiation([t]),
          ),
        );
      }

      return copyComments(
        input,
        t,
      );
    }
    case 'TSLiteralType': {
      return transformTSLiteralTypeElement(input.literal);
    }
    case 'TSNeverKeyword':
      return copyComments(input, emptyTypeAnnotation());
    case 'TSUnknownKeyword':
      return copyComments(input, mixedTypeAnnotation());
    case 'TSSymbolKeyword':
      return copyComments(input, symbolTypeAnnotation());
    case 'TSTypeOperator': {
      switch (input.operator) {
        case 'unique':
          return transformTsType(input.typeAnnotation, ctx);
        case 'readonly':
          return transformTsType(input.typeAnnotation, ctx, { readOnly: true });
        case 'keyof':
          return copyComments(
            input,
            genericTypeAnnotation(
              identifier('$Keys'),
              typeParameterInstantiation([
                transformTsType(input.typeAnnotation, ctx),
              ]),
            ),
          );
        default:
          console.error(
            `transformTSTypeAnnotation/TSTypeOperator: not supported ${input.operator}`,
          );
          return copyComments(input, anyTypeAnnotation());
      }
    }
    case 'TSTupleType': {
      return copyComments(
        input,
        tupleTypeAnnotation(
          input.elementTypes.map(el => transformTsType(
            el.type === 'TSNamedTupleMember' ? el.elementType : el,
            ctx,
          )),
        ),
      );
    }
    case 'TSArrayType': {
      if (flags.readOnly === true) {
        return copyComments(
          input,
          genericTypeAnnotation(
            identifier('$ReadOnlyArray'),
            typeParameterInstantiation([transformTsType(input.elementType, ctx)]),
          ),
        );
      }

      return arrayTypeAnnotation(transformTsType(input.elementType, ctx));
    }
    case 'TSTypeReference': {
      return transformTSTypeReference(input, ctx);
    }
    case 'TSFunctionType': {
      const [params, restParam] = transformFunctionParams(
        input.parameters,
        ctx,
      );
      return copyComments(
        input,
        functionTypeAnnotation(
          input.typeParameters == null
            ? null
            : transformTSTypeParameterDeclaration(input.typeParameters, ctx),
          params,
          restParam,
          input.typeAnnotation === null
            ? voidTypeAnnotation()
            : transformTSTypeAnnotation(input.typeAnnotation, ctx),
        ),
      );
    }
    case 'TSIntersectionType': {
      return copyComments(
        input,
        intersectionTypeAnnotation(
          input.types.map(t => transformTsType(t, ctx)),
        ),
      );
    }
    case 'TSThisType': {
      return copyComments(input, thisTypeAnnotation());
    }
    case 'TSMappedType': {
      return transformTSMappedType(input, ctx);
    }
    case 'TSIndexedAccessType': {
      return copyComments(
        input,
        indexedAccessType(
          transformTsType(input.objectType, ctx),
          transformTsType(input.indexType, ctx),
        ),
      );
    }
    case 'TSConditionalType': {
      return transformTSConditionalType(input, ctx);
    }
    case 'TSTypeQuery':
      return transformTSTypeQuery(input, ctx);
    default: {
      console.log(`transformTsType: not supported ${input.type}`, input);
      // eslint-disable-next-line no-unused-vars
      const n: empty = input.type;
      return copyComments(input, anyTypeAnnotation());
    }
  }
}

function transformTSTypeParameter(
  input: TSTypeParameter,
  ctx: TransformContext,
): TypeParameter {
  const ast = typeParameter(
    input.constraint == null
      ? null
      : typeAnnotation(transformTsType(input.constraint, ctx)),
    input.default == null ? null : transformTsType(input.default, ctx),
    null,
  );

  ast.name = input.name;

  return copyComments(input, ast);
}

function transformTSTypeParameterDeclaration(
  input: TSTypeParameterDeclaration,
  ctx: TransformContext,
): TypeParameterDeclaration {
  return copyComments(
    input,
    typeParameterDeclaration(
      input.params.map(p => transformTSTypeParameter(p, ctx)),
    ),
  );
}

function transformTSTypeAliasDeclaration(
  input: TSTypeAliasDeclaration,
  ctx: TransformContext,
): DeclareTypeAlias | TypeAlias {
  if (input.declare === true) {
    return copyComments(
      input,
      declareTypeAlias(
        input.id,
        input.typeParameters == null
          ? null
          : transformTSTypeParameterDeclaration(input.typeParameters, ctx),
        transformTsType(input.typeAnnotation, ctx),
      ),
    );
  }

  return copyComments(
    input,
    typeAlias(
      input.id,
      input.typeParameters == null
        ? null
        : transformTSTypeParameterDeclaration(input.typeParameters, ctx),
      transformTsType(input.typeAnnotation, ctx),
    ),
  );
}

function transformTSEntityName(
  input: TSEntityName,
): Identifier | QualifiedTypeIdentifier {
  if (input.type === 'Identifier') {
    switch (input.name) {
      case 'Readonly':
        return copyComments(
          input,
          identifier('$ReadOnly'),
        );
      default:
        return input;
    }
  }

  return copyComments(
    input,
    qualifiedTypeIdentifier(
      input.right,
      transformTSEntityName(input.left),
    ),
  );
}

function transformTSExpressionWithTypeArguments(
  input: TSExpressionWithTypeArguments,
): InterfaceExtends {
  return copyComments(
    input,
    interfaceExtends(transformTSEntityName(input.expression)),
  );
}

function transformInterfaceDeclaration(
  input: TSInterfaceDeclaration,
  ctx: TransformContext,
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

  return copyComments(input, ast);
}

function transformExpression<E: Expression>(
  input: E,
  ctx: TransformContext,
): E {
  switch (input.type) {
    case 'BooleanLiteral':
      return input;
    case 'StringLiteral':
      return input;
    case 'Identifier': {
      const id: Identifier = transformIdentifier(input, ctx);
      // $FlowExpectedError[incompatible-return]
      return id;
    }
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
      console.log(
        `transformExpressionTypeElement: not supported ${input.type}`,
        input,
      );
      // eslint-disable-next-line no-unused-vars
      const n: empty = input.type;
      return copyComments(input, anyTypeAnnotation());
    }
  }
}

function transformVariableDeclarator(
  input: VariableDeclarator,
  ctx: TransformContext,
): VariableDeclarator {
  const output = variableDeclarator(
    input.id,
    input.init == null ? null : transformExpression(input.init, ctx),
  );
  if (output.id.type === 'Identifier') {
    ctx.variables[output.id.name] = output;
  }
  return copyComments(input, output);
}

function transformClassMethod(
  input: ClassBody['body'][number],
  ctx: TransformContext,
): ClassBody['body'][number] {
  switch (input.type) {
    case 'ClassMethod': {
      const key = input.key.type === 'Identifier' && ctx.variables[input.key.name] != null
        ? copyComments(input.key, unaryExpression('typeof', input.key))
        : input.key;

      return copyComments(input, classMethod(input.kind, key, input.params, input.body));
    }
    case 'ClassProperty': {
      const key = input.key.type === 'Identifier' && ctx.variables[input.key.name] != null
        ? copyComments(input, unaryExpression('typeof', input.key))
        : input.key;

      return copyComments(
        input,
        classProperty(
          key,
          input.value,
          input.typeAnnotation?.type === 'TSTypeAnnotation'
            ? typeAnnotation(transformTSTypeAnnotation(input.typeAnnotation, ctx))
            : input.typeAnnotation,
          input.decorators,
          input.computed,
          input.static,
        ),
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
  classIdentifier: GenericTypeAnnotation,
): ObjectTypeCallProperty | ObjectTypeIndexer | ObjectTypeProperty | null {
  switch (input.type) {
    case 'ClassMethod': {
      const [params, restParam] = transformFunctionParams(input.params, ctx);

      const fn = functionTypeAnnotation(
        input.typeParameters != null
          && input.typeParameters.type === 'TSTypeParameterDeclaration'
          ? transformTSTypeParameterDeclaration(input.typeParameters, ctx)
          : null,
        params,
        restParam,
        input.returnType != null && input.returnType.type === 'TSTypeAnnotation'
          ? transformTSTypeAnnotation(input.returnType, ctx)
          : anyTypeAnnotation(),
      );

      if (input.kind === 'constructor') {
        return copyComments(input, objectTypeCallProperty(fn));
      }

      if (
        input.key.type !== 'Identifier'
        && input.key.type !== 'StringLiteral'
      ) {
        throw new Error(
          `transformClassDeclarationBody: ClassMethod not supported key ${input.key.type}`,
        );
      }

      if (
        input.key.type === 'Identifier'
        && ctx.variables[input.key.name] != null
      ) {
        return copyComments(
          input,
          objectTypeIndexer(
            null,
            typeofTypeAnnotation(genericTypeAnnotation(input.key)),
            input.optional === true ? nullableTypeAnnotation(fn) : fn,
          ),
        );
      }

      const prop = copyComments(
        input,
        objectTypeProperty(input.key, fn, variance('plus')),
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
      if (
        input.key.type !== 'Identifier'
        && input.key.type !== 'StringLiteral'
        && input.key.type !== 'MemberExpression'
      ) {
        throw new Error(
          `transformClassDeclarationBody: ClassProperty not supported key ${input.key.type}`,
        );
      }

      const key = input.key.type === 'MemberExpression'
        ? convertMemberExpressionIdentifier(input.key)
        : input.key;
      if (key === null) {
        throw new Error(
          `transformTSTypeElement: TSPropertySignature not supported key ${input.key.type}`,
        );
      }

      const value = input.typeAnnotation != null
        && input.typeAnnotation.type === 'TSTypeAnnotation'
        ? transformTSTypeAnnotation(input.typeAnnotation, ctx)
        : anyTypeAnnotation();

      if (
        input.computed === true
        && key.type === 'Identifier'
        && ctx.variables[key.name] != null
      ) {
        return copyComments(
          input,
          objectTypeIndexer(
            null,
            typeofTypeAnnotation(genericTypeAnnotation(key)),
            input.optional === true ? nullableTypeAnnotation(value) : value,
          ),
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

      return copyComments(input, prop);
    }
    case 'TSDeclareMethod': {
      const returnType = input.returnType != null && input.returnType.type === 'TSTypeAnnotation'
        ? transformTSTypeAnnotation(input.returnType, ctx)
        : anyTypeAnnotation();
      const [params, restParam] = transformFunctionParams(input.params, ctx);

      if (input.kind === 'constructor') {
        const construct = objectTypeProperty(
          identifier('constructor'),
          functionTypeAnnotation(
            input.typeParameters != null
                  && input.typeParameters.type === 'TSTypeParameterDeclaration'
              ? transformTSTypeParameterDeclaration(input.typeParameters, ctx)
              : null,
            params,
            restParam,
            classIdentifier,
          ),
        );
        construct.kind = 'init';
        construct.method = true;

        return copyComments(input, construct);
      }

      const value = input.kind === 'get'
        ? returnType
        : functionTypeAnnotation(
          input.typeParameters != null
                && input.typeParameters.type === 'TSTypeParameterDeclaration'
            ? transformTSTypeParameterDeclaration(input.typeParameters, ctx)
            : null,
          params,
          restParam,
          returnType,
        );

      if (
        input.key.type !== 'Identifier'
        && input.key.type !== 'StringLiteral'
        && input.key.type !== 'MemberExpression'
      ) {
        throw new Error(
          `transformClassDeclarationBody: ClassMethod not supported key ${input.key.type}`,
        );
      }

      const key = input.key.type === 'MemberExpression'
        ? convertMemberExpressionIdentifier(input.key)
        : input.key;
      if (key === null) {
        throw new Error(
          `transformTSTypeElement: TSPropertySignature not supported key ${input.key.type}`,
        );
      }

      if (
        input.key.type === 'Identifier'
        && ctx.variables[input.key.name] != null
      ) {
        return copyComments(
          input,
          objectTypeIndexer(
            null,
            typeofTypeAnnotation(genericTypeAnnotation(input.key)),
            input.optional === true ? nullableTypeAnnotation(value) : value,
          ),
        );
      }

      const prop = objectTypeProperty(key, value, variance('plus'));

      if (input.optional === true) {
        prop.optional = true;
      } else if (input.kind !== 'get') {
        prop.method = true;
        prop.variance = null;
      }

      if (input.static === true) {
        prop.static = true;
      }

      return copyComments(input, prop);
    }
    default:
      console.log(
        `[transformClassDeclarationBody]: not supported ${input.type}`,
      );
      return null;
  }
}

function transformInterfaceExtends(
  input: ClassImplements | TSExpressionWithTypeArguments,
  ctx: TransformContext,
): InterfaceExtends {
  if (input.type === 'TSExpressionWithTypeArguments') {
    return copyComments(
      input,
      interfaceExtends(
        transformTSEntityName(input.expression),
        input.typeParameters == null
          ? null
          : transformTSTypeParameterInstantiation(input.typeParameters, ctx),
      ),
    );
  }

  return copyComments(input, interfaceExtends(input.id, input.typeParameters));
}

function transformClassDeclaration(
  input: ClassDeclaration,
  ctx: TransformContext,
): ClassDeclaration | DeclareClass {
  const isDeclare = input.declare === true
    || input.body.body.some(s => s.type === 'TSDeclareMethod');

  const typeParameters = input.typeParameters != null
    && input.typeParameters.type === 'TSTypeParameterDeclaration'
    ? transformTSTypeParameterDeclaration(input.typeParameters, ctx)
    : null;

  if (isDeclare) {
    const classIdentifier = copyComments(
      input,
      genericTypeAnnotation(
        input.id,
        input.typeParameters == null || input.typeParameters.type === 'Noop'
          ? null
          : typeParameterInstantiation(
            input.typeParameters.params.map(
              param => genericTypeAnnotation(
                identifier(param.name),
              ),
            ),
          ),
      ),
    );
    const [props, indexers, calls] = input.body.body
      .map(s => transformClassDeclarationBody(s, ctx, classIdentifier))
      .reduce(
        (acc, s) => {
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
        },
        [[], [], []],
      );

    const ext = input.implements == null || input.implements.length === 0
      ? null
      : input.implements.map(i => transformInterfaceExtends(i, ctx));

    const output = declareClass(
      input.id,
      typeParameters,
      null,
      objectTypeAnnotation(props, indexers, calls),
    );

    if (ext != null) {
      output.mixins = ext;
    }

    return copyComments(input, output);
  }

  const t = classDeclaration(
    input.id,
    input.superClass,
    classBody(input.body.body.map(s => transformClassMethod(s, ctx))),
    input.decorators,
  );

  if (typeParameters != null) {
    t.typeParameters = typeParameters;
  }

  if (
    input.superTypeParameters != null
    && input.superTypeParameters.type === 'TSTypeParameterDeclaration'
  ) {
    t.superTypeParameters = transformTSTypeParameterInstantiation(
      input.superTypeParameters,
      ctx,
    );
  }

  return copyComments(input, t);
}

function transformIdentifier(
  input: Identifier,
  ctx: TransformContext,
): Identifier {
  const id = identifier(input.name);
  if (input.typeAnnotation != null && input.typeAnnotation.type !== 'Noop') {
    id.typeAnnotation = typeAnnotation(
      transformTSTypeAnnotation(input.typeAnnotation, ctx),
    );
  }

  if (input.optional === true) {
    id.optional = input.optional;
  }

  return copyComments(input, id);
}

function transformVariableDeclaratorToDeclareVariable(
  input: VariableDeclarator,
  ctx: TransformContext,
) {
  if (input.id.type !== 'Identifier') {
    throw new Error(
      'transformVariableDeclaratorToDeclareVariable: declaration variable not supported',
    );
  }
  const inputId = input.id;
  const id = transformIdentifier(inputId, ctx);
  const output = declareVariable(id);
  if (id.typeAnnotation == null && input.init != null) {
    id.typeAnnotation = typeAnnotation(
      transformExpressionTypeElement(input.init),
    );
  }

  return copyComments(input, output);
}

function transformVariableDeclaration(
  input: VariableDeclaration,
  ctx: TransformContext,
): $ReadOnlyArray<DeclareVariable | VariableDeclaration> {
  if (input.declare === true) {
    return input.declarations.map(d => transformVariableDeclaratorToDeclareVariable(d, ctx));
  }

  return [
    copyComments(input, variableDeclaration(
      input.kind,
      input.declarations.map(d => transformVariableDeclarator(d, ctx)),
    )),
  ];
}

function transformTSDeclareFunction(
  input: TSDeclareFunction,
  ctx: TransformContext,
): DeclareFunction {
  // if (input.declare !== true) {
  //   throw new Error('transformTSDeclareFunction: not supported declare must be true');
  // }

  if (input.id === null) {
    throw new Error('transformTSDeclareFunction: not supported id must be not null');
  }

  const id = transformIdentifier(input.id, ctx);

  const [params, restParam] = transformFunctionParams(input.params, ctx);

  const returnType = input.returnType == null || input.returnType.type === 'Noop'
    ? anyTypeAnnotation()
    : transformTSTypeAnnotation(input.returnType, ctx);

  const typeParams = input.typeParameters == null || input.typeParameters.type === 'Noop'
    ? null
    : transformTSTypeParameterDeclaration(input.typeParameters, ctx);

  id.typeAnnotation = typeAnnotation(
    functionTypeAnnotation(
      typeParams,
      params,
      restParam,
      returnType,
    ),
  );

  return copyComments(
    input, declareFunction(
      id,
    ),
  );
}

function transformFunctionDeclaration(
  input: FunctionDeclaration,
  ctx: TransformContext,
): FunctionDeclaration {
  const fn = functionDeclaration(
    input.id == null ? null : transformIdentifier(input.id, ctx),
    input.params.map((p) => {
      if (p.type === 'Identifier') {
        return transformIdentifier(p, ctx);
      }

      throw new Error('transformFunctionDeclaration: not supported');
    }),
    transformBlockStatement(input.body, ctx),
    input.generator,
    input.async,
  );

  if (input.returnType != null && input.returnType.type === 'TSTypeAnnotation') {
    fn.returnType = typeAnnotation(
      transformTSTypeAnnotation(input.returnType, ctx),
    );
  }

  if (input.typeParameters != null && input.typeParameters.type === 'TSTypeParameterDeclaratio') {
    fn.typeParameters = transformTSTypeParameterDeclaration(
      input.typeParameters,
      ctx,
    );
  }

  return copyComments(
    input,
    fn,
  );
}

function transformBlockStatement(
  input: BlockStatement,
  ctx: TransformContext,
): BlockStatement {
  return blockStatement(
    input.body.flatMap(s => transformStatement(s, ctx)),
    input.directives,
  );
}

function transformDeclaration(
  input: Declaration | null,
  ctx: TransformContext,
): $ReadOnlyArray<
  DeclareClass | DeclareFunction | DeclareInterface | DeclareTypeAlias
  | DeclareVariable | FunctionDeclaration | InterfaceDeclaration | TypeAlias | VariableDeclaration
> {
  if (input === null) {
    return [];
  }

  switch (input.type) {
    case 'VariableDeclaration':
      return transformVariableDeclaration(input, ctx);
    case 'ClassDeclaration': {
      const output = transformClassDeclaration(input, ctx);
      if (output.type === 'DeclareClass') {
        return [output];
      }
      console.log('transformDeclaration/ClassDeclaration: not expected');
      return [];
    }
    case 'TSTypeAliasDeclaration':
      return [transformTSTypeAliasDeclaration(input, ctx)];
    case 'TSInterfaceDeclaration': {
      const output = transformInterfaceDeclaration(input, ctx);
      if (output != null) {
        return [output];
      }
      return [];
    }
    case 'TSDeclareFunction': {
      return [transformTSDeclareFunction(input, ctx)];
    }
    case 'FunctionDeclaration': {
      return [transformFunctionDeclaration(input, ctx)];
    }
    default:
      console.log('[transformDeclaration]: not supported', input.type);
      return [];
  }
}

function transformExportSpecifier(
  input: ExportSpecifier,
  ctx: TransformContext,
) {
  const output = exportSpecifier(
    transformIdentifier(input.local, ctx),
    input.exported.type === 'StringLiteral'
      ? input.exported
      : transformIdentifier(input.exported, ctx),
  );
  output.exportKind = input.exportKind;
  return copyComments(input, output);
}

function transformExportNamespaceSpecifier(
  input: ExportNamespaceSpecifier,
  ctx: TransformContext,
) {
  return copyComments(input, exportNamespaceSpecifier(transformIdentifier(input.exported, ctx)));
}

function transformReturnStatement(
  input: ReturnStatement,
  ctx: TransformContext,
): ReturnStatement {
  return copyComments(
    input,
    returnStatement(
      input.argument == null
        ? null
        : transformExpression(input.argument, ctx),
    ),
  );
}

function transformStatement(
  input: Statement,
  ctx: TransformContext,
): $ReadOnlyArray<Statement> {
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

      const output = importDeclaration(input.specifiers, input.source);

      if (
        output.specifiers.some(s => s.type === 'ImportNamespaceSpecifier')
      ) {
        output.importKind = 'typeof';
      } else {
        output.importKind = 'type';
      }

      return [copyComments(input, output)];
    }
    case 'ExportNamedDeclaration': {
      if (input.specifiers.length > 0 && input.declaration != null) {
        console.log(
          'Unsupported ExportNamedDeclaration: has specifiers & declaration',
          input,
        );
        return [copyComments(input, emptyStatement())];
      }

      if (input.specifiers.length > 0) {
        const specifiers = input.specifiers.reduce((acc, s) => {
          if (s.type === 'ExportSpecifier') {
            acc.push(transformExportSpecifier(s, ctx));
          } else if (s.type === 'ExportNamespaceSpecifier') {
            acc.push(transformExportNamespaceSpecifier(s, ctx));
          } else {
            console.log(
              'Unsupported ExportNamedDeclaration: specifier not supported',
              s,
            );
          }

          return acc;
        }, []);

        return [copyComments(input, exportNamedDeclaration(null, specifiers, input.source))];
      }

      const declarations = transformDeclaration(input.declaration, ctx);

      return declarations.flatMap((declaration) => {
        if (
          declaration !== null
          && declaration.type === 'VariableDeclaration'
        ) {
          console.log(
            'Unsupported ExportNamedDeclaration: declaration is not declare',
          );
          return emptyStatement();
        }

        if (declaration !== null && declaration.type === 'DeclareClass') {
          return [
            declaration,
            copyComments(input, exportNamedDeclaration(
              null,
              [
                exportSpecifier(
                  declaration.id,
                  declaration.id,
                ),
              ],
              input.source,
            )),
          ];
        }

        if (declaration !== null && declaration.type === 'InterfaceDeclaration') {
          return [
            copyComments(input, exportNamedDeclaration(
              declaration,
              [],
              input.source,
            )),
          ];
        }

        if (declaration !== null && declaration.type === 'DeclareInterface') {
          const exportStatement = exportNamedDeclaration(
            null,
            [
              copyComments(input, exportSpecifier(
                declaration.id,
                declaration.id,
              )),
            ],
            input.source,
          );
          exportStatement.exportKind = 'type';
          return [
            declaration,
            exportStatement,
          ];
        }

        if (declaration !== null && declaration.type === 'DeclareTypeAlias') {
          const exportStatement = exportNamedDeclaration(
            null,
            [
              copyComments(input, exportSpecifier(
                declaration.id,
                declaration.id,
              )),
            ],
            input.source,
          );
          exportStatement.exportKind = 'type';
          return [
            declaration,
            exportStatement,
          ];
        }

        if (declaration !== null && declaration.type === 'FunctionDeclaration') {
          const exportStatement = exportNamedDeclaration(
            copyComments(input, declaration),
            [],
            input.source,
          );
          return [
            exportStatement,
          ];
        }

        return [copyComments(input, declareExportDeclaration(declaration, [], input.source))];
      });
    }
    case 'ExportDefaultDeclaration': {
      if (input.declaration.type === 'ClassDeclaration') {
        const declaration = transformClassDeclaration(input.declaration, ctx);
        if (declaration.type === 'DeclareClass') {
          console.log(
            'transformStatement/ExportDefaultDeclaration: DeclareClass not supported',
          );
          return [copyComments(input, emptyStatement())];
        }
        return [copyComments(input, exportDefaultDeclaration(declaration))];
      }

      if (
        input.declaration.type === 'FunctionDeclaration'
        || input.declaration.type === 'TSDeclareFunction'
      ) {
        console.log(
          `transformStatement/ExportDefaultDeclaration: does not support ${input.declaration.type}`,
        );
        return [];
      }

      const declaration = transformExpression(input.declaration, ctx);
      return [copyComments(input, exportDefaultDeclaration(declaration))];
    }
    case 'ExportAllDeclaration': {
      const output = exportAllDeclaration(input.source);
      output.exportKind = input.exportKind;
      return [copyComments(input, output)];
    }
    case 'TSModuleDeclaration': {
      if (input.body.type === 'TSModuleBlock') {
        return [
          copyComments(input, declareModule(
            input.id,
            toFlowModuleBlockStatement(
              input.body.body.flatMap(
                s => transformStatement(s, ctx),
              ),
            ),
          )),
        ];
      }
      console.log(
        `transformStatement/TSModuleDeclaration: does not support ${input.body.type}`,
      );
      return [copyComments(input, emptyStatement())];
    }
    case 'ReturnStatement':
      return [transformReturnStatement(input, ctx)];
    default: {
      console.log(`transformStatement: not supported ${input.type}`);
      // eslint-disable-next-line no-unused-vars
      const n: empty = input.type;
      return [copyComments(input, emptyStatement())];
    }
  }
}

function generateIfHelper() {
  const typeParamX = typeParameter(
    typeAnnotation(booleanTypeAnnotation()),
  );
  typeParamX.name = 'X';

  const typeParamThen = typeParameter();
  typeParamThen.name = 'Then';

  const typeParamElse = typeParameter();
  typeParamElse.name = 'Else';
  typeParamElse.default = emptyTypeAnnotation();

  const output = typeAlias(
    identifier('$If'),
    typeParameterDeclaration([
      typeParamX, typeParamThen, typeParamElse,
    ]),
    genericTypeAnnotation(
      identifier('$Call'),
      typeParameterInstantiation([
        intersectionTypeAnnotation([
          functionTypeAnnotation(
            null,
            [
              functionTypeParam(null, booleanLiteralTypeAnnotation(true)),
              functionTypeParam(
                null,
                genericTypeAnnotation(identifier('Then')),
              ),
              functionTypeParam(
                null,
                genericTypeAnnotation(identifier('Else')),
              ),
            ],
            null,
            genericTypeAnnotation(identifier('Then')),
          ),
          functionTypeAnnotation(
            null,
            [
              functionTypeParam(null, booleanLiteralTypeAnnotation(false)),
              functionTypeParam(
                null,
                genericTypeAnnotation(identifier('Then')),
              ),
              functionTypeParam(
                null,
                genericTypeAnnotation(identifier('Else')),
              ),
            ],
            null,
            genericTypeAnnotation(
              identifier('Else'),
            ),
          ),
        ]),
        genericTypeAnnotation(identifier('X')),
        genericTypeAnnotation(identifier('Then')),
        genericTypeAnnotation(identifier('Else')),
      ]),
    ),
  );

  return addComment(
    output,
    'leading',
    ' see https://gist.github.com/thecotne/6e5969f4aaf8f253985ed36b30ac9fe0',
    true,
  );
}

function generateAssignable() {
  const typeParamA = typeParameter();
  typeParamA.name = 'A';

  const typeParamB = typeParameter();
  typeParamB.name = 'B';

  return typeAlias(
    identifier('$Assignable'),
    typeParameterDeclaration([
      typeParamA,
      typeParamB,
    ]),
    genericTypeAnnotation(
      identifier('$Call'),
      typeParameterInstantiation([
        intersectionTypeAnnotation([
          functionTypeAnnotation(
            null,
            [],
            functionTypeParam(
              identifier('r'),
              tupleTypeAnnotation([
                genericTypeAnnotation(identifier('B')),
              ]),
            ),
            booleanLiteralTypeAnnotation(true),
          ),
          functionTypeAnnotation(
            null,
            [],
            functionTypeParam(
              identifier('r'),
              tupleTypeAnnotation([
                genericTypeAnnotation(identifier('A')),
              ]),
            ),
            booleanLiteralTypeAnnotation(false),
          ),
        ]),
        genericTypeAnnotation(identifier('A')),
      ]),
    ),
  );
}

function transformProgram(input: Program): Program {
  const ctx = {
    interfaces: {},
    variables: {},
    requireIfHelper: false,
  };

  const body = input.body.reduce((acc, s) => {
    acc.push(...transformStatement(s, ctx));
    return acc;
  }, []);

  const helpers = [];

  if (ctx.requireIfHelper) {
    helpers.push(generateIfHelper());
    helpers.push(generateAssignable());
  }

  return copyComments(input, program(
    [
      ...helpers,
      ...body,
    ],
  ));
}

export function tsToFlow(input: string): string {
  const typescriptAst = parse(input, {
    plugins: ['typescript'],
    tokens: true,
    sourceType: 'module',
  });

  const flowAst = file(transformProgram(typescriptAst.program));

  const { code } = generate(flowAst, {
    jsescOption: { compact: false, es6: true },
  });

  return code;
}
