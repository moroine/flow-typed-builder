class Subscribable<T> {}

class Operator<T, R> {}

declare class Observable<T> mixins Subscribable<T> {
  create: Function,
  static create: Function,
  lift<R>(operator: Operator<T, R>): Observable<R>,
  static lift<R>(operator: Operator<T, R>): Observable<R>,
  +foo: number,
  static +bar: string,
  baz?: string,
  +quux?: number,
  static quick?: symbol,
  static +fox?: string,
  +jump?: () => void,
  static +jump?: () => void,
  +cfnProperties: {
    [key: string]: any,
    ...
  },
  static +fooGet: string,
}