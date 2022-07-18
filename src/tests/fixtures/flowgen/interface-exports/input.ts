export interface UnaryFunction<T, R> {
  (source: T): R;
}
declare module "my-module" {
  export interface UnaryFunction<T, R> {
    (source: T): R;
  }
}