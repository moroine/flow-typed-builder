declare interface MyObj {
  on(event: "error", cb: (err: Error) => void): void,
  on(event: "close", cb: (code: number, message: string) => void): void,
  on(event: "message", cb: (data: any, flags: {
    binary: boolean,
    ...
  }) => void): void,
  on(event: "ping", cb: (data: any, flags: {
    binary: boolean,
    ...
  }) => void): void,
  on(event: "pong", cb: (data: any, flags: {
    binary: boolean,
    ...
  }) => void): void,
  on(event: "open", cb: () => void): void,
  on(event: string, listener: (...args: any[]) => void): void,
}
declare export var SET_NAME: "my/lib/SET_NAME";
declare export var SET_STAGE: "my/lib/SET_STAGE";