
import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, TextInput } from 'react-native';
import { showToastWithGravityAndOffset } from 'signalApp/utils';
import { ISingleDataItem } from '../../models/DataEntity';
import { EntityList } from '../../models/entity';
import ModalDialog from '../Dialog';
import { count } from 'sms-length';
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
}
interface ICallMenuState {
    callStart: boolean;
    mobileSearch: string;
}

const CallMenu = (props: ICallMenuProps) => {
    const { setCurrentItemIndex, currentItemIndex, callData, makeCall, setCurrentElement, dataSmsArray, sendAllSMS, pausePress,
            pause, getDataSignal, currentElement, getData } = props;
    const [sendAllSMSVisible, setSendAllSMSVisible] = useState(false)


    const [state, setState] = useState<ICallMenuState>({
        callStart: false,
        mobileSearch: ''
    })

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
    const isValidPhones = callData?.filter(obj => obj.get('phone') && (obj.get('phone').length >= 8 && obj.get('phone').length <= 13));
    const isValidSMS = callData?.filter(obj => obj.get('needToSendSMS') && obj.get('smsBody') && obj.get('smsBody').length > 0 && obj.get('smsBody').length < count(obj.get('smsBody')).characterPerMessage && obj.get('phone') && (obj.get('phone').length >= 8 && obj.get('phone').length <= 13));
    let countSms = 0;
    if (isSMSCount && isValidSMS) {
        countSms = isSMSCount?.size - isValidSMS?.size;
    }
    let phoneCount = 0;
    if (isAllCount && isValidPhones) {
        const tempPhoneCount = isAllCount?.size - isValidPhones?.size;
        phoneCount = tempPhoneCount >= 0 ? tempPhoneCount : 0
    }
    const dialogDescription = `You confirm the sending of all messages ? ${isValidSMS?.size} SMS will be sent. ${countSms && countSms > 0 ? countSms === 1 ? countSms + ' message' + ' have incorrect number format or empty message body' : countSms + ' messages' + ' have incorrect number format or empty message body' : ''}`

    return (
        <>
            <View style={styles.wrapper}>
                <View style={styles.container}>
                    <View style={styles.textBlock}>
                        <Text style={{marginBottom: 2, color: isSMSCount?.size > 0 ? 'green' : 'black'}}>{`Need send ${isSMSCount?.size || 0} sms`}</Text>
                        <Text style={{marginBottom: 2, color: countSms > 0 ? 'red' : 'black'}}>{`${countSms || 0} sms have incorrect number format or wrong sms length for 1 msg`}</Text>
                        <Text style={{marginBottom: 2, color: isDialCount?.size > 0 ? 'green' : 'black'}}>{`Need to make ${isDialCount?.size || 0} calls`}</Text>
                        <Text style={{color: phoneCount > 0 ? 'red' : 'black'}}>{`${phoneCount || 0} items have incorrect number format`}</Text>
                        <TouchableOpacity
                            style={{ ...styles.button, maxWidth: 100, marginTop: 5 }}
                            onPress={getDataSignal}>
                            <Text style={{ ...styles.buttonText, marginTop: 5 }}>Reload data</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.buttonsBlock}>
                        <TouchableOpacity
                            style={currentElement ? { ...styles.button, marginTop: 1, marginBottom: 15 }
                                : { ...styles.button, marginTop: 1, marginBottom: 15, ...styles.disabled }
                            }
                            onPress={!pause ? handlePausePress : handleContinuePress}
                            disabled={!currentElement}
                        >
                            <Text style={{ ...styles.buttonText, marginTop: 5 }}>{!pause ? 'Pause' : 'Continue'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={currentElement ? { ...styles.button, marginBottom: 15, paddingVertical: 3 }
                                : { ...styles.button, marginBottom: 15, paddingVertical: 3, ...styles.disabled }
                            }
                            onPress={handleNextPress}
                            disabled={!currentElement}
                        >
                            <Text style={styles.buttonText}>Next <Image style={{ width: 15, height: 15 }} source={require('../../../assets/phone-volume-solid.png')} /></Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={(dataSmsArray && dataSmsArray?.size > 0)
                                ? { ...styles.button, paddingVertical: 3 }
                                : { ...styles.button, paddingVertical: 3, ...styles.disabled }}
                            disabled={!dataSmsArray || dataSmsArray?.size === 0 ? true : false}
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
                        <Image style={{ width: 20, height: 20, padding: 10 }} source={require('../../../assets/search.png')} />
                    </TouchableOpacity>
                </View>
            </View>
            <ModalDialog
                handleCancel={handleCancel}
                handleConfirm={handleConfirm}
                dialogKey='sendAllSMS'
                visible={sendAllSMSVisible}
                title='Send all sms'
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