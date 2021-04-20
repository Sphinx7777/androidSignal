import { StyleSheet, Text, TouchableOpacity, Alert, Linking } from 'react-native';
import React, { useCallback } from 'react';

interface INavBtnProps {
    url: string;
    children: any;
    buttonStyle?: object;
    textStyle?: object;
}

const NavigateButton = (props: INavBtnProps) => {
    const { url, children, buttonStyle, textStyle } = props;
    const handlePress = useCallback(async () => {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
            await Linking.openURL(url);
        } else {
            Alert.alert(`Don't know how to open this URL: ${url}`);
        }
    }, [url]);
    return (
        <TouchableOpacity
            style={{ ...styles.button, ...buttonStyle }}
            onPress={handlePress}>
            <Text style={{ ...styles.buttonText, ...textStyle }}>{children}</Text>
        </TouchableOpacity>
    );
};
const styles = StyleSheet.create({
    button: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        padding: 2,
        overflow: 'hidden',
    },
    buttonText: {
        color: '#3a78f2',
        fontSize: 14
    }
});

export default NavigateButton;