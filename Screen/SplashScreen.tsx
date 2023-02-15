import { onAuthStateChanged } from 'firebase/auth';
import React, {useState, useEffect} from 'react';
import {
    SafeAreaView,
    ActivityIndicator,
    View,
    StyleSheet,
    Image,
    Text,
} from 'react-native';
import emulators from '../firebase';

const SplashScreen = ({ navigation }) => {
    const [animating, setAnimating] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setAnimating(false);
            // check if user_id is set or not
            // if not, then send for auth
            // else send to home screen

            // const auth = emulators.authentication
            // const user = auth.currentUser
            // // onAuthStateChanged(auth, (user) => {
            // if (user) {
            //     console.log("user signed in with id ", user.uid)
            //     navigation.replace("Main");
            // } else {
            //     navigation.replace("Auth");
            // }     
            navigation.replace("Main")
          
        }, 1000);

    }, []);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#307ecc" }}>
            <View style={styles.container}>
                <Image 
                    source={require('../assets/ghost.png')}
                    style={{width: '90%', resizeMode: 'contain', margin: 30}}
                />
                <ActivityIndicator 
                    animating={animating}
                    color="#FFFFFF"
                    size="large"
                    style={styles.activityIndicator}
                />
            </View>
            <Text 
                style={{
                    fontSize: 18,
                    textAlign: "center",
                    color: "white",
                }}
            >
                React Native Firebase Authentication
            </Text>
            <Text style={{
                fontSize: 16,
                textAlign: "center",
                color: "white",
            }}>
                Testing
            </Text>
        </SafeAreaView>
    )
}

export default SplashScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#307ecc',
    },
    activityIndicator: {
        alignItems: 'center',
        height: 80,
    },
});