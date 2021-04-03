import action from '../decoradors/action';
import Entity, { EntityMap } from './entity';
import { call, put } from 'redux-saga/effects';
import { ENTITY, HTTP_METHOD } from '../constants';
import { setSubmitData, defaultSubmitData } from '../redux/actions';
import { showToastWithGravityAndOffset, isNetworkAvailable } from 'signalApp/utils';

export type ISingleDataItem = EntityMap<{
    id?: string;
    phone?: string;
    smsBody?: string | null;
    email?: string;
    name?: string;
    updatedAt?: number;
    dbType?: string;
    details?: string;
    needToDialog?: boolean;
    needToSendEmail?: boolean;
    needToSendSMS?: boolean;
    searchType?: string;
    asanaDataType?: boolean;
    teamDataType?: boolean;
    allBrokersDataType?: boolean;
    taskName?: string;
    }>;

export interface IDataItem {
    id?: string;
    phone?: string;
    smsBody?: string | null;
    email?: string;
    name?: string;
    updatedAt?: number;
    dbType?: string;
    details?: string;
    needToDialog?: boolean;
    needToSendEmail?: boolean;
    needToSendSMS?: boolean;
    searchType?: string;
    asanaDataType?: boolean;
    teamDataType?: boolean;
    allBrokersDataType?: boolean;
    taskName?: string;
}

class DataEntity extends Entity {

    constructor() {
        super(ENTITY.SIGNAL_DATA);
    }

    @action()
    public * getData(data: any) {
        yield call(this.xRead, 'http://ix.rebaltic.lt/api/signal', data, HTTP_METHOD.POST);
        showToastWithGravityAndOffset('Successfully getData !');
    }

    @action()
    public * setSubmitData(submitData: any) {
        const isConnected = yield isNetworkAvailable()
        yield call(this.xSave, 'http://ix.rebaltic.lt/api/signal', submitData, HTTP_METHOD.PUT);
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