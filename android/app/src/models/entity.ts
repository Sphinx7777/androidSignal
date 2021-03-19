import { camelizeKeys } from 'humps';
import { IIdentity } from '../../src/acl/types';
import { Store, AnyAction } from 'redux';
import { fromJS, Map, List } from 'immutable';
import fetch from 'cross-fetch';
import { normalize, Schema, schema } from 'normalizr';
import { select, put, call, fork } from 'redux-saga/effects';

import { action , pageFetching, sendMessage, entityRequest, IMethod, MODEL_CLEAR, clearSSRData, IActionRequest, pageSetFilter } from '../../src/redux/actions';
import { MessageType, HTTP_METHOD, IPagerParams, ResCode, IMessageBlock } from '../../src/constants';
import { isEmpty } from '../../src/utils';

const dataTest: any = [
    {
        id: '1',
        phone: '0663952488',
        email: 'spamoglot1111@gmail.com',
        name: 'Sergei111',
        date: '20-01-01',
        dbType: 'asana',
        details: 'details 111111111'
    },
    {
        id: '2',
        phone: '22222222',
        email: 'spamoglot222@gmail.com',
        name: 'Sergei222',
        date: '20-02-02',
        dbType: 'DBX',
        details: 'details 2222222222'
    },
    {
        id: '3',
        phone: '33333333',
        email: 'spamoglot333@gmail.com',
        name: 'Sergei333',
        date: '20-03-03',
        dbType: 'C',
        details: 'details 3333333333333'
    }
    ,
    {
        id: '4',
        phone: '44444444',
        email: 'spamoglot444@gmail.com',
        name: 'Sergei444',
        date: '20-04-04',
        dbType: 'asana',
        details: 'details 4444444444444'
    },
    {
        id: '5',
        phone: '55555555',
        email: 'spamoglot555@gmail.com',
        name: 'Sergei555',
        date: '20-05-05',
        dbType: 'DBX',
        details: 'details 5555555555'
    },
    {
        id: '6',
        phone: '66666666',
        email: 'spamoglot666@gmail.com',
        name: 'Sergei666',
        date: '20-06-06',
        dbType: 'C',
        details: 'details 666666666666666'
    }
]

export enum CRUD {
    CREATE = 'CREATE',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
    READ = 'READ'
}

export interface IFetchOptions {
    method: string;
    cashed?: boolean;
    crud?: CRUD;
}
export interface ISagaItem {
    [entity: string]: {
        [action: string]: {
            actionFunc: (data: any) => any;
            watcher: string;
            isAdded: boolean;
        },
    };
}

export interface IModelAction {
    [key: string]: (data?: any) => AnyAction;
}

export interface EntityMap<T> extends Map<string, any> {
    get<K extends keyof T>(name: K): T[K];
}
export interface EntityList<T> extends List<any> {
    get<K extends keyof T>(name: K): T[K];
}

export default class Entity {
    protected mEntityName: string;
    protected mSchema: Schema;

    private static mStore: Store;
    public static mSagas: any[] = [];
    private static mUser: any = null;
    private static mContext: any;
    public static mActions: ISagaItem = {};
    /**
     * addSaga
     */
    public static addSaga(...args: any[]) {
        // log('addSaga()', args);
        args.forEach((item) => {
            if (item instanceof Function) {
                Entity.mSagas.push(fork(item));
            }
        });
    }

    public get schema() {
        return this.mSchema ? this.mSchema : null;
    }

    public static get saga() { return Entity.mSagas; }
    public get entityName() {return this.mEntityName; }
    public static get store() { return Entity.mStore; }
    public static set store(store: Store) { Entity.mStore = store; }
    public static get user() { return Entity.mUser; }
    public static set user(user: IIdentity) { Entity.mUser = user; }
    public static get context() { return Entity.mContext; }
    public static set context(value: any) { Entity.mContext = value; }

    constructor(name = 'entity', definitions: any = {}, options: any = {}) {
        this.mEntityName = name;
        // @ts-ignore
        this.mSchema = name !== 'entity' ? [ new schema.Entity(name, definitions, options) ] : null;
        this.getAction = this.getAction.bind(this);
        this.xFetch = this.xFetch.bind(this);
        this.pageEntity =  this.pageEntity.bind(this);
        this.clear =  this.clear.bind(this);
    }

    public get actions(): IModelAction {
        const result: IModelAction = {};
        const entityName = this.constructor.name;
        if (entityName in Entity.mActions) {
            const actions = Object.keys(Entity.mActions[entityName]);
            actions.forEach((item) => {
                // const func =
                //     'const func = (type, payload = {}) => ({type, ...payload}); ' +
                //     'return func("' + item + '", data); ';
                // result[item] = new Function('data', func);
                result[item] = Entity.mActions[entityName][item].actionFunc;
            });
        }
        return result;
    }

    protected xFetch(endpoint: string,  method: HTTP_METHOD, data = {}, token?: string) {
        // let fullUrl = BASE_URL + '/api' + endpoint;
        let fullUrl = endpoint;

        const params: any = {
            method,
            credentials: 'include',
            headers: {
                Authorization: 'bearer ' + token, // get token from cookies
            },
        };

        if (method !== 'GET') {
            params['headers']['content-type'] = 'application/json';
            params['body'] = JSON.stringify(data);
        } else {
            const opts = Object.entries(data).map(([key, val]) => key + '=' + val).join('&');
            fullUrl += (opts.length > 0?'?' + opts:'');
        }

        return fetch(fullUrl, params).then((response) => {
            return response.json().then((json) => ({ json, response }));
        },
        ).then(({ json, response }) =>
            Promise.resolve({
                success: response.ok ? true : false,
                response: json
            })
        );
    }

    public static fetch(uri: string, data?: any, method?: HTTP_METHOD) {
        return new Entity().fetch(uri, data, method);
    }

    public async fetch(uri: string, data?: any, method: HTTP_METHOD = HTTP_METHOD.POST) {
        const dispatch = Entity && Entity.store && Entity.store.dispatch;

        const action = this.getAction(CRUD.READ);
        dispatch(action.request(data));

        const identity = Entity.store.getState().identity;
        const token = identity && identity.user && identity.user.token;
        const query = await this.xFetch(uri, method, data, token);
        const success =  query.success;
        let message = {} as IMessageBlock;
        if (query.response.message && !isEmpty(query.response.message)) {
            const msgType =  success ? MessageType.INFO : MessageType.ERROR;
            message = { text: query.response.message, code: query.response.code, msgType };
            dispatch(sendMessage(message));
        }

        let response = {} as any;
        if (success && this.mSchema) {
            const queryResponse = query.response;
            response = normalize(camelizeKeys(JSON.parse(JSON.stringify(queryResponse.data))), this.mSchema);
            response['pager'] = ('pager' in queryResponse) ? queryResponse.pager : null;
        } else {
            response = query.response.data;
        }
        if (success) {
            dispatch(action.success(data, response));
        } else {
            dispatch(action.failure(data, response));
        }

        return { response, message };
    }

    protected * actionRequest(uri: string, crud: CRUD, method: HTTP_METHOD, data?: any) {
        const action = this.getAction(crud);
        yield put(action.request(data));
        let success = true;
        let message = {} as IMessageBlock;
        let pager = null;
        const token = yield select((state: any) => state.identity && state.identity.user && state.identity.user.token || null);
        // get data from SSR container
        let query = yield select((state: any) => state.ssrData && state.ssrData[this.entityName]);
        if (query && query.items) {
            pager = {
                page: query.page,
                count: query.count
            };
            query = query.items;
        }
        yield put(clearSSRData(this.entityName));

        // ignoring fetch request on the server (SSR mode)
        const isServer = typeof window === 'undefined';
        if (!isServer) {
            const result = yield call(this.xFetch, uri, method, data, token);
            success = result.success;
            if (result.response.message && !isEmpty(result.response.message)) {
                const msgType =  success ? MessageType.INFO : MessageType.ERROR;
                message = { text: result.response.message, code: result.response.code, msgType };
                yield put(sendMessage(message));
            }
            if (result.response.pager) {
                pager = result.response.pager;
            }
            query = result.response.data;
        }

        let response = {} as any;
        if (success && this.mSchema && query) {
            response = normalize(camelizeKeys(JSON.parse(JSON.stringify(dataTest))), this.mSchema);
            response['pager'] = pager ? pager : null;
        } else if (query ) {
            response = query.data;
        }
        if (success) {
            yield put(action.success(data, response));
        } else {
            yield put(action.failure(data, response));
        }

        return { response, message };
    }

    public clear() {
        const glob = { entity: this,  crud: IMethod.CLEAR };
        return action(MODEL_CLEAR, { glob });
    }

    public static clear() {
        return action(MODEL_CLEAR, {});
    }


    private getAction(crud: any = null): IActionRequest {
        let action: IActionRequest = entityRequest(this)[CRUD.READ];
        switch (crud) {
        case CRUD.CREATE:
            action = entityRequest(this)[CRUD.CREATE];
            break;
        case CRUD.UPDATE:
            action = entityRequest(this)[CRUD.UPDATE];
            break;
        case CRUD.DELETE:
            action = entityRequest(this)[CRUD.DELETE];
            break;
        default:
        case CRUD.READ:
            break;
        }
        return action;
    }

    public xSave = (uri: string, data: any = {}) => {
        return this.actionRequest(uri, CRUD.UPDATE, HTTP_METHOD.POST, data);
    }

    public xRead = (uri: string, data: any = {}, method: HTTP_METHOD = HTTP_METHOD.GET) => {
        return this.actionRequest(uri, CRUD.READ, method, data);
    }

    public xDelete = (uri: string, data: any = {}) => {
        return this.actionRequest(uri, CRUD.DELETE, HTTP_METHOD.DELETE, data);
    }

    /**
     * Override this method in case you need to have custom margin of entity with Redux store
     *
     * @param state state of redux before reducing
     * @param entities entities from the server
     */
    public merge(state: Map<string, any>, entities: any): Map<string, any> {
        return state.mergeDeep(entities);
    }

    public * pageEntity(uri: string, params: IPagerParams) {
        const pageName: any  = params.pageName;
        const pagination = yield select((state: any) => state['pagination']);

        if (!('page' in params)) {
            params['page'] = pagination.getIn([pageName, 'currentPage']);
        }

        // send event about starting page fetching
        // @ts-ignore
        yield put(pageFetching(pageName, params.page, true, params.force));
        // check if this page already fetched
        if (!pagination.hasIn([pageName, 'pages', params.page]) || params.force) {
            let count = 0;
            if (!params.force && pagination.hasIn([pageName, 'count'])) {
                count = pagination.get(pageName).get('count');
            }
            // set filter to paginator, in case fetch from getInitProps()
            const pFilter = params.filter ? params.filter : {};
            const pSort = params.sort? params.sort : {};
            yield put(pageSetFilter(pageName, pFilter, pSort));

            yield call(this.xRead, uri, {
                ...params,
                pageName,
                count,
            }, HTTP_METHOD.POST);
        }
        // send event about ending page fetching
        // @ts-ignore
        yield put(pageFetching(pageName, params.page, false));
    }
}

export const watchers = Entity.saga;
