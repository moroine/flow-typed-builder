import type { Binary } from 'bson';
import type { BSONRegExp } from 'bson';
import type { BSONSymbol } from 'bson';
import type { Code } from 'bson';
import type { ConnectionOptions as ConnectionOptions_2 } from 'tls';
import type { DBRef } from 'bson';
import type { Decimal128 } from 'bson';
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

declare class AbstractCursor<TSchema = any, CursorEvents extends AbstractCursorEvents = AbstractCursorEvents> extends TypedEventEmitter<CursorEvents> {
  /* Excluded from this release type: [kId] */
  /* Excluded from this release type: [kSession] */
  /* Excluded from this release type: [kServer] */
  /* Excluded from this release type: [kNamespace] */
  /* Excluded from this release type: [kDocuments] */
  /* Excluded from this release type: [kClient] */
  /* Excluded from this release type: [kTransform] */
  /* Excluded from this release type: [kInitialized] */
  /* Excluded from this release type: [kClosed] */
  /* Excluded from this release type: [kKilled] */
  /* Excluded from this release type: [kOptions] */
  /** @event */
  static readonly CLOSE: "close";
  /* Excluded from this release type: __constructor */
  get id(): Long | undefined;
  /* Excluded from this release type: client */
  /* Excluded from this release type: server */
  get namespace(): MongoDBNamespace;
  get readPreference(): ReadPreference;
  get readConcern(): ReadConcern | undefined;
  /* Excluded from this release type: session */
  /* Excluded from this release type: session */
  /* Excluded from this release type: cursorOptions */
  get closed(): boolean;
  get killed(): boolean;
  get loadBalanced(): boolean;
  /** Returns current buffered documents length */
  bufferedCount(): number;
  /** Returns current buffered documents */
  readBufferedDocuments(number?: number): TSchema[];
  [Symbol.asyncIterator](): AsyncIterator<TSchema, void>;
  stream(options?: CursorStreamOptions): Readable & AsyncIterable<TSchema>;
  hasNext(): Promise<boolean>;
  hasNext(callback: Callback<boolean>): void;
  /** Get the next available document from the cursor, returns null if no more documents are available. */
  next(): Promise<TSchema | null>;
  next(callback: Callback<TSchema | null>): void;
  next(callback?: Callback<TSchema | null>): Promise<TSchema | null> | void;
  /**
   * Try to get the next available document from the cursor or `null` if an empty batch is returned
   */
  tryNext(): Promise<TSchema | null>;
  tryNext(callback: Callback<TSchema | null>): void;
  /**
   * Iterates over all the documents for this cursor using the iterator, callback pattern.
   *
   * @param iterator - The iteration callback.
   * @param callback - The end callback.
   */
  forEach(iterator: (doc: TSchema) => boolean | void): Promise<void>;
  forEach(iterator: (doc: TSchema) => boolean | void, callback: Callback<void>): void;
  close(): Promise<void>;
  close(callback: Callback): void;
  /**
   * @deprecated options argument is deprecated
   */
  close(options: CursorCloseOptions): Promise<void>;
  /**
   * @deprecated options argument is deprecated
   */
  close(options: CursorCloseOptions, callback: Callback): void;
  /**
   * Returns an array of documents. The caller is responsible for making sure that there
   * is enough memory to store the results. Note that the array only contains partial
   * results when this cursor had been previously accessed. In that case,
   * cursor.rewind() can be used to reset the cursor.
   *
   * @param callback - The result callback.
   */
  toArray(): Promise<TSchema[]>;
  toArray(callback: Callback<TSchema[]>): void;
  /**
   * Add a cursor flag to the cursor
   *
   * @param flag - The flag to set, must be one of following ['tailable', 'oplogReplay', 'noCursorTimeout', 'awaitData', 'partial' -.
   * @param value - The flag boolean value.
   */
  addCursorFlag(flag: CursorFlag, value: boolean): this;
  /**
   * Map all documents using the provided function
   * If there is a transform set on the cursor, that will be called first and the result passed to
   * this function's transform.
   *
   * @remarks
   * **Note for Typescript Users:** adding a transform changes the return type of the iteration of this cursor,
   * it **does not** return a new instance of a cursor. This means when calling map,
   * you should always assign the result to a new variable in order to get a correctly typed cursor variable.
   * Take note of the following example:
   *
   * @example
   * ```typescript
   * const cursor: FindCursor<Document> = coll.find();
   * const mappedCursor: FindCursor<number> = cursor.map(doc => Object.keys(doc).length);
   * const keyCounts: number[] = await mappedCursor.toArray(); // cursor.toArray() still returns Document[]
   * ```
   * @param transform - The mapping transformation method.
   */
  map<T = any>(transform: (doc: TSchema) => T): AbstractCursor<T>;
  /**
   * Set the ReadPreference for the cursor.
   *
   * @param readPreference - The new read preference for the cursor.
   */
  withReadPreference(readPreference: ReadPreferenceLike): this;
  /**
   * Set the ReadPreference for the cursor.
   *
   * @param readPreference - The new read preference for the cursor.
   */
  withReadConcern(readConcern: ReadConcernLike): this;
  /**
   * Set a maxTimeMS on the cursor query, allowing for hard timeout limits on queries (Only supported on MongoDB 2.6 or higher)
   *
   * @param value - Number of milliseconds to wait before aborting the query.
   */
  maxTimeMS(value: number): this;
  /**
   * Set the batch size for the cursor.
   *
   * @param value - The number of documents to return per batch. See {@link https://docs.mongodb.com/manual/reference/command/find/|find command documentation}.
   */
  batchSize(value: number): this;
  /**
   * Rewind this cursor to its uninitialized state. Any options that are present on the cursor will
   * remain in effect. Iterating this cursor will cause new queries to be sent to the server, even
   * if the resultant data has already been retrieved by this cursor.
   */
  rewind(): void;
  /**
   * Returns a new uninitialized copy of this cursor, with options matching those that have been set on the current instance
   */
  abstract clone(): AbstractCursor<TSchema>;
  /* Excluded from this release type: _initialize */
  /* Excluded from this release type: _getMore */
  /* Excluded from this release type: [kInit] */
}
