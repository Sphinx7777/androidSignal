
import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';

// // import all the components we are going to use
import {
    SafeAreaView,
    Platform,
    StyleSheet,
    Text,
    View,
    FlatList,
    Button,
    TouchableOpacity, GestureResponderEvent, Image
} from 'react-native';
import { getStringDate } from 'signalApp/utils';
import { IDataItem } from '../../models/DataEntity';



const Details = (props) => {
    const [id, setId] = useState(props.route?.params?.id)
    const signalData = useSelector((state: any) => state.entities.get('signalData'));
    let dataItems: IDataItem[] = useMemo(() => signalData?.valueSeq()?.toJS() || [], [signalData])
    if (id && dataItems) {
        dataItems = dataItems.filter(item => item.id === id)
    }
    useEffect(() => {
        setId(props.route?.params?.id)
        return () => setId(null)
    }, [props.route?.params?.id])

    const showAll = () => setId(null)
    const showOne = (itemId: string) => !id && setId(itemId)

    const renderItem = (data: any) => {
        const item: IDataItem = data.item
        const onLongPress: (event: GestureResponderEvent) => void = () => showOne(item.id)
        const onPress: (event: GestureResponderEvent) => void = () => console.log(data)
        return (
            <>
                {
                    id &&
                    <View style={styles.showLine}>
                        <TouchableOpacity
                        activeOpacity={0.6}
                        style={styles.button}
                        onPress={showAll}>
                        <Text style={styles.buttonText}>Show all</Text>
                    </TouchableOpacity>
                    <Text style={styles.text}>Count: {` ( ${signalData?.size || 0} )`}</Text>
                    </View>

                }
                <TouchableOpacity
                    activeOpacity={0.6}
                    style={styles.item}
                    onLongPress={onLongPress}
                    onPress={onPress}>
                    {
                        Object.keys(item).sort().map(o => {
                            return (
                                <View key={item['id'] + o}>
                                    {[
                                        'email', 'agentID', 'name', 'taskName', 'details', 'searchType',
                                        'reference', 'phone', 'highNetWorth', 'segment', 'year', 'taskDescription',
                                        'memberRating', 'source', 'id', 'smsBody', 'emailBody', 'language', 'comment2020',
                                        'group', 'comment2019', 'price', 'calledAbout', 'brokersTabId', 'memberRating'
                                    ].includes(String(o)) ?
                                        <View style={styles.itemLine}>
                                            <Text style={{ ...styles.text, ...styles.textTitle }}>{String(o)}:</Text>
                                            <Text style={styles.text}>{String(item[o])}</Text>
                                        </View>
                                        : ['allBrokersBaseDate', 'teamDate', 'createdAt', 'updatedAt'
                                        ].includes(String(o)) ?
                                            <View style={styles.itemLine}>
                                                <Text style={{ ...styles.text, ...styles.textTitle }}>{String(o)}:</Text>
                                                <Text style={styles.text}>{getStringDate(new Date(Number(item[o] * 1000)))}</Text>
                                            </View>
                                            : ['needToSendSMS'
                                            ].includes(String(o)) ?
                                                <View style={styles.itemLine}>
                                                    {item?.needToSendSMS && <>
                                                        <Text style={{ ...styles.text, ...styles.textTitle }}>{String(o)}:</Text>
                                                        <Image style={{ width: 25, height: 25 }} source={require('../../../assets/sms.png')} /></>}
                                                </View>
                                                :
                                                ['needToDialog'
                                                ].includes(String(o)) ?
                                                    <View style={styles.itemLine}>
                                                        {item?.needToDialog && <>
                                                            <Text style={{ ...styles.text, ...styles.textTitle }}>{String(o)}:</Text>
                                                            <Image style={{ width: 25, height: 25, marginLeft: 5 }} source={require('../../../assets/phone-call.png')} /></>}
                                                    </View> : null
                                    }
                                </View>
                            )

                        })
                    }
                </TouchableOpacity>
            </>
        )
    }

    const keyExtractor = (item: IDataItem) => item.id

    return (
        <View style={styles.container}>
            {
                dataItems && dataItems.length > 0 && <FlatList
                    keyExtractor={keyExtractor}
                    data={dataItems || []}
                    renderItem={renderItem}
                />
            }
        </View>
    )
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
    dataType: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
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

export default Details