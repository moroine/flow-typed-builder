declare export var AuthMechanism: $ReadOnly<{
  +MONGODB_AWS: "MONGODB-AWS",
  +MONGODB_CR: "MONGODB-CR",
  +MONGODB_DEFAULT: "DEFAULT",
  +MONGODB_GSSAPI: "GSSAPI",
  +MONGODB_PLAIN: "PLAIN",
  +MONGODB_SCRAM_SHA1: "SCRAM-SHA-1",
  +MONGODB_SCRAM_SHA256: "SCRAM-SHA-256",
  +MONGODB_X509: "MONGODB-X509",
  ...
}>;
declare type IAuthMechanism = typeof AuthMechanism[$Keys<typeof AuthMechanism>];
export type { IAuthMechanism };