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
import IsMobileDatePicker from '../DatePicker';




interface IDateChangedProps {
    stateId: string | boolean;
    item: IDataItem;
    handlePickerOkClick: (date: Date, itemKey: string) => void;
    o: string;
    noMaxDate?: boolean;
}

const DateChanged = (props: IDateChangedProps) => {
    const { stateId, item, o, handlePickerOkClick, noMaxDate} = props;
    let date = Number(item[o]);
    if (o === 'dueDate') {
        date = Math.round(new Date(item[o]).getTime() / 1000)
    }
    return (
        <>
        {stateId && <IsMobileDatePicker
        noMaxDate={noMaxDate}
        elDate={date}
        handleOkClick={handlePickerOkClick}
        itemKey={o}
        containerStile={{marginVertical: 2}}
        />}
        {!stateId && <View style={styles.itemLine}>
                <Text style={{ ...styles.text, ...styles.textTitle }}>{o}:</Text>
                <Text style={styles.text}>{date > 0 ? getStringDate(new Date(Number(date * 1000))) : 'no info'}</Text>
            </View>}
        </>
    )
}

const styles = StyleSheet.create({
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
});

export default DateChanged;