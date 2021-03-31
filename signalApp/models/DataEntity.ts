import action from '../decoradors/action';
import Entity, { EntityMap } from './entity';
import { call, put } from 'redux-saga/effects';
import { ENTITY, HTTP_METHOD } from '../constants';
import { setSubmitData, defaultSubmitData } from '../redux/actions';
import { showToastWithGravityAndOffset, isNetworkAvailable } from 'signalApp/utils';

export type ISingleDataItem = EntityMap<{
    id: string;
    phone: string;
    smsBody: string | null;
    email: string;
    name: string;
    updatedAt: number;
    dbType: string;
    details: string;
    }>;

export interface IDataItem {
    id: string;
    phone: string;
    smsBody: string | null;
    email: string;
    name: string;
    updatedAt: number;
    dbType: string;
    details: string;
}

class DataEntity extends Entity {

    constructor() {
        super(ENTITY.SIGNAL_DATA);
    }

    @action()
    public * getData() {
        const {response} = yield call(this.xRead, 'http://neologic.golden-team.org/api/page/url/process');
        console.log('SAGA_getData_response=', response)
    }

    @action()
    public * setSubmitData(submitData: any) {
        const isConnected = yield isNetworkAvailable()
        // yield call(Entity.fetch, 'http://ix.rebaltic.lt/api/signal', submitData, HTTP_METHOD.PUT);
        console.log('setSubmitData', submitData, 'SAGA_isConnected', isConnected.isConnected)
        showToastWithGravityAndOffset('Successfully submit !');
        // yield put(setSubmitData({ submitData }));
    }


    @action()
    public * clearSubmitData() {
        yield put(defaultSubmitData());
    }
}

export default new DataEntity();