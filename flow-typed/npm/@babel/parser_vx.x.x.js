// flow-typed signature: 9985886813f97c10456752a45e146bde
// flow-typed version: <<STUB>>/@babel/parser_v7.16.12/flow_v0.170.0

/**
 * This is an autogenerated libdef stub for:
 *
 *   '@babel/parser'
 *
 * Fill this stub out by replacing all the `mixed` types.
 *
 * Once filled out, we encourage you to share your work with the
 * community by sending a pull request to:
 * https://github.com/flowtype/flow-typed
 */

// @flow

declare module '@babel/parser' {
  /**
   * Parse the provided code as an entire ECMAScript program.
   */
  declare export function parse(
    input: string,
    options?: ParserOptions
  ): ParseResult<$Exports<'@babel/types'>['File']>;

  /**
   * Parse the provided code as a single expression.
   */
  declare export function parseExpression(
    input: string,
    options?: ParserOptions
  ): ParseResult<$Exports<'@babel/types'>['Expression']>;
  declare export interface ParserOptions {
    /**
     * By default, await use is not allowed outside of an async function.
     * Set this to true to accept such code.
     */
    allowAwaitOutsideFunction?: boolean,

    /**
     * By default, import and export declarations can only appear at a program's top level.
     * Setting this option to true allows them anywhere where a statement is allowed.
     */
    allowImportExportEverywhere?: boolean,

    /**
     * By default, a return statement at the top level raises an error.
     * Set this to true to accept such code.
     */
    allowReturnOutsideFunction?: boolean,
    allowSuperOutsideMethod?: boolean,

    /**
     * By default, exported identifiers must refer to a declared variable.
     * Set this to true to allow export statements to reference undeclared variables.
     */
    allowUndeclaredExports?: boolean,

    /**
     * By default, Babel attaches comments to adjacent AST nodes.
     * When this option is set to false, comments are not attached.
     * It can provide up to 30% performance improvement when the input code has many comments.
     * @babel /eslint-parser will set it for you.
     * It is not recommended to use attachComment: false with Babel transform,
     * as doing so removes all the comments in output code, and renders annotations such as
     * /* istanbul ignore next *\/ nonfunctional.
     */
    attachComment?: boolean,

    /**
     * By default, the parser adds information about parentheses by setting
     * `extra.parenthesized` to `true` as needed.
     * When this option is `true` the parser creates `ParenthesizedExpression`
     * AST nodes instead of using the `extra` property.
     */
    createParenthesizedExpressions?: boolean,

    /**
     * By default, Babel always throws an error when it finds some invalid code.
     * When this option is set to true, it will store the parsing error and
     * try to continue parsing the invalid input file.
     */
    errorRecovery?: boolean,

    /**
     * Array containing the plugins that you want to enable.
     */
    plugins?: ParserPlugin[],

    /**
     * Adds a ranges property to each node: [node.start, node.end]
     */
    ranges?: boolean,

    /**
     * Correlate output AST nodes with their source filename.
     * Useful when generating code and source maps from the ASTs of multiple input files.
     */
    sourceFilename?: string,

    /**
     * Indicate the mode the code should be parsed in.
     * Can be one of "script", "module", or "unambiguous". Defaults to "script".
     * "unambiguous" will make @babel/parser attempt to guess, based on the presence
     * of ES6 import or export statements.
     * Files with ES6 imports and exports are considered "module" and are otherwise "script".
     */
    sourceType?: 'module' | 'script' | 'unambiguous',

    /**
     * By default, the first line of code parsed is treated as line 1.
     * You can provide a line number to alternatively start with.
     * Useful for integration with other source tools.
     */
    startLine?: number,

    /**
     * Should the parser work in strict mode.
     * Defaults to true if sourceType === 'module'. Otherwise, false.
     */
    strictMode?: boolean,

    /**
     * Adds all parsed tokens to a tokens property on the File node.
     */
    tokens?: boolean,
  }
  declare export

type ParserPlugin =
    | ParserPluginWithOptions
    | 'asyncDoExpressions'
    | 'asyncGenerators'
    | 'bigInt'
    | 'classPrivateMethods'
    | 'classPrivateProperties'
    | 'classProperties'
    | 'classStaticBlock'
    | 'decimal'
    | 'decorators-legacy'
    | 'decorators'
    | 'doExpressions'
    | 'dynamicImport'
    | 'estree'
    | 'exportDefaultFrom'
    | 'exportNamespaceFrom'
    | 'flow'
    | 'flowComments'
    | 'functionBind'
    | 'functionSent'
    | 'importAssertions'
    | 'importMeta'
    | 'jsx'
    | 'logicalAssignment'
    | 'moduleBlocks'
    | 'moduleStringNames'
    | 'nullishCoalescingOperator'
    | 'numericSeparator'
    | 'objectRestSpread'
    | 'optionalCatchBinding'
    | 'optionalChaining'
    | 'partialApplication'
    | 'pipelineOperator'
    | 'placeholders'
    | 'privateIn'
    | 'throwExpressions'
    | 'topLevelAwait'
    | 'typescript'
    | 'v8intrinsic';

  declare export type ParserPluginWithOptions =
    | ['decorators', DecoratorsPluginOptions]
    | ['flow', FlowPluginOptions]
    | ['pipelineOperator', PipelineOperatorPluginOptions]
    | ['recordAndTuple', RecordAndTuplePluginOptions]
    | ['typescript', TypeScriptPluginOptions];

  declare export interface DecoratorsPluginOptions {
    decoratorsBeforeExport?: boolean,
  }
  declare export interface PipelineOperatorPluginOptions {
    proposal: 'fsharp' | 'hack' | 'minimal' | 'smart',
    topicToken?: '#' | '%',
  }
  declare export interface RecordAndTuplePluginOptions {
    syntaxType: 'bar' | 'hash',
  }
  declare export interface FlowPluginOptions {
    all?: boolean,
  }
  declare export interface TypeScriptPluginOptions {
    disallowAmbiguousJSXLike?: boolean,
    dts?: boolean,
  }
  declare export var tokTypes: {
    [name: string]: mixed,
    ...,
  };
  declare export interface ParseError {
    code: string,
    reasonCode: string,
  }
  declare type ParseResult<Result> = {
    ...Result,
    errors: ParseError[],
    ...,
  };
}
