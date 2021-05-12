import React from 'react';
import Dialog from 'react-native-dialog';
import { StyleSheet, View } from 'react-native';

interface IModalDialogProps {
    handleCancel: (dialogKey: string) => void;
    handleConfirm: (dialogKey: string) => void;
    visible: boolean;
    dialogKey: string;
    title?: string;
    description?: string;
    confirmButtonText?: string;
    containerStile?: object;
    wrong?: boolean;
}

const ModalDialog = (props: IModalDialogProps) => {
    const { wrong, handleCancel, handleConfirm, dialogKey, title = 'Confirm', description = 'Do you confirm this action?', visible, containerStile = {}, confirmButtonText = 'Confirm' } = props;

    return(
        <View style={{...styles.dialogContainer, ...containerStile}}>
        <Dialog.Container visible={visible}>
            <Dialog.Title style={{color: wrong ? 'red' : 'green'}}>{title}</Dialog.Title>
            <Dialog.Description>{description}</Dialog.Description>
            <Dialog.Button label='Cancel' onPress={() => handleCancel(dialogKey)} />
            <Dialog.Button label={confirmButtonText} onPress={() => handleConfirm(dialogKey)} />
        </Dialog.Container>
    </View>
    )
}

const styles = StyleSheet.create({
    dialogContainer: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    }
});


export default ModalDialog;