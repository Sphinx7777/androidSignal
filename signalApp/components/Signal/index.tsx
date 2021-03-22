
import React from 'react';
import { StyleSheet, View, ScrollView, Text, TouchableOpacity, ActivityIndicator, PermissionsAndroid, Platform, NativeModules } from 'react-native';
import { connect } from 'react-redux';
import CallMenu from './CallMenu';
import CustomInput from './CustomInput';
// @ts-ignore
import call from 'react-native-phone-call'
import DataEntity, { ISingleDataItem } from '../../models/DataEntity';
import saga from '../../decoradors/saga';
import { EntityList } from '../../models/entity';
import ContactList from './ContactList';
import CallDetectorManager from 'react-native-call-detection';
import CallLogs from 'react-native-call-log';
import SendSMS from 'react-native-sms';
const DirectSms = NativeModules.DirectSms;

interface ICallLog {
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
    getData?: () => void;
    navigation?: any;
}
@saga(DataEntity, ['getData'])
class Signal extends React.Component<ISignalProps> {

    state = {
        response: null,
        currentItemIndex: 0,
        currentElement: this.props.dataItems && this.props.dataItems?.valueSeq()?.get(0),
        callDetector: undefined,
        callStates: [],
        isStart: false,
        flatListItems: [],
        listData: []
    }

    getSignalData = async () => {
        const { getData } = this.props;
        const res = await fetch(`http://neologic.golden-team.org/api/page/url/process`)
        const response: any = await res.json()
        if (response) {
            getData()
        }
        this.setState((prevState) => {
            return {
                ...prevState,
                response,
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

    setFlatListItems = (flatListItems: any[]) => {
        this.setState((prevState) => {
            return {
                ...prevState,
                flatListItems
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
        // const { listData } = this.state;
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
                    // CallLogs.loadAll().then(c => this.setFlatListCallData(listData.concat(c)));
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

    // sendAllSMS = () => {
    // const { dataItems } = this.props;
    // let dataSmsArray = [];
    // if (dataItems && dataItems.size > 0) {
    //     dataSmsArray = dataItems.valueSeq().filter(obj => obj.get('smsBody'))?.toJS() || []
    // }
    // console.log('sendAllSMS===', dataSmsArray)
    // for (let i = 0; i < dataSmsArray.length; i++) {
    //     const element = dataSmsArray[i];
    //     SendSMS.send(
    //         {
    //         body: String(element['smsBody']),
    //         recipients: [String(element['phone'])],
    //         // @ts-ignore
    //         successTypes: ['sent', 'queued']
    //         },
    //         (completed, cancelled, error) => {
    //             if (completed) {
    //             console.log('SMS Sent Completed');
    //         } else if (cancelled) {
    //             console.log('SMS Sent Cancelled');
    //         } else if (error) {
    //             console.log('Some error occured');
    //         }
    //         },
    //     );
    // }
    // };

    // sendSMS = () => {
    //     const { currentElement } = this.state;
    //     const body = currentElement?.get('smsBody')?.toString();
    //     const recipient = currentElement?.get('phone')?.toString();
    //     if (body && recipient) {
    //         SendSMS.send(
    //             {
    //             body,
    //             recipients: [recipient],
    //             // @ts-ignore
    //             successTypes: ['sent', 'queued']
    //             },
    //             (completed, cancelled, error) => {
    //                 if (completed) {
    //                 console.log('SMS Sent Completed');
    //                 } else if (cancelled) {
    //                     console.log('SMS Sent Cancelled');
    //                 } else if (error) {
    //                     console.log('Some error occured');
    //                 }
    //             },
    //         );
    //     }
    // };

    sendDirectSms = async  () => {
        const { dataItems } = this.props;
        let dataSmsArray = [];
        if (dataItems && dataItems.size > 0) {
        dataSmsArray = dataItems.valueSeq().filter(obj => obj.get('smsBody'))?.toJS() || []
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
            if (grantedSendSms === PermissionsAndroid.RESULTS.GRANTED && grantedReadSms === PermissionsAndroid.RESULTS.GRANTED) {
                for await (const one of dataSmsArray) {
                    console.log('send_sms_to', one.phone, one.smsBody)
                    console.log('--------------------------------------')
                    await DirectSms.sendDirectSms(one.phone, one.smsBody);
                }
            } else {
                console.log('SMS permission denied');
            }
        } catch (err) {
            console.warn('SMS permission_ERROR', err);
        }
    }

    startStopListener = async () => {
        const { callStates, isStart, currentItemIndex } = this.state;
        const { dataItems } = this.props;
        const currentPhone = dataItems?.valueSeq()?.getIn([currentItemIndex, 'phone'])
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
                    console.log('event -> ',
                        event + (num ? ' - ' + num : '')
                    );
                    const updatedCallStates = callStates;
                    updatedCallStates.push(
                        event + (num ? ' - ' + num : '')
                    );
                    this.setFlatListItems(updatedCallStates);
                    this.setCallStates(updatedCallStates);
                    // For iOS event will be either "Connected",
                    // "Disconnected","Dialing" and "Incoming"
                    // For Android event will be either "Offhook",
                    // "Disconnected", "Incoming" or "Missed"
                    // phoneNumber should store caller/called number
                    if (event === 'Disconnected') {
                        console.log('Disconnected');

                        const response = await this.fetchData();
                        console.log('response', response)

                        // this.setNextElement()

                        // Do something call got disconnected
                    } else if (event === 'Connected') {
                        console.log('Connected');
                        // Do something call got connected
                        // This clause will only be executed for iOS
                    } else if (event === 'Incoming') {
                        console.log('Incoming');
                        // Do something call got incoming
                    } else if (event === 'Dialing') {
                        console.log('Dialing');
                        // Do something call got dialing
                        // This clause will only be executed for iOS
                    } else if (event === 'Offhook') {
                        console.log('Offhook');
                        // Device call state: Off-hook.
                        // At least one call exists that is dialing,
                        // active, or on hold,
                        // and no calls are ringing or waiting.
                        // This clause will only be executed for Android
                    } else if (event === 'Missed') {
                        console.log('Missed');

                        this.fetchData()

                        // Do something call got missed
                        // This clause will only be executed for Android
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

    makeCall = async (num: string) => {
        const args = {
            number: num,
            prompt: false
        }
        return call(args)
            .then((r: any) => {
                console.log('call', r)
                return r;
            })
            .catch((err: any) => {
                return err
            })
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

    testDial = async () => {
        // const res = await DirectSms.createDial('7777777777')
        console.log('testDial')
    }

    render() {
        const { currentItemIndex, currentElement, listData } = this.state;
        const { dataItems, user, navigation } = this.props;
        // const sortedData = listData.sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
        let lastCallData = null as ICallLog | null;
        if (listData.length > 0) {
            lastCallData = listData[0];
        }
        const dataSms = currentElement?.get('smsBody');
        let dataSmsArray = null;
        if (dataItems && dataItems.size > 0) {
            dataSmsArray = dataItems.filter(obj => obj.get('smsBody'))
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
                        <CustomInput currentElement={currentElement} makeCall={this.makeCall}/>
                        <CallMenu
                            testDial={this.testDial}
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
    const user = state.identity.user || null
    return {
        dataItems,
        user
    };
}

export default connect(mapStateToProps, { ...DataEntity.actions })(Signal)
