class C {
  /* see https://github.com/facebook/flow/issues/8912 */
  /* $FlowExpectedError[unsupported-syntax] */
  "1prop" = 1;
  /* see https://github.com/facebook/flow/issues/8912 */
  /* $FlowExpectedError[unsupported-syntax] */
  "2prop" = 'a';
  /* see https://github.com/facebook/flow/issues/8912 */
  /* $FlowExpectedError[unsupported-syntax] */
  "some-value": null;
  /* see https://github.com/facebook/flow/issues/8912 */
  /* $FlowExpectedError[unsupported-syntax] */
  "with space": null;
}
declare class C1 {
  /* see https://github.com/facebook/flow/issues/8912 */
  /* $FlowExpectedError[unsupported-syntax] */
  ["1prop" | "2prop" | "some-value" | "with space"]: 1 | "a" | null | null
}
interface I {
  /* see https://github.com/facebook/flow/issues/8912 */
  /* $FlowExpectedError[unsupported-syntax] */
  ["1prop" | "2prop" | "some-value" | "with space"]: 1 | "a" | null | null
}
type O = {
  /* see https://github.com/facebook/flow/issues/8912 */
  /* $FlowExpectedError[unsupported-syntax] */
  ["1prop" | "2prop" | "some-value" | "with space"]: 1 | "a" | null | null,
  ...
};