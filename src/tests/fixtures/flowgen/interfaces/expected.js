// should handle single interface
interface User {
  firstName: string
} // should handle interface inheritance
interface User2 {
  firstName: string
}
interface SpecialUser extends User2 {
  nice: number
} // should handle interface merging
interface User3 {
  firstName: string,
  lastName: string,
  username: string,
}
// should handle all properties
interface Props {
  color: string,
  [key: string]: string,
} // should support readonly modifier
interface Helper {
  +name: string,
  callback(): void,
} // should support call signature
interface ObjectSchema<T> {}
interface ObjectSchemaDefinition<T> {}
declare interface ObjectSchemaConstructor {
  constructor(): ObjectSchema<{...}>,
  <T: {...}>(fields?: ObjectSchemaDefinition<T>): ObjectSchema<T>,
} // should remove this in call signature
interface Arc<This, Datum> {
  (this: This, d: Datum, ...args: any[]): string | null
}
interface D<Datum> {
  constructor(d: Datum, ...args: any[]): D<Datum>
}
interface C<This, Datum> {
  (this: This, d: Datum, ...args: any[]): This
} // should remove generic defaults in call signature
interface AbstractLevelDOWN<K, V> {}
interface AbstractLevelDOWNConstructor {
  <K = any, V = any>(location: string): AbstractLevelDOWN<K, V>
} // should support omitting generic defaults in types, classes, interfaces
interface Foo<T = symbol, U = number> {}
interface FooBar extends Foo {}
type Bar<T = number, U = string> = {...};
class Baz<T = string, U = number> {}
declare var a: Foo;
declare var b: Bar;
declare var c: Baz;
declare var d: Foo<any>;
declare var e: Bar<any>;
declare var f: Baz<any>;
// should support optional methods
interface Example<State> {
  required<R>(value: any, state: State): true,
  optional?: <R>(value: any, state: State) => false,
} // should handle toString property name
interface A {
  toString(): string
} // should handle untyped object binding pattern
interface ObjectBinding {
  (): void,
  ({...}): void,
} // should handle untyped array binding pattern
interface ArrayBinding {
  (): void,
  ([]): void,
} // should handle typed object binding pattern
interface ObjectBinding2 {
  (): void,
  (any): void,
  ({
    a: string,
    b: number,
    ...
  }): void,
} // should handle typed array binding pattern
interface ArrayBinding2 {
  (): void,
  ([]): void,
  ([string, number]): void,
} // should handle mutli-extends pattern
interface Shape {
  color: string
}
interface PenStroke {
  penWidth: number
}
interface Square extends Shape, PenStroke {
  sideLength: number
}