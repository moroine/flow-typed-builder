class Action {}
class RouterState {}
class Store<T> {}
class SyncHistoryWithStoreOptions {}
interface HistoryUnsubscribe {}
class History {}
declare export function routerReducer(state?: RouterState, action?: Action): RouterState;
export function syncHistoryWithStore(history: History, store: Store<any>, options?: SyncHistoryWithStoreOptions): History & HistoryUnsubscribe {
  return history;
}