export function add<T extends string | number>(a: T, b: T): T extends string ? string : number;