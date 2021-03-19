import { Action } from 'redux';
import Entity, { CRUD } from '../models/entity';
import { MessageType, IMessageBlock, ENTITY } from '../../src/constants';

export const SEND_MESSAGE       = 'SEND_MESSAGE';
export const TOAST_MESSAGE      = 'TOAST_MESSAGE';
export const RESET_MESSAGE      = 'RESET_MESSAGE';
export const RESET_ALL_MESSAGE      = 'RESET_ALL_MESSAGE';
export const CLEAR_CACHE        = 'CLEAR_CACHE';
export const PAGE_CLEAR        = 'PAGE_CLEAR';
export const PAGE_FETCHING      = 'PAGE_FETCHING';
export const PAGE_SELECT_ITEM    = 'PAGE_SELECT_ITEM';
export const SET_FLAGGER        = 'SET_FLAGGER';
export const CLEAR_REQUEST_RESULT = 'CLEAR_REQUEST_RESULT';
export const MODEL_CLEAR = 'MODEL_CLEAR';
export const PAGE_SET_FILTER = 'PAGE_SET_FILTER';
export const GET_IDENTITY = 'GET_IDENTITY';
export const SET_DEFAULT_IDENTITY = 'SET_DEFAULT_IDENTITY';
export const CLEAR_IDENTITY = 'CLEAR_IDENTITY';
export const SET_SSR_DATA = 'QUERY_DATA';
export const CLEAR_SSR_DATA = 'CLEAR_QUERY';


export enum IMethod {
    READ = 'READ',
    CREATE = 'CREATE',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
    CLEAR = 'CLEAR',
}

export enum IResult {
    REQUEST = 'REQUEST',
    SUCCESS = 'SUCCESS',
    FAILURE = 'FAILURE',
}

export interface IActionRequest {
    request: (data: any) => Action;
    success: (data: any, response: any) => Action;
    failure: (data: any, error: any) => Action;
}

export interface IEntityRequest {
    CREATE: IActionRequest;
    READ: IActionRequest;
    UPDATE: IActionRequest;
    DELETE: IActionRequest;
}


export function action(type: string, payload = {}): Action {
    return {type, ...payload};
}

export function entityRequest(entity: Entity) {
    const result: any = {};
    return [CRUD.CREATE, CRUD.READ, CRUD.UPDATE, CRUD.DELETE].reduce((acc: IEntityRequest, crud: CRUD) => {
        const pref = `${entity.entityName.toUpperCase()}_${crud}`;
        const glob = { entity, crud };
        const act: IActionRequest = {
            request: (data) => action(`${pref}_REQUEST`, { glob, data }),
            success: (data, response) => action(`${pref}_SUCCESS`, { glob, data, response }),
            failure: (data, error) => action(`${pref}_FAILURE`, { glob, data, error }),
        };
        // @ts-ignore
        acc[crud] = act;
        return acc;
    }, result);
}

export const sendMessage = (data: IMessageBlock) => action(SEND_MESSAGE, data);
export const resetMessage = () => action(RESET_MESSAGE, {});
export const resetAllMessage = () => action(RESET_ALL_MESSAGE, {});
export const toastMessage = (text: string, msgType: MessageType) => action(TOAST_MESSAGE, { text, msgType });

export const setSSRData = (data: any = null) => action(SET_SSR_DATA, data);
export const clearSSRData = (name: string) => action(CLEAR_SSR_DATA, { name });
export const getIdentity = (data: any) => action(GET_IDENTITY, data);
export const logoutUserAction = () => action(SET_DEFAULT_IDENTITY, {});
export const clearIdentity = () => action(CLEAR_IDENTITY, {});

export const pageClear = (pageName: string) => action(PAGE_CLEAR, { pageName });
export const pageFetching = (pageName: string, page: number, isFetching: boolean, force = false) => 
    action(PAGE_FETCHING, { pageName, page, isFetching, force });
export const pageSelectItem = (pageName: string, id: string) => action(PAGE_SELECT_ITEM, { pageName, id });

export const setFlagger = (key: string, value: any) => action(SET_FLAGGER, {key, value});
export const clearRequestResult = (entity: ENTITY) => action(CLEAR_REQUEST_RESULT, { entity });

export const pageSetFilter =
    (pageName: string, filter: any, sort: any) => action(PAGE_SET_FILTER, { pageName, filter, sort });