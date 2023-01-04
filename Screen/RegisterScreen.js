import React, { useState, createRef } from "react";
import {
    SafeAreaView,
    StyleSheet,
    TextInput,
    View,
    Text,
    Image,
    KeyboardAvoidingView,
    Keyboard,
    TouchableOpacity,
    ScrollView,
} from 'react-native';

import { createUserWithEmailAndPassword, updateProfile,} from 'firebase/auth';
import { createUser } from "../utils/users";
import emulators from "../firebase";

//  TODO: Allow user to create a display name.
const RegisterScreen = ({ navigation }) => {
    const [userName, setUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [userPassword, setUserPassword] = useState("");
    const [errorText, setErrorText] = useState("");

    const emailInputRef = createRef();
    const passwordInputRef = createRef();

    const auth = emulators.authentication

    const handleSubmitButton = async () => {
        setErrorText("");
        if (!userName) return alert("Please fill Name");
        if (!userEmail) return alert("Please fill Email");
        if (!userPassword) return alert("Please fill Password");

        
        await createUserWithEmailAndPassword(auth, userEmail, userPassword)
        .then((user) => {
            console.log("Registration Successful.");
            // console.log(user)
            if (user) {
                updateProfile(auth.currentUser, {
                    displayName: userName,
                    photoURL: "https://randomuser.me/api/portraits/men/22.jpg",
                })
                // .then(() => navigation.replace("Main")).catch((error) => {
                //     alert(error);
                //     console.error(error);
                // })
                .then(createUser(user))
            }
        }).catch((error) => {
            console.log(error);
            if (error.code === "auth/email-already-in-use") {
                setErrorText("That email address is already in use!");
            } else {
                setErrorText(error.message);
            }
        });
    }

    return (
        <SafeAreaView style={{ flex:1, backgroundColor: "#307ecc"}}>
            <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{
                    justifyContent: "center",
                    alignContent: "center",
                }}
            >
                <View style={{
                    alignItems: "center"
                }}>
                    <Image 
                        source={require("../assets/ghost.png")}
                        style={{
                            width: "50%",
                            height: 100,
                            resizeMode: "contain",
                            margin: 30
                        }}
                    />
                </View>
                <KeyboardAvoidingView enabled>
                    <View style={styles.sectionStyle}>
                        <TextInput 
                            style={styles.inputStyle}
                            onChangeText={(UserName) => setUserName(UserName)}
                            underlineColorAndroid="#f000"
                            placeholder="Enter Name"
                            placeholderTextColor="#8b9cb5"
                            autoCapitalize="none"
                            returnKeyType="next"
                            onSubmitEditing={() => emailInputRef.current && emailInputRef.current.focus()}
                            blurOnSubmit={false}
                        />
                    </View>
                    <View style={styles.sectionStyle}>
                        <TextInput
                            style={styles.inputStyle}
                            onChangeText={(UserEmail) => setUserEmail(UserEmail)}
                            underlineColorAndroid="#f000"
                            placeholder="Enter Email"
                            placeholderTextColor="#899cb5"
                            keyboardType="email-address"
                            ref={emailInputRef}
                            returnKeyType="next"
                            onSubmitEditing={() => passwordInputRef.current && passwordInputRef.current.focus()}
                            blurOnSubmit={false}
                            autoCapitalize="none"
                        />
                    </View>
                    <View style={styles.sectionStyle}>
                        <TextInput
                            style={styles.inputStyle}
                            onChangeText={(UserPassword) => setUserPassword(UserPassword)}
                            underlineColorAndroid="#f000"
                            placeholder="Enter Password"
                            placeholderTextColor="#8b9cb5"
                            ref={passwordInputRef}
                            returnKeyType="next"
                            secureTextEntry={true}
                            onSubmitEditing={Keyboard.dismiss}
                            blurOnSubmit={false}
                            autoCapitalize="none"

                        />
                    </View>
                    {errorText != "" ? (
                        <Text style={styles.errorTextStyle}>
                            {" "}
                            {errorText}{" "}
                        </Text>
                    ) : null}
                    <TouchableOpacity
                        style={styles.buttonStyle}
                        activeOpacity={0.5}
                        onPress={handleSubmitButton}
                    >
                        <Text style={styles.buttonTextStyle}>
                            REGISTER
                        </Text>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </ScrollView>

        </SafeAreaView>
    )
}
export default RegisterScreen;

const styles = StyleSheet.create({
    sectionStyle: {
        flexDirection: "row",
        height: 40,
        marginTop: 20,
        marginLeft: 35,
        marginRight: 35,
        margin: 10
    },
    buttonStyle: {
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
        marginBottom: 20,
    },
    buttonTextStyle: {
        color: "#FFFFFF",
        paddingVertical: 10,
        fontSize: 16,
    },
    inputStyle: {
        flex: 1,
        color: "white",
        paddingLeft: 15,
        paddingRight: 15,
        borderWidth: 1,
        borderRadius: 30,
        borderColor: "#dadae8",
    },
    errorTextStyle: {
        color: "red",
        textAlign: "center",
        fontSize: 14,
    }
})