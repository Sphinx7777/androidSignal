import { ToastAndroid } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

export const isNetworkAvailable = async () => {
    const response = await NetInfo.fetch();
    return Promise.resolve(response);
}

export const sleep = (waitTimeInMs: number) => new Promise((resolve) => setTimeout(resolve, waitTimeInMs));

export const getStringDate: (date: Date) => string = (date: Date) => {
    const m = date.getMonth() + 1;
    const d = date.getDate()
    return `${date.getFullYear()}-${(m < 10 ? '0' : '') + m}-${(d < 10 ? '0' : '') + d}`;
}

export const showToastWithGravityAndOffset = (text: string = '', duration = ToastAndroid.LONG, position = ToastAndroid.BOTTOM, xOffset = 50, yOffset = 120) => {
    ToastAndroid.showWithGravityAndOffset(
        text.toLocaleUpperCase(text),
        duration,
        position,
        xOffset,
        yOffset
    );
}

export function isEmpty(obj: any) {
    return [Object, Array].includes((obj || {}).constructor) && !Object.entries((obj || {})).length;
}

export const MAIL_REGEX = /[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]/