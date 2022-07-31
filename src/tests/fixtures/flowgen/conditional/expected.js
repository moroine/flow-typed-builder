// see https://gist.github.com/thecotne/6e5969f4aaf8f253985ed36b30ac9fe0
type $FlowGen$If<X: boolean, Then, Else = empty> = $Call<
  ((true, Then, Else) => Then) & ((false, Then, Else) => Else),
  X,
  Then,
  Else
>;
type $FlowGen$Assignable<A, B> = $Call<
  ((...r: [B]) => true) & ((...r: [A]) => false),
  A
>;
declare export function add<T: string | number>(
  a: T,
  b: T
): $FlowGen$If<$FlowGen$Assignable<T, string>, string, number>;