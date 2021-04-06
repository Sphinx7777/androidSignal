import React, { useState } from 'react';
import { View, Button, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getStringDate } from 'signalApp/utils';

interface IDetailsProps {
    elDate: number;
    handleOkClick: (data: Date, title: string) => void;
    itemKey: string;
    title?: string;
    containerStile?: object;
}

const IsMobileDatePicker = (props: IDetailsProps) => {
    const { handleOkClick, elDate, itemKey, title = itemKey, containerStile = {} } = props
    const [date, setDate] = useState(elDate > 0 ? new Date(elDate * 1000) : new Date());
    const [show, setShow] = useState(false);

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShow(Platform.OS === 'ios');
        setDate(currentDate);
        if (event.type === 'set') {
            handleOkClick(currentDate, itemKey)
        }
    };

    const showDatePicker = () => {
        setShow(true);
    };

    return (
        <View style={{...containerStile}}>
            <View style={{marginHorizontal: 10, borderWidth: 2, borderColor: '#f77e59', borderRadius: 10, overflow: 'hidden'}}>
                <Button onPress={showDatePicker} title={elDate > 0 ? `${title}: ${getStringDate(date)}` : `${title}: no info`} color='#f77e59'/>
            </View>
            {show && (
                <DateTimePicker
                    testID='dateTimePicker'
                    maximumDate={new Date()}
                    value={date}
                    mode='date'
                    is24Hour={true}
                    display='default'
                    onChange={onChange}
                />
            )}
        </View>
    );
};

export default IsMobileDatePicker;