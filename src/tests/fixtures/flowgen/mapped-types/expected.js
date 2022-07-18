type Ref<T> = {
  current: T | null,
  ...
};
type SourceUnion = "a" | "b" | "c";
type SourceObject = {
  a: number,
  d: string,
  ...
};
type MappedUnion = $ObjMapi<{
  [k: SourceUnion]: any
}, <K>(K) => Ref<number>>;
type MappedObj = $ObjMapi<SourceObject, <K>(K) => Ref<SourceObject[K]>>;
type ConstantKey = MappedObj["a"];