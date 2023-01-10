import React, { useState, useEffect} from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { 
  onAuthStateChanged,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashScreen from './Screen/SplashScreen';
import LoginScreen from './Screen/LoginScreen';
import RegisterScreen from './Screen/RegisterScreen';
import HomeScreen from './Screen/HomeScreen';
import ChatScreen from './Screen/ChatScreen';
import ChatList from './Screen/ChatList';
import GroupModal from './Screen/ModalScreen';
import GroupScreen from './Screen/GroupScreen';

// import authentication from './firebase';
import emulators from './firebase';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

// cd old
// npx expo start
const chatStack = createNativeStackNavigator();
const Stack = createNativeStackNavigator();
const mainStack = createNativeStackNavigator()
const Tab = createBottomTabNavigator();

const Auth = () => {
  return (
    <Stack.Navigator intialRouteName="LoginScreen">
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
          title: 'Register',
          headerStyle: {
            backgroundColor: '#307ecc',
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          animation: "slide_from_right",
        }}
      />
    </Stack.Navigator>
  );
};

const MainTabs = () => {
  return(
    <Tab.Navigator 
      initialRouteName='Home'
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName;
          if (route.name === "Home") {
            iconName = 'home'

          } else if (route.name === "ChatList") {
            iconName = 'chat-bubble'
          }
          return <MaterialIcons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
      })}

    >
      <Tab.Screen 
        name="Home" component={HomeScreen} options={{title: "Home", headerShown: false}}
      />
      <Tab.Screen 
        name="ChatList" component={ChatList} options={{title: "Chat", headerShown: false}}
      />
    </Tab.Navigator>
  )
}
// TODO: add icons to tab navigator
const Main = () => {
  return (
    <mainStack.Navigator initialRouteName="HomeTabs">
      <mainStack.Group >
        <mainStack.Screen 
          name="HomeTabs"
          component={MainTabs}
          options={{
            title: "Home",
            headerShown: false
          }}
        />
        <mainStack.Screen 
          name="ChatScreen"
          component={ChatScreen}
          options={{
            title: "Chat",
            headerShown: false,
            animation: "slide_from_right"
          }}
        />
      </mainStack.Group>
      <mainStack.Group screenOptions={{presentation: 'modal'}}>
          <mainStack.Screen 
            name="Modal" 
            component={GroupModal} 
            options={{
              headerShown: false,
              animation: "slide_from_bottom",
            }}
          />
          <mainStack.Screen 
            name="GroupScreen"
            component={GroupScreen}
            options={{
              headerShown: false,
              animation: "slide_from_right"
            }}
          />
      </mainStack.Group>
    </mainStack.Navigator>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator intialRouteName="SplashScreen">
        {/* Splash will appear for 5 seconds */}
        <Stack.Screen 
          name="SplashScreen"
          component={SplashScreen}
          options={{
            headerShown: false,
            animation: "fade",
          }}
        />
        {/* Auth Navigator: include login and signup */}
        <Stack.Screen 
          name="Main"
          component={Main}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="Auth"
          component={Auth}
          options={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;