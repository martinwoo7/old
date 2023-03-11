import React, {useEffect, useRef, useState} from "react";
import { SafeAreaView, View, Text, StyleSheet, Alert, TouchableOpacity, StatusBar, Platform} from "react-native";

import emulators from "../firebase";

const EventsScreen = ({ navigation, route }) => {
    const auth = emulators.authentication

    return (
        <SafeAreaView style={styles.AndroidSafeAreaView}>
            <Text>Events screen</Text>
        </SafeAreaView>
    )
}

export default EventsScreen;

const styles = StyleSheet.create({
    AndroidSafeAreaView:{
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0
    },
})