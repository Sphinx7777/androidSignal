import { Picker } from '@react-native-picker/picker';
import React, { useState, useEffect } from 'react';
import { View } from 'react-native';

interface IProps {
    value: number | string;
    onChange: (itemValue: number | string) => void;
    options: {label: string, value: number | string}[];
    mode?: 'dialog' | 'dropdown';
    containerStile?: object
}

const MobileDropdown = (props: IProps) => {
    const { value, onChange, options, mode = 'dropdown', containerStile = {}} = props;
    const [selectedValue, setSelectedValue] = useState(value);

    useEffect(() => {
        setSelectedValue(value)
    }, [value])

    const handleChange = (itemValue: number | string) => {
        onChange(itemValue)
    }

    return (
        <View style={{borderBottomColor: '#1b6b2f', borderBottomWidth: 2, ...containerStile}}>
        <Picker
            mode={mode}
            dropdownIconColor='#f56b45'
            selectedValue={selectedValue}
            onValueChange={handleChange}>
                {options.map((item, i) => (
                    <Picker.Item key={i} label={item.label} value={item.value} style={{color: item.value === 1 ? '#1b6b2f' : '#f50a0a', fontWeight: 'bold'}}/>
                ))}
        </Picker>
        </View>

    );
};

export default MobileDropdown;