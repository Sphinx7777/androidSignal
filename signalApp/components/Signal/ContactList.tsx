import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, GestureResponderEvent, Image, ActivityIndicator } from 'react-native';
import { getStringDate } from 'signalApp/utils';
import { ISingleDataItem, IDataItem } from '../../models/DataEntity';
import { EntityList } from '../../models/entity';
interface IContactListProps {
    callData: EntityList<ISingleDataItem> | undefined;
    setCurrentItemIndex: (currentItem: number) => void;
    currentItemIndex: number;
    makeCall: (phone: string) => Promise<any>;
    setCurrentElement: (currentElement: ISingleDataItem) => void;
    currentElement?: ISingleDataItem | undefined;
}

const ContactList = (props: IContactListProps) => {
    const { callData, setCurrentItemIndex, currentItemIndex, makeCall, setCurrentElement, currentElement } = props;

    const handleLongPress = async (data: any) => {
        const { index } = data
        const phone = callData?.valueSeq()?.getIn([index, 'phone'])
        const element = callData?.valueSeq()?.get(index)
        const res = await makeCall(phone)
        if (res) {
            setCurrentElement(element)
            setCurrentItemIndex(index)
        }
    }

    const handlePress = (data: any) => {
        const { index } = data
        const element = callData?.valueSeq()?.get(index)
        setCurrentElement(element)
        setCurrentItemIndex(index)
    }

    const renderItem = (data: any) => {
        const { item } = data
        const currentElSearchType = item.searchType || '';
        const isAsanaType = currentElSearchType ? currentElSearchType.split(',').includes('AD') : false;
        const isTeamType = currentElSearchType ? currentElSearchType.split(',').includes('TD') : false;
        const isBrokersType = currentElSearchType ? currentElSearchType.split(',').includes('BD') : false;
        const isPhone = item.phone?.length >= 9;
        const currentElSMSBody = item.smsBody;
        const isNeedSms = item.needToSendSMS
        const isCurrentElResDialog = item.responseDialog;
        const onLongPress: (event: GestureResponderEvent) => void = () => handleLongPress(data)
        const onPress: (event: GestureResponderEvent) => void = () => handlePress(data)

        return (
            <TouchableOpacity
                style={currentElement?.get('id') !== item.id ? styles.textContainer : styles.textContainerActive}
                onLongPress={onLongPress}
                onPress={onPress}>
                <View style={{...styles.nameLine}}>
                    <Text numberOfLines={1} style={{...styles.text, maxWidth: 220}}>{item.asanaDataType ? item?.taskName : item?.reference ? item?.reference : item?.name}</Text>
                    <Text style={{...styles.text, color: isPhone ? 'black' : '#bf0416'}}>{item.phone && item.phone?.length > 0 ? item.phone : '--------'}</Text>
                    {item?.asanaDataType
                        ? <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                            <Image style={{ width: 25, height: 25, marginRight: 5 }} source={require('../../../assets/asana.png')} />
                            <Text style={{ ...styles.text, color: '#f77e59', fontWeight: '700'}}>{item?.searchType?.replace('AD', '')?.replace('TD', 'DBX')?.replace('BD', 'PB')}</Text>
                            </View>
                        : <Text style={{ ...styles.text, color: '#f77e59', fontWeight: '700'}}>{item?.searchType?.replace('TD', 'DBX')?.replace('BD', 'PB')}</Text>
                    }
                </View>
                {<View style={styles.nameLine}>
                    <Text numberOfLines={1} style={{ ...styles.text, maxWidth: 300 }}>Email: {item?.email ? item?.email : 'no info'}</Text>
                    {!item.teamDataType && <Text><Text>not in the DBX </Text><Image style={{ width: 18, height: 18 }} source={require('../../../assets/no.png')} /></Text>}
                </View>}
                <View style={styles.nameLine}>
                    <View style={{display: 'flex', flexDirection: 'column'}}>
                    {isAsanaType && <Text style={styles.text}>Task created: {item?.taskCreated > 0 ? getStringDate(new Date(item?.taskCreated * 1000)) : 'no info'}</Text>}
                    {isAsanaType &&
                    <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                        <Text style={styles.text}>Due date: {item?.dueDate ? getStringDate(new Date(item?.dueDate * 1000)) : 'no info'}</Text>
                    </View>
                    }
                    {isTeamType && item?.teamDate > 0 && <Text style={styles.text}>TD date: {item?.teamDate > 0 ? getStringDate(new Date(item?.teamDate * 1000)) : 'no info'}</Text>}
                    {isBrokersType && item?.allBrokersBaseDate > 0 && <Text style={styles.text}>BD date: {item?.allBrokersBaseDate > 0 ? getStringDate(new Date(item?.allBrokersBaseDate * 1000)) : 'no info'}</Text>}
                    </View>
                    <View style={styles.dataType}>
                        {(!currentElSMSBody || currentElSMSBody?.length === 0 && isNeedSms) && <Text style={{color: '#bf0416', paddingVertical: 2, marginRight: 4, fontWeight: '600'}}>Empty sms body</Text>}
                        {item?.needToSendSMS && <Image style={{ width: 25, height: 25 }} source={require('../../../assets/sms.png')} />}
                        {item?.needToDialog && <Image style={{ width: 25, height: 25, marginLeft: 5 }} source={require('../../../assets/phone-call.png')} />}
                    </View>
                </View>
                { isCurrentElResDialog &&
                        <View style={{ ...styles.inputContainer, marginTop: 2, borderTopColor: '#1b6b2f', borderTopWidth: 1}}>
                        <Text style={{ ...styles.text, fontWeight: '700' }}>Last call:</Text>
                        {/* <Text style={styles.text}>Type: {isCurrentElResDialog.type}</Text> */}
                        <Text style={styles.text}>Duration: {isCurrentElResDialog.duration}</Text>
                        {/* <Text style={styles.text}>Date: {getStringDate(new Date(Number(isCurrentElResDialog.timestamp)))}</Text> */}
                        <Text style={styles.text}>{isCurrentElResDialog.dateTime ? isCurrentElResDialog.dateTime : 'no info'}</Text>
                        </View>}
            </TouchableOpacity>
        )
    }

    const keyExtractor = (item: IDataItem) => item?.id

    if (!callData || callData.size === 0) {
        return (<View style={styles.loadContainer}>
            <Text style={{ ...styles.loadContainer, height: 100 }}>
                <ActivityIndicator size='large' color='green' />
            </Text>
        </View>)
    }

    return (
        <>
            <View style={styles.container}>
                {
                    callData && callData.size > 0 && <FlatList
                        keyExtractor={keyExtractor}
                        data={callData?.valueSeq()?.toJS() || []}
                        renderItem={renderItem}
                    />
                }

            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: 'auto',
        maxHeight: '50%',
        padding: 5
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
        borderColor: '#6993f5',
        borderWidth: 2,
        marginBottom: 5,
        backgroundColor: '#bfeef5',
        padding: 5,
        width: '100%',
        borderRadius: 10
    },
    textContainerActive: {
        borderStyle: 'solid',
        borderColor: '#0730b5',
        borderWidth: 2,
        marginBottom: 3,
        backgroundColor: '#90f3f5',
        padding: 5,
        width: '100%',
        borderRadius: 10
    },
    nameLine: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    dataType: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    text: {
        color: 'black',
        paddingVertical: 2
    },
    loadContainer: {
        display: 'flex',
        flexDirection: 'column',
        height: 270,
        justifyContent: 'center',
        alignItems: 'center'
    }
});


export default ContactList;