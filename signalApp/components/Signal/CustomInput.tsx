
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image } from 'react-native';
import { CRUD } from 'signalApp/models/entity';
import { ICallLog } from '.';
import { ISingleDataItem } from '../../models/DataEntity';
import { getStringDate, isNetworkAvailable, showToastWithGravityAndOffset } from '../../utils';

interface ICustomInputProps {
    currentElement: ISingleDataItem | undefined;
    makeCall: (num: string, pauseDisable: string) => Promise<any>;
    sendSMS: (data: { id: string, phone: string, smsBody: string }) => void;
    setSubmitData: (data: any) => void;
    clearSubmitData: () => void;
    submitData: any;
    responseDialog: ICallLog;
    onDetailsPress?: (id: string) => void;
}
interface ICustomInputState {
    updatedAt: number;
    details: string | undefined;
    smsBody: string;
    taskDescription: string;
    comment2020: string;
}
const CustomInput = (props: ICustomInputProps) => {
    const { currentElement, makeCall, sendSMS, setSubmitData, clearSubmitData, submitData, responseDialog, onDetailsPress } = props;
    console.log('currentElement', currentElement)
    const currentElDate = currentElement?.get('updatedAt') || null;
    const currentElDetails = currentElement?.get('details') ? currentElement?.get('details') : '';
    const currentElSmsBody = currentElement?.get('smsBody') ? currentElement?.get('smsBody') : '';
    const currentElTaskDescription = currentElement?.get('taskDescription') ? currentElement?.get('taskDescription') : '';
    const currentElComment2020 = currentElement?.get('comment2020') ? currentElement?.get('comment2020') : '';
    const currentElTeamDate = currentElement?.get('teamDate') ? currentElement?.get('teamDate') : null;

    const currentElSearchType = currentElement?.get('searchType') || '';
    const isAsanaType = currentElSearchType ? currentElSearchType.split(',').includes('AD') : false;
    const isTeamType = currentElSearchType ? currentElSearchType.split(',').includes('TD') : false;
    const isBrokersType = currentElSearchType ? currentElSearchType.split(',').includes('BD') : false;


    const [state, setState] = useState<ICustomInputState>({
        updatedAt: currentElDate,
        details: currentElDetails,
        smsBody: currentElSmsBody,
        taskDescription: currentElTaskDescription,
        comment2020: currentElComment2020
    })

    useEffect(() => {
        setState((prevState) => {
            return {
                ...prevState,
                updatedAt: currentElDate,
                details: currentElDetails,
                smsBody: currentElSmsBody,
                taskDescription: currentElTaskDescription,
                comment2020: currentElComment2020
            }
        })
    }, [currentElDate, currentElDetails, currentElSmsBody, currentElTaskDescription, currentElComment2020])

    const addNewDate = () => {
        setState((prevState) => {
            return {
                ...prevState,
                updatedAt: Math.round(new Date().getTime() / 1000)
            }
        })
        setSubmitData({ ...state, id: currentElement?.get('id'), updatedAt: Math.round(new Date().getTime() / 1000) })
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
        sendSMS(sms)
    }
    const finishedSubmit = async () => {
        const isConnected = await isNetworkAvailable()
        const data = { ...state, id: currentElement?.get('id'), responseDialog, needToDialog: false, needToSendSMS: false, crud: CRUD.DELETE }
        isConnected.isConnected ? setSubmitData(data) : showToastWithGravityAndOffset('No internet connect !!!');
        // clearSubmitData()
    };
    const editSubmit = async () => {
        const isConnected = await isNetworkAvailable()
        const data = { ...state, id: currentElement?.get('id') }
        isConnected.isConnected ? setSubmitData(data) : showToastWithGravityAndOffset('No internet connect !!!');
    }
    const showDetails = () => onDetailsPress(currentElement.get('id'))

    return (
        <>
            <View style={styles.container}>
                {currentElement && <TouchableOpacity
                    onPress={showDetails}
                    onLongPress={calling}
                    style={styles.textContainer}>
                    <View style={styles.nameLine}>
                        <Text numberOfLines={1} style={{ ...styles.text, maxWidth: 220 }}>{currentElement?.get('asanaDataType') ? currentElement?.get('taskName') : currentElement?.get('name')}</Text>
                        <Text style={styles.text}>{currentElement?.get('phone')}</Text>
                        {currentElement?.get('asanaDataType')
                            ? <Image style={{ width: 25, height: 25, marginRight: 5 }} source={require('../../../assets/asana.png')} />
                            : <Text style={{ ...styles.text, color: '#de471d', fontWeight: '700', marginRight: 5 }}>{currentElement?.get('searchType')}</Text>
                        }
                    </View>
                    <View style={styles.nameLine}>
                        <Text numberOfLines={1} style={{ ...styles.text, maxWidth: 200 }}>{currentElement?.get('email')}</Text>
                    </View>
                    <View style={styles.nameLine}>
                        <Text style={styles.text}>{getStringDate(new Date(currentElement?.get('updatedAt') * 1000))}</Text>
                        <View style={styles.dataType}>
                            {currentElement?.get('needToSendSMS') && <Image style={{ width: 25, height: 25 }} source={require('../../../assets/sms.png')} />}
                            {currentElement?.get('needToDialog') && <Image style={{ width: 25, height: 25, marginLeft: 5 }} source={require('../../../assets/phone-call.png')} />}
                        </View>
                    </View>
                </TouchableOpacity>}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={{ ...styles.textInput }}
                        placeholder='set new date'
                        value={getStringDate(new Date(state.updatedAt * 1000))}
                        editable={false}
                        // onChangeText={handleDateChange}
                    />
                    <View style={styles.dateButtons}>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={addNewDate}>
                            <Text style={styles.buttonText}>Set new date</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {isAsanaType && <>
                        <Text style={styles.label}>Task description</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={{ ...styles.textInput, width: '100%' }}
                                placeholder='enter task description'
                                value={state.taskDescription}
                                onEndEditing={editSubmit}
                                onChangeText={text => handleInputChange(text, 'taskDescription')}
                                multiline={true} />
                        </View>
                    </>}
                {isTeamType &&
                <>
                    <Text style={styles.label}>Details</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={{ ...styles.textInput, width: '100%' }}
                            placeholder='enter details'
                            value={state.details}
                            onEndEditing={editSubmit}
                            onChangeText={text => handleInputChange(text, 'details')}
                            multiline={true} />
                    </View>
                </>}
                {isBrokersType &&
                    <>
                        <Text style={styles.label}>Comment 2020</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={{ ...styles.textInput, width: '100%' }}
                                placeholder='comment 2020'
                                value={state.comment2020}
                                onEndEditing={editSubmit}
                                onChangeText={text => handleInputChange(text, 'comment2020')}
                                multiline={true} />
                        </View>
                    </>}
                <Text style={styles.label}>sms body</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={{ ...styles.textInput, width: '100%' }}
                        placeholder='sms body'
                        value={state.smsBody}
                        onEndEditing={editSubmit}
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
                        onPress={handleSendSms}>
                        <Text style={styles.buttonText}>Custom sms</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{ ...styles.button, ...styles.sendButton, backgroundColor: '#6993f5' }}
                        onPress={finishedSubmit}>
                        <Text style={styles.buttonText}>Finished</Text>
                    </TouchableOpacity>
                </View>
            </View>
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
    label: {
        color: 'black',
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
        paddingVertical: 5
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
        fontSize: 18
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