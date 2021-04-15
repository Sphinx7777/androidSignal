import action from '../decoradors/action';
import Entity, { CRUD, EntityMap } from './entity';
import { call, put } from 'redux-saga/effects';
import { ENTITY, HTTP_METHOD } from '../constants';
import { setSubmitData, defaultSubmitData } from '../redux/actions';
import { showToastWithGravityAndOffset, isNetworkAvailable } from 'signalApp/utils';
import { ICallLog } from 'signalApp/components/Signal';

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
    taskDescription?: string;
    currentYearComment?: string;
    teamDate?: number;
    taskCreated?: number;
    allBrokersBaseDate?: number;
    responseDialog?: EntityMap<ICallLog>;
    dueDate?: string;
    taskCompleted?: boolean;
    currentComments?: string;
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
    taskDescription?: string;
    currentYearComment?: string;
    teamDate?: number;
    taskCreated?: number;
    allBrokersBaseDate?: number;
    responseDialog?: ICallLog;
    dueDate?: string;
    taskCompleted?: boolean;
    currentComments?: string;
}

class DataEntity extends Entity {

    constructor() {
        super(ENTITY.SIGNAL_DATA);
    }

    @action()
    public * getData(data: any) {
        const isConnected = yield isNetworkAvailable()
        if (isConnected.isConnected) {
            const { response } = yield call(this.xRead, 'http://ix.rebaltic.lt/api/signal', data, HTTP_METHOD.POST);
            showToastWithGravityAndOffset(`${response?.pager?.count > 0 ? 'Successfully get data !' : 'No data for the Signal APP'}`);
        } else {
            showToastWithGravityAndOffset('No internet connect !!!');
        }
    }

    @action()
    public * setSubmitData(submitData: any) {
        const isConnected = yield isNetworkAvailable()
        const crud: CRUD = submitData.crud === CRUD.DELETE ? CRUD.DELETE : CRUD.UPDATE
        if (isConnected.isConnected) {
            yield call(this.xSave, 'http://ix.rebaltic.lt/api/signal', crud, submitData, HTTP_METHOD.PUT);
            showToastWithGravityAndOffset('Successfully submit !');
        } else {
            showToastWithGravityAndOffset('No internet connect !!!');
        }
        console.log('setSubmitData', submitData)
        // yield put(setSubmitData({ submitData }));
    }


    @action()
    public * clearSubmitData() {
        yield put(defaultSubmitData());
    }
}

export default new DataEntity();