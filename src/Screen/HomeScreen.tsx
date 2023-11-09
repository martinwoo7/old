import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Button
} from 'react-native';
import {addDoc, collection, doc, setDoc } from 'firebase/firestore'
import emulators from '../../firebase';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

const HomeScreen = ({ navigation }) => {

    const auth = emulators.authentication
    const db = emulators.firestore
    const user = auth.currentUser

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white'}}>
            <View style={{ flex: 1, padding: 16 }}>
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center"}}>
                    <Text style={{ fontSize: 20, textAlign: "center", marginBottom: 16}}>
                        FireBase Auth
                    </Text>
                    <Text>
                        Welcome{" "}
                        {user.displayName ? user.displayName : user.email}
                    </Text>

                    <Button onPress={()=>navigation.getParent('LeftPanel').openDrawer()} title="Left"/>
                    {/* <Button onPress={()=>navigation.getParent('RightPanel').openDrawer()} title="RIght"/> */}

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
        // height: 40,
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
});