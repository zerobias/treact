declare module 'redux-act' {
  // Generic stuff
  interface Identity<T> {
    (arg: T): T
  }

  interface Action<P, M> {
    type: string;
    payload: P;
    meta?: M;
  }

  interface Dispatch {
    (action: Action<any, any>): Action<any, any>;
  }

  interface Unsubscribe {
    (): void;
  }

  interface Store<S> {
    getState(): S;
    subscribe(listener: () => void): Unsubscribe;
    replaceReducer(nextReducer: Reducer<S>): void;
    dispatch(action: Action<any, any>): Action<any, any>;
  }

  interface StoreWithDisbatch<S> extends Store<S> {
    disbatch(...actions: Action<any, any>[]): Action<any, any>;
    disbatch(actions: Action<any, any>[]): Action<any, any>;
  }

  type StoreOrDispatch = Store<any> | Dispatch | Store<any>[] | Dispatch[]

  // Action creators
  interface ActionCreator<P, M> {
    (...args: any[]): Action<P, M>;

    toString(): string;
    getType(): string;

    assignTo(arg: StoreOrDispatch): ActionCreator<P, M>;
    bindTo(arg: StoreOrDispatch): ActionCreator<P, M>;

    assigned(): boolean;
    bound(): boolean;
    dispatched(): boolean;

    raw(...args: any[]): Action<P, M>;
  }

  interface SimpleActionCreator<P>  {
    (arg:P): Action<P, void>;

    toString(): string;
    getType(): string;

    assignTo(arg: StoreOrDispatch): ActionCreator<P, void>;
    bindTo(arg: StoreOrDispatch): ActionCreator<P, void>;

    assigned(): boolean;
    bound(): boolean;
    dispatched(): boolean;

    raw(arg:P): Action<P, void>;
  }

  // Reducers
  type Handler<S, P, M> = (state: S, payload: P, meta?: M) => S
  type ActionCreatorOrString<P, M> = ActionCreator<P, M> | string

  export function createAction<P, M>(): ActionCreator<P, M> & string;
  export function createAction<P, M>(description: string, payloadReducer?: (...args: any[]) => P): ActionCreator<P, M> & string;

  export function createAction<P>(description: string): SimpleActionCreator<P> & string;

  export function createAction<P, M>(description: string, payloadReducer: (...args: any[]) => P, metaReducer?: (...args: any[]) => M): ActionCreator<P, M>;
  export function createAction<P, M>(payloadReducer: (...args: any[]) => P, metaReducer?: (...args: any[]) => M): ActionCreator<P, M>;

  interface Reducer<S> {
    (state: S, action: Action<any, any>): S

    options(opts: Object): void
    has(actionCreator: ActionCreatorOrString<any, any>): boolean
    on<P, M>(actionCreator: ActionCreatorOrString<P, M>, handler: Handler<S, P, M>): void
    off(actionCreator: ActionCreatorOrString<any, any>): void
  }

  type Handlers<S> = {
    [propertyName: string]: Handler<S, any, any>
  }

  type functionOn<S, P, M> = (actionCreator: ActionCreatorOrString<P, M>, handler: Handler<S, P, M>) => void
  type functionOff = (actionCreator: ActionCreatorOrString<any, any>) => void

  interface OnOff<S> {
    (on: functionOn<S, any, any>, off: functionOff): void;
  }

  export function createReducer<S>(handlers: Handlers<S> | OnOff<S>, defaultState?: S): Reducer<S>;


  // doAll
  interface ActionCreators {
    [propertyName: string]: ActionCreator<any, any>
  }

  export function assignAll(actionCreators: ActionCreators | ActionCreator<any, any>[], stores: StoreOrDispatch): void;
  export function bindAll(actionCreators: ActionCreators | ActionCreator<any, any>[], stores: StoreOrDispatch): void;


  // Batching
  export const batch: ActionCreator<Action<any, any>[],null>

  export function disbatch(store: Store<any>): StoreWithDisbatch<any>;
  export function disbatch(store: Store<any>, ...actions: Action<any, any>[]): void;
  export function disbatch(store: Store<any>, actions: Action<any, any>[]): void;

  // types
  export namespace types {
    export function add(t: string): void;
    export function remove(t: string): void;
    export function has(t: string): boolean;
    export function all(): string[];
    export function clear(): void;
  }
}
