// see https://gist.github.com/thecotne/6e5969f4aaf8f253985ed36b30ac9fe0
type $If<X: boolean, Then, Else = empty> = $Call<((true, Then, Else) => Then) & ((false, Then, Else) => Else), X, Then, Else>;
type $Assignable<A, B> = $Call<((...r: [B]) => true) & ((...r: [A]) => false), A>;
declare export function add<T: string | number>(a: T, b: T): $If<$Assignable<T, string>, string, number>;