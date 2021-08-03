
import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, TextInput } from 'react-native';
import { showToastWithGravityAndOffset } from 'signalApp/utils';
import { ISingleDataItem } from '../../models/DataEntity';
import { EntityList } from '../../models/entity';
import ModalDialog from '../Dialog';
interface ICallMenuProps {
    setCurrentItemIndex: (currentItemIndex: number) => void;
    currentItemIndex: number;
    callData: EntityList<ISingleDataItem> | undefined;
    makeCall: (phone: string, pauseDisable: string) => Promise<any>;
    setCurrentElement: (currentElement: ISingleDataItem) => void;
    sendAllSMS: () => void;
    dataSmsArray: any;
    pausePress: (pause?: boolean) => void;
    pause: boolean;
    getDataSignal?: () => void;
    currentElement: ISingleDataItem;
    getData?: (data: any) => void;
    messagesUpload?: boolean;
    submitData: any;
}
interface ICallMenuState {
    callStart: boolean;
    mobileSearch: string;
}

const CallMenu = (props: ICallMenuProps) => {
    const { setCurrentItemIndex, currentItemIndex, callData, makeCall, setCurrentElement, dataSmsArray, sendAllSMS, pausePress,
            pause, getDataSignal, currentElement, getData, messagesUpload, submitData } = props;
    const [sendAllSMSVisible, setSendAllSMSVisible] = useState(false)


    const [state, setState] = useState<ICallMenuState>({
        callStart: false,
        mobileSearch: ''
    })

    const calling = () => currentElement && makeCall(currentElement?.get('phone'), 'disable')

    const handleNextPress = async () => {
        if (callData && currentItemIndex < callData?.size - 1) {
            const phone = callData?.valueSeq()?.getIn([currentItemIndex + 1, 'phone'])
            const element = callData?.valueSeq()?.get(currentItemIndex + 1)
            const res = await makeCall(phone, 'disable')
            if (res) {
                setState((prevState) => {
                    return {
                        ...prevState,
                        callStart: res
                    }
                })
            }
            setCurrentItemIndex(currentItemIndex + 1)
            setCurrentElement(element)
        } else {
            if (callData) {
                const phone = callData?.valueSeq()?.getIn([0, 'phone'])
                const element = callData?.valueSeq()?.get(0)
                const res = await makeCall(phone, 'disable')
                if (res) {
                    setState((prevState) => {
                        return {
                            ...prevState,
                            callStart: res
                        }
                    })
                }
                setCurrentItemIndex(0)
                setCurrentElement(element)
            }
        }
    }

    const handlePausePress = () => pausePress()
    const handleContinuePress = () => {
        if (callData) {
            const phone = callData?.valueSeq()?.getIn([currentItemIndex, 'phone'])
            pausePress(false)
            makeCall(phone, 'disable')
        }
    }
    const handleSendAllSMS = () => sendAllSMS()

    const showDialog = (dialogKey: string) => {
        if (dialogKey === 'sendAllSMS') {
            setSendAllSMSVisible(true);
        }
    };

    const handleCancel = (dialogKey: string) => {
        if (dialogKey === 'sendAllSMS') {
            setSendAllSMSVisible(false);
        }
    };

    const handleConfirm = async (dialogKey: string) => {
        if (dialogKey === 'sendAllSMS') {
            handleSendAllSMS();
            setSendAllSMSVisible(false);
        }
    };

    const handleInputSearch = (text: string) => {
        setState((prevState) => {
            return {
                ...prevState,
                mobileSearch: text,
            }
        });
    }
    const handleSearchPress = () => {
        if (state.mobileSearch && state.mobileSearch.length >= 5 && state.mobileSearch.length <= 20) {
            const mobileSearch = state.mobileSearch.trim();
            const data = { pageName: 'signal', perPage: 20, filter: {mobileSearch}};
            getData(data);
            setState((prevState) => {
                return {
                    ...prevState,
                    mobileSearch: '',
                }
            });
        }
        if (state.mobileSearch.length < 5) {
            showToastWithGravityAndOffset ('Min 5 digits')
        }
        if (state.mobileSearch.length > 11) {
            showToastWithGravityAndOffset ('Max 20 digits')
        }
    }

    const isSMSCount = callData?.filter(obj => obj.get('needToSendSMS'));
    const isDialCount = callData?.filter(obj => obj.get('needToDialog'));
    const isAllCount = callData?.filter(obj => obj.get('needToDialog') || obj.get('needToSendSMS'));
    const isValidPhones = callData?.filter(obj => obj.get('phone') && (obj.get('phone').length >= 9));
    const isValidSMS = callData?.filter(obj => obj.get('needToSendSMS') && obj.get('smsBody') && obj.get('smsBody').length > 0 && obj.get('smsBody').length < 900 && obj.get('phone') && (obj.get('phone').length >= 9));
    let countSms = 0;
    if (isSMSCount && isValidSMS) {
        countSms = isSMSCount?.size - isValidSMS?.size;
    }
    let phoneCount = 0;
    if (isAllCount && isValidPhones) {
        const tempPhoneCount = isAllCount?.size - isValidPhones?.size;
        phoneCount = tempPhoneCount >= 0 ? tempPhoneCount : 0
    }
    const dialogDescription = `You confirm the sending of messages ? ${isValidSMS?.size} SMS will be sent. ${countSms && countSms > 0 ? countSms === 1 ? countSms + ' message' + ' have incorrect number format or message body' : countSms + ' messages' + ' have incorrect number format or message body' : ''}`

    return (
        <>
            <View style={styles.wrapper}>
                <View style={styles.container}>
                    <View style={styles.textBlock}>
                        <Text style={{marginBottom: 2, color: isSMSCount?.size > 0 ? 'green' : 'black'}}>{`Need send ${isSMSCount?.size || 0} sms`}</Text>
                        <Text style={{marginBottom: 2, color: countSms > 0 ? 'red' : 'black'}}>{`${countSms || 0} sms have incorrect number format or empty sms body`}</Text>
                        <Text style={{marginBottom: 2, color: isDialCount?.size > 0 ? 'green' : 'black'}}>{`Need to make ${isDialCount?.size || 0} calls`}</Text>
                        <Text style={{color: phoneCount > 0 ? 'red' : 'black'}}>{`${phoneCount || 0} items have incorrect number format`}</Text>
                        {submitData && submitData.data && submitData.data.length > 0 &&
                        (<Text style={{color: 'red'}}>{`${submitData.data.length} server request${submitData.data.length > 1 ? 's' : ''} failed, check your internet connection`}</Text>)
                        }
                        <TouchableOpacity
                            style={{ ...styles.button, maxWidth: 100, marginTop: 5 }}
                            onPress={getDataSignal}>
                            <Text style={{ ...styles.buttonText, marginTop: 5 }}>Reload data</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.buttonsBlock}>
                        <TouchableOpacity
                            style={currentElement ? { ...styles.button,  backgroundColor: '#147d46', borderColor: '#147d46', marginTop: 1, marginBottom: 15 }
                                : { ...styles.button, marginTop: 1, marginBottom: 15, ...styles.disabled }
                            }
                            onPress={calling}
                            disabled={!currentElement}
                        >
                            <View style={{ width: '100%', paddingHorizontal: 20, paddingVertical: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around'}}>
                            <Text style={{ marginRight: 5, color: 'white', fontSize: 20, fontWeight: '700', letterSpacing: 2}}>Call</Text>
                            <Image style={{ width: 40, height: 40 }}
                            source={require('../../../assets/phone_call_4.png')}
                            />
                            </View>
                            {/* <Text style={{ ...styles.buttonText, marginTop: 5 }}>{!pause ? 'Pause' : 'Continue'}</Text> */}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={currentElement ? { ...styles.button, backgroundColor: '#147d46', borderColor: '#147d46', marginBottom: 15, marginTop: 5 }
                                : { ...styles.button, marginBottom: 15, marginTop: 5, ...styles.disabled }
                            }
                            onPress={handleNextPress}
                            disabled={!currentElement}
                        >
                            <View style={{width: '100%', paddingHorizontal: 20, paddingVertical: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around'}}>
                            <Text style={{ marginRight: 5, color: 'black', fontSize: 20, fontWeight: '700', letterSpacing: 2}}>Next</Text>
                            <Image style={{ width: 35, height: 35 }}
                            source={require('../../../assets/next_call.png')}
                            />
                            </View>
                            {/* <Text style={styles.buttonText}>Next <Image style={{ width: 15, height: 15 }} source={require('../../../assets/phone-volume-solid.png')} /></Text> */}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={(dataSmsArray && dataSmsArray?.size > 0 && !messagesUpload)
                                ? { ...styles.button, paddingVertical: 3, paddingTop: 4 }
                                : { ...styles.button, paddingVertical: 3, ...styles.disabled }}
                            disabled={!dataSmsArray || dataSmsArray?.size === 0 || messagesUpload ? true : false}
                            onPress={() => showDialog('sendAllSMS')}>
                            <Text style={styles.buttonText}>{`Send all sms: ${isSMSCount?.size || 0}`}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={{ ...styles.textInput, width: '100%' }}
                        autoCorrect={false}
                        maxLength={20}
                        placeholder='Phone or email search'
                        value={state.mobileSearch}
                        onChangeText={text => handleInputSearch(text)}
                        multiline={true}
                    />
                    <TouchableOpacity
                        style={{width: '20%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}
                        onPress={handleSearchPress}
                        disabled={!currentElement}>
                        <Image style={{ width: 20, height: 20, padding: 10, backgroundColor: 'white' }}  source={require('../../../assets/search.png')} />
                    </TouchableOpacity>
                </View>
            </View>
            <ModalDialog
                handleCancel={handleCancel}
                handleConfirm={handleConfirm}
                wrong={countSms > 0 ? true : false}
                dialogKey='sendAllSMS'
                visible={sendAllSMSVisible}
                title={countSms > 0 ? 'Not all sms will be sent' : 'Send all sms'}
                description={dialogDescription}
                confirmButtonText='Send'
            />
        </>
    );
}



const styles = StyleSheet.create({
    button: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#1f6b4e',
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#1f6b4e'
    },
    inputContainer: {
        display: 'flex',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        marginTop: 12,
    },
    textInput: {
        borderStyle: 'solid',
        paddingVertical: 5,
        marginBottom: 5,
        maxWidth: '80%',
        borderBottomWidth: 2,
        borderBottomColor: 'lightgrey',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        paddingBottom: 8,
        paddingTop: 3
    },
    container: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',

    },
    textBlock: {
        display: 'flex',
        width: '60%',
    },
    buttonsBlock: {
        display: 'flex',
        flexDirection: 'column',
        width: '40%',
    },
    wrapper: {
        display: 'flex',
        backgroundColor: '#f7faf7',
        flexDirection: 'column',
        marginTop: 5,
        borderColor: '#a5a8a5',
        borderWidth: 2,
        padding: 5,
        borderRadius: 10,
        marginBottom: 10,
        width: '100%',
    },
    disabled: {
        backgroundColor: 'gray',
        borderColor: 'gray'
    }
});

export default CallMenu;