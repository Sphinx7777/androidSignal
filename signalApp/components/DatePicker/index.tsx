import React, { useState } from 'react'
import DatePicker from 'react-native-date-picker'

const IsDatePicker = () => {
    const [date, setDate] = useState(new Date())

    return (
    <DatePicker
        date={date}
        mode='date'
        onDateChange={setDate}
    />
    )
}

export default IsDatePicker;