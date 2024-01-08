import React, { useEffect, useRef, useState, useCallback } from "react";
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
    FlatList,
    TouchableWithoutFeedback,
} from "react-native";
import { TabView, SceneMap } from "react-native-tab-view";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { MessageComponent } from "../Components/Post";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Tabs } from "react-native-collapsible-tab-view";

import emulators from "../firebase";
import {
    collection,
    getDocs,
    limit,
    orderBy,
    query,
    where,
} from "firebase/firestore";
import {} from "react-native-gesture-handler";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import EditScreen from "./EditScreen";
import StyleScreen from "./StyleScreen";

const Tab = createMaterialTopTabNavigator();
const Stack = createNativeStackNavigator();

const UserPosts = ({ navigation, route }) => {
    const auth = emulators.authentication;
    const db = emulators.firestore;

    const [posts, setPosts] = useState(null);
    useEffect(() => {
        const getPosts = async () => {
            const q = query(
                collection(db, "posts"),
                where("createdBy", "==", auth.currentUser.uid),
                orderBy("createdAt", "asc")
            );
            const querySnapshot = await getDocs(q);
            let temp = [];
            querySnapshot.forEach((doc) => {
                let item = Object.assign({ id: doc.id }, doc.data());
                temp.unshift(item);
            });
            setPosts(temp);
        };

        getPosts();
    }, []);

    const renderItem = ({ item }) => {
        // console.log(item)
        return (
            <>
                <MessageComponent
                    navigation={navigation}
                    enabled
                    data={item}
                    type={item.type}
                    tags={item.tags}
                />
            </>
        );
    };
    const separator = () => {
        return <View style={{ marginVertical: 5 }}></View>;
    };
    return (
        <View>
            <FlatList
                showsVerticalScrollIndicator={false}
                data={posts}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                style={{ marginHorizontal: 10, marginTop: 10 }}
                ItemSeparatorComponent={separator}
            />
        </View>
    );
};

const CommentComponent = ({ content, likes, replyingTo }) => {
    return (
        <View style={{ justifyContent: "center", alignItems: "center" }}>
            <Text style={{ color: "aliceblue" }}>{replyingTo}</Text>
            <Text
                style={{ color: "aliceblue" }}
                numberOfLines={1}
                ellipsizeMode="tail"
            >
                {content}
            </Text>
        </View>
    );
};

const UserComments = () => {
    const auth = emulators.authentication;
    const db = emulators.firestore;

    const [data, setData] = useState([]);
    const lastVisible = useRef(null);

    useEffect(() => {
        // need to paginate
        const getComments = async () => {
            const q = query(
                collection(db, "comments"),
                where("createdBy", "==", auth.currentUser.uid),
                limit(25)
            );
            const querySnapshot = await getDocs(q);
            lastVisible.current =
                querySnapshot.docs[querySnapshot.docs.length - 1];

            const temp = [];
            querySnapshot.forEach((doc) => {
                temp.unshift(doc.data());
            });
            setData(temp);
        };
        getComments();
    }, []);

    const empty = () => {
        return (
            <View
                style={{
                    justifyContent: "center",
                    alignItems: "center",
                    flex: 1,
                    backgroundColor: "red",
                }}
            >
                <Text>There's nothing here</Text>
            </View>
        );
    };

    const renderItem = ({ item }) => {
        return (
            <CommentComponent
                content={item.content}
                likes={item.likes}
                replyingTo={item.replyingTo}
            />
        );
    };
    return (
        <View style={{ flex: 1 }}>
            <FlatList
                data={data}
                renderItem={renderItem}
                ListEmptyComponent={empty}
            />
        </View>
    );
};

const Profile = ({ navigation }) => {
    const auth = emulators.authentication;

    const Header = () => {
        return (
            <SafeAreaView style={styles.AndroidSafeAreaView}>
                <View
                    style={{
                        width: "100%",
                        height: 350,
                        backgroundColor: "#202225",
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                    }}
                >
                    <TouchableOpacity
                        onPress={() => navigation.toggleDrawer()}
                        style={{
                            position: "absolute",
                            left: 15,
                            zIndex: 2,
                            top: 50,
                        }}
                    >
                        <MaterialCommunityIcons
                            name="menu"
                            color={"lightgrey"}
                            size={26}
                        />
                    </TouchableOpacity>
                    <View>
                        <Text style={{ color: "aliceblue" }}>
                            {auth.currentUser.displayName}
                        </Text>
                    </View>
                    <View
                        style={{
                            position: "absolute",
                            right: 10,
                            top: "20%",
                            backgroundColor: "#DCDFE4",
                            borderRadius: 24,
                            height: 100,
                            justifyContent: "space-evenly",
                            paddingHorizontal: 5,
                        }}
                    >
                        <Pressable onPress={() => navigation.navigate("Style")}>
                            <MaterialCommunityIcons name="hanger" size={24} />
                        </Pressable>

                        <Pressable onPress={() => navigation.navigate("Edit")}>
                            <MaterialIcons name="edit" size={24} />
                        </Pressable>
                    </View>
                </View>
            </SafeAreaView>
        );
    };

    const DATA = [0, 1, 2, 3, 4];
    const HEADER_HEIGHT = 350;
    const identity = (v: unknown): string => v + "";
    const renderItem = useCallback(({ index }) => {
        return (
            <View
                style={[
                    styles.box,
                    index % 2 === 0 ? styles.boxB : styles.boxA,
                ]}
            />
        );
    }, []);

    return (
        <>
            {/* <ScrollView> */}
            <Tabs.Container renderHeader={Header}>
                <Tabs.Tab name="UserPosts">
                    <Tabs.FlatList
                        data={DATA}
                        renderItem={renderItem}
                        keyExtractor={identity}
                    />
                </Tabs.Tab>
                <Tabs.Tab name="Comments">
                    <Tabs.FlatList
                        data={DATA}
                        renderItem={renderItem}
                        keyExtractor={identity}
                    />
                </Tabs.Tab>
            </Tabs.Container>
            {/* <Tab.Navigator
                initialRouteName="UserPosts"
                screenOptions={{
                    tabBarStyle: { backgroundColor: "#202225" },
                }}
            >
                <Tab.Screen
                    name="UserPosts"
                    component={UserPosts}
                    options={{ tabBarLabel: "Posts" }}
                />
                <Tab.Screen name="Comments" component={UserComments} />
            </Tab.Navigator> */}
            {/* </ScrollView> */}
        </>
    );
};

const ProfileScreen = ({ navigation, route }) => {
    return (
        <Stack.Navigator
            initialRouteName="ProfileScreen"
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="ProfileScreen" component={Profile} />
            <Stack.Screen name="Edit" component={EditScreen} />
            <Stack.Screen name="Style" component={StyleScreen} />
        </Stack.Navigator>
    );
};

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

    box: {
        height: 250,
        width: "100%",
    },
    boxA: {
        backgroundColor: "white",
    },
    boxB: {
        backgroundColor: "#D8D8D8",
    },
    header: {
        height: 350,
        width: "100%",
        backgroundColor: "#2196f3",
    },
});
