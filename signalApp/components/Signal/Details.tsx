
import React from 'react';
import {
    StyleSheet, Text, View, FlatList, TextInput,
    TouchableOpacity, GestureResponderEvent, Image
} from 'react-native';
import saga from '../../decoradors/saga';
import DataEntity, { IDataItem, ISingleDataItem } from '../../models/DataEntity';
import { connect } from 'react-redux';
import { EntityList } from '../../models/entity';
import { getStringDate, isNetworkAvailable, showToastWithGravityAndOffset } from '../../utils';
import MobileDropdown from '../MobileDropdown';
import DateChanged from '../DatePicker/DateChanged';

const dialogOptions = [
    { label: 'auto-dial ON', value: 1 },
    { label: 'auto-dial OFF', value: 0 },
]
const taskCompletedOptions = [
    { label: 'Task completed', value: 1 },
    { label: 'Task not completed', value: 0 },
]
const smsOptions = [
    { label: 'auto-SMS ON', value: 1 },
    { label: 'auto-SMS OFF', value: 0 },
]
interface IDetailsProps {
    route: any;
    signalData: EntityList<ISingleDataItem>;
    setSubmitData: (data: any) => void;
    navigation?: any;
    user?: any;
}
@saga(DataEntity, ['setSubmitData'])
class Details extends React.Component<IDetailsProps> {
    state = {
        id: this.props.route?.params?.id,
        currentItem: this.props.signalData?.valueSeq()?.find(o => o.get('id') === this.props.route?.params?.id)?.toJS(),
        ...this.props.signalData?.valueSeq()?.find(o => o.get('id') === this.props.route?.params?.id)?.toJS()
    }

    componentDidUpdate(prevProps: any) {
        if (this.props.route?.params?.id && prevProps.route?.params?.id !== this.props.route?.params?.id) {
            const id = this.props.route?.params?.id;
            const currentItem = this.props.signalData.valueSeq().find(o => o.get('id') === id)?.toJS()
            this.setState({
                id,
                currentItem,
                ...this.props.signalData.valueSeq().find(o => o.get('id') === id)?.toJS()
            })
        }
    }

    componentWillUnmount() {
        this.setState({ id: null })
    }

    handleInputChange = (text: string, name: string) => {
        this.setState((prevState) => {
            return {
                ...prevState,
                [name]: text
            }
        })
    }

    editSubmit = async (e: any, name: string, id: string) => {
        e.preventDefault()
        const { text } = e.nativeEvent;
        const currentItem = this.props.signalData.valueSeq().find(o => o.get('id') === id)?.toJS();
        const isChanged = JSON.stringify(this.state[name]) !== JSON.stringify(currentItem[name])
        const isConnected = await isNetworkAvailable()
        const data = { [name]: text, id }
        if (isConnected.isConnected && isChanged) {
            this.props.setSubmitData(data)
        }
        if (!isConnected.isConnected) {
            showToastWithGravityAndOffset('No internet connect !!!');
        }
    }

    showAll = () => this.setState({ id: null, currentItem: null })
    showOne = (itemId: string) => {
        const currentItem = this.props.signalData.valueSeq().find(o => o.get('id') === itemId)?.toJS()
        if (!this.state.id) {
            this.setState({
                id: itemId,
                currentItem,
                ...currentItem
            })
        }
    }
    onLoginPress = () => {
        if (this.props.navigation) {
            this.props.navigation.navigate('Login')
        } else {
            console.log('onLoginPress_error')
        }
    }

    handleDropdownDialog = (value: number | string) => {
        this.props.setSubmitData({ id: this.state.id, needToDialog: value === 0 ? false : true })
    }
    handleDropdownTaskCompleted = (value: number | string) => {
        this.props.setSubmitData({ id: this.state.id, taskCompleted: value === 0 ? false : true })
    }
    handleDropdownSMS = (value: number | string) => {
        this.props.setSubmitData({ id: this.state.id, needToSendSMS: value === 0 ? false : true })
    }

    handlePickerOkClick = (date: Date, itemKey: string) => {
        let sendDate: string | number = Math.round(date.getTime() / 1000);
        if (itemKey === 'dueDate') {
            sendDate = getStringDate(date);
        }
        this.props.setSubmitData({ id: this.state.id, [itemKey]: sendDate });
    }

    renderItem = (data: any) => {
        const item: IDataItem = data.item
        const onLongPress: (event: GestureResponderEvent) => void = () => this.showOne(item.id)
        // const onPress: (event: GestureResponderEvent) => void = () => console.log('renderItem_onPress=', data)
        return (
            <>
                {this.state.id &&
                    <View style={styles.showLine}>
                        <TouchableOpacity
                            activeOpacity={0.6}
                            style={styles.button}
                            onPress={this.showAll}>
                            <Text style={styles.buttonText}>Show all</Text>
                        </TouchableOpacity>
                        <Text style={styles.text}>Count: {` ( ${this.props.signalData?.size || 0} )`}</Text>
                    </View>}
                <TouchableOpacity
                    activeOpacity={0.6}
                    style={styles.item}
                    onLongPress={onLongPress}
                    // onPress={onPress}
                >
                    <View style={{...styles.showLine, marginBottom: 10}}>
                    {item?.asanaDataType
                        ? <Text style={{ ...styles.text, color: '#f77e59', fontWeight: '700', fontSize: 18 }}><Image style={{ width: 30, height: 30 }} source={require('../../../assets/asana.png')} /> {item?.searchType.replace('AD', '')}</Text> 
                        : <Text style={{ ...styles.text, color: '#f77e59', fontWeight: '700' }}>{item?.searchType}</Text>
                    }
                    </View>
                    {Object.keys(item).sort().map(o => {
                        return (
                            <View key={item['id'] + o}>
                                {['agentID', 'searchType', 'reference', 'highNetWorth', 'year', 'source', 'id', 'language', 'brokersTabId'].includes(String(o)) &&
                                    <View style={styles.itemLine}>
                                        <Text style={{ ...styles.text, ...styles.textTitle }}>{String(o)}:</Text>
                                        <Text style={styles.text}>{String(item[o])}</Text>
                                    </View>
                                }
                                {['email', 'name', 'taskName', 'details', 'phone', 'segment', 'taskDescription', 'memberRating',
                                    'smsBody', 'emailBody', 'comment2020', 'group', 'price', 'calledAbout', 'comment2019'
                                ].includes(String(o)) &&
                                    <>
                                        {this.state.id && <>
                                            <View style={styles.showLine}>
                                                <Text style={{ ...styles.text, ...styles.textTitle, color: '#f77e59' }}>{String(o)} :</Text>
                                                <Image style={{ width: 20, height: 20, marginLeft: 5 }} source={require('../../../assets/edit.png')} />
                                            </View>
                                            <View style={styles.inputContainer}>
                                                <TextInput
                                                    style={styles.textInput}
                                                    autoCorrect={false}
                                                    placeholder={String(o)}
                                                    value={String(this.state[o])}
                                                    onEndEditing={(e) => this.editSubmit(e, o, item['id'])}
                                                    onChangeText={text => this.handleInputChange(text, String(o))}
                                                    multiline={true} />
                                            </View></>}
                                        {!this.state.id && <View style={styles.itemLine}>
                                            <Text style={{ ...styles.text, ...styles.textTitle }}>{String(o)}:</Text>
                                            <Text style={styles.text}>{String(item[o])}</Text>
                                        </View>}</>
                                }
                                {(String(o) === 'allBrokersBaseDate' && item.searchType.split(',').includes('BD')) &&
                                <DateChanged
                                stateId={this.state.id}
                                item={item}
                                title='All brokers sheet date'
                                field={String(o)}
                                handlePickerOkClick={this.handlePickerOkClick}
                                containerStile={{marginVertical: 2}}/>
                                }
                                {(String(o) === 'teamDate' && item.searchType.split(',').includes('TD')) &&
                                <DateChanged
                                stateId={this.state.id}
                                item={item}
                                title='Team sheet date'
                                field={String(o)}
                                handlePickerOkClick={this.handlePickerOkClick}
                                containerStile={{marginVertical: 2}}/>
                                }
                                {(String(o) === 'dueDate' && item.searchType.split(',').includes('AD')) &&
                                <DateChanged
                                stateId={this.state.id}
                                item={item}
                                title='Due date'
                                field={String(o)}
                                handlePickerOkClick={this.handlePickerOkClick}
                                containerStile={{marginVertical: 2}}/>
                                }
                                {['taskCreated'].includes(String(o)) &&
                                <View style={styles.itemLine}>
                                        <Text style={{ ...styles.text, ...styles.textTitle }}>{String(o)}:</Text>
                                        <Text style={styles.text}>{Number(item[o]) > 0 ? getStringDate(new Date(Number(item[o] * 1000))) : 'no info'}</Text>
                                    </View>
                                }
                                {['responseDialog'].includes(String(o)) &&
                                    <View style={styles.itemLine}>
                                        <Text style={{ ...styles.text, ...styles.textTitle }}>{String(o)}:</Text>
                                        <Text style={styles.text}>{JSON.stringify(item.responseDialog)}</Text>
                                    </View>
                                }
                                {['needToSendSMS'].includes(String(o)) &&
                                    <>
                                        {this.state.id && <MobileDropdown
                                            value={item.needToSendSMS ? 1 : 0}
                                            onChange={this.handleDropdownSMS}
                                            options={smsOptions}
                                        />}
                                        {!this.state.id && <View style={styles.itemLine}>
                                            {item?.needToSendSMS && <>
                                                <Text style={{ ...styles.text, ...styles.textTitle }}>{String(o)}:</Text>
                                                <Image style={{ width: 22, height: 22 }} source={require('../../../assets/sms.png')} /></>}
                                        </View>}
                                    </>
                                }
                                {['needToDialog'].includes(String(o)) &&
                                    <>
                                        {this.state.id && <MobileDropdown
                                            value={item.needToDialog ? 1 : 0}
                                            onChange={this.handleDropdownDialog}
                                            options={dialogOptions}
                                        />}
                                        {!this.state.id && <View style={styles.itemLine}>
                                            <Text style={{ ...styles.text, ...styles.textTitle }}>{String(o)}:</Text>
                                            {item?.needToDialog && <Image style={{ width: 22, height: 22, marginLeft: 5 }} source={require('../../../assets/phone-call.png')} />}
                                        </View>}
                                    </>
                                }
                                {['taskCompleted'].includes(String(o)) &&
                                    <>
                                        {this.state.id && <MobileDropdown
                                            value={item.taskCompleted ? 1 : 0}
                                            onChange={this.handleDropdownTaskCompleted}
                                            options={taskCompletedOptions}
                                        />}
                                        {!this.state.id && <View style={styles.itemLine}>
                                            <Text style={{ ...styles.text, ...styles.textTitle }}>{String(o)}:</Text>
                                            {item.taskCompleted ? <Image style={{ width: 22, height: 22, marginLeft: 5 }} source={require('../../../assets/yes.png')} />
                                            : <Image style={{ width: 22, height: 22, marginLeft: 5 }} source={require('../../../assets/no.png')} />}                                           
                                        </View>}
                                    </>
                                }
                            </View>
                        )
                    })
                    }
                </TouchableOpacity>
            </>
        )
    }

    keyExtractor = (item: IDataItem) => item.id



    render() {
        const { signalData, user } = this.props;
        let dataItems: IDataItem[] = signalData?.valueSeq()?.toJS() || []
        if (this.state.id && dataItems) {
            dataItems = dataItems.filter(item => item.id === this.state.id)
        }
        const validUser = user?.token?.length > 0
        if (!validUser) {
            return (
                <View style={styles.loadContainer}>
                    <View style={{ ...styles.loadContainer, height: 100 }}>
                        <Text style={{ fontSize: 22, fontWeight: '600' }}>Only register user</Text>
                        <TouchableOpacity
                            activeOpacity={0.5}
                            style={{}}
                            onPress={this.onLoginPress}>
                            <Text style={{ color: '#62aee5', fontSize: 20, marginTop: 30 }}>Go to login</Text>
                        </TouchableOpacity>
                    </View>
                </View>)
        }
        if ((!signalData || signalData.size === 0)) {
            return (<View style={styles.loadContainer}>
                <View style={{ ...styles.loadContainer, height: 200 }}>
                    <Text style={{ color: '#bf0416', fontSize: 20, marginTop: 30, padding: 20, borderRadius: 20, backgroundColor: '#dbdbd7' }}>No data...</Text>
                </View>
            </View>)
        }
        return (
            <View style={styles.container}>
                {
                    dataItems && dataItems.length > 0 && <FlatList
                        keyExtractor={this.keyExtractor}
                        data={dataItems || []}
                        renderItem={this.renderItem}
                    />
                }
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        padding: 5,
        backgroundColor: '#bfeef5'
    },
    item: {
        borderStyle: 'solid',
        borderColor: '#6993f5',
        borderWidth: 2,
        marginVertical: 5,
        backgroundColor: '#97cca5',
        padding: 5,
        width: '100%',
        borderRadius: 10
    },
    loadContainer: {
        display: 'flex',
        flexDirection: 'column',
        height: 700,
        justifyContent: 'center',
        alignItems: 'center'
    },
    textInput: {
        borderStyle: 'solid',
        borderBottomWidth: 1,
        borderBottomColor: '#0b4702',
        paddingVertical: 2,
        width: '100%',
    },
    inputContainer: {
        width: '100%',
    },
    itemLine: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: 2,
        paddingBottom: 2,
        borderBottomWidth: 1,
        borderBottomColor: '#5eb337'
    },
    text: {
        color: 'black',
        fontSize: 16,
        fontWeight: '600'
    },
    textTitle: {
        fontWeight: '700',
        marginRight: 10
    },
    showLine: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 5
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
        marginVertical: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 18
    },
});

const mapStateToProps = (state: any) => {
    const signalData = state.entities.get('signalData')?.sort() || null
    const user = state.identity.user || null
    return {
        signalData,
        user
    };
}

export default connect(mapStateToProps, { ...DataEntity.actions })(Details);