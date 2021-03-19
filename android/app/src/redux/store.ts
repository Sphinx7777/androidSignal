import { all } from 'redux-saga/effects';
import {createStore, applyMiddleware, compose, Store} from 'redux';
import createSagaMiddleware, {Task} from 'redux-saga';
import rootReducer from './reducers';
import Entity from '../../src/models/entity';
import { persistStore, persistReducer } from 'redux-persist'
import AsyncStorage from '@react-native-community/async-storage';

const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
    whitelist: ['identity'],
}
declare global {
    interface Window {
        __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
    }
}
export interface SagaStore extends Store {
    sagaTask?: Task;
    runSaga: () => void;
}

const rootSaga = function* root() {
    yield all(Entity.saga);
};

export const makeStore = () => {
    const sagaMiddleware = createSagaMiddleware();
    // @ts-ignore
    const composeEnhancers = typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
    // @ts-ignore
        window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({}) :
        compose;

    const enhancer = composeEnhancers(
        applyMiddleware(sagaMiddleware)
    );
    const persistedReducer = persistReducer(persistConfig, rootReducer)
    const store = createStore(persistedReducer, enhancer) as SagaStore
    store.sagaTask = sagaMiddleware.run(rootSaga);
    Entity.store = store;
    store.runSaga = () => sagaMiddleware.run(rootSaga);
    const persistor = persistStore(store)

    return {store, persistor};
};

export default makeStore;