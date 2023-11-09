import "react-native-gesture-handler";
import React, { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StatusBar,
    LogBox,
    TouchableOpacity,
    Dimensions,
    Platform,
    Pressable,
} from "react-native";
import {
    NavigationContainer,
    DefaultTheme,
    DarkTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
    createDrawerNavigator,
    DrawerContentScrollView,
    DrawerItemList,
    getDrawerStatusFromState,
} from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";

import SplashScreen from "./src/Screen/SplashScreen";
import LoginScreen from "./src/Screen/LoginScreen";
import RegisterScreen from "./src/Screen/RegisterScreen";
import ProfileScreen from "./src/Screen/ProfileScreen";
import ChatScreen from "./src/Screen/ChatScreen";
import ChatList from "./src/Screen/ChatList";
import NewChatScreen from "./src/Screen/NewChatScreen";
import GroupScreen from "./src/Screen/GroupScreen";
import ServerScreen from "./src/Screen/ServerScreen";
import PostScreen from "./src/Screen/PostScreen";
import NewPost from "./src/Screen/NewPost";
import EventScreen from "./src/Screen/EventScreen";

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import * as NavigationBar from "expo-navigation-bar";

import { signInWithEmailAndPassword } from "firebase/auth";
import emulators from "./firebase";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
} from "react-native-reanimated";
import {
    gestureHandlerRootHOC,
    GestureHandlerRootView,
} from "react-native-gesture-handler";
import Comment from "./src/Components/Comment";
import { setDoc, collection, doc, serverTimestamp, addDoc } from "firebase/firestore";

// cd old
// npx expo start

// firebase emulators:start --project demo-project --import=./export --export-on-exit=./export
// firebase emulators:export ./export --project demo-project
// TODO: integrate storage w/ redux, redux-persist, and AsyncStorage

const MainStack = createNativeStackNavigator();
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
const chatStack = createStackNavigator();
const Post = createNativeStackNavigator();

const navTheme = {
    ...DarkTheme,
    colors: {
        ...DarkTheme.colors,
        background: "#282b30",
    },
};

const Auth = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="LoginScreen"
                component={LoginScreen}
                options={{
                    headerShown: false,
                    animation: "slide_from_right",
                }}
            />
            <Stack.Screen
                name="RegisterScreen"
                component={RegisterScreen}
                options={{
                    title: "Register",
                    headerStyle: {
                        backgroundColor: "#307ecc",
                    },
                    headerTintColor: "#fff",
                    headerTitleStyle: {
                        fontWeight: "bold",
                    },
                    animation: "slide_from_right",
                }}
            />
        </Stack.Navigator>
    );
};

const Chat = () => {
    return (
        <chatStack.Navigator initialRouteName="ChatList">
            <chatStack.Screen
                name="ChatList"
                component={ChatList}
                options={{
                    headerShown: false,
                }}
            />
            <chatStack.Group screenOptions={{ presentation: "modal" }}>
                <chatStack.Screen
                    name="NewChat"
                    component={NewChatScreen}
                    options={{
                        headerShown: false,
                        // animation: 'slide_from_right'
                    }}
                />
                <chatStack.Screen
                    name="NewGroup"
                    component={GroupScreen}
                    options={{
                        headerShown: false,
                        // animation: 'slide_from_right'
                    }}
                />
            </chatStack.Group>
        </chatStack.Navigator>
    );
};

const PostStack = () => {
    return (
        <Post.Navigator
            initialRouteName="PostScreen"
            screenOptions={{ headerShown: false }}
        >
            <Post.Screen name="PostScreen" component={PostScreen} />
            <Post.Screen name="CommentScreen" component={Comment} />
        </Post.Navigator>
    );
};
const DrawerNavigator = () => {
    const auth = emulators.authentication;
    const db = emulators.firestore;

    const createUser = async () => {
        try {
            const response = await fetch("https://randomuser.me/api/");
            const json = await response.json();
            const results = json.results[0];
            console.log(results);


            await addDoc(collection(db, "users"), {
                createdAt: serverTimestamp(),
                likes: [],
                displayName: results.name.first + " " + results.name.last,
                photoURL: results.picture.large,
            });
        } catch (error) {
            console.log(error);
        }
    };

    const createPost = () => {
        console.log("post created");
    };
    const CustomDrawerContent = (props) => {
        return (
            <>
                <DrawerContentScrollView
                    showsVerticalScrollIndicator={false}
                    style={{
                        marginTop:
                            Platform.OS === "android"
                                ? StatusBar.currentHeight
                                : 0,
                        marginRight: 10,
                        backgroundColor: "#2F3137",
                        height: "100%",
                        borderTopRightRadius: 12,
                    }}
                    {...props}
                >
                    {/* avatar goes here */}
                    <View
                        style={{
                            height: 200,
                            borderRadius: 12,
                            backgroundColor: "#5D626F",
                            marginHorizontal: 10,
                            marginBottom: 10,
                        }}
                    >
                        <Text>Admin controls</Text>
                        {/* {auth.currentUser && <Text>{auth.currentUser.displayName}</Text>} */}
                        <Pressable
                            onPress={createUser}
                            style={{
                                backgroundColor: "lavender",
                                borderRadius: 12,
                                padding: 10,
                            }}
                        >
                            <Text>Create new user</Text>
                        </Pressable>
                        <Pressable
                            onPress={createPost}
                            style={{
                                backgroundColor: "lavender",
                                borderRadius: 12,
                                padding: 10,
                            }}
                        >
                            <Text>Add new post</Text>
                        </Pressable>
                    </View>
                    <DrawerItemList {...props} style={{}} />
                </DrawerContentScrollView>
            </>
        );
    };

    return (
        // <PortalProvider>
        <Drawer.Navigator
            initialRouteName="Server"
            id="Drawer"
            screenOptions={{
                drawerType: "back",
                // swipeEdgeWidth: Dimensions.get('window').width,
                swipeMinDistance: 15,
                drawerStyle: {
                    width: "90%",
                    backgroundColor: "#202225",
                },
                swipeEnabled: true,
                swipeEdgeWidth: 20,
            }}
            backBehavior="history"
            drawerContent={CustomDrawerContent}
        >
            {/* <Stack.Screen component={SplashScreen} name="Splash" options={{headerShown: false, animation: "fade"}}/> */}
            <Drawer.Screen
                component={ProfileScreen}
                name="Profile"
                options={{ headerShown: false }}
            />
            <Drawer.Screen
                component={ServerScreen}
                name="Server"
                options={{ headerShown: false }}
            />
            <Drawer.Screen
                component={Chat}
                name="Chat"
                options={{ headerShown: false }}
            />
            <Drawer.Screen
                component={EventScreen}
                name="Events"
                options={{ headerShown: false }}
            />
        </Drawer.Navigator>
        // </PortalProvider>
    );
};

const App = () => {
    const auth = emulators.authentication;
    const userEmail = "test@test.com";
    const userPassword = "testing";

    useEffect(() => {
        const signIn = async () => {
            try {
                await signInWithEmailAndPassword(
                    auth,
                    userEmail,
                    userPassword
                ).then((userCredential) => {
                    // Write user data to 'user' collection
                    const user = userCredential.user;
                    console.log(user.uid + " Logged in");
                });
            } catch (error) {
                console.log(error);
            }
        };
        signIn();
    }, []);

    NavigationBar.setBackgroundColorAsync("#202225");
    // NavigationBar.setBackgroundColorAsync('rgba(0,0,0, 0.5)')
    // NavigationBar.setButtonStyleAsync('light');

    return (
        <NavigationContainer theme={navTheme}>
            <MainStack.Navigator>
                {/* <MainStack.Screen 
            name="Auth"
            component={Auth}
            options={{
              headerShown: false,
              animation: "slide_from_right",
            }}
          /> */}
                <MainStack.Screen
                    component={gestureHandlerRootHOC(DrawerNavigator)}
                    name="Main"
                    options={{ headerShown: false }}
                />
                <MainStack.Group screenOptions={{ presentation: "modal" }}>
                    <MainStack.Screen
                        name="PostStack"
                        component={gestureHandlerRootHOC(PostStack)}
                        options={{
                            headerShown: false,
                            animation: "slide_from_bottom",
                            animationDuration: 250,
                        }}
                    />
                    <MainStack.Screen
                        name="NewPost"
                        component={gestureHandlerRootHOC(NewPost)}
                        options={{
                            headerShown: false,
                            animation: "slide_from_bottom",
                            animationDuration: 250,
                        }}
                    />
                </MainStack.Group>
            </MainStack.Navigator>
        </NavigationContainer>
    );
};

export default App;
