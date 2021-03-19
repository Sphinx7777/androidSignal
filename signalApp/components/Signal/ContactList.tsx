import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, GestureResponderEvent, Image, ActivityIndicator } from 'react-native';
import { ISingleDataItem, IDataItem } from '../../models/DataEntity';
import { EntityList } from '../../models/entity';
interface IContactListProps {
    callData: EntityList<ISingleDataItem> | undefined;
    setCurrentItemIndex: (currentItem: number) => void;
    currentItemIndex: number;
    makeCall: (phone: string) => Promise<any>;
    setCurrentElement: (currentElement: ISingleDataItem) => void;
}
interface IContactListState {

}
const ContactList = (props: IContactListProps) => {
    const { callData, setCurrentItemIndex, currentItemIndex, makeCall, setCurrentElement } = props;

    const [state, setState] = useState<IContactListState>({

    })

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
        const { item, index } = data
        const onLongPress: (event: GestureResponderEvent) => void = () => handleLongPress(data)
        const onPress: (event: GestureResponderEvent) => void = () => handlePress(data)
        return (
            <TouchableOpacity
                style={currentItemIndex !== index ? styles.textContainer : styles.textContainerActive}
                onLongPress={onLongPress}
                onPress={onPress}>
                <View style={styles.nameLine}>
                    <Text style={styles.text}>{item?.name}</Text>
                    <Text style={styles.text}>{item?.phone}</Text>
                    {item?.dbType === 'asana'
                        ? <Image style={{ width: 25, height: 25 }} source={require('../../../assets/asana.png')} />
                        : <Text style={{ ...styles.text, color: '#de471d', fontWeight: '700' }}>{item?.dbType}</Text>
                    }
                </View>
                <Text style={styles.text}>{item?.email}</Text>
                <View style={styles.nameLine}>
                    <Text style={styles.text}>{item?.date}</Text>
                    <Text style={styles.text}>Calling Status</Text>
                </View>
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
                        data={callData?.valueSeq()?.toJS()}
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
        height: 270,
        padding: 5
    },
    textContainer: {
        borderStyle: 'solid',
        borderColor: '#6993f5',
        borderWidth: 2,
        marginBottom: 3,
        backgroundColor: '#bfeef5',
        padding: 5,
        width: '100%',
        borderRadius: 10
    },
    textContainerActive: {
        borderStyle: 'solid',
        borderColor: '#1b6b2f',
        borderWidth: 2,
        marginBottom: 3,
        backgroundColor: '#97cca5',
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