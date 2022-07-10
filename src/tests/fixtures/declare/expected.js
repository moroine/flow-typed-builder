declare type AbstractCursorEvents = {
  close(): void,
  ...
};
export type { AbstractCursorEvents };
declare class Batch<T = number> {
  operations: T[],
  constructor(originalZeroIndex: T): Batch<T>,
}
export { Batch };