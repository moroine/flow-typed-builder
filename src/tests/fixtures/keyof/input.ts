export declare const AuthMechanism: Readonly<{
  readonly MONGODB_AWS: "MONGODB-AWS";
  readonly MONGODB_CR: "MONGODB-CR";
  readonly MONGODB_DEFAULT: "DEFAULT";
  readonly MONGODB_GSSAPI: "GSSAPI";
  readonly MONGODB_PLAIN: "PLAIN";
  readonly MONGODB_SCRAM_SHA1: "SCRAM-SHA-1";
  readonly MONGODB_SCRAM_SHA256: "SCRAM-SHA-256";
  readonly MONGODB_X509: "MONGODB-X509";
}>;

export declare type IAuthMechanism = typeof AuthMechanism[keyof typeof AuthMechanism];
