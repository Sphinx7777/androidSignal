import Entity from '../../src/models/entity';
import { take, fork } from 'redux-saga/effects';
// @ts-ignore
const saga = (entity: Entity = null, actions: string[] = []) => (constructor: Function = null) => {
    if (entity) {
        const entityName = entity.constructor.name;
        actions.forEach((actionName) => {
            if (entityName in Entity.mActions) {
                const acts = Entity.mActions[entityName];
                if (actionName in acts) {
                    const act = Entity.mActions[entityName][actionName];
                    if (!act.isAdded) {
                        // console.log('Add: ' + entityName + '.' + actionName + '()');
                        // @ts-ignore
                        const watcherFunc = entity[act.watcher].bind(entity);
                        let func = function*() {
                            while (true) {
                                // console.log('Start: ' + entityName + '.' + actionName + '()');
                                const data = yield take(actionName);
                                delete data['type'];
                                // console.log('Call: ' + entityName + '.' + actionName + '()');
                                yield fork(watcherFunc, data);
                            }
                        };
                        // set name to above function. use for debug goals
                        func = (new Function(
                            'return function (call) { return function ' + entityName + '_' + actionName +
                            ' () { return call(this, arguments) }; };')())(Function.apply.bind(func));
                        Entity.mSagas.push(fork(func));
                        act.isAdded = true;
                    }
                }
            } else {
                throw new Error(`Action [${actionName}] does not belong to the entity`);
            }
        });
    } else {
        Entity.mSagas = [];
    }
};
export default saga;