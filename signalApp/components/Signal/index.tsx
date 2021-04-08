
import React from 'react';
import { StyleSheet, View, ScrollView, Text, TouchableOpacity, ActivityIndicator, PermissionsAndroid, Platform, NativeModules } from 'react-native';
import { connect } from 'react-redux';
import CallMenu from './CallMenu';
import CustomInput from './CustomInput';
import DataEntity, { ISingleDataItem } from '../../models/DataEntity';
import saga from '../../decoradors/saga';
import { EntityList } from '../../models/entity';
import ContactList from './ContactList';
import CallDetectorManager from 'react-native-call-detection';
import CallLogs from 'react-native-call-log';
import {isNetworkAvailable, showToastWithGravityAndOffset} from '../../utils';
const DirectSms = NativeModules.DirectSms;
const DirectDial = NativeModules.DirectDial;

export interface ICallLog {
    dateTime: string;
    duration: number;
    name: any;
    phoneNumber: string;
    rawType: number;
    timestamp: string;
    type: string;
}
interface ISignalProps {
    dataItems?: EntityList<ISingleDataItem>;
    user?: any;
    getData?: (data: any) => void;
    setSubmitData?: (data: any) => void;
    clearSubmitData?: () => void;
    navigation?: any;
    submitData: any;
    route?: any;
}
@saga(DataEntity, ['getData', 'setSubmitData', 'clearSubmitData'])
class Signal extends React.Component<ISignalProps> {

    state = {
        internetConnect: false,
        currentItemIndex: 0,
        currentElement: this.props.dataItems?.valueSeq()?.get(0),
        callDetector: undefined,
        callStates: [],
        isStart: false,
        listData: [],
        pause: false,
        responseDialog: null,
        isInternet: true,
        currentElementId: null
    }

    getSignalData = async () => {
        const isConnected = await isNetworkAvailable();
        if (isConnected.isConnected) {
            this.getDataSignal()
            this.setState((prevState) => {
                return {
                    ...prevState,
                    isInternet: true,
                }
            })
        }else {
            showToastWithGravityAndOffset('No internet connect !!!');
            this.setState((prevState) => {
                return {
                    ...prevState,
                    isInternet: false,
                }
            })
        }
        this.setState((prevState) => {
            return {
                ...prevState,
                internetConnect: isConnected.isConnected,
            }
        })
    }
    setCallStates = (callStates: any[]) => {
        this.setState((prevState) => {
            return {
                ...prevState,
                callStates
            }
        })
    }

    getDataSignal = () => {
        const { getData } = this.props;
        getData({ pageName: 'signal', perPage: 100, filter: {mobileInfo: ['needToDialog', 'needToSendSMS']}})
    }

    setIsStart = (isStart: boolean) => {
        this.setState((prevState) => {
            return {
                ...prevState,
                isStart
            }
        })
    }

    setPrevElement = () => {
        this.setState((prevState) => {
            return {
                ...prevState
            }
        })
    }

    setFlatListCallData = (listData: any[]) => {
        this.setState((prevState) => {
            return {
                ...prevState,
                listData
            }
        })
    }

    setNextElement = (nextElement, ind) => {
        const { dataItems } = this.props;
        const { currentItemIndex } = this.state;
        if (dataItems && !nextElement) {
            const nextInd = currentItemIndex < dataItems.size - 1 ? currentItemIndex + 1 : 0;
            const next = dataItems?.valueSeq()?.get(nextInd);
            this.setCurrentElement(next);
            this.setCurrentItemIndex(nextInd);

        }
        if (nextElement) {
            this.setCurrentElement(nextElement);
            this.setCurrentItemIndex(ind);
        }
    }

    fetchData = async () => {
        if (Platform.OS !== 'ios') {
            try {
                // Ask for runtime permission
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
                    {
                        title: 'Call Log Example',
                        message: 'Access your call logs',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    },
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    return CallLogs.load(1).then(lastCallArr => {
                        this.setFlatListCallData(lastCallArr);
                        return lastCallArr
                    });
                } else {
                    console.log('Call Log permission denied');
                }
            } catch (e) {
                console.log('fetchData_error=', e);
            }
        } else {
            console.log('Sorry! You can’t get call logs in iOS devices because of the security concern');
        }
    };

    sendDirectSms = async (data: {id: string, phone: string, smsBody: string} | null = null) => {
        const { dataItems } = this.props;
        let dataSmsArray = [];
        if (dataItems && dataItems.size > 0 && !data) {
        dataSmsArray = dataItems.valueSeq().filter(obj => obj.get('needToSendSMS'))?.toJS() || []
        }
        if (data && data.smsBody && data.smsBody.length > 0) {
            dataSmsArray = [{
                id: data.id,
                phone: data.phone,
                smsBody: data.smsBody
            }]
        }
        try {
            const grantedSendSms = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.SEND_SMS,
                {
                    title: 'YourProject App Sms Permission',
                    message:
                    'YourProject App needs access to your inbox ' +
                    'so you can send messages in background.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                },
            );
            const grantedReadSms = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.READ_SMS,
                    {
                        title: 'YourProject App Sms Permission',
                        message:
                        'YourProject App needs access to your inbox ' +
                        'so you can send messages in background.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    },
                );
            if (grantedSendSms === PermissionsAndroid.RESULTS.GRANTED && grantedReadSms === PermissionsAndroid.RESULTS.GRANTED && dataSmsArray.length > 0) {
                for await (const one of dataSmsArray) {
                    console.log('send_sms_to ', one.phone, one.smsBody)
                    console.log('--------------------------------------')
                    if (one.phone && (one.phone.length >= 8 && one.phone.length <= 12) && one.smsBody && one.smsBody.length > 0) {
                        DirectSms.sendDirectSms(one.phone, one.smsBody);
                        // this.props.setSubmitData({id: one.id, needToSendSMS: false})
                        this.props.setSubmitData(
                            {id: one.id, needToSendSMS: false, smsSend: {sendDate: Math.round(new Date().getTime() / 1000), phoneNumber: one.phone, smsBody: one.smsBody}})
                    } else {
                        showToastWithGravityAndOffset(`ERROR, incorrect number ${one.phone} or empty sms body`)
                    }
                }
                showToastWithGravityAndOffset(dataSmsArray.length > 1 ? 'All messages sent' : 'Message sent')
            } else {
                console.log('SMS permission denied');
            }
        } catch (err) {
            console.warn('SMS permission_ERROR', err);
        }
    }

    makeNextDialogLogic = (event: string, num: string, res: ICallLog[]) => {
        const { currentElement, currentItemIndex } = this.state;
        const { dataItems } = this.props;
        const response = res && res.length > 0 && res[0] || null;
        let nextElement = null;
        let ind = null;
        if (dataItems) {
            const arrLength = dataItems.size;
            const nextIndex = currentItemIndex < arrLength - 1 ? currentItemIndex + 1 : 0;
            let count = 0;
            const getNextEl = (i: number) => {
                const el = dataItems?.valueSeq()?.get(i)
                if (el.get('needToDialog') && currentElement.get('id') !== el.get('id')) {
                        count = 0;
                        return {el, i};
                    } else if (count <= arrLength) {
                        count = count + 1;
                        const nextInd = i < arrLength - 1 ? i + 1 : 0;
                        return getNextEl(nextInd)
                    }
            }
            const elem = getNextEl(nextIndex)
            nextElement = elem?.el;
            ind = elem?.i;

        }
        if (nextElement && response && response['phoneNumber'] === currentElement?.get('phone') && response['duration'] === 0) {
            console.log('--------------------------------------------------------------------------------');
            console.log('event -> ', event, 'num -> ', num, 'response -> ', response);
            console.log('--------------------------------------------------------------------------------');
            console.log('currentElementPhone -> ', currentElement.get('phone'));
            console.log('--------------------------------------------------------------------------------');
            this.setNextElement(nextElement, ind)
            setTimeout(() => this.makeCall(nextElement?.get('phone')), 10000)
        }
        if (nextElement && response && response['phoneNumber'] === currentElement?.get('phone') && response['duration'] > 0) {
            console.log('--------------------------------------------------------------------------------');
            console.log('event -> ', event, 'num -> ', num, 'response -> ', response);
            console.log('--------------------------------------------------------------------------------');
            console.log('currentElementPhone -> ', currentElement.get('phone'));
            console.log('--------------------------------------------------------------------------------');
            this.setDialog(response, currentElement?.get('id'))
        }
    }

    setDialog = (responseDialog: ICallLog, id: string) => {
        this.setState((prevState) => {
            return {
                ...prevState,
                responseDialog
            }
        })
        this.props.setSubmitData({id, responseDialog})
    }

    startStopListener = async () => {
        const { callStates, isStart} = this.state;
        let { callDetector } = this.state;
        if (isStart) {
            if (callDetector) {
                console.log('Phone_State_listener_Stop');
                callDetector.dispose();
            }
        } else {
            console.log('Phone_State_listener_Start');
            callDetector = new CallDetectorManager(
                async (event: string, num: string) => {
                    const updatedCallStates = callStates;
                    updatedCallStates.push({
                        event,
                        num
                    });
                    this.setCallStates(updatedCallStates);
                    if (event === 'Disconnected') {
                        const res = await this.fetchData();
                        if (res && res.length > 0 && res[0]['type'] === 'OUTGOING') {
                            this.makeNextDialogLogic(event, num, res);
                        }
                    } else if (event === 'Connected') {
                    console.log('event -> ',
                    event + (num ? ' - ' + num : ''));
                    } else if (event === 'Incoming') {
                        console.log('event -> ',
                        event + (num ? ' - ' + num : ''));
                    } else if (event === 'Dialing') {
                        console.log('event -> ',
                        event + (num ? ' - ' + num : ''));
                    } else if (event === 'Offhook') {
                        console.log('event -> ',
                        event + (num ? ' - ' + num : ''));
                    } else if (event === 'Missed') {
                        const res = await this.fetchData();
                        if (res && res.length > 0 && res[0]['type'] === 'OUTGOING') {
                            this.makeNextDialogLogic(event, num, res);
                        }
                    }
                },
                true, // To detect incoming calls [ANDROID]
                () => {
                    // If your permission got denied [ANDROID]
                    // Only if you want to read incoming number
                    // Default: console.error'
                },
                {
                    title: 'Phone State Permission',
                    message:
                        'This app needs access to your phone state in order to react and/or to adapt to incoming calls.',
                },
            );
        }
        this.setIsStart(!isStart);
    };

    makeCall = async (num: string, pause: boolean | string = this.state.pause) => {
        this.setState((prevState) => {
            return {
                ...prevState,
                responseDialog: null
            }
        })
        let currentPause = this.state.pause
        if (pause === 'disable') {
            this.pausePress(false);
            currentPause = false;
        }
        const grantedCall = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CALL_PHONE,
                {
                    title: 'Your project app dialog permission',
                    message:
                    'YourProject App needs access to dialog your phone ' +
                    'so you can dialog in background.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                },
            );
        const grantedLog = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
            {
                title: 'Call Log Example',
                message: 'Access your call logs',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
            },
        );
        if (grantedCall === PermissionsAndroid.RESULTS.GRANTED && grantedLog === PermissionsAndroid.RESULTS.GRANTED && !currentPause) {
            if (num && (num.length >= 8 && num.length <= 12)) {
                const res = await DirectDial.createDial(num)
                return Promise.resolve(res)
            } else {
                showToastWithGravityAndOffset(`Error, incorrect number : ${num}`)
            }
        } else {
            console.log('SMS permission denied');
        }
    }

    setCurrentItemIndex = (currentItemIndex: number) => {
        this.setState((prevState) => {
            return {
                ...prevState,
                currentItemIndex
            }
        })
    }

    setCurrentElement = (currentElement: ISingleDataItem) => {
        const currentElementId = currentElement?.get('id')
        this.setState((prevState) => {
            return {
                ...prevState,
                currentElement,
                currentElementId
            }
        })
    }

    componentDidMount() {
        const { user } = this.props;
        this.startStopListener();
        const validUser = user && user?.token && user?.token?.length > 0;
        if (validUser) {
            this.getSignalData();
        }
    }

    componentWillUnmount() {
        this.startStopListener();
    }

    componentDidUpdate(prevProps: any) {
        const { user, dataItems } = this.props
        let currentElement = this.state.currentElement
        if (this.state.currentElementId) {
            currentElement = dataItems?.get(this.state.currentElementId);
        } else if (currentElement) {
            currentElement = currentElement
        } else {
            currentElement = this.props.dataItems?.valueSeq()?.get(0)
        }
        const validUser = user && prevProps.user !== user && user?.token && user?.token?.length > 0 && !dataItems
        if (validUser) {
            this.getSignalData();
        }
        if (prevProps.dataItems !== dataItems) {
            this.setState((prevState) => {
                return {
                    ...prevState,
                    currentElement
                }
            });
        }
    }

    pausePress = (pause: boolean = !this.state.pause) => {
        this.setState({
            pause
        })
    }

    render() {
        const { currentItemIndex, currentElement, responseDialog, pause, isInternet } = this.state;
        const { dataItems, user, navigation, submitData, setSubmitData, clearSubmitData } = this.props;
        // clearSubmitData()
        let dataSmsArray = null;
        if (dataItems && dataItems.size > 0) {
            dataSmsArray = dataItems.filter(obj => obj.get('needToSendSMS') && obj.get('smsBody') && obj.get('smsBody').length > 0)
        }
        const validUser = user && user?.token && user?.token?.length > 0;
        if (!validUser && navigation) {
            navigation.navigate('Login');
        }
        const onLoginPress = () => {
            if (navigation) {
                navigation.navigate('Login')
            } else {
                console.log('onLoginPress_error')
            }
        }
        const onDetailsPress = (id: string) => {
            if (navigation) {
                navigation.navigate('Details', {id})
            } else {
                console.log('onLoginPress_error')
            }
        }
        if (!validUser) {
            return (
                <View style={styles.loadContainer}>
                    <View style={{ ...styles.loadContainer, height: 100 }}>
                        <Text style={{ fontSize: 22, fontWeight: '600' }}>Only register user</Text>
                        <TouchableOpacity
                            activeOpacity={0.5}
                            style={{}}
                            onPress={onLoginPress}>
                            <Text style={{ color: '#62aee5', fontSize: 20, marginTop: 30 }}>Go to login</Text>
                        </TouchableOpacity>
                    </View>
                </View>)
        }
        // if ((!dataItems || dataItems.size === 0) && isInternet) {
        //     return (<View style={styles.loadContainer}>
        //         <View style={{ ...styles.loadContainer, height: 200 }}>
        //             <ActivityIndicator size='large' color='green' />
        //             <TouchableOpacity
        //                     activeOpacity={0.5}
        //                     style={{marginTop: 20}}
        //                     onPress={this.getSignalData}>
        //                     <Text style={{ color: '#bf0416', fontSize: 20, marginTop: 30, padding: 20, borderRadius: 20, backgroundColor: '#fc9fa8' }}>No data to download, click to try again</Text>
        //             </TouchableOpacity>
        //         </View>
        //     </View>)
        // }
        if (!isInternet) {
            return (<View style={styles.loadContainer}>
                <View style={{ ...styles.loadContainer, height: 200 }}>
                    <ActivityIndicator size='large' color='green' />
                    <TouchableOpacity
                            activeOpacity={0.5}
                            style={{marginTop: 20}}
                            onPress={this.getSignalData}>
                            <Text style={{ color: '#bf0416', fontSize: 20, marginTop: 30, padding: 20, borderRadius: 20, backgroundColor: '#fc9fa8' }}>No internet connection, click to try again</Text>
                    </TouchableOpacity>
                </View>
            </View>)
        }

        return (
            <View style={styles.container}>
                <View style={styles.viewContainer}>
                    <ContactList
                        currentElement={currentElement}
                        currentItemIndex={currentItemIndex}
                        callData={dataItems}
                        setCurrentItemIndex={this.setCurrentItemIndex}
                        makeCall={this.makeCall}
                        setCurrentElement={this.setCurrentElement}
                    />
                    <ScrollView style={styles.container}>
                        <CustomInput
                        dataItems={dataItems}
                        setNextElement={this.setNextElement}
                        onDetailsPress={onDetailsPress}
                        responseDialog={responseDialog}
                        submitData={submitData}
                        setSubmitData={setSubmitData}
                        clearSubmitData={clearSubmitData}
                        currentElement={currentElement}
                        makeCall={this.makeCall}
                        sendSMS={this.sendDirectSms}/>
                        <CallMenu
                            pause={pause}
                            getData={this.props.getData}
                            getDataSignal={this.getDataSignal}
                            pausePress={this.pausePress}
                            sendAllSMS={this.sendDirectSms}
                            currentElement={currentElement}
                            dataSmsArray={dataSmsArray}
                            setCurrentItemIndex={this.setCurrentItemIndex}
                            currentItemIndex={currentItemIndex}
                            callData={dataItems}
                            setCurrentElement={this.setCurrentElement}
                            makeCall={this.makeCall}
                        />
                    </ScrollView>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    viewContainer: {
        flex: 1,
        backgroundColor: '#47f56a',
        paddingHorizontal: 5,
        paddingVertical: 5
    },
    container: {
        flex: 2
    },
    loadContainer: {
        display: 'flex',
        flexDirection: 'column',
        height: 700,
        justifyContent: 'center',
        alignItems: 'center'
    }
});

const mapStateToProps = (state: any) => {
    const dataItems = state.entities.get('signalData')?.sort() || null;
    const user = state.identity.user || null
    const submitData = state.submitData.data || []
    return {
        dataItems,
        user,
        submitData
    };
}

export default connect(mapStateToProps, { ...DataEntity.actions })(Signal)
