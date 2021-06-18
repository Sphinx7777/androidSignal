
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image } from 'react-native';
import { CRUD, EntityList } from 'signalApp/models/entity';
import { ICallLog } from './index';
import { ISingleDataItem } from '../../models/DataEntity';
import { getStringDate, isNetworkAvailable, showToastWithGravityAndOffset } from '../../utils';
import ModalDialog from '../Dialog';
import MobileDropdown from '../MobileDropdown';
import MobileInput from '../MobileInput';
import IsMobileDatePicker from '../DatePicker';
import { count } from 'sms-length';
import { INewRowValues, groupOptions, segmentOptions, highNetWorthOptions } from 'signalApp/constants';

const dialogOptions = [
    { label: 'auto-dial ON', value: 1 },
    { label: 'auto-dial OFF', value: 0 },
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
    messagesUpload?: boolean;
    addToDBXSheet: (submitData: { values: INewRowValues }) => void;
    setFlagger: (key: string, value: any) => void;
}
interface ICustomInputState {
    taskCreated: number;
    details: string | undefined;
    smsBody: string;
    taskDescription: string;
    currentYearComment: string;
    teamDate: number;
    allBrokersBaseDate: number;
    phone: string;
    taskName: string;
    currentComments: string;
    dueDate: number;
    reference: string;
    pastYearsComment: string;
    price: string;
    calledAbout: string;
}
const CustomInput = (props: ICustomInputProps) => {
    const { currentElement, makeCall, sendSMS, setSubmitData, clearSubmitData, submitData, responseDialog, onDetailsPress,
            setNextElement, dataItems, messagesUpload, addToDBXSheet, setFlagger } = props;
    const [sendCustomSMSVisible, setSendCustomSMSVisible] = useState(false)
    const currentElTaskCreated = currentElement?.get('taskCreated') || null;
    const currentElReference = currentElement?.get('reference') || '';
    const currentElDetails = currentElement?.get('details') ? currentElement?.get('details') : '';
    let currentElSmsBody = ''
    if (currentElement?.get('smsBody') && currentElement?.get('smsBody').length > 0) {
        const tempBody = currentElement?.get('smsBody')
        const isDynamicName = tempBody.includes('[name]')
        if (!isDynamicName) {
            currentElSmsBody = tempBody
        }
        if (isDynamicName) {
            const newBody = currentElReference && currentElReference.length > 0 ? tempBody.replace(/\[name]/, currentElReference) : tempBody.replace(/\[name]/, ' ')
            currentElSmsBody = newBody
        }
    }
    const currentElTaskDescription = currentElement?.get('taskDescription') ? currentElement?.get('taskDescription') : '';
    const currentElCurrentComments = currentElement?.get('currentComments') ? currentElement?.get('currentComments') : '';
    const currentElTaskName = currentElement?.get('taskName') ? currentElement?.get('taskName') : '';
    const currentElCurrentYearComment = currentElement?.get('currentYearComment') ? currentElement?.get('currentYearComment') : '';
    const currentElPastYearComment = currentElement?.get('pastYearsComment') ? currentElement?.get('pastYearsComment') : '';
    const currentElPBCalledAbout = currentElement?.get('calledAbout') ? currentElement?.get('calledAbout') : '';
    const currentElPBPrice = currentElement?.get('price') ? String(currentElement?.get('price')) : '';
    const currentElTeamDate = currentElement?.get('teamDate') ? currentElement?.get('teamDate') : null;
    const currentElBrokersDate = currentElement?.get('allBrokersBaseDate') ? currentElement?.get('allBrokersBaseDate') : null;
    const currentElPhone = currentElement?.get('phone') ? currentElement?.get('phone') : null;
    const currentElDueDate = currentElement?.get('dueDate') ? currentElement?.get('dueDate') : null;
    const currentElSearchType = currentElement?.get('searchType') || '';
    const isAsanaType = currentElSearchType ? currentElSearchType.split(',').includes('AD') : false;
    const isTeamType = currentElSearchType ? currentElSearchType.split(',').includes('TD') : false;
    const isBrokersType = currentElSearchType ? currentElSearchType.split(',').includes('BD') : false;
    const currentElGroup = currentElement?.get('group') ? String(currentElement?.get('group')) : 'Ignas LT';
    const currentElADDTeamDate = currentElement?.get('teamDate') ? currentElement?.get('teamDate') : Math.round(new Date().getTime() / 1000);
    const currentElLanguage = currentElement?.get('language') ? currentElement?.get('language') : 'LT';
    const currentElEmail = currentElement?.get('email') ? currentElement?.get('email') : '';
    const currentElName = currentElement?.get('name') ? currentElement?.get('name') : '';
    const currentElSource = currentElement?.get('source') ? currentElement?.get('source') : 'past buyers';
    const currentElSegment = currentElement?.get('segment') ? currentElement?.get('segment') : 'C';
    const currentElHighNetWorth = currentElement?.get('highNetWorth') ? currentElement?.get('highNetWorth') : 'no';

    const [state, setState] = useState<ICustomInputState>({
        taskCreated: currentElTaskCreated,
        details: currentElDetails,
        smsBody: currentElSmsBody,
        taskDescription: currentElTaskDescription,
        currentYearComment: currentElCurrentYearComment,
        pastYearsComment: currentElPastYearComment,
        teamDate: currentElTeamDate,
        allBrokersBaseDate: currentElBrokersDate,
        phone: currentElPhone,
        taskName: currentElTaskName,
        currentComments: currentElCurrentComments,
        dueDate: currentElDueDate,
        reference: currentElReference,
        price: currentElPBPrice,
        calledAbout: currentElPBCalledAbout
    })
    const [finishedVisible, setFinishedVisible] = useState(false)
    const [showAddFields, setShowAddFields] = useState(false)
    const [additionalFields, setAdditionalFields] = useState({
        group: currentElGroup,
        teamDate: currentElADDTeamDate,
        language: currentElLanguage,
        reference: currentElReference && currentElReference.length > 0 ? currentElReference : currentElName && currentElName.length > 0 ? currentElName : '',
        email: currentElEmail,
        phone: currentElPhone,
        source: currentElSource,
        details: currentElDetails,
        segment: currentElSegment,
        highNetWorth: currentElHighNetWorth,
    })

    useEffect(() => {
        setState((prevState) => {
            return {
                ...prevState,
                taskCreated: currentElTaskCreated,
                details: currentElDetails,
                smsBody: currentElSmsBody,
                taskDescription: currentElTaskDescription,
                pastYearsComment: currentElPastYearComment,
                currentYearComment: currentElCurrentYearComment,
                teamDate: currentElTeamDate,
                allBrokersBaseDate: currentElBrokersDate,
                phone: currentElPhone,
                taskName: currentElTaskName,
                currentComments: currentElCurrentComments,
                dueDate: currentElDueDate,
                reference: currentElReference,
                price: currentElPBPrice,
                calledAbout: currentElPBCalledAbout
            }
        })
        setAdditionalFields((prevState) => {
            return {
                ...prevState,
                group: currentElGroup,
                teamDate: currentElADDTeamDate,
                language: currentElLanguage,
                phone: currentElPhone,
                reference: currentElReference && currentElReference.length > 0 ? currentElReference : currentElName && currentElName.length > 0 ? currentElName : '',
                email: currentElEmail,
                source: currentElSource,
                details: currentElDetails,
                segment: currentElSegment,
                highNetWorth: currentElHighNetWorth,
            }
        })
        setShowAddFields(false)
    }, [currentElement])


    const calling = () => currentElement && makeCall(currentElement?.get('phone'), 'disable')

    const handleInputChange = (text: string, name: string) => {
        setState((prevState) => {
            return {
                ...prevState,
                [name]: text
            }
        })
    }

    const handleAdditionalFieldsChange = (text: string, name: string) => {
        setAdditionalFields((prevState) => {
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
        if (currentElement) {
            sendSMS(sms);
        } else {
            showToastWithGravityAndOffset('No data to send !!!');
        }
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
    const editSubmit = async (e: any, name: any) => {
        e.preventDefault()
        const isConnected = await isNetworkAvailable()
        const data = { [name]: state[name], id: currentElement?.get('id') }
        let isChanged = state[name] !== currentElement?.get(name)
        if (name === 'price') {
            data['price'] = Number(data['price'])
            isChanged = Number(state['price']) !== Number(currentElement?.get('price'))
        }
        if (isConnected.isConnected && currentElement && isChanged) {
            setSubmitData(data)
        } else {
            if (!isConnected.isConnected) {
                showToastWithGravityAndOffset('No internet connect !!!');
            }
            if (!currentElement) {
                showToastWithGravityAndOffset('No data for submit !!!');
            }
        }
    }
    const showDetails = () => onDetailsPress(currentElement.get('id'))

    const showDialog = (dialogKey: string) => {
        if (dialogKey === 'finished') {
            setFinishedVisible(true);
        }
        if (dialogKey === 'sendCustomSMS') {
            setSendCustomSMSVisible(true);
        }
    };

    const handleCancel = (dialogKey: string) => {
        if (dialogKey === 'finished') {
            setFinishedVisible(false);
        }
        if (dialogKey === 'sendCustomSMS') {
            setSendCustomSMSVisible(false);
        }
    };

    const handleDelete = (dialogKey: string) => {
        if (dialogKey === 'finished') {
            finishedSubmit();
            setFinishedVisible(false);
        }
        if (dialogKey === 'sendCustomSMS') {
            handleSendSms();
            setSendCustomSMSVisible(false)
        }
    };

    const handleDropdownDialog = (value: number | string) => {
        if (currentElement) {
            setSubmitData({ id: currentElement?.get('id'), needToDialog: value === 0 ? false : true })
        }
    }

    const handleAdditionalDropdown = (value: number | string, key: string) => {
        setAdditionalFields((prevState) => {
            return {
                ...prevState,
                [key]: value
            }
        })
    }

    const handleDropdownSMS = (value: number | string) => {
        if (currentElement) {
            setSubmitData({ id: currentElement?.get('id'), needToSendSMS: value === 0 ? false : true })
        }
    }

    const handlePickerOkClick = (date: Date, itemKey: string) => {
        const sendDate: string | number = Math.round(date.getTime() / 1000);
        setSubmitData({ id: currentElement?.get('id'), [itemKey]: sendDate });
    }

    const handlePickerAdditionalOkClick = (date: Date, itemKey: string) => {
        const sendDate: string | number = Math.round(date.getTime() / 1000);
        setAdditionalFields((prevState) => {
            return {
                ...prevState,
                [itemKey]: sendDate
            }
        })
    }

    const handleAddFields = () => {
        setShowAddFields(!showAddFields)
    }

    const handleCreateRow = () => {
        const values = additionalFields
        if (values && state && state.phone && state.phone.length >= 8) {
            values['phone'] = state.phone
            addToDBXSheet({ values })
            setFlagger('createRowLoader', true)
        } else {
            showToastWithGravityAndOffset('Phone field cannot be empty or less than 8 characters !!!');
        }
    }

    const phone = currentElement?.get('phone') && currentElement?.get('phone')?.length > 0 ? currentElement?.get('phone') : '--------'
    const isPhone = currentElement?.get('phone') && currentElement?.get('phone').length >= 9;
    const currentElSMSBody = currentElement?.get('smsBody');
    const isNeedSms = currentElement?.get('needToSendSMS');
    const dialogDescription = `Do you want to send this sms ? Number: ${phone} sms body: ${state.smsBody}`
    const isCurrentElResDialog = currentElement?.get('responseDialog');
    const messagesCount = count(state.smsBody).messages
    const isBtnDisable = !currentElement || !additionalFields || !state || !state.phone || state.phone.length < 8;
    console.log('currentElement_ID', currentElement?.get('id'));
    
    return (
        <>
            <View style={styles.container}>
                {currentElement && <TouchableOpacity
                    onPress={showDetails}
                    onLongPress={calling}
                    style={styles.textContainer}>
                    <View style={styles.nameLine}>
                        <Text numberOfLines={1} style={{ ...styles.text, maxWidth: 220 }}>{currentElement?.get('asanaDataType') ? currentElement?.get('taskName') : currentElement?.get('reference') ? currentElement?.get('reference') : currentElement?.get('name')}</Text>
                        <Text style={{ ...styles.text, color: isPhone ? 'black' : '#bf0416' }}>{phone}</Text>
                        {currentElement?.get('asanaDataType')
                            ? <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                <Image style={{ width: 25, height: 25 }} source={require('../../../assets/asana.png')} />
                                <Text style={{ ...styles.text, color: '#f77e59', fontWeight: '700', marginHorizontal: 5 }}>{currentElement?.get('searchType').replace('AD', '')?.replace('TD', 'DBX')?.replace('BD', 'PB')}</Text>
                            </View>
                            : <Text style={{ ...styles.text, color: '#f77e59', fontWeight: '700' }}>{currentElement?.get('searchType')?.replace('TD', 'DBX')?.replace('BD', 'PB')}</Text>
                        }
                    </View>
                    {<View style={styles.nameLine}>
                        <Text numberOfLines={1} style={{ ...styles.text, maxWidth: 300 }}>Email: {currentElement?.get('email') ? currentElement?.get('email') : 'no info'}</Text>
                        {!currentElement?.get('teamDataType') && <Text> <Text>not in the DBX </Text> <Image style={{ width: 18, height: 18 }} source={require('../../../assets/no.png')} /></Text>}
                    </View>}
                    { }
                    <View style={styles.nameLine}>
                        <View style={{ display: 'flex', flexDirection: 'column' }}>
                            {isAsanaType && <Text style={styles.text}>Task created: {currentElTaskCreated > 0 ? getStringDate(new Date(currentElTaskCreated * 1000)) : 'no info'}</Text>}
                            {isAsanaType &&
                                <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={styles.text}>Due date: {currentElDueDate ? getStringDate(new Date(currentElDueDate * 1000)) : 'no info'}</Text>
                                </View>
                            }
                            {isTeamType && currentElTeamDate > 0 && <Text style={styles.text}>TD date: {currentElTeamDate > 0 ? getStringDate(new Date(currentElTeamDate * 1000)) : 'no info'}</Text>}
                            {isBrokersType && currentElBrokersDate > 0 && <Text style={styles.text}>BD date: {currentElBrokersDate > 0 ? getStringDate(new Date(currentElBrokersDate * 1000)) : 'no info'}</Text>}
                        </View>
                        <View style={styles.dataType}>
                            {(!currentElSMSBody || currentElSMSBody?.length === 0 && isNeedSms) && <Text style={{ color: '#bf0416', paddingVertical: 2, marginRight: 4, fontWeight: '600' }}>Empty sms body</Text>}
                            {currentElement?.get('needToSendSMS') && <Image style={{ width: 25, height: 25 }} source={require('../../../assets/sms.png')} />}
                            {currentElement?.get('needToDialog') && <Image style={{ width: 25, height: 25, marginLeft: 5 }} source={require('../../../assets/phone-call.png')} />}
                        </View>
                    </View>
                    {isCurrentElResDialog &&
                        <View style={{ ...styles.inputContainer, marginTop: 2, borderTopColor: '#1b6b2f', borderTopWidth: 1, justifyContent: 'space-between', paddingHorizontal: 2 }}>
                            <Text style={{ ...styles.text, fontWeight: '700' }}>Last call:</Text>
                            <Text style={styles.text}>Type: {isCurrentElResDialog?.get('type')}</Text>
                            <Text style={styles.text}>Duration: {isCurrentElResDialog?.get('duration')}</Text>
                            <Text style={styles.text}>Date: {getStringDate(new Date(isCurrentElResDialog?.get('dateTime')))}</Text>
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
                    containerStile={{ marginBottom: 5 }}
                    options={smsOptions}
                />
                {isAsanaType &&
                    <>
                        <View style={styles.inputContainer}>
                            <IsMobileDatePicker
                                elDate={currentElement?.get('dueDate')}
                                handleOkClick={handlePickerOkClick}
                                itemKey='dueDate'
                                title='Asana due date'
                                containerStile={{ marginBottom: 5 }}
                            />
                        </View>
                        <MobileInput
                            value={state.taskName}
                            label='Task name'
                            placeholder='enter task name'
                            textKey='taskName'
                            onEndEditing={editSubmit}
                            onChangeText={handleInputChange} />
                        <MobileInput
                            value={state.taskDescription}
                            label='Task description'
                            placeholder='enter task description'
                            textKey='taskDescription'
                            onEndEditing={editSubmit}
                            onChangeText={handleInputChange} />
                    </>}
                {isTeamType &&
                    <>
                        <View style={styles.inputContainer}>
                            <IsMobileDatePicker
                                elDate={currentElement?.get('teamDate')}
                                handleOkClick={handlePickerOkClick}
                                itemKey='teamDate'
                                title='DBX - 1st contact date'
                                containerStile={{ marginBottom: 5 }}
                            />
                        </View>
                        <MobileInput
                            value={state.reference}
                            label='DBX name (reference)'
                            placeholder='DBX reference'
                            textKey='reference'
                            onEndEditing={editSubmit}
                            onChangeText={handleInputChange} />
                        <MobileInput
                            value={state.currentComments}
                            label='DBX current comments'
                            placeholder='DBX current comments'
                            textKey='currentComments'
                            onEndEditing={editSubmit}
                            onChangeText={handleInputChange} />
                        <MobileInput
                            value={state.details}
                            label='DBX details'
                            placeholder='DBX details'
                            textKey='details'
                            onEndEditing={editSubmit}
                            onChangeText={handleInputChange} />
                    </>}
                {isBrokersType &&
                    <>
                        <MobileInput
                            value={state.currentYearComment}
                            label='Past buyer comment current year'
                            placeholder='Past buyer comment current year'
                            textKey='currentYearComment'
                            onEndEditing={editSubmit}
                            onChangeText={handleInputChange} />
                        <MobileInput
                            value={state.pastYearsComment}
                            label='Past buyer comment past year'
                            placeholder='Past buyer comment past year'
                            textKey='pastYearsComment'
                            onEndEditing={editSubmit}
                            onChangeText={handleInputChange} />
                        <MobileInput
                            value={state.price}
                            label='Past buyers - Last property price'
                            placeholder='Past buyers - Last property price'
                            textKey='price'
                            keyboardType='numeric'
                            onEndEditing={editSubmit}
                            onChangeText={handleInputChange} />
                        <MobileInput
                            value={state.calledAbout}
                            label='Past buyers - Last property street'
                            placeholder='Past buyers - Last property street'
                            textKey='calledAbout'
                            onEndEditing={editSubmit}
                            onChangeText={handleInputChange} />
                        <View style={styles.inputContainer}>
                            <IsMobileDatePicker
                                elDate={currentElement?.get('allBrokersBaseDate')}
                                handleOkClick={handlePickerOkClick}
                                itemKey='allBrokersBaseDate'
                                title='PB - Last property date called'
                                containerStile={{ marginVertical: 5 }}
                            />
                        </View>
                    </>}
                <MobileInput
                    value={state.phone}
                    label='Phone'
                    placeholder='phone'
                    textKey='phone'
                    keyboardType='numeric'
                    onEndEditing={editSubmit}
                    onChangeText={handleInputChange} />
                <MobileInput
                    value={state.smsBody}
                    label='Sms body'
                    placeholder='sms body'
                    textKey='smsBody'
                    onEndEditing={editSubmit}
                    onChangeText={handleInputChange} />
                {(state.smsBody?.length > 0) ?
                    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignContent: 'center' }}>
                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignContent: 'center', marginRight: 6 }}>
                            <Text style={{ marginRight: 3 }}>SMS count:</Text>
                            <Text style={{ fontWeight: '700', color: messagesCount > 1 ? 'red' : 'green' }}>{messagesCount}</Text>
                        </View>
                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignContent: 'center', marginRight: 6 }}>
                            <Text style={{ marginRight: 3 }}> / Length:</Text>
                            <Text style={{ fontWeight: '700' }}>{count(state.smsBody).length}</Text>
                        </View>
                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignContent: 'center', marginRight: 6 }}>
                            <Text style={{ marginRight: 3 }}> / Max length for 1 msg:</Text>
                            <Text style={{ fontWeight: '700' }}>{count(state.smsBody).characterPerMessage}</Text>
                        </View>
                    </View> : <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignContent: 'center', marginRight: 6 }}>
                        <Text style={{ marginRight: 3 }}>Length:</Text>
                        <Text style={{ fontWeight: '700', color: 'red' }}>0</Text>
                    </View>
                }
                {showAddFields &&
                    <View>
                        <Text style={{ color: 'black', fontSize: 16, fontWeight: '700', marginVertical: 2 }}>Additional fields for DBX</Text>
                        <Text style={{ ...styles.label }}>DBX Grupė</Text>
                        <MobileDropdown
                            value={additionalFields.group}
                            onChange={value => handleAdditionalDropdown(value, 'group')}
                            options={groupOptions} />
                        <IsMobileDatePicker
                            elDate={additionalFields.teamDate}
                            handleOkClick={handlePickerAdditionalOkClick}
                            itemKey='teamDate'
                            title='DBX - 1st contact date'
                            containerStile={{ marginTop: 2 }} />
                        <MobileInput
                            value={additionalFields.language}
                            label='DBX language (Kalba)'
                            placeholder='DBX language (Kalba)'
                            textKey='language'
                            onChangeText={handleAdditionalFieldsChange} />
                        <MobileInput
                            value={additionalFields.reference}
                            label='DBX name (Kreipinys)'
                            placeholder='DBX name (Kreipinys)'
                            textKey='reference'
                            onChangeText={handleAdditionalFieldsChange} />
                        <MobileInput
                            value={additionalFields.email}
                            label='DBX email'
                            autoCapitalize= 'none'
                            keyboardType='email-address'
                            placeholder='DBX email'
                            textKey='email'
                            onChangeText={handleAdditionalFieldsChange} />
                        <MobileInput
                            value={additionalFields.source}
                            label='DBX Šaltinis'
                            placeholder='DBX Šaltinis'
                            textKey='source'
                            onChangeText={handleAdditionalFieldsChange} />
                        <MobileInput
                            value={additionalFields.details}
                            label='DBX details'
                            placeholder='DBX details'
                            textKey='details'
                            onChangeText={handleAdditionalFieldsChange} />
                        <Text style={{ ...styles.label }}>DBX Segmentas</Text>
                        <MobileDropdown
                            value={additionalFields.segment}
                            onChange={value => handleAdditionalDropdown(value, 'segment')}
                            options={segmentOptions} />
                        <Text style={{ ...styles.label }}>DBX High Net Worth</Text>
                        <MobileDropdown
                            value={additionalFields.highNetWorth}
                            onChange={value => handleAdditionalDropdown(value, 'highNetWorth')}
                            options={highNetWorthOptions} />
                    </View>
                }
                {!currentElement?.get('teamDataType') &&
                    <View style={styles.sendButtonContainer}>
                        <TouchableOpacity
                            style={{ ...styles.button, ...styles.sendButton, backgroundColor: currentElement ? '#31b7cc' : 'gray', borderColor: currentElement ? '#31b7cc' : 'gray' }}
                            disabled={!currentElement}
                            onPress={handleAddFields}>
                            <Text style={styles.buttonText}>{!showAddFields ? 'Add to DBX' : 'Cancel'}</Text>
                        </TouchableOpacity>
                        {
                            !showAddFields
                                ? <Text></Text>
                                : <TouchableOpacity
                                    style={{ ...styles.button, ...styles.sendButton, backgroundColor: !isBtnDisable ? '#0ca823' : 'gray', borderColor: !isBtnDisable ? '#0ca823' : 'gray' }}
                                    disabled={isBtnDisable}
                                    onPress={handleCreateRow}>
                                    <Text style={styles.buttonText}>Ok</Text>
                                </TouchableOpacity>
                        }
                    </View>
                }
                <View style={styles.sendButtonContainer}>
                    <TouchableOpacity
                        style={(state.smsBody.length !== 0 && currentElement && !messagesUpload)
                            ? { ...styles.button, ...styles.sendButton }
                            : { ...styles.button, ...styles.sendButton, ...styles.disabled }}
                        disabled={state.smsBody.length === 0 || !currentElement || messagesUpload}
                        onPress={() => showDialog('sendCustomSMS')}>
                        <Text style={styles.buttonText}>Custom sms</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{ ...styles.button, ...styles.sendButton, backgroundColor: currentElement ? '#f26257' : 'gray', borderColor: currentElement ? '#f26257' : 'gray' }}
                        disabled={!currentElement}
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
                title={'The following SMS will be sent, please confirm'}
                description={dialogDescription}
                confirmButtonText='Send'
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
        justifyContent: 'flex-start',
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
