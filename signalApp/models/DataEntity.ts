import action from '../decoradors/action';
import Entity, { EntityMap } from './entity';
import { call, put } from 'redux-saga/effects';
import { ENTITY } from '../constants';
import { setSubmitData, defaultSubmitData } from '../redux/actions';
import { showToastWithGravityAndOffset } from 'signalApp/utils';

export type ISingleDataItem = EntityMap<{
    id: string;
    phone: string;
    smsBody: string | null;
    email: string;
    name: string;
    date: number;
    dbType: string;
    details: string;
    }>;

export interface IDataItem {
    id: string;
    phone: string;
    smsBody: string | null;
    email: string;
    name: string;
    date: number;
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

    @action()
    public * setSubmitData(submitData: any) {
        console.log('setSubmitData', submitData)
        showToastWithGravityAndOffset('Successfully submit !');
        // yield put(setSubmitData({ submitData }));
    }

    @action()
    public * clearSubmitData() {
        yield put(defaultSubmitData());
    }
}

export default new DataEntity();