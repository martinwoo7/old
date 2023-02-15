import React, {useEffect, useRef, useState} from "react";
import { SafeAreaView, View, Text, StyleSheet, Alert, TouchableOpacity, StatusBar, Platform} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import emulators from "../firebase";

const ProfileScreen = ({ navigation }) => {
    const auth = emulators.authentication

    const logout = async () => {
        Alert.alert(
            "Logout",
            "Are you sure? You want to logout?",
            [
                {
                    text: "Cancel",
                    onPress: () => {
                        return null;
                    },
                },
                {
                    text: "Confirm",
                    onPress: () => {
                        auth.signOut().then(() => {
                            // sign out successful
                            // console.log(user.uid, " successfully signed out")
                            navigation.replace("Auth")
                        }).catch((error) => {
                            console.log("An error occurred while trying to sign out")
                        })
                        
                        
                    },
                },
            ],
            { cancelable: false }
        );
    };

    return (
        <SafeAreaView style={styles.AndroidSafeAreaView}>
            <Text>{auth.currentUser.displayName}</Text>
            <TouchableOpacity 
                style={styles.buttonStyle}
                activeOpacity={0.5}
                onPress={logout}
            >
                <Text style={styles.buttonTextStyle}>
                    Logout
                </Text>
            </TouchableOpacity>
        </SafeAreaView>
    )
}

export default ProfileScreen;

const styles = StyleSheet.create({
    AndroidSafeAreaView:{
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0
    },
    buttonStyle: {
        minWidth: 300,
        backgroundColor: "#7DE24E",
        borderWidth: 0,
        color: "#FFFFFF",
        borderColor: "#7DE24E",
        paddingVertical: 10,
        alignItems: "center",
        borderRadius: 30,
        marginLeft: 35,
        marginRight: 35,
        marginTop: 25,
        marginBottom: 25,
    },
    buttonTextStyle: {
        color: "#FFFFFF",
        alignContent: "center",
        fontSize: 16,
    },
})