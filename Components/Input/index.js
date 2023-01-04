import React from "react";
import {StyleSheet, TextInput, View} from 'react-native';

const Input = ({text, setText}) => {
    return (
        <TextInput
            value={text}
            onChangeText={setText}
            style={styles.textInput}
            placeholder="Enter message"
            placeholderTextColor="#595959"

        />
    )
}

const styles = StyleSheet.create({
    textInput: {
        width: '75%',
        // height: 40,
        // margin: 0,
        // padding: 12,
        paddingHorizontal: 12,
        color: '#ffa600',
        fontWeight: '600',
        borderRadius: 25,
        alignItems: 'center',
        backgroundColor: '#282a2d',
    }
})

export default Input;