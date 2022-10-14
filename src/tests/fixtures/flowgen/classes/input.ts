class Subscribable<T> {}
class Operator<T, R> {}
class Observable<T> implements Subscribable<T> {
  create: Function;
  static create: Function;
  lift<R>(operator: Operator<T, R>): Observable<R>;
  static lift<R>(operator: Operator<T, R>): Observable<R>;
  readonly foo: number;
  static readonly bar: string;
  baz?: string;
  readonly quux?: number;
  static quick?: symbol;
  static readonly fox?: string;
  jump?(): void;
  static jump?(): void;
  protected get cfnProperties(): {
    [key: string]: any;
  };
  static get fooGet(): string;
}