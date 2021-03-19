
import React from 'react';
import { StyleSheet, View, ScrollView, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
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
        flatListItems: []
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

    startStopListener = async () => {
        const { callStates, isStart } = this.state;
        let { callDetector } = this.state;
        if (isStart) {
            if (callDetector) {
                console.log('Phone_State_listener_Stop');
                callDetector.dispose();
            }
        } else {
            console.log('Phone_State_listener_Start');
            callDetector = new CallDetectorManager(
                (event: string, num: string) => {
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
                        this.setNextElement()
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
                        // Do something call got missed
                        // This clause will only be executed for Android
                    }
                },
                true, // To detect incoming calls [ANDROID]
                () => {
                    // If your permission got denied [ANDROID]
                    // Only if you want to read incoming number
                    // Default: console.error
                    console.log('Permission Denied by User');
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

    makeCall = async (num?: string) => {
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
        const { user } = this.props
        this.startStopListener()
        const validUser = user && user?.token && user?.token?.length > 0
        if (validUser) {
            this.getSignalData();
        }
    }

    componentWillUnmount() {
        this.startStopListener()
    }

    componentDidUpdate(prevProps: any) {
        const { user, dataItems } = this.props
        const validUser = user && prevProps.user !== user && user?.token && user?.token?.length > 0 && !dataItems
        if (validUser) {
            this.getSignalData();
        }
        if (prevProps.dataItems !== dataItems) {
            const currentElement = dataItems && dataItems?.valueSeq()?.get(0)
            this.setState((prevState) => {
                return {
                    ...prevState,
                    currentElement
                }
            })
        }
    }

    render() {
        const { currentItemIndex, currentElement } = this.state
        const { dataItems, user, navigation } = this.props
        const validUser = user && user?.token && user?.token?.length > 0
        if (!validUser && navigation) {
            navigation.navigate('Login')
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
                        <CustomInput currentElement={currentElement} makeCall={this.makeCall} />
                        <CallMenu
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
        backgroundColor: '#d7dbd7',
        paddingHorizontal: 5,
        paddingTop: 30
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
