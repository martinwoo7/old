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
import { MaterialTabBar, Tabs } from "react-native-collapsible-tab-view";

import emulators from "../../firebase";
import {
    collection,
    getDocs,
    limit,
    onSnapshot,
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

const Profile = ({ navigation }) => {
    const auth = emulators.authentication;
    const db = emulators.firestore;

    const [comments, setComments] = useState([]);
    const lastVisible = useRef(null);
    const postRef = useRef(null);

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
            setComments(temp);
        };
        getComments();
    }, []);

    const [posts, setPosts] = useState(null);
    useEffect(() => {
        const getPosts = async () => {
            const q = query(
                collection(db, "posts"),
                where("createdBy", "==", auth.currentUser.uid),
                orderBy("createdAt", "asc")
            );
            let temp = [];
            const unsub = onSnapshot(q, (querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    let item = Object.assign({ id: doc.id }, doc.data());
                    temp.unshift(item);
                });
            });
            postRef.current = unsub;
            setPosts(temp);
        };

        getPosts();
        return () => {
            postRef.current && postRef.current();
        };
    }, []);

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
                        paddingBottom: 50,
                    }}
                >
                    <TouchableOpacity
                        onPress={() => navigation.toggleDrawer()}
                        style={{
                            position: "absolute",
                            left: 10,
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

    const renderPosts = ({ item }) => {
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

    const renderComments = ({ item }) => {
        return (
            <CommentComponent
                content={item.content}
                likes={item.likes}
                replyingTo={item.replyingTo}
            />
        );
    };
    const separator = () => {
        return <View style={{ marginVertical: 5 }}></View>;
    };
    return (
        <>
            <Tabs.Container
                renderHeader={Header}
                renderTabBar={(props) => (
                    <MaterialTabBar
                        {...props}
                        style={{ backgroundColor: "#202225" }}
                        activeColor="orange"
                        inactiveColor="aliceblue"
                    />
                )}
                minHeaderHeight={50}
            >
                <Tabs.Tab name="Posts">
                    <Tabs.FlatList
                        data={posts}
                        renderItem={renderPosts}
                        keyExtractor={(item) => item.id}
                        style={{ marginTop: 10 }}
                        contentContainerStyle={{ marginHorizontal: 10 }}
                        ItemSeparatorComponent={separator}
                        // ListEmptyComponent={
                        //     <View
                        //         style={{
                        //             display: "flex",
                        //             alignItems: "center",
                        //             marginTop: 20
                        //         }}
                        //     >
                        //         <Text style={{ color: "dimgray" }}>
                        //             No posts :(
                        //         </Text>
                        //     </View>
                        // }
                    />
                </Tabs.Tab>

                <Tabs.Tab name="Comments">
                    <Tabs.FlatList
                        data={comments}
                        renderItem={renderComments}
                        contentContainerStyle={{ marginHorizontal: 10 }}
                        style={{ marginTop: 10 }}
                        keyExtractor={(item) => item.id}
                        ListEmptyComponent={
                            <View
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    marginTop: 20
                                }}
                            >
                                <Text style={{ color: "dimgray" }}>
                                    No comments :(
                                </Text>
                            </View>
                        }
                    />
                </Tabs.Tab>
            </Tabs.Container>
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
});
