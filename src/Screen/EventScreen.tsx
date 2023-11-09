import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import Events from "./EventScreens/Event";
import Search from "./EventScreens/Search";
import NewEvent from "./EventScreens/NewEvent";

const Tabbar = createBottomTabNavigator();
const EventScreen = ({ navigation, route }) => {
    return (
        <Tabbar.Navigator
            initialRouteName="MainEvents"
            screenOptions={{
                tabBarShowLabel: false,
                tabBarActiveTintColor: "orange",
                tabBarStyle: {
                    backgroundColor: "#202225",
                },
                headerShown: false,
            }}
        >
            <Tabbar.Screen
                name="MainEvents"
                component={Events}
                options={{
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="home" color={color} size={size} />
                    ),
                }}
            />
            <Tabbar.Screen
                name="New"
                component={NewEvent}
                options={{
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="plus" color={color} size={size} />
                    ),
                }}
            />
            <Tabbar.Screen
                name="Search"
                component={Search}
                options={{
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="search" color={color} size={size} />
                    ),
                }}
            />
        </Tabbar.Navigator>
    );
};

export default EventScreen;
