export declare type AbstractCursorEvents = {
  close(): void;
};
export declare class Batch<T = number> {
  operations: T[];
  constructor(originalZeroIndex: T);
}