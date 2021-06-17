import action from '../decoradors/action';
import Entity, { CRUD, EntityMap } from './entity';
import { call, put } from 'redux-saga/effects';
import { ENTITY, HTTP_METHOD, INewRowValues } from '../constants';
import { setSubmitData, defaultSubmitData, IMethod } from '../redux/actions';
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
    dueDate?: number;
    taskCompleted?: boolean;
    currentComments?: string;
    reference?: string;
    pastYearsComment?: string;
    price?: string;
    calledAbout?: string;
    group?: string;
    language?: string;
    source?: string;
    segment?: string;
    highNetWorth?: string;
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
    dueDate?: number;
    taskCompleted?: boolean;
    currentComments?: string;
    reference?: string;
    pastYearsComment?: string;
    price?: string;
    calledAbout?: string;
    group?: string;
    language?: string;
    source?: string;
    segment?: string;
    highNetWorth?: string;
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
    public * reloadData(data: any) {
        const isConnected = yield isNetworkAvailable()
        if (isConnected.isConnected) {
            const glob = { entity: this,  crud: IMethod.CLEAR }
            yield put({type: ENTITY.SIGNAL_DATA, glob});
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
            const { response } = yield call(this.xSave, 'http://ix.rebaltic.lt/api/signal', crud, submitData, HTTP_METHOD.PUT);
            console.log('setSubmitData===', response.entities.signalData)
            if (!submitData.smsSend) {
                showToastWithGravityAndOffset('Successfully submit !');
            }
        } else {
            showToastWithGravityAndOffset('No internet connect !!!');
        }
        // yield put(setSubmitData({ submitData }));
    }

    @action()
    public * addToDBXSheet(submitData: {values: INewRowValues}) {
        const isConnected = yield isNetworkAvailable()
        console.log('addToDBXSheet', submitData)
        // if (isConnected.isConnected) {
        //     const { response } = yield call(this.xSave, 'http://ix.rebaltic.lt/api/signal/create-row', CRUD.UPDATE, submitData, HTTP_METHOD.PUT);
        //     console.log('addToDBXSheet===', response.entities.signalData)
        //     showToastWithGravityAndOffset('Successfully submit !');
        // } else {
        //     showToastWithGravityAndOffset('No internet connect !!!');
        // }
    }

    @action()
    public * clearSubmitData() {
        yield put(defaultSubmitData());
    }
}

export default new DataEntity();