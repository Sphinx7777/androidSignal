import action from '../decoradors/action';
import Entity, { CRUD, EntityMap } from './entity';
import { call, put } from 'redux-saga/effects';
import { ENTITY, HTTP_METHOD, INewRowValues } from '../constants';
import { setSubmitData, defaultSubmitData, IMethod, setFlagger, setSendSmsFalse, updateSubmitData, setResponseDialog } from '../redux/actions';
import { showToastWithGravityAndOffset, isNetworkAvailable, isEmpty } from 'signalApp/utils';
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
        .catch(err => {
            console.log('setSubmitData_internet_error', err)
            return null
        })
        // const isConnected = null
        if (isConnected && isConnected.isConnected) {
            const { response } = yield call(this.xRead, 'http://ix.rebaltic.lt/api/signal', data, HTTP_METHOD.POST);
            showToastWithGravityAndOffset(`${response?.pager?.count > 0 ? 'Successfully get data !' : 'No data for the Signal APP'}`);
        } else {
            showToastWithGravityAndOffset('No internet connect !!!');
        }
    }

    @action()
    public * reloadData(data: any) {
        const isConnected = yield isNetworkAvailable()
        .catch(err => {
            console.log('setSubmitData_internet_error', err)
            return null
        })
        // const isConnected = null
        if (isConnected && isConnected.isConnected) {
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
        console.log('SAGA____setSubmitData=====', submitData)
        const isConnected = yield isNetworkAvailable()
        .catch(err => {
            console.log('setSubmitData_internet_error', err)
            return null
        })
        // const isConnected = null
        const crud: CRUD = submitData.crud === CRUD.DELETE ? CRUD.DELETE : CRUD.UPDATE
        if (isConnected && isConnected.isConnected) {
            const { response } = yield call(this.xSave, 'http://ix.rebaltic.lt/api/signal', crud, submitData, HTTP_METHOD.PUT);
            const success = response && response.entities && response.entities.signalData && !isEmpty(response.entities.signalData[submitData.id])
            // const success = null
            if (!success) {
                submitData['mobileErrorType'] = 'bad_request'
                yield put(setSubmitData({ submitData }));
                if (submitData.smsSend) {
                    yield put(setSendSmsFalse({ id: submitData.id }));
                }
                if (submitData.responseDialog) {
                    yield put(setResponseDialog({ id: submitData.id, responseDialog: submitData.responseDialog}));
                }
            }
            if (success) {
                yield put(updateSubmitData(submitData.id));
                if (!submitData.smsSend && !submitData.hasOwnProperty('mobileUpdate') && !submitData.hasOwnProperty('needToSendSMS')) {
                    showToastWithGravityAndOffset('Successfully submit !');
                }
            }
        } else {
            showToastWithGravityAndOffset('NO INTERNET CONNECTION !!!');
            submitData['mobileErrorType'] = 'no_internet_connect'
            yield put(setSubmitData({ submitData }));
            if (submitData.smsSend) {
                yield put(setSendSmsFalse({ id: submitData.id }));
            }
            if (submitData.responseDialog) {
                yield put(setResponseDialog({ id: submitData.id, responseDialog: submitData.responseDialog}));
            }
        }
    }

    @action()
    public * addToDBXSheet(submitData: {values: INewRowValues}) {
        const isConnected = yield isNetworkAvailable()
        .catch(err => {
            console.log('setSubmitData_internet_error', err)
            return null
        })
        if (isConnected && isConnected.isConnected) {
            const { response } = yield call(this.xSave, 'http://ix.rebaltic.lt/api/signal/create-row', CRUD.UPDATE, submitData, HTTP_METHOD.PUT);
            if (response && response.entities && response.entities.signalData) {
                showToastWithGravityAndOffset('Successfully created row !');
            }
            yield put(setFlagger('createRowLoader', null))
        } else {
            yield put(setFlagger('createRowLoader', null))
            showToastWithGravityAndOffset('NO INTERNET CONNECTION !!!');
        }
    }

    @action()
    public * checkSMS(checkSMSData: any) {
        console.log('checkSMSData==================', checkSMSData)
        const isConnected = yield isNetworkAvailable()
        .catch(err => {
            console.log('setSubmitData_internet_error', err)
            return null
        })
        if (isConnected && isConnected.isConnected) {
            const { response } = yield call(this.xFetch, 'http://ix.rebaltic.lt/api/signal/checkSMS', HTTP_METHOD.PUT, checkSMSData);
            if (response && response.success) {
                showToastWithGravityAndOffset('Successfully check SMS !');
            }
            yield put(setFlagger('checkSMSLoader', null))
        } else {
            yield put(setFlagger('checkSMSLoader', null))
            showToastWithGravityAndOffset('NO INTERNET CONNECTION !!!');
        }
    }

    @action()
    public * clearSubmitData() {
        yield put(defaultSubmitData());
    }
}

export default new DataEntity();