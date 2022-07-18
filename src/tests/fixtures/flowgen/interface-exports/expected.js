export interface UnaryFunction<T, R> {
  (source: T): R
}
declare module "my-module" {
  declare export interface UnaryFunction<T, R> {
    (source: T): R
  }
}