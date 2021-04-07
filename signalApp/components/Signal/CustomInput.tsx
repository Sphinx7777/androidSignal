
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image } from 'react-native';
import { CRUD, EntityList } from 'signalApp/models/entity';
import { ICallLog } from './index';
import { ISingleDataItem } from '../../models/DataEntity';
import { getStringDate, isNetworkAvailable, showToastWithGravityAndOffset } from '../../utils';
import ModalDialog from '../Dialog';
import MobileDropdown from '../MobileDropdown';

const dialogOptions = [
    {label: 'auto-dial ON', value: 1},
    {label: 'auto-dial OFF', value: 0},
]

const smsOptions = [
    { label: 'auto-SMS ON', value: 1 },
    { label: 'auto-SMS OFF', value: 0 },
]

interface ICustomInputProps {
    currentElement: ISingleDataItem | undefined;
    makeCall: (num: string, pauseDisable: string) => Promise<any>;
    sendSMS: (data: { id: string, phone: string, smsBody: string }) => void;
    setSubmitData: (data: any) => void;
    clearSubmitData: () => void;
    submitData: any;
    responseDialog: ICallLog;
    onDetailsPress?: (id: string) => void;
    setNextElement: (a: any, b: any) => void;
    dataItems: EntityList<ISingleDataItem>;
}
interface ICustomInputState {
    taskCreated: number;
    details: string | undefined;
    smsBody: string;
    taskDescription: string;
    comment2020: string;
    teamDate: number;
    allBrokersBaseDate: number;
    phone: string;
    taskName: string;
}
const CustomInput = (props: ICustomInputProps) => {
    const { currentElement, makeCall, sendSMS, setSubmitData, clearSubmitData, submitData, responseDialog, onDetailsPress, setNextElement, dataItems } = props;
    const [finishedVisible, setFinishedVisible] = useState(false)
    const [addTaskDateVisible, setAddTaskDateVisible] = useState(false)
    const [addTeamDateVisible, setAddTeamDateVisible] = useState(false)
    const [addBrokersDateVisible, setAddBrokersDateVisible] = useState(false)
    const [sendCustomSMSVisible, setSendCustomSMSVisible] = useState(false)
    const currentElTaskCreated = currentElement?.get('taskCreated') || null;
    const currentElDetails = currentElement?.get('details') ? currentElement?.get('details') : '';
    const currentElSmsBody = currentElement?.get('smsBody') ? currentElement?.get('smsBody') : '';
    const currentElTaskDescription = currentElement?.get('taskDescription') ? currentElement?.get('taskDescription') : '';
    const currentElTaskName = currentElement?.get('taskName') ? currentElement?.get('taskName') : '';
    const currentElComment2020 = currentElement?.get('comment2020') ? currentElement?.get('comment2020') : '';
    const currentElTeamDate = currentElement?.get('teamDate') ? currentElement?.get('teamDate') : null;
    const currentElBrokersDate = currentElement?.get('allBrokersBaseDate') ? currentElement?.get('allBrokersBaseDate') : null;
    const currentElPhone = currentElement?.get('phone') ? currentElement?.get('phone') : null;
    const currentElSearchType = currentElement?.get('searchType') || '';
    const isAsanaType = currentElSearchType ? currentElSearchType.split(',').includes('AD') : false;
    const isTeamType = currentElSearchType ? currentElSearchType.split(',').includes('TD') : false;
    const isBrokersType = currentElSearchType ? currentElSearchType.split(',').includes('BD') : false;

    const [state, setState] = useState<ICustomInputState>({
        taskCreated: currentElTaskCreated,
        details: currentElDetails,
        smsBody: currentElSmsBody,
        taskDescription: currentElTaskDescription,
        comment2020: currentElComment2020,
        teamDate: currentElTeamDate,
        allBrokersBaseDate: currentElBrokersDate,
        phone: currentElPhone,
        taskName: currentElTaskName
    })

    useEffect(() => {
        setState((prevState) => {
            return {
                ...prevState,
                taskCreated: currentElTaskCreated,
                details: currentElDetails,
                smsBody: currentElSmsBody,
                taskDescription: currentElTaskDescription,
                comment2020: currentElComment2020,
                teamDate: currentElTeamDate,
                allBrokersBaseDate: currentElBrokersDate,
                phone: currentElPhone,
                taskName: currentElTaskName
            }
        })
    }, [currentElTaskCreated, currentElDetails, currentElSmsBody, currentElTaskDescription,
        currentElComment2020, currentElTeamDate, currentElBrokersDate, currentElPhone, currentElTaskName])

    const addNewDate = (dateType: string) => {
        setState((prevState) => {
            return {
                ...prevState,
                [dateType]: Math.round(new Date().getTime() / 1000)
            }
        })
        setSubmitData({ id: currentElement?.get('id'), [dateType]: Math.round(new Date().getTime() / 1000) })
    }

    const calling = () => currentElement && makeCall(currentElement?.get('phone'), 'disable')

    const handleInputChange = (text: string, name: string) => {
        setState((prevState) => {
            return {
                ...prevState,
                [name]: text
            }
        })
    }

    const handleSendSms = () => {
        const sms = {
            id: currentElement?.get('id'),
            phone: currentElement?.get('phone'),
            smsBody: state.smsBody
        }
        sendSMS(sms);
    }
    const finishedSubmit = async () => {
        const isConnected = await isNetworkAvailable()
        const data = { ...state, id: currentElement?.get('id'), responseDialog, needToDialog: false, needToSendSMS: false, crud: CRUD.DELETE }
        if (isConnected.isConnected) {
            setSubmitData(data);
            setNextElement(null, null);
        } else {
            showToastWithGravityAndOffset('No internet connect !!!');
        }
    };
    const editSubmit = async (e: any, name: string) => {
        e.preventDefault()
        const isConnected = await isNetworkAvailable()
        const data = { [name]: state[name], id: currentElement?.get('id') }
        isConnected.isConnected ? setSubmitData(data) : showToastWithGravityAndOffset('No internet connect !!!');
    }
    const showDetails = () => onDetailsPress(currentElement.get('id'))

    const showDialog = (dialogKey: string) => {
        if (dialogKey === 'finished') {
            setFinishedVisible(true);
        }
        if (dialogKey === 'sendCustomSMS') {
            setSendCustomSMSVisible(true);
        }
        if (dialogKey === 'taskCreated') {
            setAddTaskDateVisible(true);
        }
        if (dialogKey === 'teamDate') {
            setAddTeamDateVisible(true);
        }
        if (dialogKey === 'allBrokersBaseDate') {
            setAddBrokersDateVisible(true);
        }
    };

    const handleCancel = (dialogKey: string) => {
        if (dialogKey === 'finished') {
            setFinishedVisible(false);
        }
        if (dialogKey === 'sendCustomSMS') {
            setSendCustomSMSVisible(false);
        }
        if (dialogKey === 'taskCreated') {
            setAddTaskDateVisible(false);
        }
        if (dialogKey === 'teamDate') {
            setAddTeamDateVisible(false);
        }
        if (dialogKey === 'allBrokersBaseDate') {
            setAddBrokersDateVisible(false);
        }
    };

    const handleDelete = async (dialogKey: string) => {
        if (dialogKey === 'finished') {
            finishedSubmit();
            setFinishedVisible(false);
        }
        if (dialogKey === 'sendCustomSMS') {
            handleSendSms();
            setSendCustomSMSVisible(false)
        }
        if (dialogKey === 'taskCreated') {
            addNewDate(dialogKey)
            setAddTaskDateVisible(false);
        }
        if (dialogKey === 'teamDate') {
            addNewDate(dialogKey)
            setAddTeamDateVisible(false);
        }
        if (dialogKey === 'allBrokersBaseDate') {
            addNewDate(dialogKey)
            setAddBrokersDateVisible(false);
        }
    };

    const handleDropdownDialog = (value: number | string) => {
        setSubmitData({ id: currentElement?.get('id'), needToDialog: value === 0 ? false : true })
    }

    const handleDropdownSMS = (value: number | string) => {
        setSubmitData({ id: currentElement?.get('id'), needToSendSMS: value === 0 ? false : true })
    }

    const phone = currentElement?.get('phone') && currentElement?.get('phone')?.length > 0 ? currentElement?.get('phone') : '--------'
    const isPhone = currentElement?.get('phone') && currentElement?.get('phone').length >= 9 && currentElement?.get('phone').length <= 11;
    const currentElSMSBody = currentElement?.get('smsBody');
    const isNeedSms = currentElement?.get('needToSendSMS');
    const dialogDescription = `Do you want to send this sms ? Number: ${phone} sms body: ${currentElSMSBody}`
    const isCurrentElResDialog = currentElement?.get('responseDialog');

    return (
        <>
            <View style={styles.container}>
                {currentElement && <TouchableOpacity
                    onPress={showDetails}
                    onLongPress={calling}
                    style={styles.textContainer}>
                    <View style={styles.nameLine}>
                        <Text numberOfLines={1} style={{ ...styles.text, maxWidth: 220 }}>{currentElement?.get('asanaDataType') ? currentElement?.get('taskName') : currentElement?.get('name')}</Text>
                        <Text style={{...styles.text, color: isPhone ? 'black' : '#bf0416'}}>{phone}</Text>
                        {currentElement?.get('asanaDataType')
                            ? <Image style={{ width: 25, height: 25, marginRight: 5 }} source={require('../../../assets/asana.png')} />
                            : <Text style={{ ...styles.text, color: '#0d1180', fontWeight: '700', marginRight: 5 }}>{currentElement?.get('searchType')}</Text>
                        }
                    </View>
                    <View style={styles.nameLine}>
                        <Text numberOfLines={1} style={{ ...styles.text, maxWidth: 200 }}>{currentElement?.get('email')}</Text>
                    </View>
                    <View style={styles.nameLine}>
                        <View style={{ display: 'flex', flexDirection: 'column' }}>
                            {isAsanaType && <Text style={styles.text}>Asana create: {currentElTaskCreated > 0 ? getStringDate(new Date(currentElTaskCreated * 1000)) : 'no info'}</Text>}
                            {isTeamType && <Text style={styles.text}>TD date: {currentElTeamDate > 0 ? getStringDate(new Date(currentElTeamDate * 1000)) : 'no info'}</Text>}
                            {isBrokersType && <Text style={styles.text}>BD date: {currentElBrokersDate > 0 ? getStringDate(new Date(currentElBrokersDate * 1000)) : 'no info'}</Text>}
                        </View>
                        <View style={styles.dataType}>
                        {(!currentElSMSBody || currentElSMSBody.length === 0 && isNeedSms) && <Text style={{color: '#bf0416', paddingVertical: 2, marginRight: 4, fontWeight: '600'}}>Empty sms body</Text>}
                            {currentElement?.get('needToSendSMS') && <Image style={{ width: 25, height: 25 }} source={require('../../../assets/sms.png')} />}
                            {currentElement?.get('needToDialog') && <Image style={{ width: 25, height: 25, marginLeft: 5 }} source={require('../../../assets/phone-call.png')} />}
                        </View>
                    </View>
                    { isCurrentElResDialog &&
                        <View style={{ ...styles.inputContainer}}>
                        <Text style={{ ...styles.text, fontWeight: '700' }}>Last call:</Text>
                        <Text style={{ ...styles.text }}>Type: {isCurrentElResDialog?.get('type')}</Text>
                        <Text style={{ ...styles.text }}>Duration: {isCurrentElResDialog?.get('duration')}</Text>
                        <Text style={{ ...styles.text }}>Date: {getStringDate(new Date(isCurrentElResDialog?.get('dateTime')))}</Text>
                        </View>}
                </TouchableOpacity>}
                <MobileDropdown
                value={currentElement?.get('needToDialog') ? 1 : 0}
                onChange={handleDropdownDialog}
                options={dialogOptions}
                />
                <MobileDropdown
                value={currentElement?.get('needToSendSMS') ? 1 : 0}
                onChange={handleDropdownSMS}
                containerStile={{marginBottom: 5}}
                options={smsOptions}
                />
                {isAsanaType && <>
                    <Text style={styles.label}>Task created</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={{ ...styles.textInput }}
                            placeholder='set new date'
                            value={getStringDate(new Date(state.taskCreated * 1000))}
                            editable={false}
                        />
                        <View style={styles.dateButtons}>
                            <TouchableOpacity
                                style={styles.button}
                                onPress={() => showDialog('taskCreated')}>
                                <Text style={styles.buttonText}>Set new date</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <Text style={styles.label}>Task name</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={{ ...styles.textInput, width: '100%' }}
                            autoCorrect={false}
                            placeholder='enter task name'
                            value={state.taskName}
                            onEndEditing={(e) => editSubmit(e, 'taskName')}
                            onChangeText={text => handleInputChange(text, 'taskName')}
                            multiline={true} />
                    </View>
                    <Text style={styles.label}>Task description</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={{ ...styles.textInput, width: '100%' }}
                            autoCorrect={false}
                            placeholder='enter task description'
                            value={state.taskDescription}
                            onEndEditing={(e) => editSubmit(e, 'taskDescription')}
                            onChangeText={text => handleInputChange(text, 'taskDescription')}
                            multiline={true} />
                    </View>
                </>}
                {isTeamType &&
                    <>
                        <Text style={styles.label}>Team base date</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={{ ...styles.textInput }}
                                placeholder='set new date'
                                value={state.teamDate ? getStringDate(new Date(state.teamDate * 1000)) : null}
                                editable={false}
                            />
                            <View style={styles.dateButtons}>
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={() => showDialog('teamDate')}>
                                    <Text style={styles.buttonText}>Set new date</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <Text style={styles.label}>Details</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={{ ...styles.textInput, width: '100%' }}
                                autoCorrect={false}
                                placeholder='enter details'
                                value={state.details}
                                onEndEditing={(e) => editSubmit(e, 'details')}
                                onChangeText={text => handleInputChange(text, 'details')}
                                multiline={true} />
                        </View>
                    </>}
                {isBrokersType &&
                    <>
                        <Text style={styles.label}>All brokers base date</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={{ ...styles.textInput }}
                                placeholder='set new date'
                                value={state.allBrokersBaseDate ? getStringDate(new Date(state.allBrokersBaseDate * 1000)) : null}
                                editable={false}
                            />
                            <View style={styles.dateButtons}>
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={() => showDialog('allBrokersBaseDate')}>
                                    <Text style={styles.buttonText}>Set new date</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <Text style={styles.label}>Comment 2020</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={{ ...styles.textInput, width: '100%' }}
                                autoCorrect={false}
                                placeholder='comment 2020'
                                value={state.comment2020}
                                onEndEditing={(e) => editSubmit(e, 'comment2020')}
                                onChangeText={text => handleInputChange(text, 'comment2020')}
                                multiline={true} />
                        </View>
                    </>}
                <Text style={styles.label}>Phone</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={{ ...styles.textInput, width: '100%' }}
                        autoCorrect={false}
                        placeholder='phone'
                        value={state.phone}
                        onEndEditing={(e) => editSubmit(e, 'phone')}
                        onChangeText={text => handleInputChange(text, 'phone')}
                        multiline={true} />
                </View>
                <Text style={styles.label}>sms body</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={{ ...styles.textInput, width: '100%' }}
                        autoCorrect={false}
                        placeholder='sms body'
                        data-name='bar'
                        value={state.smsBody}
                        onEndEditing={(e) => editSubmit(e, 'smsBody')}
                        onChangeText={text => handleInputChange(text, 'smsBody')}
                        multiline={true}
                    />
                </View>
                <View style={styles.sendButtonContainer}>
                    <TouchableOpacity
                        style={(state.smsBody.length !== 0)
                            ? { ...styles.button, ...styles.sendButton }
                            : { ...styles.button, ...styles.sendButton, ...styles.disabled }}
                        disabled={state.smsBody.length === 0}
                        onPress={() => showDialog('sendCustomSMS')}>
                        <Text style={styles.buttonText}>Custom sms</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{ ...styles.button, ...styles.sendButton, backgroundColor: '#f26257', borderColor: '#f26257' }}
                        onPress={() => showDialog('finished')}>
                        <Text style={styles.buttonText}>Finished</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <ModalDialog
            handleCancel={handleCancel}
            handleConfirm={handleDelete}
            dialogKey='finished'
            visible={finishedVisible}
            title='Finished'
            description='Do you want to finished work with it object in mobile app ?'
            confirmButtonText='Finished'
            />
            <ModalDialog
            handleCancel={handleCancel}
            handleConfirm={handleDelete}
            dialogKey='sendCustomSMS'
            visible={sendCustomSMSVisible}
            title='Send custom sms'
            description={dialogDescription}
            confirmButtonText='Send'
            />
            <ModalDialog
            handleCancel={handleCancel}
            handleConfirm={handleDelete}
            dialogKey='allBrokersBaseDate'
            visible={addBrokersDateVisible}
            title='Change date'
            description='Do you want to change the date ?'
            confirmButtonText='Ok'
            />
            <ModalDialog
            handleCancel={handleCancel}
            handleConfirm={handleDelete}
            dialogKey='teamDate'
            visible={addTeamDateVisible}
            title='Change date'
            description='Do you want to change the date ?'
            confirmButtonText='Ok'
            />
            <ModalDialog
            handleCancel={handleCancel}
            handleConfirm={handleDelete}
            dialogKey='taskCreated'
            visible={addTaskDateVisible}
            title='Change date'
            description='Do you want to change the date ?'
            confirmButtonText='Ok'
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        minHeight: 270,
        borderColor: '#29a331',
        backgroundColor: '#c9f2cf',
        borderWidth: 2,
        paddingHorizontal: 5,
        paddingTop: 10,
        borderRadius: 10
    },
    inputContainer: {
        display: 'flex',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
    },
    textContainer: {
        borderStyle: 'solid',
        borderColor: '#1b6b2f',
        borderWidth: 2,
        marginBottom: 10,
        backgroundColor: '#97cca5',
        padding: 1,
        width: '100%',
        borderRadius: 10,
    },
    itemLine: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: 2,
        paddingBottom: 2,
        borderBottomWidth: 1,
        borderBottomColor: '#5eb337'
    },
    dialogContainer: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        color: '#f77e59',
        fontSize: 12,
        fontWeight: '700'
    },
    nameLine: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    text: {
        color: 'black',
        paddingVertical: 2
    },
    textInput: {
        borderStyle: 'solid',
        borderBottomWidth: 1,
        borderBottomColor: 'lightgrey',
        paddingVertical: 5,
        width: '60%',
    },
    dateInput: {
        width: '40%'
    },
    dateButtons: {
        display: 'flex',
        flexDirection: 'row',
        borderRadius: 10
    },
    detailsButtons: {
        marginTop: 5,
    },
    button: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#1f6b4e',
        width: 120,
        paddingVertical: 2,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#1f6b4e',
        marginBottom: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 16
    },
    sendButtonContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 5
    },
    dataType: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5
    },
    sendButton: {
        marginBottom: 0,
        marginTop: 15,
        width: 130,
        paddingVertical: 5
    },
    disabled: {
        backgroundColor: 'gray',
        borderColor: 'gray'
    }
});


export default CustomInput;
