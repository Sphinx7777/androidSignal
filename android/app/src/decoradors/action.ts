import Entity from '../../src/models/entity';
import * as actions from '../../src/redux/actions';

/*
 * Decoractor for saga functions (watchers) to link them with redux and actions that users sends from components.
 * @param actionName name of action that a component sends to redux
 */
const action = () => {
    return (target: any, propertyKey: string) => {
        const entityName = target.constructor.name;
        const entityItem = entityName in Entity.mActions ? Entity.mActions[entityName] : {};
        if (!(propertyKey in entityItem)) {
            entityItem[propertyKey] = {
                watcher: propertyKey,
                actionFunc: (data) => actions.action(propertyKey, data),
                isAdded: false,
            };
        }
        Entity.mActions[entityName] = entityItem;
    };
};

export default action;
