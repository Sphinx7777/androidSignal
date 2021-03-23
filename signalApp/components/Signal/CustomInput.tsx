import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image } from 'react-native';
// import { useDispatch } from 'react-redux';
import { ISingleDataItem } from '../../models/DataEntity';
import { getStringDate, NetworkUtils } from '../../utils';


interface ICustomInputProps {
    currentElement: ISingleDataItem | undefined;
    makeCall: (num: string, pauseDisable: string) => Promise<any>;
    sendSMS: (data: { phone: string, smsBody: string }) => void;
    setSubmitData: (data: any) => void;
    clearSubmitData: () => void;
    submitData: any;
}
interface ICustomInputState {
    date: number;
    details: string | undefined;
    smsBody: string;
}
const CustomInput = (props: ICustomInputProps) => {
    const { currentElement, makeCall, sendSMS, setSubmitData, clearSubmitData, submitData } = props;
    const currentElDate = currentElement ? currentElement?.get('date') : null;
    const currentElDetails = currentElement?.get('details') ? currentElement?.get('details') : '';
    const currentElSmsBody = currentElement?.get('smsBody') ? currentElement?.get('smsBody') : '';

    const [state, setState] = useState<ICustomInputState>({
        date: currentElDate,
        details: currentElDetails,
        smsBody: currentElSmsBody
    })

    const cancelDate = () => {
        setState((prevState) => {
            return {
                ...prevState,
                date: currentElDate
            }
        })
    }

    useEffect(() => {
        setState((prevState) => {
            return {
                ...prevState,
                date: currentElDate,
                details: currentElDetails,
                smsBody: currentElSmsBody
            }
        })
    }, [currentElDate, currentElDetails, currentElSmsBody])

    const addNewDate = () => {
        setState((prevState) => {
            return {
                ...prevState,
                date: Math.round(new Date().getTime() / 1000)
            }
        })
    }

    const calling = () => currentElement && makeCall(currentElement?.get('phone'), 'disable')

    // const handleDateChange = (data: string) => {
    //     setState((prevState) => {
    //         return {
    //             ...prevState,
    //             date: data
    //         }
    //     })
    // }
    const handleDetailsChange = (details: string) => {
        setState((prevState) => {
            return {
                ...prevState,
                details
            }
        })
    }
    const cancelDetails = () => {
        setState((prevState) => {
            return {
                ...prevState,
                details: currentElDetails
            }
        })
    }

    const handleSMSChange = (smsBody: string) => {
        setState((prevState) => {
            return {
                ...prevState,
                smsBody
            }
        })
    }
    const cancelSMSBody = () => {
        setState((prevState) => {
            return {
                ...prevState,
                smsBody: currentElSmsBody
            }
        })
    }

    const handleSendSms = () => {
        const sms = {
            phone: currentElement?.get('phone'),
            smsBody: state.smsBody
        }
        sendSMS(sms)
    }
    const submit = async () => {
        const isConnected = await NetworkUtils.isNetworkAvailable()
        console.log('isConnected', isConnected)
        const data = { ...state, id: currentElement?.get('id') }
        if (state.smsBody.length === 0) {
            data.smsBody = null
        }
        setSubmitData(data)
        // clearSubmitData()
    };
    const cancelDetailsDis = currentElDetails === state.details
    const cancelSMSDis = currentElSmsBody === state.smsBody
    const cancelDateDis = currentElDate === state.date
    return (
        <>
            <View style={styles.container}>
                {currentElement && <TouchableOpacity
                    onLongPress={calling}
                    style={styles.textContainer}>
                    <View style={styles.nameLine}>
                        <Text style={styles.text}>{currentElement?.get('name')}</Text>
                        <Text style={styles.text}>{currentElement?.get('phone')}</Text>
                        {currentElement?.get('dbType') === 'asana'
                            ? <Image style={{ width: 25, height: 25, marginRight: 5 }} source={require('../../../assets/asana.png')} />
                            : <Text style={{ ...styles.text, color: '#de471d', fontWeight: '700', marginRight: 5 }}>{currentElement?.get('dbType')}</Text>
                        }
                    </View>
                    <View style={styles.nameLine}>
                        <Text style={styles.text}>{currentElement?.get('email')}</Text>
                    </View>
                    <View style={styles.nameLine}>
                        <Text style={styles.text}>{getStringDate(new Date(currentElement?.get('date') * 1000))}</Text>
                        <Text style={styles.text}>Calling Status</Text>
                    </View>
                </TouchableOpacity>}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={{ ...styles.textInput, ...styles.dateInput }}
                        placeholder='set date'
                        value={getStringDate(new Date(state.date * 1000))}
                        editable={false}
                    // onChangeText={handleDateChange}
                    />
                    <View style={styles.dateButtons}>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={addNewDate}>
                            <Text style={styles.buttonText}>Set date</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={!cancelDateDis
                                ? { ...styles.button, marginLeft: 5 }
                                : { ...styles.button, ...styles.disabled, marginLeft: 5 }}
                            disabled={cancelDateDis}
                            onPress={cancelDate}>
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <Text style={styles.label}>details</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.textInput}
                        placeholder='enter details'
                        value={state.details}
                        onChangeText={handleDetailsChange}
                        multiline={true}
                    />
                    <View style={styles.detailsButtons}>
                        <TouchableOpacity
                            style={!cancelDetailsDis
                                ? styles.button
                                : { ...styles.button, ...styles.disabled }}
                            disabled={cancelDetailsDis}
                            onPress={cancelDetails}>
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <Text style={styles.label}>sms body</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.textInput}
                        placeholder='sms body'
                        value={state.smsBody}
                        onChangeText={handleSMSChange}
                        multiline={true}
                    />
                    <View style={styles.detailsButtons}>
                        <TouchableOpacity
                            style={!cancelSMSDis
                                ? styles.button
                                : { ...styles.button, ...styles.disabled }}
                            disabled={cancelSMSDis}
                            onPress={cancelSMSBody}>
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.sendButtonContainer}>
                    <TouchableOpacity
                        style={(state.smsBody.length !== 0)
                            ? { ...styles.button, ...styles.sendButton }
                            : { ...styles.button, ...styles.sendButton, ...styles.disabled }}
                        disabled={state.smsBody.length === 0}
                        onPress={handleSendSms}>
                        <Text style={styles.buttonText}>Send sms</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={(!cancelDetailsDis || !cancelDateDis)
                            ? { ...styles.button, ...styles.sendButton }
                            : { ...styles.button, ...styles.sendButton, ...styles.disabled }}
                        disabled={(cancelDateDis && cancelDetailsDis)}
                        onPress={submit}>
                        <Text style={styles.buttonText}> Submit </Text>
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
        width: '70%',
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
        width: 85,
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