import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    StyleSheet,
    TouchableOpacity,
    Alert
} from 'react-native';
import {addDoc, collection, doc, setDoc } from 'firebase/firestore'
import emulators from '../firebase';

// reminder that this is a tab - cannot do useNavigation
const HomeScreen = ({ navigation }) => {

    const auth = emulators.authentication
    const db = emulators.firestore
    const user = auth.currentUser

    // useEffect(() => {
    //     const test = async () => {
    //         let num = 5
    //         const docRef = await addDoc(collection (db, "user"), {
    //             displayName: "temp" + num,
    //             email: "test@test.com",
    //             groups: [],
    //             photoUrl: "temp" + num + ".png",
    //             uid: num,
    //         })
    //         console.log(docRef.id)
    //     }
    //     test()
    // }, [])

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
                        auth.signOut()
                    },
                },
            ],
            { cancelable: false }
        );
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={{ flex: 1, padding: 16 }}>
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center"}}>
                    <Text style={{ fontSize: 20, textAlign: "center", marginBottom: 16}}>
                        FireBase Auth
                    </Text>
                    <Text>
                        Welcome{" "}
                        {user.displayName ? user.displayName : user.email}
                    </Text>

                    <TouchableOpacity 
                        style={styles.buttonStyle}
                        activeOpacity={0.5}
                        onPress={logout}
                    >
                        <Text style={styles.buttonTextStyle}>
                            Logout
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};
export default HomeScreen;

const styles = StyleSheet.create({
    buttonStyle: {
        minWidth: 300,
        backgroundColor: "#7DE24E",
        borderWidth: 0,
        color: "#FFFFFF",
        borderColor: "#7DE24E",
        height: 40,
        alignItems: "center",
        borderRadius: 30,
        marginLeft: 35,
        marginRight: 35,
        marginTop: 20,
        marginBottom: 25,
    },
    buttonTextStyle: {
        color: "#FFFFFF",
        alignContent: "center",
        fontSize: 16,
    },
});