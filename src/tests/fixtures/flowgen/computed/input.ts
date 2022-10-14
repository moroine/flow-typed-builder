type T1 = {
  [Symbol.asyncIterator]?(): any;
  [Symbol.iterator]?(): any;
};
type T3 = {
  [Symbol.asyncIterator](): any;
  [Symbol.iterator](): any;
};
type T5 = {
  [Symbol.asyncIterator]?: any;
  [Symbol.iterator]?: any;
};
type T7 = {
  [Symbol.asyncIterator]: any;
  [Symbol.iterator]: any;
};
declare class C1 {
  [Symbol.asyncIterator]?(): any;
  [Symbol.iterator]?(): any;
}
declare class C3 {
  [Symbol.asyncIterator](): any;
  [Symbol.iterator](): any;
}
declare class C5 {
  [Symbol.asyncIterator]?: any;
  [Symbol.iterator]?: any;
}
declare class C7 {
  [Symbol.asyncIterator]: any;
  [Symbol.iterator]: any;
}
interface I1 {
  [Symbol.asyncIterator]?(): any;
  [Symbol.iterator]?(): any;
}
interface I3 {
  [Symbol.asyncIterator](): any;
  [Symbol.iterator](): any;
}
interface I5 {
  [Symbol.asyncIterator]?: any;
  [Symbol.iterator]?: any;
}
interface I7 {
  [Symbol.asyncIterator]: any;
  [Symbol.iterator]: any;
}
type TC1 = {
  ["foo"]?(): any;
}
type TC3 = {
  ["foo"](): any;
}
type TC5 = {
  ["foo"]?: any;
}
type TC7 = {
  ["foo"]: any;
}
declare class CC1 {
  ["foo"]?(): any;
}
declare class CC3 {
  ["foo"](): any;
}
declare class CC5 {
  ["foo"]?: any;
}
declare class CC7 {
  ["foo"]: any;
}
interface IC1 {
  ["foo"]?(): any;
}
interface IC3 {
  ["foo"](): any;
}
interface IC5 {
  ["foo"]?: any;
}
interface IC7 {
  ["foo"]: any;
}
const Foo = 'foo';
type TT1 = {
  [Foo]?(): any;
}
type TT3 = {
  [Foo](): any;
}
type TT5 = {
  [Foo]?: any;
}
type TT7 = {
  [Foo]: any;
}
declare class CT1 {
  [Foo]?(): any
}
declare class CT3 {
  [Foo](): any
}
declare class CT5 {
  [Foo]?: any
}
declare class CT7 {
  [Foo]: any
}
interface IT1 {
  [Foo]?(): any;
}
interface IT3 {
  [Foo](): any;
}
interface IT5 {
  [Foo]?: any;
}
interface IT7 {
  [Foo]: any;
}