import React, {
    useEffect,
    useState,
    useRef,
    useLayoutEffect,
    useMemo,
    useCallback,
} from "react";
import {
    View,
    Text,
    StyleSheet,
    Platform,
    SafeAreaView,
    StatusBar,
    Pressable,
    TouchableWithoutFeedback,
    ActivityIndicator,
    Button,
    TouchableOpacity,
} from "react-native";
import emulators from "../../firebase";
import {
    FlatList,
    Gesture,
    GestureDetector,
} from "react-native-gesture-handler";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    interpolate,
    Extrapolation,
    withTiming,
    runOnJS,
    interpolateColor,
} from "react-native-reanimated";
import {
    collection,
    orderBy,
    query,
    limit,
    onSnapshot,
    getDocs,
    where,
    addDoc,
    Timestamp,
    startAfter,
} from "firebase/firestore";

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import { useDrawerProgress } from "@react-navigation/drawer";
import BottomSheet from "@gorhom/bottom-sheet";
import { MessageComponent } from "../Components/Post";

// const temp = {
//     content: "Testing content. This is a strong message and a long message",
//     createdAt: new Date(2022, 11, 30),
//     createdBy: "ufsaqZFjpdujUJSmb79l9kEAUvbN",
//     name: "Jimmy",
//     type: 0,
//     score: 0,
//     likes: 0,
//     comments: 0,
//     verb: "shouted",
// }

const ServerScreen = ({ navigation, route }) => {
    const db = emulators.firestore;
    const auth = emulators.authentication;

    const [items, setItems] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [fetching, setFetching] = useState(false);
    // const [loading, setLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState(null);
    const [offset, setOffset] = useState(0);

    const lastVisible = useRef(null);

    const filterSheetRef = useRef<BottomSheet>(null);
    const rightSheetRef = useRef<BottomSheet>(null);

    const snapPoints = useMemo(() => ["10%", "50%"], []);

    const toggleDrawer = () => navigation.toggleDrawer();

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);

    useEffect(() => {
        const getPosts = async () => {
            const q = query(
                collection(db, "posts"),
                where("score", ">=", 0),
                orderBy("score", "desc"),
                limit(25)
            );
            const querySnapshot = await getDocs(q);
            lastVisible.current =
                querySnapshot.docs[querySnapshot.docs.length - 1];

            const posts = [];
            querySnapshot.forEach((doc) => {
                // temp.push(doc.data())
                const temp = Object.assign({ id: doc.id }, doc.data());
                posts.push(temp);
            });
            setItems(posts);
        };
        getPosts();
    }, []);

    const renderItem = ({ item }) => {
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

    const footer = () => {
        return (
            <View>
                <TouchableOpacity>
                    <Text style={{color: 'aliceblue'}}>Loading</Text>
                    {fetching ? (
                        <ActivityIndicator
                            color="white"
                            style={{ marginLeft: 8 }}
                        />
                    ) : null}
                </TouchableOpacity>
            </View>
        );
    };

    const loadMore = () => {
        const q = query(
            collection(db, "posts"),
            where("score", ">=", 0),
            orderBy("score", "desc"),
            limit(25),
            startAfter(lastVisible.current)
        );
        console.log('loading more')
    };
    const MiddlePanel = () => {
        return (
            <>
                <Animated.View style={[styles.middlePanel]}>
                    <Animated.View
                        style={[
                            {
                                flex: 1,
                                marginTop: StatusBar.currentHeight,
                                backgroundColor: "#35393F",
                                paddingHorizontal: 15,
                                borderTopLeftRadius: 12,
                            },
                        ]}
                    >
                        <TouchableWithoutFeedback onPress={toggleDrawer}>
                            <MaterialCommunityIcons
                                name="menu"
                                style={{ paddingTop: 15 }}
                                color={"lightgrey"}
                                size={26}
                            />
                        </TouchableWithoutFeedback>
                        {loading ? (
                            <ActivityIndicator size="large" />
                        ) : (
                            <FlatList
                                showsVerticalScrollIndicator={false}
                                // refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                                onRefresh={() => onRefresh()}
                                refreshing={refreshing}
                                data={items}
                                renderItem={renderItem}
                                keyExtractor={(item) => item.content}
                                // contentContainerStyle={{ paddingBottom: 10 }}
                                // tslint:disable-next-line
                                ItemSeparatorComponent={separator}
                                style={{ marginTop: 10 }}
                                onEndReached={loadMore}
                                onEndReachedThreshold={0.1}
                                ListEmptyComponent={
                                    <View>
                                        <Text>Nothing here :(</Text>
                                    </View>
                                }
                                ListFooterComponent={footer}
                            />
                        )}
                    </Animated.View>

                    <View
                        style={{
                            flexDirection: "row",
                            backgroundColor: "#35393F",
                            paddingVertical: 7,
                        }}
                    >
                        <Pressable
                            style={{
                                backgroundColor: "#35393F",
                                flex: 1,
                                alignItems: "center",
                                paddingVertical: 5,
                            }}
                            onPress={() => {
                                filterSheetRef.current.expand();
                            }}
                        >
                            <MaterialCommunityIcons
                                name="filter-variant"
                                size={24}
                                color="lightgrey"
                            />
                        </Pressable>

                        <Pressable
                            style={{
                                backgroundColor: "#35393F",
                                flex: 1,
                                alignItems: "center",
                                paddingVertical: 5,
                            }}
                            onPress={() => {
                                navigation.navigate("NewPost");
                            }}
                        >
                            <MaterialIcons
                                name="add"
                                size={24}
                                color="lightgrey"
                            />
                        </Pressable>

                        <Pressable
                            style={{
                                backgroundColor: "#35393F",
                                flex: 1,
                                alignItems: "center",
                                paddingVertical: 5,
                            }}
                            onPress={() => {
                                rightSheetRef.current.expand();
                            }}
                        >
                            <MaterialCommunityIcons
                                name="filter-variant"
                                size={24}
                                color="lightgrey"
                            />
                        </Pressable>
                    </View>

                    <BottomSheet
                        enablePanDownToClose
                        ref={filterSheetRef}
                        index={-1}
                        snapPoints={snapPoints}
                        // onChange={handleSheetChanges}
                        backgroundStyle={{ backgroundColor: "#202225" }}
                        handleIndicatorStyle={{ backgroundColor: "lightgrey" }}
                    >
                        <View>
                            <Text style={{ color: "lightgrey" }}>
                                Filter item
                            </Text>
                        </View>
                    </BottomSheet>
                </Animated.View>
            </>
        );
    };

    return (
        <SafeAreaView style={[styles.AndroidSafeArea, styles.container]}>
            <StatusBar
                barStyle={"light-content"}
                translucent
                backgroundColor={"rgba(0,0,0,0)"}
            />
            <MiddlePanel />
            {/* <Backdrop /> */}
        </SafeAreaView>
    );
};

export default ServerScreen;

const styles = StyleSheet.create({
    AndroidSafeArea: {
        // paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    container: {
        flex: 1,
        // backgroundColor: '#202225',
        backgroundColor: "#35393F",
    },
    middlePanel: {
        flex: 1,
        height: "100%",
        // backgroundColor: 'blue'
    },
    solid: {
        backgroundColor: "red",
        opacity: 1,
    },
});
