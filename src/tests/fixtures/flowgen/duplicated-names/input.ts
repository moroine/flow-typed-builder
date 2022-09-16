export declare type AuthMechanismType = string;
export declare const AuthMechanism: {
  readonly MONGODB_AWS: "MONGODB-AWS";
  readonly MONGODB_CR: "MONGODB-CR";
};
export declare type AuthMechanism = typeof AuthMechanism[keyof typeof AuthMechanism];

import { Buffer } from 'buffer';
export declare type BufferAlias = Buffer;

export declare const ProfilingLevel: Readonly<{
  readonly off: "off";
}>;
export declare type ProfilingLevel = typeof ProfilingLevel[keyof typeof ProfilingLevel];
export declare type Callback<T = any> = (error?: Error, result?: T) => void;
export declare const callback: Callback<ProfilingLevel>;