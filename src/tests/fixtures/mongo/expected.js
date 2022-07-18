import type { Binary } from 'bson';
import type { BSONRegExp } from 'bson';
import type { BSONSymbol } from 'bson';
import type { Code } from 'bson';
import type { ConnectionOptions as ConnectionOptions_2 } from 'tls';
import type { DBRef } from 'bson';
import type { Decimal128 } from 'bson';
;
import type { deserialize as deserialize_2 } from 'bson';
import type { DeserializeOptions } from 'bson';
import typeof * as dns from 'dns';
import type { Document } from 'bson';
import type { Double } from 'bson';
import type { Duplex } from 'stream';
import type { DuplexOptions } from 'stream';
import type { EventEmitter } from 'events';
import type { Int32 } from 'bson';
import type { Long } from 'bson';
import type { Map as Map_2 } from 'bson';
import type { MaxKey } from 'bson';
import type { MinKey } from 'bson';
import type { ObjectId } from 'bson';
import type { ObjectIdLike } from 'bson';
import type { Readable } from 'stream';
import type { serialize as serialize_2 } from 'bson';
import type { SerializeOptions } from 'bson';
import type { Socket } from 'net';
import type { SrvRecord } from 'dns';
import type { TcpNetConnectOpts } from 'net';
import type { Timestamp } from 'bson';
import type { TLSSocket } from 'tls';
import type { TLSSocketOptions } from 'tls';
import type { Writable } from 'stream';
declare class AbstractCursor<TSchema = any, CursorEvents: AbstractCursorEvents = AbstractCursorEvents> {
  static +CLOSE: "close",
  +id: Long | void,
  +namespace: MongoDBNamespace,
  +readPreference: ReadPreference,
  +readConcern: ReadConcern | void,
  +closed: boolean,
  +killed: boolean,
  +loadBalanced: boolean,
  bufferedCount(): number,
  readBufferedDocuments(number?: number): TSchema[],
  @@asyncIterator(): AsyncIterator<TSchema, void>,
  stream(options?: CursorStreamOptions): Readable & AsyncIterable<TSchema>,
  hasNext(): Promise<boolean>,
  hasNext(callback: Callback<boolean>): void,
  next(): Promise<TSchema | null>,
  next(callback: Callback<TSchema | null>): void,
  next(callback?: Callback<TSchema | null>): Promise<TSchema | null> | void,
  tryNext(): Promise<TSchema | null>,
  tryNext(callback: Callback<TSchema | null>): void,
  forEach(iterator: (doc: TSchema) => boolean | void): Promise<void>,
  forEach(iterator: (doc: TSchema) => boolean | void, callback: Callback<void>): void,
  close(): Promise<void>,
  close(callback: Callback): void,
  close(options: CursorCloseOptions): Promise<void>,
  close(options: CursorCloseOptions, callback: Callback): void,
  toArray(): Promise<TSchema[]>,
  toArray(callback: Callback<TSchema[]>): void,
  addCursorFlag(flag: CursorFlag, value: boolean): this,
  map<T = any>(transform: (doc: TSchema) => T): AbstractCursor<T>,
  withReadPreference(readPreference: ReadPreferenceLike): this,
  withReadConcern(readConcern: ReadConcernLike): this,
  maxTimeMS(value: number): this,
  batchSize(value: number): this,
  rewind(): void,
  clone(): AbstractCursor<TSchema>,
}
export { AbstractCursor };
declare type AbstractCursorEvents = {
  [any]: () => void,
  ...
};
export type { AbstractCursorEvents };
declare type AcceptedFields<TSchema, FieldType, AssignableType> = $ObjMapi<{
  [k: KeysOfAType<TSchema, FieldType>]: any
}, <key>(key) => AssignableType>;
export type { AcceptedFields };
declare type AddToSetOperators<Type> = {
  $each?: Array<Flatten<Type>>,
  ...
};
export type { AddToSetOperators };
declare class Admin {
  command(command: Document): Promise<Document>,
  command(command: Document, callback: Callback<Document>): void,
  command(command: Document, options: RunCommandOptions): Promise<Document>,
  command(command: Document, options: RunCommandOptions, callback: Callback<Document>): void,
  buildInfo(): Promise<Document>,
  buildInfo(callback: Callback<Document>): void,
  buildInfo(options: CommandOperationOptions): Promise<Document>,
  buildInfo(options: CommandOperationOptions, callback: Callback<Document>): void,
  serverInfo(): Promise<Document>,
  serverInfo(callback: Callback<Document>): void,
  serverInfo(options: CommandOperationOptions): Promise<Document>,
  serverInfo(options: CommandOperationOptions, callback: Callback<Document>): void,
  serverStatus(): Promise<Document>,
  serverStatus(callback: Callback<Document>): void,
  serverStatus(options: CommandOperationOptions): Promise<Document>,
  serverStatus(options: CommandOperationOptions, callback: Callback<Document>): void,
  ping(): Promise<Document>,
  ping(callback: Callback<Document>): void,
  ping(options: CommandOperationOptions): Promise<Document>,
  ping(options: CommandOperationOptions, callback: Callback<Document>): void,
  addUser(username: string): Promise<Document>,
  addUser(username: string, callback: Callback<Document>): void,
  addUser(username: string, password: string): Promise<Document>,
  addUser(username: string, password: string, callback: Callback<Document>): void,
  addUser(username: string, options: AddUserOptions): Promise<Document>,
  addUser(username: string, options: AddUserOptions, callback: Callback<Document>): void,
  addUser(username: string, password: string, options: AddUserOptions): Promise<Document>,
  addUser(username: string, password: string, options: AddUserOptions, callback: Callback<Document>): void,
  removeUser(username: string): Promise<boolean>,
  removeUser(username: string, callback: Callback<boolean>): void,
  removeUser(username: string, options: RemoveUserOptions): Promise<boolean>,
  removeUser(username: string, options: RemoveUserOptions, callback: Callback<boolean>): void,
  validateCollection(collectionName: string): Promise<Document>,
  validateCollection(collectionName: string, callback: Callback<Document>): void,
  validateCollection(collectionName: string, options: ValidateCollectionOptions): Promise<Document>,
  validateCollection(collectionName: string, options: ValidateCollectionOptions, callback: Callback<Document>): void,
  listDatabases(): Promise<ListDatabasesResult>,
  listDatabases(callback: Callback<ListDatabasesResult>): void,
  listDatabases(options: ListDatabasesOptions): Promise<ListDatabasesResult>,
  listDatabases(options: ListDatabasesOptions, callback: Callback<ListDatabasesResult>): void,
  replSetGetStatus(): Promise<Document>,
  replSetGetStatus(callback: Callback<Document>): void,
  replSetGetStatus(options: CommandOperationOptions): Promise<Document>,
  replSetGetStatus(options: CommandOperationOptions, callback: Callback<Document>): void,
}
export { Admin };
declare class AggregationCursor<TSchema = any> {
  +pipeline: Document[],
  clone(): AggregationCursor<TSchema>,
  map<T>(transform: (doc: TSchema) => T): AggregationCursor<T>,
  explain(): Promise<Document>,
  explain(callback: Callback): void,
  explain(verbosity: ExplainVerbosityLike): Promise<Document>,
  group<T = TSchema>($group: Document): AggregationCursor<T>,
  limit($limit: number): this,
  match($match: Document): this,
  out($out: {
    db: string,
    coll: string,
    ...
  } | string): this,
  project<T: Document = Document>($project: Document): AggregationCursor<T>,
  lookup($lookup: Document): this,
  redact($redact: Document): this,
  skip($skip: number): this,
  sort($sort: Sort): this,
  unwind($unwind: Document | string): this,
  geoNear($geoNear: Document): this,
}
export { AggregationCursor };
declare type AlternativeType<T> = any;
export type { AlternativeType };
declare type AnyBulkWriteOperation<TSchema: Document = Document> = {
  insertOne: InsertOneModel<TSchema>,
  ...
} | {
  replaceOne: ReplaceOneModel<TSchema>,
  ...
} | {
  updateOne: UpdateOneModel<TSchema>,
  ...
} | {
  updateMany: UpdateManyModel<TSchema>,
  ...
} | {
  deleteOne: DeleteOneModel<TSchema>,
  ...
} | {
  deleteMany: DeleteManyModel<TSchema>,
  ...
};
export type { AnyBulkWriteOperation };
declare type AnyError = MongoError | Error;
export type { AnyError };
declare type ArrayOperator<Type> = {
  $each?: Array<Flatten<Type>>,
  $slice?: number,
  $position?: number,
  $sort?: Sort,
  ...
};
export type { ArrayOperator };
declare export var AuthMechanism: Readonly<{
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
declare type AuthMechanism = any[$Keys<any>];
export type { AuthMechanism };
declare export var AutoEncryptionLoggerLevel: Readonly<{
  +FatalError: 0,
  +Error: 1,
  +Warning: 2,
  +Info: 3,
  +Trace: 4,
  ...
}>;
declare type AutoEncryptionLoggerLevel = any[$Keys<any>];
export type { AutoEncryptionLoggerLevel };
declare class Batch<T = Document> {
  originalZeroIndex: number,
  currentIndex: number,
  originalIndexes: number[],
  batchType: BatchType,
  operations: T[],
  size: number,
  sizeBytes: number,
  constructor(batchType: BatchType, originalZeroIndex: number): Batch<T>,
}
export { Batch };
declare export var BatchType: Readonly<{
  +INSERT: 1,
  +UPDATE: 2,
  +DELETE: 3,
  ...
}>;
declare type BatchType = any[$Keys<any>];
export type { BatchType };
export { Binary };
declare type BitwiseFilter = number | Binary | ReadonlyArray<number>;
export type { BitwiseFilter };
export { BSONRegExp };
export { BSONSymbol };
declare export var BSONType: Readonly<{
  +double: 1,
  +string: 2,
  +object: 3,
  +array: 4,
  +binData: 5,
  +undefined: 6,
  +objectId: 7,
  +bool: 8,
  +date: 9,
  +null: 10,
  +regex: 11,
  +dbPointer: 12,
  +javascript: 13,
  +symbol: 14,
  +javascriptWithScope: 15,
  +int: 16,
  +timestamp: 17,
  +long: 18,
  +decimal: 19,
  +minKey: -1,
  +maxKey: 127,
  ...
}>;
declare type BSONType = any[$Keys<any>];
export type { BSONType };
declare type BSONTypeAlias = $Keys<any>;
export type { BSONTypeAlias };
declare class BulkOperationBase {
  isOrdered: boolean,
  operationId?: number,
  insert(document: Document): BulkOperationBase,
  find(selector: Document): FindOperators,
  raw(op: AnyBulkWriteOperation): this,
  +bsonOptions: BSONSerializeOptions,
  +writeConcern: WriteConcern | void,
  +batches: Batch[],
  execute(options?: BulkWriteOptions): Promise<BulkWriteResult>,
  execute(callback: Callback<BulkWriteResult>): void,
  execute(options: BulkWriteOptions | void, callback: Callback<BulkWriteResult>): void,
  execute(options?: BulkWriteOptions | Callback<BulkWriteResult>, callback?: Callback<BulkWriteResult>): Promise<BulkWriteResult> | void,
  addToOperationsList(batchType: BatchType, document: Document | UpdateStatement | DeleteStatement): this,
}
export { BulkOperationBase };
declare class BulkWriteResult {
  result: BulkResult,
  +insertedCount: number,
  +matchedCount: number,
  +modifiedCount: number,
  +deletedCount: number,
  +upsertedCount: number,
  +upsertedIds: {
    [key: number]: any,
    ...
  },
  +insertedIds: {
    [key: number]: any,
    ...
  },
  +ok: number,
  +nInserted: number,
  +nUpserted: number,
  +nMatched: number,
  +nModified: number,
  +nRemoved: number,
  getInsertedIds(): Document[],
  getUpsertedIds(): Document[],
  getUpsertedIdAt(index: number): Document | void,
  getRawResponse(): Document,
  hasWriteErrors(): boolean,
  getWriteErrorCount(): number,
  getWriteErrorAt(index: number): WriteError | void,
  getWriteErrors(): WriteError[],
  getLastOp(): Document | void,
  getWriteConcernError(): WriteConcernError | void,
  toJSON(): BulkResult,
  isOk(): boolean,
  [typeof toString]: () => string,
}
export { BulkWriteResult };
declare type Callback<T = any> = (error?: AnyError, result?: T) => void;
export type { Callback };
declare class CancellationToken {}
export { CancellationToken };
declare class ChangeStream<TSchema: Document = Document, TChange: Document = ChangeStreamDocument<TSchema>> {
  pipeline: Document[],
  options: ChangeStreamOptions,
  parent: MongoClient | Db | Collection,
  namespace: MongoDBNamespace,
  type: symbol,
  streamOptions?: CursorStreamOptions,
  static +RESPONSE: "response",
  static +MORE: "more",
  static +INIT: "init",
  static +CLOSE: "close",
  static +CHANGE: "change",
  static +END: "end",
  static +ERROR: "error",
  static +RESUME_TOKEN_CHANGED: "resumeTokenChanged",
  +resumeToken: ResumeToken,
  hasNext(): Promise<boolean>,
  hasNext(callback: Callback<boolean>): void,
  next(): Promise<TChange>,
  next(callback: Callback<TChange>): void,
  +closed: boolean,
  close(callback?: Callback): Promise<void> | void,
  stream(options?: CursorStreamOptions): Readable & AsyncIterable<TChange>,
  tryNext(): Promise<Document | null>,
  tryNext(callback: Callback<Document | null>): void,
}
export { ChangeStream };
declare type ChangeStreamDocument<TSchema: Document = Document> = ChangeStreamInsertDocument<TSchema> | ChangeStreamUpdateDocument<TSchema> | ChangeStreamReplaceDocument<TSchema> | ChangeStreamDeleteDocument<TSchema> | ChangeStreamDropDocument | ChangeStreamRenameDocument | ChangeStreamDropDatabaseDocument | ChangeStreamInvalidateDocument | ChangeStreamCreateIndexDocument | ChangeStreamCreateDocument | ChangeStreamCollModDocument | ChangeStreamDropIndexDocument | ChangeStreamShardCollectionDocument | ChangeStreamReshardCollectionDocument | ChangeStreamRefineCollectionShardKeyDocument;
export type { ChangeStreamDocument };
declare type ChangeStreamEvents<TSchema: Document = Document, TChange: Document = ChangeStreamDocument<TSchema>> = {
  resumeTokenChanged(token: ResumeToken): void,
  init(response: any): void,
  more(response?: any): void,
  response(): void,
  end(): void,
  error(error: Error): void,
  change(change: TChange): void,
  ...
} & AbstractCursorEvents;
export type { ChangeStreamEvents };
declare class ClientSession {
  hasEnded: boolean,
  clientOptions?: MongoOptions,
  supports: {
    causalConsistency: boolean,
    ...
  },
  clusterTime?: ClusterTime,
  operationTime?: Timestamp,
  explicit: boolean,
  defaultTransactionOptions: TransactionOptions,
  transaction: Transaction,
  +id: ServerSessionId | void,
  +serverSession: ServerSession,
  +snapshotEnabled: boolean,
  +loadBalanced: boolean,
  +isPinned: boolean,
  endSession(): Promise<void>,
  endSession(callback: Callback<void>): void,
  endSession(options: EndSessionOptions): Promise<void>,
  endSession(options: EndSessionOptions, callback: Callback<void>): void,
  advanceOperationTime(operationTime: Timestamp): void,
  advanceClusterTime(clusterTime: ClusterTime): void,
  equals(session: ClientSession): boolean,
  incrementTransactionNumber(): void,
  inTransaction(): boolean,
  startTransaction(options?: TransactionOptions): void,
  commitTransaction(): Promise<Document>,
  commitTransaction(callback: Callback<Document>): void,
  abortTransaction(): Promise<Document>,
  abortTransaction(callback: Callback<Document>): void,
  toBSON(): empty,
  withTransaction<T = void>(fn: WithTransactionCallback<T>, options?: TransactionOptions): Promise<Document | void>,
}
export { ClientSession };
declare type ClientSessionEvents = {
  ended(session: ClientSession): void,
  ...
};
export type { ClientSessionEvents };
export { Code };
declare class Collection<TSchema: Document = Document> {
  +dbName: string,
  +collectionName: string,
  +namespace: string,
  +readConcern: ReadConcern | void,
  +readPreference: ReadPreference | void,
  +bsonOptions: BSONSerializeOptions,
  +writeConcern: WriteConcern | void,
  +hint: Hint | void,
  hint(v: Hint | void): any,
  insertOne(doc: OptionalUnlessRequiredId<TSchema>): Promise<InsertOneResult<TSchema>>,
  insertOne(doc: OptionalUnlessRequiredId<TSchema>, callback: Callback<InsertOneResult<TSchema>>): void,
  insertOne(doc: OptionalUnlessRequiredId<TSchema>, options: InsertOneOptions): Promise<InsertOneResult<TSchema>>,
  insertOne(doc: OptionalUnlessRequiredId<TSchema>, options: InsertOneOptions, callback: Callback<InsertOneResult<TSchema>>): void,
  insertMany(docs: OptionalUnlessRequiredId<TSchema>[]): Promise<InsertManyResult<TSchema>>,
  insertMany(docs: OptionalUnlessRequiredId<TSchema>[], callback: Callback<InsertManyResult<TSchema>>): void,
  insertMany(docs: OptionalUnlessRequiredId<TSchema>[], options: BulkWriteOptions): Promise<InsertManyResult<TSchema>>,
  insertMany(docs: OptionalUnlessRequiredId<TSchema>[], options: BulkWriteOptions, callback: Callback<InsertManyResult<TSchema>>): void,
  bulkWrite(operations: AnyBulkWriteOperation<TSchema>[]): Promise<BulkWriteResult>,
  bulkWrite(operations: AnyBulkWriteOperation<TSchema>[], callback: Callback<BulkWriteResult>): void,
  bulkWrite(operations: AnyBulkWriteOperation<TSchema>[], options: BulkWriteOptions): Promise<BulkWriteResult>,
  bulkWrite(operations: AnyBulkWriteOperation<TSchema>[], options: BulkWriteOptions, callback: Callback<BulkWriteResult>): void,
  updateOne(filter: Filter<TSchema>, update: UpdateFilter<TSchema> | Partial<TSchema>): Promise<UpdateResult>,
  updateOne(filter: Filter<TSchema>, update: UpdateFilter<TSchema> | Partial<TSchema>, callback: Callback<UpdateResult>): void,
  updateOne(filter: Filter<TSchema>, update: UpdateFilter<TSchema> | Partial<TSchema>, options: UpdateOptions): Promise<UpdateResult>,
  updateOne(filter: Filter<TSchema>, update: UpdateFilter<TSchema> | Partial<TSchema>, options: UpdateOptions, callback: Callback<UpdateResult>): void,
  replaceOne(filter: Filter<TSchema>, replacement: WithoutId<TSchema>): Promise<UpdateResult | Document>,
  replaceOne(filter: Filter<TSchema>, replacement: WithoutId<TSchema>, callback: Callback<UpdateResult | Document>): void,
  replaceOne(filter: Filter<TSchema>, replacement: WithoutId<TSchema>, options: ReplaceOptions): Promise<UpdateResult | Document>,
  replaceOne(filter: Filter<TSchema>, replacement: WithoutId<TSchema>, options: ReplaceOptions, callback: Callback<UpdateResult | Document>): void,
  updateMany(filter: Filter<TSchema>, update: UpdateFilter<TSchema>): Promise<UpdateResult | Document>,
  updateMany(filter: Filter<TSchema>, update: UpdateFilter<TSchema>, callback: Callback<UpdateResult | Document>): void,
  updateMany(filter: Filter<TSchema>, update: UpdateFilter<TSchema>, options: UpdateOptions): Promise<UpdateResult | Document>,
  updateMany(filter: Filter<TSchema>, update: UpdateFilter<TSchema>, options: UpdateOptions, callback: Callback<UpdateResult | Document>): void,
  deleteOne(filter: Filter<TSchema>): Promise<DeleteResult>,
  deleteOne(filter: Filter<TSchema>, callback: Callback<DeleteResult>): void,
  deleteOne(filter: Filter<TSchema>, options: DeleteOptions): Promise<DeleteResult>,
  deleteOne(filter: Filter<TSchema>, options: DeleteOptions, callback?: Callback<DeleteResult>): void,
  deleteMany(filter: Filter<TSchema>): Promise<DeleteResult>,
  deleteMany(filter: Filter<TSchema>, callback: Callback<DeleteResult>): void,
  deleteMany(filter: Filter<TSchema>, options: DeleteOptions): Promise<DeleteResult>,
  deleteMany(filter: Filter<TSchema>, options: DeleteOptions, callback: Callback<DeleteResult>): void,
  rename(newName: string): Promise<Collection>,
  rename(newName: string, callback: Callback<Collection>): void,
  rename(newName: string, options: RenameOptions): Promise<Collection>,
  rename(newName: string, options: RenameOptions, callback: Callback<Collection>): void,
  drop(): Promise<boolean>,
  drop(callback: Callback<boolean>): void,
  drop(options: DropCollectionOptions): Promise<boolean>,
  drop(options: DropCollectionOptions, callback: Callback<boolean>): void,
  findOne(): Promise<WithId<TSchema> | null>,
  findOne(callback: Callback<WithId<TSchema> | null>): void,
  findOne(filter: Filter<TSchema>): Promise<WithId<TSchema> | null>,
  findOne(filter: Filter<TSchema>, callback: Callback<WithId<TSchema> | null>): void,
  findOne(filter: Filter<TSchema>, options: FindOptions): Promise<WithId<TSchema> | null>,
  findOne(filter: Filter<TSchema>, options: FindOptions, callback: Callback<WithId<TSchema> | null>): void,
  findOne<T = TSchema>(): Promise<T | null>,
  findOne<T = TSchema>(callback: Callback<T | null>): void,
  findOne<T = TSchema>(filter: Filter<TSchema>): Promise<T | null>,
  findOne<T = TSchema>(filter: Filter<TSchema>, options?: FindOptions): Promise<T | null>,
  findOne<T = TSchema>(filter: Filter<TSchema>, options?: FindOptions, callback?: Callback<T | null>): void,
  find(): FindCursor<WithId<TSchema>>,
  find(filter: Filter<TSchema>, options?: FindOptions): FindCursor<WithId<TSchema>>,
  find<T: Document>(filter: Filter<TSchema>, options?: FindOptions): FindCursor<T>,
  options(): Promise<Document>,
  options(callback: Callback<Document>): void,
  options(options: OperationOptions): Promise<Document>,
  options(options: OperationOptions, callback: Callback<Document>): void,
  isCapped(): Promise<boolean>,
  isCapped(callback: Callback<boolean>): void,
  isCapped(options: OperationOptions): Promise<boolean>,
  isCapped(options: OperationOptions, callback: Callback<boolean>): void,
  createIndex(indexSpec: IndexSpecification): Promise<string>,
  createIndex(indexSpec: IndexSpecification, callback: Callback<string>): void,
  createIndex(indexSpec: IndexSpecification, options: CreateIndexesOptions): Promise<string>,
  createIndex(indexSpec: IndexSpecification, options: CreateIndexesOptions, callback: Callback<string>): void,
  createIndexes(indexSpecs: IndexDescription[]): Promise<string[]>,
  createIndexes(indexSpecs: IndexDescription[], callback: Callback<string[]>): void,
  createIndexes(indexSpecs: IndexDescription[], options: CreateIndexesOptions): Promise<string[]>,
  createIndexes(indexSpecs: IndexDescription[], options: CreateIndexesOptions, callback: Callback<string[]>): void,
  dropIndex(indexName: string): Promise<Document>,
  dropIndex(indexName: string, callback: Callback<Document>): void,
  dropIndex(indexName: string, options: DropIndexesOptions): Promise<Document>,
  dropIndex(indexName: string, options: DropIndexesOptions, callback: Callback<Document>): void,
  dropIndexes(): Promise<Document>,
  dropIndexes(callback: Callback<Document>): void,
  dropIndexes(options: DropIndexesOptions): Promise<Document>,
  dropIndexes(options: DropIndexesOptions, callback: Callback<Document>): void,
  listIndexes(options?: ListIndexesOptions): ListIndexesCursor,
  indexExists(indexes: string | string[]): Promise<boolean>,
  indexExists(indexes: string | string[], callback: Callback<boolean>): void,
  indexExists(indexes: string | string[], options: IndexInformationOptions): Promise<boolean>,
  indexExists(indexes: string | string[], options: IndexInformationOptions, callback: Callback<boolean>): void,
  indexInformation(): Promise<Document>,
  indexInformation(callback: Callback<Document>): void,
  indexInformation(options: IndexInformationOptions): Promise<Document>,
  indexInformation(options: IndexInformationOptions, callback: Callback<Document>): void,
  estimatedDocumentCount(): Promise<number>,
  estimatedDocumentCount(callback: Callback<number>): void,
  estimatedDocumentCount(options: EstimatedDocumentCountOptions): Promise<number>,
  estimatedDocumentCount(options: EstimatedDocumentCountOptions, callback: Callback<number>): void,
  countDocuments(): Promise<number>,
  countDocuments(callback: Callback<number>): void,
  countDocuments(filter: Filter<TSchema>): Promise<number>,
  countDocuments(callback: Callback<number>): void,
  countDocuments(filter: Filter<TSchema>, options: CountDocumentsOptions): Promise<number>,
  countDocuments(filter: Filter<TSchema>, options: CountDocumentsOptions, callback: Callback<number>): void,
  countDocuments(filter: Filter<TSchema>, callback: Callback<number>): void,
  distinct<Key: $Keys<WithId<TSchema>>>(key: Key): Promise<Array<Flatten<WithId<TSchema>[Key]>>>,
  distinct<Key: $Keys<WithId<TSchema>>>(key: Key, callback: Callback<Array<Flatten<WithId<TSchema>[Key]>>>): void,
  distinct<Key: $Keys<WithId<TSchema>>>(key: Key, filter: Filter<TSchema>): Promise<Array<Flatten<WithId<TSchema>[Key]>>>,
  distinct<Key: $Keys<WithId<TSchema>>>(key: Key, filter: Filter<TSchema>, callback: Callback<Array<Flatten<WithId<TSchema>[Key]>>>): void,
  distinct<Key: $Keys<WithId<TSchema>>>(key: Key, filter: Filter<TSchema>, options: DistinctOptions): Promise<Array<Flatten<WithId<TSchema>[Key]>>>,
  distinct<Key: $Keys<WithId<TSchema>>>(key: Key, filter: Filter<TSchema>, options: DistinctOptions, callback: Callback<Array<Flatten<WithId<TSchema>[Key]>>>): void,
  distinct(key: string): Promise<any[]>,
  distinct(key: string, callback: Callback<any[]>): void,
  distinct(key: string, filter: Filter<TSchema>): Promise<any[]>,
  distinct(key: string, filter: Filter<TSchema>, callback: Callback<any[]>): void,
  distinct(key: string, filter: Filter<TSchema>, options: DistinctOptions): Promise<any[]>,
  distinct(key: string, filter: Filter<TSchema>, options: DistinctOptions, callback: Callback<any[]>): void,
  indexes(): Promise<Document[]>,
  indexes(callback: Callback<Document[]>): void,
  indexes(options: IndexInformationOptions): Promise<Document[]>,
  indexes(options: IndexInformationOptions, callback: Callback<Document[]>): void,
  stats(): Promise<CollStats>,
  stats(callback: Callback<CollStats>): void,
  stats(options: CollStatsOptions): Promise<CollStats>,
  stats(options: CollStatsOptions, callback: Callback<CollStats>): void,
  findOneAndDelete(filter: Filter<TSchema>): Promise<ModifyResult<TSchema>>,
  findOneAndDelete(filter: Filter<TSchema>, options: FindOneAndDeleteOptions): Promise<ModifyResult<TSchema>>,
  findOneAndDelete(filter: Filter<TSchema>, callback: Callback<ModifyResult<TSchema>>): void,
  findOneAndDelete(filter: Filter<TSchema>, options: FindOneAndDeleteOptions, callback: Callback<ModifyResult<TSchema>>): void,
  findOneAndReplace(filter: Filter<TSchema>, replacement: WithoutId<TSchema>): Promise<ModifyResult<TSchema>>,
  findOneAndReplace(filter: Filter<TSchema>, replacement: WithoutId<TSchema>, callback: Callback<ModifyResult<TSchema>>): void,
  findOneAndReplace(filter: Filter<TSchema>, replacement: WithoutId<TSchema>, options: FindOneAndReplaceOptions): Promise<ModifyResult<TSchema>>,
  findOneAndReplace(filter: Filter<TSchema>, replacement: WithoutId<TSchema>, options: FindOneAndReplaceOptions, callback: Callback<ModifyResult<TSchema>>): void,
  findOneAndUpdate(filter: Filter<TSchema>, update: UpdateFilter<TSchema>): Promise<ModifyResult<TSchema>>,
  findOneAndUpdate(filter: Filter<TSchema>, update: UpdateFilter<TSchema>, callback: Callback<ModifyResult<TSchema>>): void,
  findOneAndUpdate(filter: Filter<TSchema>, update: UpdateFilter<TSchema>, options: FindOneAndUpdateOptions): Promise<ModifyResult<TSchema>>,
  findOneAndUpdate(filter: Filter<TSchema>, update: UpdateFilter<TSchema>, options: FindOneAndUpdateOptions, callback: Callback<ModifyResult<TSchema>>): void,
  aggregate<T: Document = Document>(pipeline?: Document[], options?: AggregateOptions): AggregationCursor<T>,
  watch<TLocal: Document = TSchema, TChange: Document = ChangeStreamDocument<TLocal>>(pipeline?: Document[], options?: ChangeStreamOptions): ChangeStream<TLocal, TChange>,
  mapReduce<TKey = any, TValue = any>(map: string | MapFunction<TSchema>, reduce: string | ReduceFunction<TKey, TValue>): Promise<Document | Document[]>,
  mapReduce<TKey = any, TValue = any>(map: string | MapFunction<TSchema>, reduce: string | ReduceFunction<TKey, TValue>, callback: Callback<Document | Document[]>): void,
  mapReduce<TKey = any, TValue = any>(map: string | MapFunction<TSchema>, reduce: string | ReduceFunction<TKey, TValue>, options: MapReduceOptions<TKey, TValue>): Promise<Document | Document[]>,
  mapReduce<TKey = any, TValue = any>(map: string | MapFunction<TSchema>, reduce: string | ReduceFunction<TKey, TValue>, options: MapReduceOptions<TKey, TValue>, callback: Callback<Document | Document[]>): void,
  initializeUnorderedBulkOp(options?: BulkWriteOptions): UnorderedBulkOperation,
  initializeOrderedBulkOp(options?: BulkWriteOptions): OrderedBulkOperation,
  getLogger(): Logger,
  +logger: Logger,
  insert(docs: OptionalUnlessRequiredId<TSchema>[], options: BulkWriteOptions, callback: Callback<InsertManyResult<TSchema>>): Promise<InsertManyResult<TSchema>> | void,
  update(selector: Filter<TSchema>, update: UpdateFilter<TSchema>, options: UpdateOptions, callback: Callback<Document>): Promise<UpdateResult> | void,
  remove(selector: Filter<TSchema>, options: DeleteOptions, callback: Callback): Promise<DeleteResult> | void,
  count(): Promise<number>,
  count(callback: Callback<number>): void,
  count(filter: Filter<TSchema>): Promise<number>,
  count(filter: Filter<TSchema>, callback: Callback<number>): void,
  count(filter: Filter<TSchema>, options: CountOptions): Promise<number>,
  count(filter: Filter<TSchema>, options: CountOptions, callback: Callback<number>): Promise<number> | void,
}
export { Collection };
declare class CommandFailedEvent {
  address: string,
  connectionId?: string | number,
  requestId: number,
  duration: number,
  commandName: string,
  failure: Error,
  serviceId?: ObjectId,
  +hasServiceId: boolean,
}
export { CommandFailedEvent };
declare class CommandStartedEvent {
  commandObj?: Document,
  requestId: number,
  databaseName: string,
  commandName: string,
  command: Document,
  address: string,
  connectionId?: string | number,
  serviceId?: ObjectId,
  +hasServiceId: boolean,
}
export { CommandStartedEvent };
declare class CommandSucceededEvent {
  address: string,
  connectionId?: string | number,
  requestId: number,
  duration: number,
  commandName: string,
  reply: mixed,
  serviceId?: ObjectId,
  +hasServiceId: boolean,
}
export { CommandSucceededEvent };
declare type CommonEvents = "newListener" | "removeListener";
export type { CommonEvents };
declare export var Compressor: Readonly<{
  +none: 0,
  +snappy: 1,
  +zlib: 2,
  +zstd: 3,
  ...
}>;
declare type Compressor = any[CompressorName];
export type { Compressor };
declare type CompressorName = $Keys<any>;
export type { CompressorName };
declare type Condition<T> = AlternativeType<T> | FilterOperators<AlternativeType<T>>;
export type { Condition };
declare class ConnectionCheckedInEvent {
  connectionId: number | "<monitor>"
}
export { ConnectionCheckedInEvent };
declare class ConnectionCheckedOutEvent {
  connectionId: number | "<monitor>"
}
export { ConnectionCheckedOutEvent };
declare class ConnectionCheckOutFailedEvent {
  reason: AnyError | string
}
export { ConnectionCheckOutFailedEvent };
declare class ConnectionCheckOutStartedEvent {}
export { ConnectionCheckOutStartedEvent };
declare class ConnectionClosedEvent {
  connectionId: number | "<monitor>",
  reason: string,
  serviceId?: ObjectId,
}
export { ConnectionClosedEvent };
declare class ConnectionCreatedEvent {
  connectionId: number | "<monitor>"
}
export { ConnectionCreatedEvent };
declare type ConnectionEvents = {
  commandStarted(event: CommandStartedEvent): void,
  commandSucceeded(event: CommandSucceededEvent): void,
  commandFailed(event: CommandFailedEvent): void,
  clusterTimeReceived(clusterTime: Document): void,
  close(): void,
  message(message: any): void,
  pinned(pinType: string): void,
  unpinned(pinType: string): void,
  ...
};
export type { ConnectionEvents };
declare class ConnectionPoolClearedEvent {}
export { ConnectionPoolClearedEvent };
declare class ConnectionPoolClosedEvent {}
export { ConnectionPoolClosedEvent };
declare class ConnectionPoolCreatedEvent {
  options?: ConnectionPoolOptions
}
export { ConnectionPoolCreatedEvent };
declare type ConnectionPoolEvents = {
  connectionPoolCreated(event: ConnectionPoolCreatedEvent): void,
  connectionPoolClosed(event: ConnectionPoolClosedEvent): void,
  connectionPoolCleared(event: ConnectionPoolClearedEvent): void,
  connectionCreated(event: ConnectionCreatedEvent): void,
  connectionReady(event: ConnectionReadyEvent): void,
  connectionClosed(event: ConnectionClosedEvent): void,
  connectionCheckOutStarted(event: ConnectionCheckOutStartedEvent): void,
  connectionCheckOutFailed(event: ConnectionCheckOutFailedEvent): void,
  connectionCheckedOut(event: ConnectionCheckedOutEvent): void,
  connectionCheckedIn(event: ConnectionCheckedInEvent): void,
  ...
} & Omit<ConnectionEvents, "close" | "message">;
export type { ConnectionPoolEvents };
declare class ConnectionPoolMonitoringEvent {
  time: Date,
  address: string,
}
export { ConnectionPoolMonitoringEvent };
declare class ConnectionReadyEvent {
  connectionId: number | "<monitor>"
}
export { ConnectionReadyEvent };
declare export var CURSOR_FLAGS: ["tailable", "oplogReplay", "noCursorTimeout", "awaitData", "exhaust", "partial"];
declare type CursorFlag = any[number];
export type { CursorFlag };
declare class Db {
  static SYSTEM_NAMESPACE_COLLECTION: string,
  static SYSTEM_INDEX_COLLECTION: string,
  static SYSTEM_PROFILE_COLLECTION: string,
  static SYSTEM_USER_COLLECTION: string,
  static SYSTEM_COMMAND_COLLECTION: string,
  static SYSTEM_JS_COLLECTION: string,
  constructor(client: MongoClient, databaseName: string, options?: DbOptions): Db,
  +databaseName: string,
  +options: DbOptions | void,
  +slaveOk: boolean,
  +secondaryOk: boolean,
  +readConcern: ReadConcern | void,
  +readPreference: ReadPreference,
  +bsonOptions: BSONSerializeOptions,
  +writeConcern: WriteConcern | void,
  +namespace: string,
  createCollection<TSchema: Document = Document>(name: string, options?: CreateCollectionOptions): Promise<Collection<TSchema>>,
  createCollection<TSchema: Document = Document>(name: string, callback: Callback<Collection<TSchema>>): void,
  createCollection<TSchema: Document = Document>(name: string, options: CreateCollectionOptions | void, callback: Callback<Collection<TSchema>>): void,
  command(command: Document): Promise<Document>,
  command(command: Document, callback: Callback<Document>): void,
  command(command: Document, options: RunCommandOptions): Promise<Document>,
  command(command: Document, options: RunCommandOptions, callback: Callback<Document>): void,
  aggregate<T: Document = Document>(pipeline?: Document[], options?: AggregateOptions): AggregationCursor<T>,
  admin(): Admin,
  collection<TSchema: Document = Document>(name: string, options?: CollectionOptions): Collection<TSchema>,
  stats(): Promise<Document>,
  stats(callback: Callback<Document>): void,
  stats(options: DbStatsOptions): Promise<Document>,
  stats(options: DbStatsOptions, callback: Callback<Document>): void,
  listCollections(filter: Document, options: Exclude<ListCollectionsOptions, "nameOnly"> & {
    nameOnly: true,
    ...
  }): ListCollectionsCursor<Pick<CollectionInfo, "name" | "type">>,
  listCollections(filter: Document, options: Exclude<ListCollectionsOptions, "nameOnly"> & {
    nameOnly: false,
    ...
  }): ListCollectionsCursor<CollectionInfo>,
  listCollections<T: Pick<CollectionInfo, "name" | "type"> | CollectionInfo = Pick<CollectionInfo, "name" | "type"> | CollectionInfo>(filter?: Document, options?: ListCollectionsOptions): ListCollectionsCursor<T>,
  renameCollection<TSchema: Document = Document>(fromCollection: string, toCollection: string): Promise<Collection<TSchema>>,
  renameCollection<TSchema: Document = Document>(fromCollection: string, toCollection: string, callback: Callback<Collection<TSchema>>): void,
  renameCollection<TSchema: Document = Document>(fromCollection: string, toCollection: string, options: RenameOptions): Promise<Collection<TSchema>>,
  renameCollection<TSchema: Document = Document>(fromCollection: string, toCollection: string, options: RenameOptions, callback: Callback<Collection<TSchema>>): void,
  dropCollection(name: string): Promise<boolean>,
  dropCollection(name: string, callback: Callback<boolean>): void,
  dropCollection(name: string, options: DropCollectionOptions): Promise<boolean>,
  dropCollection(name: string, options: DropCollectionOptions, callback: Callback<boolean>): void,
  dropDatabase(): Promise<boolean>,
  dropDatabase(callback: Callback<boolean>): void,
  dropDatabase(options: DropDatabaseOptions): Promise<boolean>,
  dropDatabase(options: DropDatabaseOptions, callback: Callback<boolean>): void,
  collections(): Promise<Collection[]>,
  collections(callback: Callback<Collection[]>): void,
  collections(options: ListCollectionsOptions): Promise<Collection[]>,
  collections(options: ListCollectionsOptions, callback: Callback<Collection[]>): void,
  createIndex(name: string, indexSpec: IndexSpecification): Promise<string>,
  createIndex(name: string, indexSpec: IndexSpecification, callback?: Callback<string>): void,
  createIndex(name: string, indexSpec: IndexSpecification, options: CreateIndexesOptions): Promise<string>,
  createIndex(name: string, indexSpec: IndexSpecification, options: CreateIndexesOptions, callback: Callback<string>): void,
  addUser(username: string): Promise<Document>,
  addUser(username: string, callback: Callback<Document>): void,
  addUser(username: string, password: string): Promise<Document>,
  addUser(username: string, password: string, callback: Callback<Document>): void,
  addUser(username: string, options: AddUserOptions): Promise<Document>,
  addUser(username: string, options: AddUserOptions, callback: Callback<Document>): void,
  addUser(username: string, password: string, options: AddUserOptions): Promise<Document>,
  addUser(username: string, password: string, options: AddUserOptions, callback: Callback<Document>): void,
  removeUser(username: string): Promise<boolean>,
  removeUser(username: string, callback: Callback<boolean>): void,
  removeUser(username: string, options: RemoveUserOptions): Promise<boolean>,
  removeUser(username: string, options: RemoveUserOptions, callback: Callback<boolean>): void,
  setProfilingLevel(level: ProfilingLevel): Promise<ProfilingLevel>,
  setProfilingLevel(level: ProfilingLevel, callback: Callback<ProfilingLevel>): void,
  setProfilingLevel(level: ProfilingLevel, options: SetProfilingLevelOptions): Promise<ProfilingLevel>,
  setProfilingLevel(level: ProfilingLevel, options: SetProfilingLevelOptions, callback: Callback<ProfilingLevel>): void,
  profilingLevel(): Promise<string>,
  profilingLevel(callback: Callback<string>): void,
  profilingLevel(options: ProfilingLevelOptions): Promise<string>,
  profilingLevel(options: ProfilingLevelOptions, callback: Callback<string>): void,
  indexInformation(name: string): Promise<Document>,
  indexInformation(name: string, callback: Callback<Document>): void,
  indexInformation(name: string, options: IndexInformationOptions): Promise<Document>,
  indexInformation(name: string, options: IndexInformationOptions, callback: Callback<Document>): void,
  unref(): void,
  watch<TSchema: Document = Document, TChange: Document = ChangeStreamDocument<TSchema>>(pipeline?: Document[], options?: ChangeStreamOptions): ChangeStream<TSchema, TChange>,
  getLogger(): Logger,
  +logger: Logger,
}
export { Db };
export { DBRef };
export { Decimal128 };
declare type DistinctOptions = CommandOperationOptions;
export type { DistinctOptions };
export { Document };
export { Double };
declare type DropDatabaseOptions = CommandOperationOptions;
export type { DropDatabaseOptions };
declare type DropIndexesOptions = CommandOperationOptions;
export type { DropIndexesOptions };
declare type EnhancedOmit<TRecordOrUnion, KeyUnion> = any;
export type { EnhancedOmit };
declare type EventEmitterWithState = {...};
export type { EventEmitterWithState };
declare type EventsDescription = Record<string, GenericListener>;
export type { EventsDescription };
declare export var ExplainVerbosity: Readonly<{
  +queryPlanner: "queryPlanner",
  +queryPlannerExtended: "queryPlannerExtended",
  +executionStats: "executionStats",
  +allPlansExecution: "allPlansExecution",
  ...
}>;
declare type ExplainVerbosity = string;
export type { ExplainVerbosity };
declare type ExplainVerbosityLike = ExplainVerbosity | boolean;
export type { ExplainVerbosityLike };
declare type Filter<TSchema> = Partial<TSchema> | any;
export type { Filter };
declare type FilterOperations<T> = any;
export type { FilterOperations };
declare type FinalizeFunction<TKey = ObjectId, TValue = Document> = (key: TKey, reducedValue: TValue) => TValue;
export type { FinalizeFunction };
declare class FindCursor<TSchema = any> {
  clone(): FindCursor<TSchema>,
  map<T>(transform: (doc: TSchema) => T): FindCursor<T>,
  count(): Promise<number>,
  count(callback: Callback<number>): void,
  count(options: CountOptions): Promise<number>,
  count(options: CountOptions, callback: Callback<number>): void,
  explain(): Promise<Document>,
  explain(callback: Callback): void,
  explain(verbosity?: ExplainVerbosityLike): Promise<Document>,
  filter(filter: Document): this,
  hint(hint: Hint): this,
  min(min: Document): this,
  max(max: Document): this,
  returnKey(value: boolean): this,
  showRecordId(value: boolean): this,
  addQueryModifier(name: string, value: string | boolean | number | Document): this,
  comment(value: string): this,
  maxAwaitTimeMS(value: number): this,
  maxTimeMS(value: number): this,
  project<T: Document = Document>(value: Document): FindCursor<T>,
  sort(sort: Sort | string, direction?: SortDirection): this,
  allowDiskUse(allow?: boolean): this,
  collation(value: CollationOptions): this,
  limit(value: number): this,
  skip(value: number): this,
}
export { FindCursor };
declare class FindOperators {
  bulkOperation: BulkOperationBase,
  update(updateDocument: Document): BulkOperationBase,
  updateOne(updateDocument: Document): BulkOperationBase,
  replaceOne(replacement: Document): BulkOperationBase,
  deleteOne(): BulkOperationBase,
  delete(): BulkOperationBase,
  upsert(): this,
  collation(collation: CollationOptions): this,
  arrayFilters(arrayFilters: Document[]): this,
}
export { FindOperators };
declare type Flatten<Type> = any;
export type { Flatten };
declare type GenericListener = (...args: any[]) => void;
export type { GenericListener };
declare class GridFSBucket {
  static +INDEX: "index",
  constructor(db: Db, options?: GridFSBucketOptions): GridFSBucket,
  openUploadStream(filename: string, options?: GridFSBucketWriteStreamOptions): GridFSBucketWriteStream,
  openUploadStreamWithId(id: ObjectId, filename: string, options?: GridFSBucketWriteStreamOptions): GridFSBucketWriteStream,
  openDownloadStream(id: ObjectId, options?: GridFSBucketReadStreamOptions): GridFSBucketReadStream,
  delete(id: ObjectId): Promise<void>,
  delete(id: ObjectId, callback: Callback<void>): void,
  find(filter?: Filter<GridFSFile>, options?: FindOptions): FindCursor<GridFSFile>,
  openDownloadStreamByName(filename: string, options?: GridFSBucketReadStreamOptionsWithRevision): GridFSBucketReadStream,
  rename(id: ObjectId, filename: string): Promise<void>,
  rename(id: ObjectId, filename: string, callback: Callback<void>): void,
  drop(): Promise<void>,
  drop(callback: Callback<void>): void,
  getLogger(): Logger,
}
export { GridFSBucket };
declare type GridFSBucketEvents = {
  index(): void,
  ...
};
export type { GridFSBucketEvents };
declare class GridFSBucketReadStream mixins NodeJS.ReadableStream {
  static +ERROR: "error",
  static +FILE: "file",
  static +DATA: "data",
  static +END: "end",
  static +CLOSE: "close",
  start(start?: number): this,
  end(end?: number): this,
  abort(callback?: Callback<void>): void,
}
export { GridFSBucketReadStream };
declare class GridFSBucketWriteStream mixins NodeJS.WritableStream {
  bucket: GridFSBucket,
  chunks: Collection<GridFSChunk>,
  filename: string,
  files: Collection<GridFSFile>,
  options: GridFSBucketWriteStreamOptions,
  done: boolean,
  id: ObjectId,
  chunkSizeBytes: number,
  bufToStore: Buffer,
  length: number,
  n: number,
  pos: number,
  state: {
    streamEnd: boolean,
    outstandingRequests: number,
    errored: boolean,
    aborted: boolean,
    ...
  },
  writeConcern?: WriteConcern,
  static +CLOSE: any,
  static +ERROR: any,
  static +FINISH: any,
  write(chunk: Buffer | string): boolean,
  write(chunk: Buffer | string, callback: Callback<void>): boolean,
  write(chunk: Buffer | string, encoding: BufferEncoding | void): boolean,
  write(chunk: Buffer | string, encoding: BufferEncoding | void, callback: Callback<void>): boolean,
  abort(): Promise<void>,
  abort(callback: Callback<void>): void,
  end(): this,
  end(chunk: Buffer): this,
  end(callback: Callback<GridFSFile | void>): this,
  end(chunk: Buffer, callback: Callback<GridFSFile | void>): this,
  end(chunk: Buffer, encoding: BufferEncoding): this,
  end(chunk: Buffer, encoding: BufferEncoding | void, callback: Callback<GridFSFile | void>): this,
}
export { GridFSBucketWriteStream };
declare export var GSSAPICanonicalizationValue: Readonly<{
  +on: true,
  +off: false,
  +none: "none",
  +forward: "forward",
  +forwardAndReverse: "forwardAndReverse",
  ...
}>;
declare type GSSAPICanonicalizationValue = any[$Keys<any>];
export type { GSSAPICanonicalizationValue };
declare type Hint = string | Document;
export type { Hint };
declare class HostAddress {
  host: string | void,
  port: number | void,
  socketPath: string | void,
  isIPv6: boolean | void,
  constructor(hostString: string): HostAddress,
  inspect(): string,
  static fromString(s: string): HostAddress,
  static fromHostPort(host: string, port: number): HostAddress,
  static fromSrvRecord(SrvRecord): HostAddress,
  [typeof toString]: (ipv6Brackets?: boolean) => string,
}
export { HostAddress };
declare type IndexDirection = -1 | 1 | "2d" | "2dsphere" | "text" | "geoHaystack" | number;
export type { IndexDirection };
declare type IndexSpecification = OneOrMore<string | [string, IndexDirection] | {
  [key: string]: IndexDirection,
  ...
} | [string, IndexDirection][] | {
  [key: string]: IndexDirection,
  ...
}[]>;
export type { IndexSpecification };
declare type InferIdType<TSchema> = any;
export type { InferIdType };
export { Int32 };
declare type IntegerType = number | Int32 | Long;
export type { IntegerType };
declare type IsAny<Type, ResultIfAny, ResultIfNotAny> = any;
export type { IsAny };
declare type Join<T: mixed[], D: string> = any;
export type { Join };
declare type KeysOfAType<TSchema, Type> = $ObjMapi<TSchema, <key>(key) => any>[$Keys<TSchema>];
export type { KeysOfAType };
declare type KeysOfOtherType<TSchema, Type> = $ObjMapi<TSchema, <key>(key) => any>[$Keys<TSchema>];
export type { KeysOfOtherType };
declare export var LEGAL_TCP_SOCKET_OPTIONS: ["family", "hints", "localAddress", "localPort", "lookup"];
declare export var LEGAL_TLS_SOCKET_OPTIONS: ["ALPNProtocols", "ca", "cert", "checkServerIdentity", "ciphers", "crl", "ecdhCurve", "key", "minDHSize", "passphrase", "pfx", "rejectUnauthorized", "secureContext", "secureProtocol", "servername", "session"];
declare class ListCollectionsCursor<T: Pick<CollectionInfo, "name" | "type"> | CollectionInfo = Pick<CollectionInfo, "name" | "type"> | CollectionInfo> {
  parent: Db,
  filter: Document,
  options?: ListCollectionsOptions,
  constructor(db: Db, filter: Document, options?: ListCollectionsOptions): ListCollectionsCursor<T>,
  clone(): ListCollectionsCursor<T>,
}
export { ListCollectionsCursor };
declare class ListIndexesCursor {
  parent: Collection,
  options?: ListIndexesOptions,
  constructor(collection: Collection, options?: ListIndexesOptions): ListIndexesCursor,
  clone(): ListIndexesCursor,
}
export { ListIndexesCursor };
declare class Logger {
  className: string,
  constructor(className: string, options?: LoggerOptions): Logger,
  debug(message: string, object?: mixed): void,
  warn(message: string, object?: mixed): void,
  info(message: string, object?: mixed): void,
  error(message: string, object?: mixed): void,
  isInfo(): boolean,
  isError(): boolean,
  isWarn(): boolean,
  isDebug(): boolean,
  static reset(): void,
  static currentLogger(): LoggerFunction,
  static setCurrentLogger(logger: LoggerFunction): void,
  static filter(type: string, values: string[]): void,
  static setLevel(newLevel: LoggerLevel): void,
}
export { Logger };
declare type LoggerFunction = (message?: any, ...optionalParams: any[]) => void;
export type { LoggerFunction };
declare export var LoggerLevel: Readonly<{
  +ERROR: "error",
  +WARN: "warn",
  +INFO: "info",
  +DEBUG: "debug",
  +error: "error",
  +warn: "warn",
  +info: "info",
  +debug: "debug",
  ...
}>;
declare type LoggerLevel = any[$Keys<any>];
export type { LoggerLevel };
export { Long };
export { Map_2 as Map };
declare type MapFunction<TSchema = Document> = (this: TSchema) => void;
export type { MapFunction };
declare type MatchKeysAndValues<TSchema> = Readonly<Partial<TSchema>> & Record<string, any>;
export type { MatchKeysAndValues };
export { MaxKey };
export { MinKey };
declare export var MONGO_CLIENT_EVENTS: ["connectionPoolCreated", "connectionPoolClosed", "connectionCreated", "connectionReady", "connectionClosed", "connectionCheckOutStarted", "connectionCheckOutFailed", "connectionCheckedOut", "connectionCheckedIn", "connectionPoolCleared", "commandStarted", "commandSucceeded", "commandFailed", "serverOpening", "serverClosed", "serverDescriptionChanged", "topologyOpening", "topologyClosed", "topologyDescriptionChanged", "error", "timeout", "close", "serverHeartbeatStarted", "serverHeartbeatSucceeded", "serverHeartbeatFailed"];
declare class MongoAPIError {
  constructor(message: string): MongoAPIError,
  +name: string,
}
export { MongoAPIError };
declare class MongoAWSError {
  constructor(message: string): MongoAWSError,
  +name: string,
}
export { MongoAWSError };
declare class MongoBatchReExecutionError {
  constructor(message?: string): MongoBatchReExecutionError,
  +name: string,
}
export { MongoBatchReExecutionError };
declare class MongoBulkWriteError {
  result: BulkWriteResult,
  writeErrors: OneOrMore<WriteError>,
  err?: WriteConcernError,
  constructor(error: {
    message: string,
    code: number,
    writeErrors?: WriteError[],
    ...
  } | WriteConcernError | AnyError, result: BulkWriteResult): MongoBulkWriteError,
  +name: string,
  +insertedCount: number,
  +matchedCount: number,
  +modifiedCount: number,
  +deletedCount: number,
  +upsertedCount: number,
  +insertedIds: {
    [key: number]: any,
    ...
  },
  +upsertedIds: {
    [key: number]: any,
    ...
  },
}
export { MongoBulkWriteError };
declare class MongoChangeStreamError {
  constructor(message: string): MongoChangeStreamError,
  +name: string,
}
export { MongoChangeStreamError };
declare class MongoClient {
  constructor(url: string, options?: MongoClientOptions): MongoClient,
  +options: Readonly<MongoOptions>,
  +serverApi: Readonly<ServerApi | void>,
  +autoEncrypter: AutoEncrypter | void,
  +readConcern: ReadConcern | void,
  +writeConcern: WriteConcern | void,
  +readPreference: ReadPreference,
  +bsonOptions: BSONSerializeOptions,
  +logger: Logger,
  connect(): Promise<this>,
  connect(callback: Callback<this>): void,
  close(): Promise<void>,
  close(callback: Callback<void>): void,
  close(force: boolean): Promise<void>,
  close(force: boolean, callback: Callback<void>): void,
  db(dbName?: string, options?: DbOptions): Db,
  static connect(url: string): Promise<MongoClient>,
  static connect(url: string, callback: Callback<MongoClient>): void,
  static connect(url: string, options: MongoClientOptions): Promise<MongoClient>,
  static connect(url: string, options: MongoClientOptions, callback: Callback<MongoClient>): void,
  startSession(): ClientSession,
  startSession(options: ClientSessionOptions): ClientSession,
  withSession(callback: WithSessionCallback): Promise<void>,
  withSession(options: ClientSessionOptions, callback: WithSessionCallback): Promise<void>,
  watch<TSchema: Document = Document, TChange: Document = ChangeStreamDocument<TSchema>>(pipeline?: Document[], options?: ChangeStreamOptions): ChangeStream<TSchema, TChange>,
  getLogger(): Logger,
}
export { MongoClient };
declare type MongoClientEvents = Pick<TopologyEvents, any[number]> & {
  open(mongoClient: MongoClient): void,
  ...
};
export type { MongoClientEvents };
declare class MongoCompatibilityError {
  constructor(message: string): MongoCompatibilityError,
  +name: string,
}
export { MongoCompatibilityError };
declare class MongoCredentials {
  +username: string,
  +password: string,
  +source: string,
  +mechanism: AuthMechanism,
  +mechanismProperties: AuthMechanismProperties,
  constructor(options: MongoCredentialsOptions): MongoCredentials,
  equals(other: MongoCredentials): boolean,
  resolveAuthMechanism(hello?: Document): MongoCredentials,
  validate(): void,
  static merge(creds: MongoCredentials | void, options: Partial<MongoCredentialsOptions>): MongoCredentials,
}
export { MongoCredentials };
declare class MongoCursorExhaustedError {
  constructor(message?: string): MongoCursorExhaustedError,
  +name: string,
}
export { MongoCursorExhaustedError };
declare class MongoCursorInUseError {
  constructor(message?: string): MongoCursorInUseError,
  +name: string,
}
export { MongoCursorInUseError };
declare class MongoDBNamespace {
  db: string,
  collection?: string,
  constructor(db: string, collection?: string): MongoDBNamespace,
  withCollection(collection: string): MongoDBNamespace,
  static fromString(namespace?: string): MongoDBNamespace,
  [typeof toString]: () => string,
}
export { MongoDBNamespace };
declare class MongoDecompressionError {
  constructor(message: string): MongoDecompressionError,
  +name: string,
}
export { MongoDecompressionError };
declare class MongoDriverError {
  constructor(message: string): MongoDriverError,
  +name: string,
}
export { MongoDriverError };
declare class MongoError {
  code?: number | string,
  topologyVersion?: TopologyVersion,
  constructor(message: string | Error): MongoError,
  +name: string,
  +errmsg: string,
  hasErrorLabel(label: string): boolean,
  addErrorLabel(label: string): void,
  +errorLabels: string[],
}
export { MongoError };
declare export var MongoErrorLabel: Readonly<{
  +RetryableWriteError: "RetryableWriteError",
  +TransientTransactionError: "TransientTransactionError",
  +UnknownTransactionCommitResult: "UnknownTransactionCommitResult",
  +ResumableChangeStreamError: "ResumableChangeStreamError",
  +HandshakeError: "HandshakeError",
  ...
}>;
declare type MongoErrorLabel = any[$Keys<any>];
export type { MongoErrorLabel };
declare class MongoExpiredSessionError {
  constructor(message?: string): MongoExpiredSessionError,
  +name: string,
}
export { MongoExpiredSessionError };
declare class MongoGridFSChunkError {
  constructor(message: string): MongoGridFSChunkError,
  +name: string,
}
export { MongoGridFSChunkError };
declare class MongoGridFSStreamError {
  constructor(message: string): MongoGridFSStreamError,
  +name: string,
}
export { MongoGridFSStreamError };
declare class MongoInvalidArgumentError {
  constructor(message: string): MongoInvalidArgumentError,
  +name: string,
}
export { MongoInvalidArgumentError };
declare class MongoKerberosError {
  constructor(message: string): MongoKerberosError,
  +name: string,
}
export { MongoKerberosError };
declare class MongoMissingCredentialsError {
  constructor(message: string): MongoMissingCredentialsError,
  +name: string,
}
export { MongoMissingCredentialsError };
declare class MongoMissingDependencyError {
  constructor(message: string): MongoMissingDependencyError,
  +name: string,
}
export { MongoMissingDependencyError };
declare class MongoNetworkError {
  constructor(message: string | Error, options?: MongoNetworkErrorOptions): MongoNetworkError,
  +name: string,
}
export { MongoNetworkError };
declare class MongoNetworkTimeoutError {
  constructor(message: string, options?: MongoNetworkErrorOptions): MongoNetworkTimeoutError,
  +name: string,
}
export { MongoNetworkTimeoutError };
declare class MongoNotConnectedError {
  constructor(message: string): MongoNotConnectedError,
  +name: string,
}
export { MongoNotConnectedError };
declare class MongoParseError {
  constructor(message: string): MongoParseError,
  +name: string,
}
export { MongoParseError };
declare class MongoRuntimeError {
  constructor(message: string): MongoRuntimeError,
  +name: string,
}
export { MongoRuntimeError };
declare class MongoServerClosedError {
  constructor(message?: string): MongoServerClosedError,
  +name: string,
}
export { MongoServerClosedError };
declare class MongoServerError {
  codeName?: string,
  writeConcernError?: Document,
  errInfo?: Document,
  ok?: number,
  constructor(message: ErrorDescription): MongoServerError,
  +name: string,
}
export { MongoServerError };
declare class MongoServerSelectionError {
  constructor(message: string, reason: TopologyDescription): MongoServerSelectionError,
  +name: string,
}
export { MongoServerSelectionError };
declare class MongoSystemError {
  reason?: TopologyDescription,
  constructor(message: string, reason: TopologyDescription): MongoSystemError,
  +name: string,
}
export { MongoSystemError };
declare class MongoTailableCursorError {
  constructor(message?: string): MongoTailableCursorError,
  +name: string,
}
export { MongoTailableCursorError };
declare class MongoTopologyClosedError {
  constructor(message?: string): MongoTopologyClosedError,
  +name: string,
}
export { MongoTopologyClosedError };
declare class MongoTransactionError {
  constructor(message: string): MongoTransactionError,
  +name: string,
}
export { MongoTransactionError };
declare class MongoUnexpectedServerResponseError {
  constructor(message: string): MongoUnexpectedServerResponseError,
  +name: string,
}
export { MongoUnexpectedServerResponseError };
declare class MongoWriteConcernError {
  result?: Document,
  constructor(message: ErrorDescription, result?: Document): MongoWriteConcernError,
  +name: string,
}
export { MongoWriteConcernError };
declare type MonitorEvents = {
  serverHeartbeatStarted(event: ServerHeartbeatStartedEvent): void,
  serverHeartbeatSucceeded(event: ServerHeartbeatSucceededEvent): void,
  serverHeartbeatFailed(event: ServerHeartbeatFailedEvent): void,
  resetServer(error?: Error): void,
  resetConnectionPool(): void,
  close(): void,
  ...
} & EventEmitterWithState;
export type { MonitorEvents };
declare type NestedPaths<Type> = any;
export type { NestedPaths };
declare type NonObjectIdLikeDocument = $ObjMapi<ObjectIdLike, <key>(key) => empty> & Document;
export type { NonObjectIdLikeDocument };
declare type NotAcceptedFields<TSchema, FieldType> = $ObjMapi<{
  [k: KeysOfOtherType<TSchema, FieldType>]: any
}, <key>(key) => empty>;
export type { NotAcceptedFields };
declare type NumericType = IntegerType | Decimal128 | Double;
export type { NumericType };
declare export var ObjectID: any;
export { ObjectId };
declare type OneOrMore<T> = T | ReadonlyArray<T>;
export type { OneOrMore };
declare type OnlyFieldsOfType<TSchema, FieldType = any, AssignableType = FieldType> = IsAny<TSchema[$Keys<TSchema>], Record<string, FieldType>, AcceptedFields<TSchema, FieldType, AssignableType> & NotAcceptedFields<TSchema, FieldType> & Record<string, AssignableType>>;
export type { OnlyFieldsOfType };
declare type OperationTime = Timestamp;
export type { OperationTime };
declare type OptionalId<TSchema> = EnhancedOmit<TSchema, "_id"> & {
  _id?: InferIdType<TSchema>,
  ...
};
export type { OptionalId };
declare type OptionalUnlessRequiredId<TSchema> = any;
export type { OptionalUnlessRequiredId };
declare class OrderedBulkOperation {
  constructor(collection: Collection, options: BulkWriteOptions): OrderedBulkOperation,
  addToOperationsList(batchType: BatchType, document: Document | UpdateStatement | DeleteStatement): this,
}
export { OrderedBulkOperation };
declare export var ProfilingLevel: Readonly<{
  +off: "off",
  +slowOnly: "slow_only",
  +all: "all",
  ...
}>;
declare type ProfilingLevel = any[$Keys<any>];
export type { ProfilingLevel };
declare type ProfilingLevelOptions = CommandOperationOptions;
export type { ProfilingLevelOptions };
declare type Projection<TSchema: Document = Document> = Document;
export type { Projection };
declare type ProjectionOperators = Document;
export type { ProjectionOperators };
declare class Promise_2 {
  static validate(lib: mixed): any,
  static set(lib: PromiseConstructor): void,
  static get(): PromiseConstructor,
}
export { Promise_2 as Promise };
declare type PropertyType<Type, Property: string> = any;
export type { PropertyType };
declare type PullAllOperator<TSchema> = any & {
  [key: string]: ReadonlyArray<any>,
  ...
};
export type { PullAllOperator };
declare type PullOperator<TSchema> = any & {
  [key: string]: FilterOperators<any> | any,
  ...
};
export type { PullOperator };
declare type PushOperator<TSchema> = any & {
  [key: string]: ArrayOperator<any> | any,
  ...
};
export type { PushOperator };
declare class ReadConcern {
  level: ReadConcernLevel | string,
  constructor(level: ReadConcernLevel): ReadConcern,
  static fromOptions(options?: {
    readConcern?: ReadConcernLike,
    level?: ReadConcernLevel,
    ...
  }): ReadConcern | void,
  static +MAJORITY: "majority",
  static +AVAILABLE: "available",
  static +LINEARIZABLE: "linearizable",
  static +SNAPSHOT: "snapshot",
  toJSON(): Document,
}
export { ReadConcern };
declare export var ReadConcernLevel: Readonly<{
  +local: "local",
  +majority: "majority",
  +linearizable: "linearizable",
  +available: "available",
  +snapshot: "snapshot",
  ...
}>;
declare type ReadConcernLevel = any[$Keys<any>];
export type { ReadConcernLevel };
declare type ReadConcernLike = ReadConcern | {
  level: ReadConcernLevel,
  ...
} | ReadConcernLevel;
export type { ReadConcernLike };
declare class ReadPreference {
  mode: ReadPreferenceMode,
  tags?: TagSet[],
  hedge?: HedgeOptions,
  maxStalenessSeconds?: number,
  minWireVersion?: number,
  static PRIMARY: "primary",
  static PRIMARY_PREFERRED: "primaryPreferred",
  static SECONDARY: "secondary",
  static SECONDARY_PREFERRED: "secondaryPreferred",
  static NEAREST: "nearest",
  static primary: ReadPreference,
  static primaryPreferred: ReadPreference,
  static secondary: ReadPreference,
  static secondaryPreferred: ReadPreference,
  static nearest: ReadPreference,
  constructor(mode: ReadPreferenceMode, tags?: TagSet[], options?: ReadPreferenceOptions): ReadPreference,
  +preference: ReadPreferenceMode,
  static fromString(mode: string): ReadPreference,
  static fromOptions(options?: ReadPreferenceFromOptions): ReadPreference | void,
  static translate(options: ReadPreferenceLikeOptions): ReadPreferenceLikeOptions,
  static isValid(mode: string): boolean,
  isValid(mode?: string): boolean,
  slaveOk(): boolean,
  secondaryOk(): boolean,
  equals(readPreference: ReadPreference): boolean,
  toJSON(): Document,
}
export { ReadPreference };
declare type ReadPreferenceLike = ReadPreference | ReadPreferenceMode;
export type { ReadPreferenceLike };
declare export var ReadPreferenceMode: Readonly<{
  +primary: "primary",
  +primaryPreferred: "primaryPreferred",
  +secondary: "secondary",
  +secondaryPreferred: "secondaryPreferred",
  +nearest: "nearest",
  ...
}>;
declare type ReadPreferenceMode = any[$Keys<any>];
export type { ReadPreferenceMode };
declare type ReduceFunction<TKey = ObjectId, TValue = any> = (key: TKey, values: TValue[]) => TValue;
export type { ReduceFunction };
declare type RegExpOrString<T> = any;
export type { RegExpOrString };
declare type RemoveUserOptions = CommandOperationOptions;
export type { RemoveUserOptions };
declare type ResumeToken = mixed;
export type { ResumeToken };
declare export var ReturnDocument: Readonly<{
  +BEFORE: "before",
  +AFTER: "after",
  ...
}>;
declare type ReturnDocument = any[$Keys<any>];
export type { ReturnDocument };
declare type RunCommandOptions = CommandOperationOptions;
export type { RunCommandOptions };
declare type SchemaMember<T, V> = $ObjMapi<T, <P>(P) => V> | {
  [key: string]: V,
  ...
};
export type { SchemaMember };
declare export var ServerApiVersion: Readonly<{
  +v1: "1",
  ...
}>;
declare type ServerApiVersion = any[$Keys<any>];
export type { ServerApiVersion };
declare class ServerCapabilities {
  maxWireVersion: number,
  minWireVersion: number,
  constructor(hello: Document): ServerCapabilities,
  +hasAggregationCursor: boolean,
  +hasWriteCommands: boolean,
  +hasTextSearch: boolean,
  +hasAuthCommands: boolean,
  +hasListCollectionsCommand: boolean,
  +hasListIndexesCommand: boolean,
  +supportsSnapshotReads: boolean,
  +commandsTakeWriteConcern: boolean,
  +commandsTakeCollation: boolean,
}
export { ServerCapabilities };
declare class ServerClosedEvent {
  topologyId: number,
  address: string,
}
export { ServerClosedEvent };
declare class ServerDescription {
  _hostAddress: any,
  address: string,
  type: ServerType,
  hosts: string[],
  passives: string[],
  arbiters: string[],
  tags: TagSet,
  error?: MongoError,
  topologyVersion?: TopologyVersion,
  minWireVersion: number,
  maxWireVersion: number,
  roundTripTime: number,
  lastUpdateTime: number,
  lastWriteDate: number,
  me?: string,
  primary?: string,
  setName?: string,
  setVersion?: number,
  electionId?: ObjectId,
  logicalSessionTimeoutMinutes?: number,
  $clusterTime?: ClusterTime,
  +hostAddress: HostAddress,
  +allHosts: string[],
  +isReadable: boolean,
  +isDataBearing: boolean,
  +isWritable: boolean,
  +host: string,
  +port: number,
  equals(other: ServerDescription): boolean,
}
export { ServerDescription };
declare class ServerDescriptionChangedEvent {
  topologyId: number,
  address: string,
  previousDescription: ServerDescription,
  newDescription: ServerDescription,
}
export { ServerDescriptionChangedEvent };
declare type ServerEvents = {
  serverHeartbeatStarted(event: ServerHeartbeatStartedEvent): void,
  serverHeartbeatSucceeded(event: ServerHeartbeatSucceededEvent): void,
  serverHeartbeatFailed(event: ServerHeartbeatFailedEvent): void,
  descriptionReceived(description: ServerDescription): void,
  closed(): void,
  ended(): void,
  ...
} & ConnectionPoolEvents & EventEmitterWithState;
export type { ServerEvents };
declare class ServerHeartbeatFailedEvent {
  connectionId: string,
  duration: number,
  failure: Error,
}
export { ServerHeartbeatFailedEvent };
declare class ServerHeartbeatStartedEvent {
  connectionId: string
}
export { ServerHeartbeatStartedEvent };
declare class ServerHeartbeatSucceededEvent {
  connectionId: string,
  duration: number,
  reply: Document,
}
export { ServerHeartbeatSucceededEvent };
declare class ServerOpeningEvent {
  topologyId: number,
  address: string,
}
export { ServerOpeningEvent };
declare type ServerOptions = Omit<ConnectionPoolOptions, "id" | "generation" | "hostAddress"> & MonitorOptions;
export type { ServerOptions };
declare type ServerSelector = (topologyDescription: TopologyDescription, servers: ServerDescription[]) => ServerDescription[];
export type { ServerSelector };
declare class ServerSession {
  id: ServerSessionId,
  lastUse: number,
  txnNumber: number,
  isDirty: boolean,
  hasTimedOut(sessionTimeoutMinutes: number): boolean,
}
export { ServerSession };
declare type ServerSessionId = {
  id: Binary,
  ...
};
export type { ServerSessionId };
declare export var ServerType: Readonly<{
  +Standalone: "Standalone",
  +Mongos: "Mongos",
  +PossiblePrimary: "PossiblePrimary",
  +RSPrimary: "RSPrimary",
  +RSSecondary: "RSSecondary",
  +RSArbiter: "RSArbiter",
  +RSOther: "RSOther",
  +RSGhost: "RSGhost",
  +Unknown: "Unknown",
  +LoadBalancer: "LoadBalancer",
  ...
}>;
declare type ServerType = any[$Keys<any>];
export type { ServerType };
declare type SetFields<TSchema> = any & {
  [key: string]: AddToSetOperators<any> | any,
  ...
};
export type { SetFields };
declare type SetProfilingLevelOptions = CommandOperationOptions;
export type { SetProfilingLevelOptions };
declare type Sort = string | Exclude<SortDirection, {
  $meta: string,
  ...
}> | string[] | {
  [key: string]: SortDirection,
  ...
} | Map<string, SortDirection> | [string, SortDirection][] | [string, SortDirection];
export type { Sort };
declare type SortDirection = 1 | -1 | "asc" | "desc" | "ascending" | "descending" | {
  $meta: string,
  ...
};
export type { SortDirection };
declare type Stream = Socket | TLSSocket;
export type { Stream };
declare class StreamDescription {
  address: string,
  type: string,
  minWireVersion?: number,
  maxWireVersion?: number,
  maxBsonObjectSize: number,
  maxMessageSizeBytes: number,
  maxWriteBatchSize: number,
  compressors: CompressorName[],
  compressor?: CompressorName,
  logicalSessionTimeoutMinutes?: number,
  loadBalanced: boolean,
  __nodejs_mock_server__?: boolean,
  zlibCompressionLevel?: number,
  constructor(address: string, options?: StreamDescriptionOptions): StreamDescription,
  receiveResponse(response: Document | null): void,
}
export { StreamDescription };
declare type SupportedNodeConnectionOptions = SupportedTLSConnectionOptions & SupportedTLSSocketOptions & SupportedSocketOptions;
export type { SupportedNodeConnectionOptions };
declare type SupportedSocketOptions = Pick<TcpNetConnectOpts, any[number]>;
export type { SupportedSocketOptions };
declare type SupportedTLSConnectionOptions = Pick<ConnectionOptions_2, Extract<$Keys<ConnectionOptions_2>, any[number]>>;
export type { SupportedTLSConnectionOptions };
declare type SupportedTLSSocketOptions = Pick<TLSSocketOptions, Extract<$Keys<TLSSocketOptions>, any[number]>>;
export type { SupportedTLSSocketOptions };
declare type TagSet = {
  [key: string]: string,
  ...
};
export type { TagSet };
export { Timestamp };
declare class TopologyClosedEvent {
  topologyId: number
}
export { TopologyClosedEvent };
declare class TopologyDescription {
  type: TopologyType,
  setName?: string,
  maxSetVersion?: number,
  maxElectionId?: ObjectId,
  servers: Map<string, ServerDescription>,
  stale: boolean,
  compatible: boolean,
  compatibilityError?: string,
  logicalSessionTimeoutMinutes?: number,
  heartbeatFrequencyMS: number,
  localThresholdMS: number,
  commonWireVersion?: number,
  constructor(topologyType: TopologyType, serverDescriptions?: Map<string, ServerDescription>, setName?: string, maxSetVersion?: number, maxElectionId?: ObjectId, commonWireVersion?: number, options?: TopologyDescriptionOptions): TopologyDescription,
  +error: MongoError | void,
  +hasKnownServers: boolean,
  +hasDataBearingServers: boolean,
}
export { TopologyDescription };
declare class TopologyDescriptionChangedEvent {
  topologyId: number,
  previousDescription: TopologyDescription,
  newDescription: TopologyDescription,
}
export { TopologyDescriptionChangedEvent };
declare type TopologyEvents = {
  serverOpening(event: ServerOpeningEvent): void,
  serverClosed(event: ServerClosedEvent): void,
  serverDescriptionChanged(event: ServerDescriptionChangedEvent): void,
  topologyClosed(event: TopologyClosedEvent): void,
  topologyOpening(event: TopologyOpeningEvent): void,
  topologyDescriptionChanged(event: TopologyDescriptionChangedEvent): void,
  error(error: Error): void,
  close(): void,
  timeout(): void,
  ...
} & Omit<ServerEvents, "connect"> & ConnectionPoolEvents & ConnectionEvents & EventEmitterWithState;
export type { TopologyEvents };
declare class TopologyOpeningEvent {
  topologyId: number
}
export { TopologyOpeningEvent };
declare export var TopologyType: Readonly<{
  +Single: "Single",
  +ReplicaSetNoPrimary: "ReplicaSetNoPrimary",
  +ReplicaSetWithPrimary: "ReplicaSetWithPrimary",
  +Sharded: "Sharded",
  +Unknown: "Unknown",
  +LoadBalanced: "LoadBalanced",
  ...
}>;
declare type TopologyType = any[$Keys<any>];
export type { TopologyType };
declare class Transaction {
  options: TransactionOptions,
  +recoveryToken: Document | void,
  +isPinned: boolean,
  +isStarting: boolean,
  +isActive: boolean,
  +isCommitted: boolean,
}
export { Transaction };
declare class TypedEventEmitter<Events: EventsDescription> {}
export { TypedEventEmitter };
declare class UnorderedBulkOperation {
  constructor(collection: Collection, options: BulkWriteOptions): UnorderedBulkOperation,
  handleWriteError(callback: Callback, writeResult: BulkWriteResult): boolean,
  addToOperationsList(batchType: BatchType, document: Document | UpdateStatement | DeleteStatement): this,
}
export { UnorderedBulkOperation };
declare type UpdateFilter<TSchema> = {
  $currentDate?: OnlyFieldsOfType<TSchema, Date | Timestamp, true | {
    $type: "date" | "timestamp",
    ...
  }>,
  $inc?: OnlyFieldsOfType<TSchema, NumericType | void>,
  $min?: MatchKeysAndValues<TSchema>,
  $max?: MatchKeysAndValues<TSchema>,
  $mul?: OnlyFieldsOfType<TSchema, NumericType | void>,
  $rename?: Record<string, string>,
  $set?: MatchKeysAndValues<TSchema>,
  $setOnInsert?: MatchKeysAndValues<TSchema>,
  $unset?: OnlyFieldsOfType<TSchema, any, "" | true | 1>,
  $addToSet?: SetFields<TSchema>,
  $pop?: OnlyFieldsOfType<TSchema, ReadonlyArray<any>, 1 | -1>,
  $pull?: PullOperator<TSchema>,
  $push?: PushOperator<TSchema>,
  $pullAll?: PullAllOperator<TSchema>,
  $bit?: OnlyFieldsOfType<TSchema, NumericType | void, {
    and: IntegerType,
    ...
  } | {
    or: IntegerType,
    ...
  } | {
    xor: IntegerType,
    ...
  }>,
  ...
} & Document;
export type { UpdateFilter };
declare type W = number | "majority";
export type { W };
declare type WithId<TSchema> = EnhancedOmit<TSchema, "_id"> & {
  _id: InferIdType<TSchema>,
  ...
};
export type { WithId };
declare type WithoutId<TSchema> = Omit<TSchema, "_id">;
export type { WithoutId };
declare type WithSessionCallback = (session: ClientSession) => Promise<any>;
export type { WithSessionCallback };
declare type WithTransactionCallback<T = void> = (session: ClientSession) => Promise<T>;
export type { WithTransactionCallback };
declare class WriteConcern {
  w?: W,
  wtimeout?: number,
  j?: boolean,
  fsync?: boolean | 1,
  constructor(w?: W, wtimeout?: number, j?: boolean, fsync?: boolean | 1): WriteConcern,
  static fromOptions(options?: WriteConcernOptions | WriteConcern | W, inherit?: WriteConcernOptions | WriteConcern): WriteConcern | void,
}
export { WriteConcern };
declare class WriteConcernError {
  constructor(error: WriteConcernErrorData): WriteConcernError,
  +code: number | void,
  +errmsg: string | void,
  +errInfo: Document | void,
  +err: WriteConcernErrorData,
  toJSON(): WriteConcernErrorData,
  [typeof toString]: () => string,
}
export { WriteConcernError };
declare class WriteError {
  err: BulkWriteOperationError,
  constructor(err: BulkWriteOperationError): WriteError,
  +code: number,
  +index: number,
  +errmsg: string | void,
  +errInfo: Document | void,
  getOperation(): Document,
  toJSON(): {
    code: number,
    index: number,
    errmsg?: string,
    op: Document,
    ...
  },
  [typeof toString]: () => string,
}
export { WriteError };