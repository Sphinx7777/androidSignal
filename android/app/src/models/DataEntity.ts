import action from '../decoradors/action';
import Entity, { EntityMap } from './entity';
import { call, cancelled } from 'redux-saga/effects';
import { ENTITY } from '../constants';

export type ISingleDataItem = EntityMap<{
    id: string;
    phone: string;
    email: string;
    name: string;
    date: string;
    dbType: string;
    details: string;
    }>;

    export interface IDataItem {
    id: string;
    phone: string;
    email: string;
    name: string;
    date: string;
    dbType: string;
    details: string;
}

class DataEntity extends Entity {

    constructor() {
        super(ENTITY.SIGNAL_DATA);
    }

    @action()
    public * getData() {
        const response = yield call(this.xRead, 'http://neologic.golden-team.org/api/page/url/process');
    }
}

export default new DataEntity();