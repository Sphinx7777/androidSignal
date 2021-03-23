import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { ISingleDataItem } from '../../models/DataEntity';
import { EntityList } from '../../models/entity';
interface ICallMenuProps {
    setCurrentItemIndex: (currentItemIndex: number) => void;
    currentItemIndex: number;
    callData: EntityList<ISingleDataItem> | undefined;
    makeCall: (phone: string) => Promise<any>;
    setCurrentElement: (currentElement: ISingleDataItem) => void;
    sendAllSMS: () => void;
    dataSmsArray: any;
    pausePress: (pause?: boolean) => void;
    pause: boolean;
}
interface ICallMenuState {
    callStart: boolean;
}
const CallMenu = (props: ICallMenuProps) => {
    const { setCurrentItemIndex, currentItemIndex, callData, makeCall, setCurrentElement, dataSmsArray, sendAllSMS, pausePress, pause } = props;

    const [state, setState] = useState<ICallMenuState>({
        callStart: false
    })

    const handleNextPress = async () => {
        if (callData && currentItemIndex < callData?.size - 1) {
            const phone = callData?.valueSeq()?.getIn([currentItemIndex + 1, 'phone'])
            const element = callData?.valueSeq()?.get(currentItemIndex + 1)
            const res = await makeCall(phone)
            if (res) {
                setState((prevState) => {
                    return {
                        ...prevState,
                        callStart: res
                    }
                })
                setCurrentItemIndex(currentItemIndex + 1)
                setCurrentElement(element)
            }
        } else {
            if (callData) {
                const phone = callData?.valueSeq()?.getIn([0, 'phone'])
                const element = callData?.valueSeq()?.get(0)
                const res = await makeCall(phone)
                if (res) {
                    setState((prevState) => {
                        return {
                            ...prevState,
                            callStart: res
                        }
                    })
                    setCurrentItemIndex(0)
                    setCurrentElement(element)
                }
            }
        }
    }

    const handlePausePress = () => pausePress()
    const handleContinuePress = () => {
        if (callData) {
            const phone = callData?.valueSeq()?.getIn([currentItemIndex, 'phone'])
            pausePress(false)
            makeCall(phone)
        }
    }

    return (
        <>
            <View style={styles.container}>
                <View style={styles.textBlock}>
                    <Text>Info block</Text>
                    <Text>Info block</Text>
                    <Text>Info block</Text>
                    <Text>Info block</Text>
                </View>
                <View style={styles.buttonsBlock}>
                    <TouchableOpacity
                        style={{ ...styles.button, marginTop: 1, marginBottom: 5 }}
                        onPress={!pause ? handlePausePress : handleContinuePress}
                    >
                        <Text style={{...styles.buttonText, marginTop: 5}}>{!pause ? 'Pause' : 'Continue'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{ ...styles.button, marginBottom: 1, marginTop: 5, paddingVertical: 2 }}
                        onPress={handleNextPress}
                    >
                        <Text style={styles.buttonText}>Next <Image style={{width: 20, height: 20}} source={require('../../../assets/phone-volume-solid.png')} /></Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{ ...styles.button, marginBottom: 1, marginTop: 10, paddingVertical: 2 }}
                        // style={(dataSmsArray)
                        //     ? { ...styles.button, ...styles.sendButton }
                        //     : { ...styles.button, ...styles.sendButton, ...styles.disabled }}
                        disabled={dataSmsArray ? false : true}
                        onPress={sendAllSMS}>
                        <Text style={styles.buttonText}>Send all sms</Text>
                    </TouchableOpacity>
                </View>
            </View>
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
        paddingHorizontal: 10,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#1f6b4e'
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        paddingBottom: 8,
        paddingTop: 3
    },
    container: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 5,
        borderColor: '#a5a8a5',
        backgroundColor: '#f7faf7',
        borderWidth: 2,
        padding: 5,
        borderRadius: 10
    },
    textBlock: {
        display: 'flex',
        width: '65%',
    },
    buttonsBlock: {
        display: 'flex',
        width: '35%',
    },
});

export default CallMenu;