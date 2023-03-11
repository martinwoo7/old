import React, { useEffect, useRef, useState } from "react";
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    Alert,
    TouchableOpacity,
    StatusBar,
    Platform,
    Pressable,
    BackHandler,
    Dimensions,
    ScrollView,
    FlatList
} from "react-native";
import { TabView, SceneMap } from 'react-native-tab-view';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { MessageComponent } from "../Components/Post";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'

import emulators from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { } from "react-native-gesture-handler";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import EditScreen from "./EditScreen";
import StyleScreen from "./StyleScreen";

const Tab = createMaterialTopTabNavigator()
const Stack = createNativeStackNavigator()

const UserPosts = ({ navigation, route }) => {
    const auth = emulators.authentication
    const db = emulators.firestore

    const [posts, setPosts] = useState(null)
    useEffect(() => {
        const getPosts = async () => {
            const q = query(
                collection(db, 'posts'),
                where('createdBy', "==", auth.currentUser.uid)
            )
            const querySnapshot = await getDocs(q)
            let temp = []
            querySnapshot.forEach((doc) => {
                temp.push(doc.data())
            })
            setPosts(temp)
        }

        getPosts()
    }, [])

    const renderItem = ({ item }) => {
        return (
            <MessageComponent navigation={navigation} disabled data={item} type={item.type} tags={item.tags} />
        )
    }
    const separator = () => {
        return (
            <View style={{ marginVertical: 5 }}></View>
        )
    }
    return (
        <View>
            <FlatList
                showsVerticalScrollIndicator={false}
                data={posts}
                renderItem={renderItem}
                keyExtractor={item => item.content}
                style={{ marginHorizontal: 10, marginTop: 10 }}
                ItemSeparatorComponent={separator}
            />


        </View>


    )
}

const CommentComponent = ({ }) => {

    return (
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Text>Content</Text>
        </View>
    )
}

const UserComments = () => {
    const auth = emulators.authentication
    const db = emulators.firestore
    const [data, setData] = useState([])
    const empty = () => {
        return (
            <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1, backgroundColor: 'red' }}>
                <Text>There's nothing here</Text>
            </View>
        )
    }

    const renderItem = ({ item }) => {
        return (
            <CommentComponent />
        )
    }
    return (
        <View style={{ flex: 1 }}>
            <FlatList
                data={data}
                renderItem={renderItem}
                ListEmptyComponent={empty}
            />
        </View>
    )
}

const Profile = ({ navigation }) => {
    const auth = emulators.authentication

    // useEffect(() => {
    //     const backAction = () => {
    //         navigation.getParent('Drawer').toggleDrawer()
    //         return true
    //     }
    //     const backHandler = BackHandler.addEventListener(
    //         'hardwareBackPress',
    //         backAction,
    //     );
    //     return () => backHandler.remove()
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
        <>
            <SafeAreaView style={styles.AndroidSafeAreaView}>
                {/* <Pressable onPress={()=>navigation.navigate('Server')} style={{position:'absolute', zIndex:3, left: 10, top: 40}}> 
                <MaterialIcons name="arrow-back" size={25} color="#202225" />
            </Pressable> */}
                <View style={{ width: '100%', height: 350, backgroundColor: 'aliceblue', display: 'flex', justifyContent: "flex-end", alignItems: 'center' }}>
                    <View>
                        <Text style={{}}>{auth.currentUser.displayName}</Text>
                    </View>
                    <View style={{ position: 'absolute', right: 10, top: '20%', backgroundColor: '#DCDFE4', borderRadius: 24, height: 100, justifyContent: 'space-evenly', paddingHorizontal: 5 }}>
                        <Pressable onPress={()=>navigation.navigate("Style")}>
                            <MaterialCommunityIcons name="hanger" size={24} />
                        </Pressable>

                        <Pressable onPress={()=>navigation.navigate("Edit")}>
                            <MaterialIcons name="edit" size={24} />
                        </Pressable>
                    </View>
                </View>

                {/* tabs panel */}


                {/* <TouchableOpacity 
                style={styles.buttonStyle}
                activeOpacity={0.5}
                onPress={logout}
            >
                <Text style={styles.buttonTextStyle}>
                    Logout
                </Text>
            </TouchableOpacity> */}

            </SafeAreaView>
            <Tab.Navigator
                initialRouteName="UserPosts"
                screenOptions={{
                    tabBarStyle: { backgroundColor: '#202225' }
                }}
            >
                <Tab.Screen name="UserPosts" component={UserPosts} options={{ tabBarLabel: "User Post" }} />
                <Tab.Screen name="Comments" component={UserComments} />
            </Tab.Navigator>
        </>
    )
}

const ProfileScreen = ({ navigation, route }) => {

    return (
        <Stack.Navigator initialRouteName="ProfileScreen"
            screenOptions={{
                headerShown: false
            }}
        >
            <Stack.Screen name="ProfileScreen" component={Profile} />
            <Stack.Screen name="Edit" component={EditScreen} />
            <Stack.Screen name="Style" component={StyleScreen} />
        </Stack.Navigator>
    )
}


export default ProfileScreen;

const styles = StyleSheet.create({
    AndroidSafeAreaView: {
        // paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0
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