
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
}
@saga(DataEntity, ['getData', 'setSubmitData', 'clearSubmitData'])
class Signal extends React.Component<ISignalProps> {

    state = {
        internetConnect: false,
        currentItemIndex: 0,
        currentElement: this.props.dataItems && this.props.dataItems?.valueSeq()?.get(0),
        callDetector: undefined,
        callStates: [],
        isStart: false,
        listData: [],
        pause: false,
        responseDialog: null
    }

    getSignalData = async () => {
        const { getData, user } = this.props;
        const isConnected = await isNetworkAvailable();
        if (isConnected.isConnected) {
            try {
                getData({ pageName: 'signal', perPage: 100, filter: {forMobile: true}})
            } catch (error) {
                console.log('getSignalData_ERROR===', JSON.stringify(error))
            }

        }else {
            showToastWithGravityAndOffset('No internet connect !!!');
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
    setIsStart = (isStart: boolean) => {
        this.setState((prevState) => {
            return {
                ...prevState,
                isStart
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

    setNextElement = () => {
        const { dataItems } = this.props;
        const { currentItemIndex } = this.state;
        if (dataItems) {
            const arrLength = dataItems.size;
            const nextIndex = currentItemIndex < arrLength - 1 ? currentItemIndex + 1 : 0;
            const nextElement = dataItems?.valueSeq()?.get(nextIndex);
            this.setCurrentElement(nextElement);
            this.setCurrentItemIndex(nextIndex);
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
                console.log(e);
            }
        } else {
            console.log(
                'Sorry! You can’t get call logs in iOS devices because of the security concern',
            );
        }
    };

    sendDirectSms = async (data: {id: string, phone: string, smsBody: string} | null = null) => {
        const { dataItems } = this.props;
        let dataSmsArray = [];
        if (dataItems && dataItems.size > 0 && !data) {
        dataSmsArray = dataItems.valueSeq().filter(obj => obj.get('needToSendSMS'))?.toJS() || []
        }
        if (data) {
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
                    DirectSms.sendDirectSms(one.phone, one.smsBody);
                    this.props.setSubmitData({id: one.id, needToSendSMS: false})
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
        if (dataItems) {
            const arrLength = dataItems.size;
            const nextIndex = currentItemIndex < arrLength - 1 ? currentItemIndex + 1 : 0;
            nextElement = dataItems?.valueSeq()?.get(nextIndex);
        }
        if (nextElement && response && response['phoneNumber'] === currentElement?.get('phone') && response['duration'] === 0) {
            console.log('--------------------------------------------------------------------------------');
            console.log('event -> ', event, 'num -> ', num, 'response -> ', response);
            console.log('--------------------------------------------------------------------------------');
            console.log('currentElement -> ', currentElement);
            console.log('--------------------------------------------------------------------------------');
            this.setNextElement()
            setTimeout(() => this.makeCall(nextElement?.get('phone')), 8000)
        }
        if (nextElement && response && response['phoneNumber'] === currentElement?.get('phone') && response['duration'] > 0) {
            console.log('--------------------------------------------------------------------------------');
            console.log('event -> ', event, 'num -> ', num, 'response -> ', response);
            console.log('--------------------------------------------------------------------------------');
            console.log('currentElement -> ', currentElement);
            console.log('--------------------------------------------------------------------------------');
            this.setDialog(response)
        }
    }

    setDialog = (responseDialog: ICallLog) => {
        this.setState((prevState) => {
            return {
                ...prevState,
                responseDialog
            }
        })
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
                        console.log('event -> ',
                        event + (num ? ' - ' + num : ''));
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
            await DirectDial.createDial(num)
        } else {
            console.log('SMS permission denied');
        }
        // const args = {
        //     number: num,
        //     prompt: false
        // }
        // return call(args)
        //     .then((r: any) => {
        //         console.log('call', r)
        //         return r;
        //     })
        //     .catch((err: any) => {
        //         return err
        //     })
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
        this.setState((prevState) => {
            return {
                ...prevState,
                currentElement,
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
        const validUser = user && prevProps.user !== user && user?.token && user?.token?.length > 0 && !dataItems
        if (validUser) {
            this.getSignalData();
        }
        if (prevProps.dataItems !== dataItems) {
            const currentElement = dataItems && dataItems?.valueSeq()?.get(0);
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
        const { currentItemIndex, currentElement, responseDialog, pause } = this.state;
        const { dataItems, user, navigation, submitData, setSubmitData, clearSubmitData } = this.props;
        // clearSubmitData()
        let dataSmsArray = null;
        if (dataItems && dataItems.size > 0) {
            dataSmsArray = dataItems.filter(obj => obj.get('needToSendSMS'))
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
        if (!dataItems || dataItems.size === 0) {
            return (<View style={styles.loadContainer}>
                <Text style={{ ...styles.loadContainer, height: 100 }}>
                    <ActivityIndicator size='large' color='green' />
                </Text>
            </View>)
        }

        return (
            <View style={styles.container}>
                <View style={styles.viewContainer}>
                    <ContactList
                        currentItemIndex={currentItemIndex}
                        callData={dataItems}
                        setCurrentItemIndex={this.setCurrentItemIndex}
                        makeCall={this.makeCall}
                        setCurrentElement={this.setCurrentElement}
                    />
                    <ScrollView style={styles.container}>
                        <CustomInput
                        responseDialog={responseDialog}
                        submitData={submitData}
                        setSubmitData={setSubmitData}
                        clearSubmitData={clearSubmitData}
                        currentElement={currentElement}
                        makeCall={this.makeCall}
                        sendSMS={this.sendDirectSms}/>
                        <CallMenu
                            pause={pause}
                            pausePress={this.pausePress}
                            sendAllSMS={this.sendDirectSms}
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
        paddingTop: 5
    },
    container: {
        flex: 2
    },
    loadContainer: {
        display: 'flex',
        flexDirection: 'column',
        height: 270,
        justifyContent: 'center',
        alignItems: 'center'
    }
});

const mapStateToProps = (state: any) => {
    const dataItems = state.entities.get('signalData')
    const dataItems2 = state.entities.get('signalData')?.valueSeq().filter(item => item.get('needToDialog') || item.get('needToSendSMS')) || []
    console.log('dataItems222222=============================================', dataItems2)
    const user = state.identity.user || null
    const submitData = state.submitData.data || []
    return {
        dataItems,
        user,
        submitData
    };
}

export default connect(mapStateToProps, { ...DataEntity.actions })(Signal)
