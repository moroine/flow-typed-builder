// @flow

/* eslint-disable no-use-before-define, no-console */

import { readFileSync } from 'fs';
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
  ImportDeclaration,
  IndexedAccessType,
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
  StringLiteral,
  StringLiteralTypeAnnotation,
  TSCallSignatureDeclaration,
  TSConditionalType,
  TSConstructSignatureDeclaration,
  TSDeclareFunction,
  TSEntityName,
  TSExpressionWithTypeArguments,
  TSImportEqualsDeclaration,
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
  importDefaultSpecifier,
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
  stringLiteral,
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
  // eslint-disable-next-line no-unused-vars
  ctx: TransformContext,
): Identifier | IndexedAccessType | null {
  const { object, property } = input;
  if (object.type !== 'Identifier') {
    console.log(
      `[convertMemberExpressionIdentifier]: not supported object type ${object.type}`,
    );
    return null;
  }

  if (property.type !== 'Identifier') {
    console.log(
      `[convertMemberExpressionIdentifier]: not supported property type ${property.type}`,
    );
    return null;
  }

  if (object.name !== 'Symbol') {
    return indexedAccessType(
      genericTypeAnnotation(object),
      stringLiteralTypeAnnotation(property.name),
    );
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
  inputKey: Expression,
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
    ? convertMemberExpressionIdentifier(inputKey, ctx)
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

  if (key.type === 'IndexedAccessType') {
    return copyComments(
      input,
      objectTypeIndexer(
        null,
        key,
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

  if (key.type === 'IndexedAccessType') {
    return copyComments(
      input,
      objectTypeIndexer(
        null,
        key,
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
): ObjectTypeCallProperty | ObjectTypeIndexer | ObjectTypeProperty | null {
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
        console.log(
          'transformTSTypeElement: TSConstructSignatureDeclaration not supported empty typeAnnotation',
        );
        return null;
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
        console.log(
          '[transformTSTypeElement]: TSIndexSignature supports only identifiers',
        );
        return null;
      }
      const [id] = input.parameters;
      if (id == null && id.type !== 'Identifier') {
        console.log(
          `[transformTSTypeElement]: TSIndexSignature non-identifier not supported ${id.type}`,
        );
        return null;
      }

      if (id.typeAnnotation == null) {
        console.log(
          '[transformTSTypeElement]: TSIndexSignature not supported empty typeAnnotation',
        );
        return null;
      }

      if (id.typeAnnotation.type !== 'TSTypeAnnotation') {
        console.log(
          `[transformTSTypeElement]: TSIndexSignature not supported typeAnnotation ${id.typeAnnotation.type}`,
        );
        return null;
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
        console.log(
          '[transformTSTypeElement]: TSIndexSignature not supported empty typeAnnotation',
        );
        return null;
      }
      const value = transformTSTypeAnnotation(input.typeAnnotation, ctx);

      return copyComments(
        input,
        objectTypeIndexer(id, key, value, null),
      );
    }
    default: {
      console.log(`[transformTSTypeElement]: not supported ${input.type}`);
      return null;
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
        ? buildObjectTypeAnnotation(transformObjectProperties(input.properties, ctx), false)
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
      console.log(`[transformPatternLike]: not supported ${input.type}`);
      return anyTypeAnnotation();
    }
  }
}

function buildObjectTypeAnnotation(
  fields: $ReadOnlyArray<
    | ObjectTypeCallProperty
    | ObjectTypeIndexer
    | ObjectTypeProperty
    | ObjectTypeSpreadProperty
    | null>,
  exact: boolean | null,
): ObjectTypeAnnotation {
  const props = [];
  const indexers = { instance: [], static: [] };
  const calls = [];

  const shouldAddComment = { instance: false, static: false };

  for (const field of fields) {
    if (field?.type === 'ObjectTypeProperty') {
      const name: string = field.key.type === 'StringLiteral' ? field.key.value : field.key.name;
      if (isValidClassIdentifier(name)) {
        props.push(field);
      } else {
        const indexer = objectTypeIndexer(
          null,
          toStringLiteralTypeAnnotation(field.key),
          field.value,
          null,
        );
        if (field.static) {
          shouldAddComment.static = true;
          indexer.static = true;
          indexers.static.push(indexer);
        } else {
          shouldAddComment.instance = true;
          indexers.instance.push(indexer);
        }
      }
    } else if (field?.type === 'ObjectTypeSpreadProperty') {
      props.push(field);
    } else if (field?.type === 'ObjectTypeIndexer') {
      if (field.static) {
        indexers.static.push(field);
      } else {
        indexers.instance.push(field);
      }
    } else if (field?.type === 'ObjectTypeCallProperty') {
      calls.push(field);
    }
  }

  if (indexers.instance.length > 1) {
    const indexer = objectTypeIndexer(
      null,
      unionTypeAnnotation(indexers.instance.map(i => i.key)),
      unionTypeAnnotation(indexers.instance.map(i => i.value)),
      null,
    );
    if (shouldAddComment.instance) {
      addUnsupportedLiteralSyntaxComment(indexer);
    }
    indexers.instance = [indexer];
  }

  if (indexers.static.length > 1) {
    const indexer = objectTypeIndexer(
      null,
      unionTypeAnnotation(indexers.instance.map(i => i.key)),
      unionTypeAnnotation(indexers.instance.map(i => i.value)),
      null,
    );
    indexer.static = true;
    if (shouldAddComment.static) {
      addUnsupportedLiteralSyntaxComment(indexer);
    }
    indexers.instance = [indexer];
  }

  const output = objectTypeAnnotation(
    props,
    [...indexers.instance, ...indexers.static],
    calls,
    null,
    exact === true,
  );
  if (exact === false) {
    output.inexact = true;
  }

  return output;
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
            ? buildObjectTypeAnnotation(
              transformObjectProperties(param.properties, ctx),
              false,
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

function transformTSInterfaceBody(
  input: TSInterfaceBody,
  ctx: TransformContext,
): ObjectTypeAnnotation {
  const out = copyComments(
    input,
    buildObjectTypeAnnotation(
      input.body.reduce((acc, s) => {
        const output = transformTSTypeElement(s, ctx);
        if (output !== null) {
          acc.push(output);
        }
        return acc;
      }, []),
      null,
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
        console.log(
          `transformTSLiteralTypeElement/UnaryExpression: not supported ${input.operator} ${input.argument.type}`,
        );
        return anyTypeAnnotation();
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
      console.log(
        `transformTSLiteralTypeElement: not supported ${input.type}`,
      );
      return anyTypeAnnotation();
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
    : buildObjectTypeAnnotation(
      [
        objectTypeIndexer(
          identifier('k'),
          constraint == null ? anyTypeAnnotation() : transformTsType(constraint, ctx),
          anyTypeAnnotation(),
        ),
      ],
      false,
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
  // ctx: TransformContext,
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
        buildObjectTypeAnnotation(
          input.members.reduce((acc, s) => {
            const output = transformTSTypeElement(s, ctx);
            if (output !== null) {
              acc.push(output);
            }
            return acc;
          }, []),
          false,
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
      const t = buildObjectTypeAnnotation([], false);

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
      return transformTSTypeQuery(input);
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

// see https://stackoverflow.com/questions/2008279/validate-a-javascript-function-name
// eslint-disable-next-line no-misleading-character-class
const identifierRegex = /^(?!(?:do|if|in|for|let|new|try|var|case|else|enum|eval|false|null|this|true|void|with|break|catch|class|const|super|throw|while|yield|delete|export|import|public|return|static|switch|typeof|default|extends|finally|package|private|continue|debugger|function|arguments|interface|protected|implements|instanceof)$)[$A-Z_a-z\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc][$A-Z_a-z\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc0-9\u0300-\u036f\u0483-\u0487\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u0669\u0670\u06d6-\u06dc\u06df-\u06e4\u06e7\u06e8\u06ea-\u06ed\u06f0-\u06f9\u0711\u0730-\u074a\u07a6-\u07b0\u07c0-\u07c9\u07eb-\u07f3\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0859-\u085b\u08e4-\u08fe\u0900-\u0903\u093a-\u093c\u093e-\u094f\u0951-\u0957\u0962\u0963\u0966-\u096f\u0981-\u0983\u09bc\u09be-\u09c4\u09c7\u09c8\u09cb-\u09cd\u09d7\u09e2\u09e3\u09e6-\u09ef\u0a01-\u0a03\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a66-\u0a71\u0a75\u0a81-\u0a83\u0abc\u0abe-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ae2\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b3c\u0b3e-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b62\u0b63\u0b66-\u0b6f\u0b82\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c3e-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0cbc\u0cbe-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0ce6-\u0cef\u0d02\u0d03\u0d3e-\u0d44\u0d46-\u0d48\u0d4a-\u0d4d\u0d57\u0d62\u0d63\u0d66-\u0d6f\u0d82\u0d83\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0e50-\u0e59\u0eb1\u0eb4-\u0eb9\u0ebb\u0ebc\u0ec8-\u0ecd\u0ed0-\u0ed9\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e\u0f3f\u0f71-\u0f84\u0f86\u0f87\u0f8d-\u0f97\u0f99-\u0fbc\u0fc6\u102b-\u103e\u1040-\u1049\u1056-\u1059\u105e-\u1060\u1062-\u1064\u1067-\u106d\u1071-\u1074\u1082-\u108d\u108f-\u109d\u135d-\u135f\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17b4-\u17d3\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u18a9\u1920-\u192b\u1930-\u193b\u1946-\u194f\u19b0-\u19c0\u19c8\u19c9\u19d0-\u19d9\u1a17-\u1a1b\u1a55-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1b00-\u1b04\u1b34-\u1b44\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1b82\u1ba1-\u1bad\u1bb0-\u1bb9\u1be6-\u1bf3\u1c24-\u1c37\u1c40-\u1c49\u1c50-\u1c59\u1cd0-\u1cd2\u1cd4-\u1ce8\u1ced\u1cf2-\u1cf4\u1dc0-\u1de6\u1dfc-\u1dff\u200c\u200d\u203f\u2040\u2054\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2cef-\u2cf1\u2d7f\u2de0-\u2dff\u302a-\u302f\u3099\u309a\ua620-\ua629\ua66f\ua674-\ua67d\ua69f\ua6f0\ua6f1\ua802\ua806\ua80b\ua823-\ua827\ua880\ua881\ua8b4-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f1\ua900-\ua909\ua926-\ua92d\ua947-\ua953\ua980-\ua983\ua9b3-\ua9c0\ua9d0-\ua9d9\uaa29-\uaa36\uaa43\uaa4c\uaa4d\uaa50-\uaa59\uaa7b\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uaaeb-\uaaef\uaaf5\uaaf6\uabe3-\uabea\uabec\uabed\uabf0-\uabf9\ufb1e\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\uff10-\uff19\uff3f]*$/;

function isValidClassIdentifier(name: string): boolean {
  if (name.startsWith('@@')) {
    return true;
  }

  return identifierRegex.test(name);
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

function addUnsupportedLiteralSyntaxComment<T: Node>(input: T): T {
  return addComment(
    addComment(
      input,
      'leading',
      ' $FlowExpectedError[unsupported-syntax] ',
    ),
    'leading',
    ' see https://github.com/facebook/flow/issues/8912 ',
  );
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
      let key = input.key.type === 'Identifier' && ctx.variables[input.key.name] != null
        ? copyComments(input, unaryExpression('typeof', input.key))
        : input.key;

      // StringLiteral are not supported by FlowJs
      if (input.key.type === 'StringLiteral') {
        if (isValidClassIdentifier(input.key.value)) {
          key = identifier(input.key.value);
        } else {
          key = copyComments(
            input.key,
            stringLiteral(input.key.value),
          );
          key = addUnsupportedLiteralSyntaxComment(
            key,
          );
        }
      }

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
        console.log(
          `transformClassDeclarationBody: ClassMethod not supported key ${input.key.type}`,
        );
        return null;
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
        console.log(
          `transformClassDeclarationBody: ClassProperty not supported key ${input.key.type}`,
        );
        return null;
      }

      const key = input.key.type === 'MemberExpression'
        ? convertMemberExpressionIdentifier(input.key, ctx)
        : input.key;
      if (key === null) {
        console.log(
          `transformTSTypeElement: TSPropertySignature not supported key ${input.key.type}`,
        );
        return null;
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

      if (key.type === 'IndexedAccessType') {
        return copyComments(
          input,
          objectTypeIndexer(
            null,
            key,
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
        console.log(
          `transformClassDeclarationBody: ClassMethod not supported key ${input.key.type}`,
        );
        return null;
      }

      const key = input.key.type === 'MemberExpression'
        ? convertMemberExpressionIdentifier(input.key, ctx)
        : input.key;
      if (key === null) {
        console.log(
          `transformTSTypeElement: TSPropertySignature not supported key ${input.key.type}`,
        );
        return null;
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

      if (key.type === 'IndexedAccessType') {
        return copyComments(
          input,
          objectTypeIndexer(
            null,
            key,
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

function toStringLiteralTypeAnnotation(
  input: Identifier | StringLiteral,
): StringLiteralTypeAnnotation {
  return stringLiteralTypeAnnotation(input.type === 'Identifier' ? input.name : input.value);
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
    const typeAnnot = buildObjectTypeAnnotation(
      input.body.body
        .map(s => transformClassDeclarationBody(s, ctx, classIdentifier)),
      null,
    );

    const ext = input.implements == null || input.implements.length === 0
      ? null
      : input.implements.map(i => transformInterfaceExtends(i, ctx));

    const output = declareClass(
      input.id,
      typeParameters,
      null,
      typeAnnot,
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
): DeclareVariable | null {
  if (input.id.type !== 'Identifier') {
    console.log(
      'transformVariableDeclaratorToDeclareVariable: declaration variable not supported',
    );
    return null;
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
    return input.declarations.reduce(
      (acc, d) => {
        const o = transformVariableDeclaratorToDeclareVariable(d, ctx);
        if (o !== null) {
          acc.push(o);
        }

        return acc;
      },
      [],
    );
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
): DeclareFunction | null {
  if (input.id === null) {
    console.log('transformTSDeclareFunction: not supported id must be not null');
    return null;
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
      const output = transformTSDeclareFunction(input, ctx);
      if (output != null) {
        return [output];
      }
      return [];
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

function transformTSImportEqualsDeclaration(
  input: TSImportEqualsDeclaration,
  // ctx: TransformContext,
): ImportDeclaration[] {
  const { moduleReference } = input;
  if (moduleReference.type !== 'TSExternalModuleReference') {
    console.log('TSImportEqualsDeclaration: only supports TSExternalModuleReference');
    return [];
  }

  const output = importDeclaration(
    [importDefaultSpecifier(
      input.id,
    )],
    moduleReference.expression,
  );

  if (input.importKind === 'type') {
    output.importKind = 'type';
  }

  return [copyComments(input, output)];
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

    case 'TSImportEqualsDeclaration':
      return transformTSImportEqualsDeclaration(input);

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

function transformProgram(
  input: Program,
  asModule: boolean,
): Program {
  const ctx = {
    interfaces: {},
    variables: {},
    requireIfHelper: false,
  };

  let body = input.body.reduce((acc, s) => {
    acc.push(...transformStatement(s, ctx));
    return acc;
  }, []);

  if (asModule) {
    body = [toFlowModuleBlockStatement(body)];
  }

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

export function tsToFlow(
  input: string,
  type: 'content' | 'file',
  asModule: boolean,
): string {
  const content = type === 'content'
    ? input
    : readFileSync(input, 'utf8');

  const typescriptAst = parse(content, {
    plugins: ['typescript'],
    tokens: true,
    sourceType: 'module',
  });

  const flowAst = file(transformProgram(typescriptAst.program, asModule));

  const { code } = generate(flowAst, {
    jsescOption: { compact: false, es6: true },
  });

  return code;
}
