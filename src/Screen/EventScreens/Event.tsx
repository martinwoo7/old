import React, { useEffect, useRef, useState } from "react";
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    Alert,
    // TouchableOpacity,
    StatusBar,
    Platform,
    TouchableWithoutFeedback,
    Pressable,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import { FlatList } from "react-native-gesture-handler";
import emulators from "../../../firebase";

const MainEvents = ({ navigation, route }) => {
    const auth = emulators.authentication;
    const toggleDrawer = () => navigation.toggleDrawer();
    const trending = [
        {
            title: "Event title",
            description: "Event description",
        },
        {
            title: "Event title",
            description: "Event description",
        },
        {
            title: "Event title",
            description: "Event description",
        },
    ];
    const renderItem = ({ item }) => {
        return (
            <View
                style={{
                    borderRadius: 12,
                    backgroundColor: "gainsboro",
                    paddingHorizontal: 5,
                    paddingVertical: 40,
                    width: 300,
                    height: 200,
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                <Text>{item.title}</Text>
                <Text>{item.description}</Text>
            </View>
        );
    };
    return (
        <SafeAreaView style={[styles.AndroidSafeAreaView, styles.container]}>
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginHorizontal: 5,
                    marginBottom: 20,
                }}
            >
                <TouchableWithoutFeedback onPress={toggleDrawer}>
                    <MaterialCommunityIcons
                        name="menu"
                        style={{ paddingTop: 10 }}
                        color={"lightgrey"}
                        size={26}
                    />
                </TouchableWithoutFeedback>
                <Text
                    style={{
                        color: "aliceblue",
                        fontSize: 28,
                        fontWeight: "500",
                        marginLeft: 20,
                        marginTop: 10,
                    }}
                >
                    Events
                </Text>
            </View>

            <View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text
                        style={{
                            color: "aliceblue",
                            fontSize: 22,
                            fontWeight: "300",
                            marginLeft: 0,
                            marginBottom: 5,
                        }}
                    >
                        Trending
                    </Text>
                    <Pressable
                        style={{
                            alignItems: "center",
                            flexDirection: "row",
                            marginLeft: "auto",
                        }}
                        onPress={() => {
                            console.log("pressed see all");
                        }}
                    >
                        <Text
                            style={{ color: "aliceblue", alignItems: "center" }}
                        >
                            View All{" "}
                        </Text>
                        <MaterialCommunityIcons
                            name="chevron-right"
                            color="aliceblue"
                            size={21}
                        />
                    </Pressable>
                </View>
                <FlatList
                    data={trending}
                    renderItem={renderItem}
                    horizontal
                    ItemSeparatorComponent={<View style={{ width: 10 }}></View>}
                    showsHorizontalScrollIndicator={false}
                />
            </View>
            <View style={{ marginTop: 20 }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text
                        style={{
                            color: "aliceblue",
                            fontSize: 22,
                            fontWeight: "300",
                            marginLeft: 0,
                            marginBottom: 5,
                        }}
                    >
                        Upcoming
                    </Text>
                    <Pressable
                        style={{
                            alignItems: "center",
                            flexDirection: "row",
                            marginLeft: "auto",
                        }}
                        onPress={() => {
                            console.log("pressed see all");
                        }}
                    >
                        <Text
                            style={{ color: "aliceblue", alignItems: "center" }}
                        >
                            View All{" "}
                        </Text>
                        <MaterialCommunityIcons
                            name="chevron-right"
                            color="aliceblue"
                            size={21}
                        />
                    </Pressable>
                </View>
                <FlatList
                    data={trending}
                    renderItem={renderItem}
                    horizontal
                    ItemSeparatorComponent={<View style={{ width: 10 }}></View>}
                    showsHorizontalScrollIndicator={false}
                />
            </View>
        </SafeAreaView>
    );
};

export default MainEvents;

const styles = StyleSheet.create({
    AndroidSafeAreaView: {
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    container: {
        marginHorizontal: 10,
    },
});
