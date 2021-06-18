import React from 'react';
import { StyleSheet, Text, View, TextInput } from 'react-native';

interface IMobileInputProps {
    value: string;
    label?: string;
    multiline?: boolean;
    autoCorrect?: boolean;
    placeholder?: string;
    autoCapitalize?: 'characters' | 'words' | 'sentences' | 'none';
    textKey?: string;
    editable?: boolean;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad' | 'decimal-pad';
    onChangeText?: (text: string, textKey: string) => void;
    onEndEditing?: (event: any, textKey: string) => void;
}


const MobileInput = (props: IMobileInputProps) => {
    const { value, onEndEditing, onChangeText, textKey, autoCapitalize = 'sentences', placeholder = '', autoCorrect = false, multiline = true, keyboardType = 'default', label, editable = true } = props;
    return (
        <>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.textInput}
                    autoCorrect={autoCorrect}
                    placeholder={placeholder}
                    autoCapitalize={autoCapitalize}
                    keyboardType={keyboardType}
                    value={value}
                    editable={editable}
                    onEndEditing={(event) => onEndEditing && onEndEditing(event, textKey)}
                    onChangeText={text => onChangeText(text, textKey)}
                    multiline={multiline} />
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    inputContainer: {
        display: 'flex',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
    },
    label: {
        color: '#f77e59',
        fontSize: 12,
        fontWeight: '700'
    },
    textInput: {
        borderStyle: 'solid',
        borderBottomWidth: 1,
        borderBottomColor: 'lightgrey',
        paddingVertical: 5,
        width: '100%',
    }
});


export default MobileInput;