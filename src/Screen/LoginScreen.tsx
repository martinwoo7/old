import React, {useState, useEffect, createRef} from 'react';
import {
    SafeAreaView,
    StyleSheet,
    View,
    Text,
    ScrollView,
    KeyboardAvoidingView,
    TextInput,
    TouchableOpacity,
    Image,
    Keyboard,
    Platform,
} from 'react-native';
import { 
    signInWithEmailAndPassword,
    onAuthStateChanged,
} from 'firebase/auth';
import emulators from '../../firebase';


const LoginScreen = ({ navigation }) => {
    const [userEmail, setUserEmail] = useState('');
    const [userPassword, setUserPassword] = useState('');
    const [errorText, setErrorText] = useState('');

    const passwordInputRef = createRef()

    const auth = emulators.authentication
    const db = emulators.firestore

    const signIn = async () => {
        try {
            await signInWithEmailAndPassword(auth, userEmail, userPassword)
            .then((userCredential) => {
                // Write user data to 'user' collection
                const user = userCredential.user;
                console.log(user.uid + " Logged in");
                navigation.navigate('Main')
            })
        } catch (error) {
            console.log(error);
            if (error.code === "auth/invalid-email") {
                setErrorText(error.message);
            }
            else if (error.code === "auth/user-not-found") {
                setErrorText("No user found")
            } else {
                setErrorText("Please check your email id or password")
            }
        }
    }

    const handleSubmitPress = () => {
        setErrorText('');
        if (!userEmail) {
            alert('Please fill Email');
            return;
        }
        if (!userPassword) {
            alert('Please fill Password');
            return;
        }
        signIn();
        
    }

    return (
        <SafeAreaView style={styles.mainBody}>
            <ScrollView 
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{
                    flex: 1,
                    justifyContent: 'center',
                    alignContent: 'center',
                }}
            >
                {/* <KeyboardAvoidingView 
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    // behavior={"position"}
                > */}
                    <View style={{alignItems: 'center'}}>
                        <Image
                            source={require('../../assets/ghost.png')}
                            style={{
                                width: '50%',
                                height: 100,
                                resizeMode: 'contain',
                                margin: 30,
                            }}
                        />
                    </View>
                    <View style={styles.SectionStyle}>
                        <TextInput 
                            style={styles.inputStyle}
                            onChangeText={(UserEmail) => setUserEmail(UserEmail)}
                            placeholder="Enter Email"
                            placeholderTextColor="#8b9cb5"
                            autoCapitalize="none"
                            keyboardType='email-address'
                            onSubmitEditing={() => 
                                passwordInputRef.current &&
                                passwordInputRef.current.focus()
                            }
                            underlineColorAndroid="#f000"
                            blurOnSubmit={false}
                        />
                    </View>
                    <View style={styles.SectionStyle}>
                        <TextInput
                            style={styles.inputStyle}
                            onChangeText={(UserPassword) => setUserPassword(UserPassword)}
                            placeholder="Enter Password"
                            placeholderTextColor="#8b9cb5"
                            keyboardType='default'
                            ref={passwordInputRef}
                            onSubmitEditing={Keyboard.dismiss}
                            blurOnSubmit={false}
                            secureTextEntry={true}
                            underlineColorAndroid="#f000"
                            returnKeyType='next'
                            autoCapitalize='none'
                        />
                    </View>
                    {errorText != '' ? (
                        <Text style={styles.errorTextStyle}>
                            {" "}
                            {errorText}{" "}
                        </Text>
                    ): null}
                    {/* <View style={[styles.checkboxContainer, styles.SectionStyle]}>
                        <CheckBox 
                            checked={checked}
                            onChange={onChange}
                            buttonStyle={styles.checkboxBase}
                            activeButtonStyle={styles.checkboxChecked}
                        />
                        <Text style={styles.checkboxLabel}>Keep me logged in</Text>
                    </View> */}
                    <TouchableOpacity 
                        style={styles.buttonStyle}
                        activeOpacity={0.5}
                        onPress={handleSubmitPress}
                    >
                        <Text style={styles.buttonTextStyle}>LOGIN</Text>
                    </TouchableOpacity>
                    <Text
                        style={styles.registerTextStyle}
                        onPress={() => navigation.navigate('RegisterScreen')}
                    >
                        New Here ? Register
                    </Text>
                {/* </KeyboardAvoidingView> */}
            </ScrollView>
        </SafeAreaView>
    )
}
export default LoginScreen

const styles = StyleSheet.create({
    mainBody: {
        flex: 1,
        // justifyContent: 'center',
        // paddingTop: 100,
        backgroundColor: '#307ecc',
        // alignContent: 'center',
    },
    SectionStyle: {
        flexDirection: 'row',
        height: 40,
        marginTop: 20,
        marginLeft: 35,
        marginRight: 35,
        marginB: 10,
    },
    buttonStyle: {
        backgroundColor: '#7DE24E',
        borderWidth: 0,
        color: "#FFFFFF",
        borderColor: '#7DE24E',
        height: 40,
        alignItems: 'center',
        borderRadius: 30,
        marginLeft: 35,
        marginRight: 35,
        marginTop: 20,
        marginBottom: 25,
    },
    buttonTextStyle: {
        color: '#FFFFFF',
        paddingVertical: 10,
        fontSize: 16,
    },
    inputStyle: {
        flex: 1,
        color: 'white',
        paddingLeft: 15,
        paddingRight: 15,
        borderWidth: 1,
        borderRadius: 30,
        borderColor: '#dadae8',
    },
    registerTextStyle: {
        color: '#FFFFFF',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 14,
        alignSelf: 'center',
        padding: 10,
    },
    errorTextStyle: {
        color: 'red',
        textAlign: 'center',
        fontSize: 14,
    },
    checkboxContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    checkboxLabel: {
        marginLeft: 8,
        fontSize: 14,
    },
    checkboxBase: {
        width: 24,
        height: 24,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 4,
        borderWidth: 2,
        borderColor: "coral",
        backgroundColor: 'transparent'
    },
    checkboxChecked: {
        backgroundColor: 'coral'
    },
});