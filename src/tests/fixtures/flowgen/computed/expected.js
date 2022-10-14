type T1 = {
  @@asyncIterator?: () => any,
  @@iterator?: () => any,
  ...
};
type T3 = {
  @@asyncIterator(): any,
  @@iterator(): any,
  ...
};
type T5 = {
  @@asyncIterator?: any,
  @@iterator?: any,
  ...
};
type T7 = {
  @@asyncIterator: any,
  @@iterator: any,
  ...
};
declare class C1 {
  +@@asyncIterator?: () => any,
  +@@iterator?: () => any,
}
declare class C3 {
  @@asyncIterator(): any,
  @@iterator(): any,
}
declare class C5 {
  @@asyncIterator?: any,
  @@iterator?: any,
}
declare class C7 {
  @@asyncIterator: any,
  @@iterator: any,
}
interface I1 {
  @@asyncIterator?: () => any,
  @@iterator?: () => any,
}
interface I3 {
  @@asyncIterator(): any,
  @@iterator(): any,
}
interface I5 {
  @@asyncIterator?: any,
  @@iterator?: any,
}
interface I7 {
  @@asyncIterator: any,
  @@iterator: any,
}
type TC1 = {
  foo?: () => any,
  ...
};
type TC3 = {
  foo(): any,
  ...
};
type TC5 = {
  foo?: any,
  ...
};
type TC7 = {
  foo: any,
  ...
};
declare class CC1 {
  +"foo"?: () => any
}
declare class CC3 {
  "foo"(): any
}
declare class CC5 {
  "foo"?: any
}
declare class CC7 {
  "foo": any
}
interface IC1 {
  foo?: () => any
}
interface IC3 {
  foo(): any
}
interface IC5 {
  foo?: any
}
interface IC7 {
  foo: any
}
const Foo = 'foo';
type TT1 = {
  [typeof Foo]: ?() => any,
  ...
};
type TT3 = {
  [typeof Foo]: () => any,
  ...
};
type TT5 = {
  [typeof Foo]: ?any,
  ...
};
type TT7 = {
  [typeof Foo]: any,
  ...
};
declare class CT1 {
  [typeof Foo]: ?() => any
}
declare class CT3 {
  [typeof Foo]: () => any
}
declare class CT5 {
  [typeof Foo]: ?any
}
declare class CT7 {
  [typeof Foo]: any
}
interface IT1 {
  [typeof Foo]: ?() => any
}
interface IT3 {
  [typeof Foo]: () => any
}
interface IT5 {
  [typeof Foo]: ?any
}
interface IT7 {
  [typeof Foo]: any
}