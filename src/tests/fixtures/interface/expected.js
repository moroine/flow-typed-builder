interface Person {
  firstName: string,
  lastName: string,
  age: number,
}
;
declare interface Me extends Person {}
export type { Me };