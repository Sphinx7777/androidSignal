import { fromJS, List, Map } from 'immutable';
import { combineReducers } from 'redux';

export interface AppState {
    entities: any;
    requestResult: any;
    form: any;
    message: any;
    pagination: any;
    flagger: any;
    identity: any;
    ssrData: any;
}


import {
    IMethod,
    SET_FLAGGER,
    TOAST_MESSAGE,
    RESET_MESSAGE,
    RESET_ALL_MESSAGE,
    CLEAR_REQUEST_RESULT,
    GET_IDENTITY,
    SET_DEFAULT_IDENTITY,
    SET_SUBMIT_DATA,
    UPDATE_SUBMIT_DATA,
    SET_SMS_FALSE,
    SET_RESPONSE_DIALOG,
    SET_DEFAULT_SUBMIT_DATA
} from './actions';
import { IMessageBlock } from '../constants';


const initialEntities = fromJS({

});

// Updates an entity cache in response to any action with response.entities.
function entities(state = initialEntities, action: any) {
    if ('glob' in action) {
        const { glob: { crud, entity } } = action;
        switch (crud) {
        case IMethod.DELETE:
            {
                let list = state.get(entity.entityName);
                if (list) {
                    list = list.remove(action.data.id);
                    state = state.set(entity.entityName, list);
                }
            }
            break;
        case IMethod.CLEAR:
            if (entity && state.has(entity.entityName)) {
                state = state.set(entity.entityName, fromJS({}));
            }
            break;
        default:
        case IMethod.UPDATE:
            if (action.response && action.response.entities) {
                // tslint:disable-next-line: no-shadowed-variable
                const { response: { entities } } = action;
                if (entities) {
                    Object.keys(entities).map((entityName) => {
                        let list = state.get(entityName);
                        if (list && list.size > 0) {
                            Object.keys(entities[entityName]).map((id) => list = list.remove(id));
                        }
                        state = state.set(entityName, list);
                    });
                    state = state.mergeDeep(fromJS(entities));
                }
            }
            break;
        }
    }
    if (action['type'] === SET_SMS_FALSE) {
        let list = state?.get('signalData');
        if (list && list.size > 0) {
            list = list.map(one => {
                if (one.get('id') === action.id) {
                    one = one.set('needToSendSMS', false)
                }
                return one
            })
        }
        state = state.set('signalData', list);
    }
    if (action['type'] === SET_RESPONSE_DIALOG) {
        console.log('SET_RESPONSE_DIALOG===', action)
        let list = state?.get('signalData');
        if (list && list.size > 0) {
            list = list.map(one => {
                if (one.get('id') === action.id) {
                    one = one.setIn(['responseDialog', 'dateTime'], action.responseDialog.dateTime)
                    one = one.setIn(['responseDialog', 'duration'], action.responseDialog.duration)
                }
                return one
            })
        }
        state = state.set('signalData', list);
    }
    return state;
}

const initialRequestResult = fromJS({
});

function requestResult(state = initialRequestResult, action: any) {
    if ('glob' in action) {
        // tslint:disable-next-line: no-shadowed-variable
        const { glob: { method, crud, entity } } = action;
        if (action.response && action.response.result) {
            const { response: { result } } = action;
            state = state.setIn([entity.entityName, crud], fromJS(result));
        }
    }
    const { type, entity } = action;
    if (type === CLEAR_REQUEST_RESULT) {
        if (state.has(entity)) {
            state = state.set(entity, fromJS({}));
        }
    }
    return state;
}

const initialMessage: IMessageBlock[] = [];

function message(state = initialMessage, action: any) {
    const { type } = action;
    if (type === RESET_MESSAGE) {
        state.splice(0, 1);
        return [...state];
    } else if (type === TOAST_MESSAGE) {
        return [...state, {
            text: action.text,
            code: action.code,
            msgType: action.msgType
        }];
    } else if (type === RESET_ALL_MESSAGE) {
        return [];
    }
    return state;
}

const initialFlagger = {
};

function flagger(state = initialFlagger, action: any) {
    const { type } = action;
    if (type === SET_FLAGGER) {
        return {
            ...state,
            [action.key]: action.value,
        };
    }
    return state;
}

export type StateIdentity = {
    user: any;
    roles: any;
    rules: any;
};

const initialIdentity: StateIdentity = {
    user: null,
    roles: null,
    rules: null
};

function identity(state: StateIdentity = initialIdentity, action: any) {
    switch (action.type) {
    case GET_IDENTITY:
            return {
                user: action.identity.user,
                roles: action.identity.roles,
                rules: action.identity.rules,
            };
            case SET_DEFAULT_IDENTITY:
            return { ...initialIdentity};
    }
    return state;
}

export type ISubmitData = {
    data: any[];
};

const initialSubmitData: ISubmitData = {
    data: []
};

function submitData(state: ISubmitData = initialSubmitData, action: any) {
    switch (action.type) {
    case SET_SUBMIT_DATA:
        const update = state.data.find(o => o.id === action.submitData.id);
        let data = [];
        data = !update ? [...state.data, action.submitData]
        : [...state.data.map(o => {
            if (o.id === action.submitData.id) {
                o = {...o, ...action.submitData}
            }
            return o
        })];
        return {
                ...state,
                data
            };
    case SET_DEFAULT_SUBMIT_DATA:
    return { ...initialSubmitData };
    case UPDATE_SUBMIT_DATA:
        state = {...state, data: state.data.filter(o => o.id !== action.id) }
        break;
    }
    return state;
}

const appReducer = combineReducers({
    entities,
    requestResult,
    submitData,
    message,
    flagger,
    identity
});

function rootReducer(state: any, action: any) {
    const intermediateState = appReducer(state, action);
    return intermediateState;
}

export default rootReducer;
