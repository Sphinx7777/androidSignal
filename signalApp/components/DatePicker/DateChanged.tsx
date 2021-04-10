
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { IDataItem } from '../../models/DataEntity';
import { getStringDate } from '../../utils';
import IsMobileDatePicker from '../DatePicker';

interface IDateChangedProps {
    stateId: string | boolean;
    item: IDataItem;
    handlePickerOkClick: (date: Date, itemKey: string) => void;
    field: string;
    noMaxDate?: boolean;
    title?: string;
    containerStile?: object;
}

const DateChanged = (props: IDateChangedProps) => {
    const { stateId, item, field, handlePickerOkClick, noMaxDate, title, containerStile} = props;
    let date = Number(item[field]);
    if (field === 'dueDate') {
        date = Math.round(new Date(item[field]).getTime() / 1000)
    }
    return (
        <>
        {stateId && <IsMobileDatePicker
        noMaxDate={noMaxDate}
        elDate={date}
        title={title}
        handleOkClick={handlePickerOkClick}
        itemKey={field}
        containerStile={containerStile}
        />}
        {!stateId && <View style={styles.itemLine}>
                <Text style={{ ...styles.text, ...styles.textTitle }}>{field}:</Text>
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