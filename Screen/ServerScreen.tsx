import React, { useEffect, useState, useRef, useLayoutEffect, useMemo, useCallback } from "react";
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
} from 'react-native'
import emulators from "../firebase";
import { FlatList, Gesture, GestureDetector, ScrollView } from 'react-native-gesture-handler';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withSpring, 
    interpolate, 
    Extrapolation,
    withTiming,
    runOnJS,
    interpolateColor,
} from 'react-native-reanimated';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'

import { useDrawerProgress } from '@react-navigation/drawer';
import BottomSheet from '@gorhom/bottom-sheet'
import { Posts } from "../Components/Post";
import { useInternal } from "../Hooks/useInternal";
import { CONTEXT_MENU_STATE, ICON_SIZE } from "../constants";

const ServerScreen = ({ navigation, route}) => {
    const db = emulators.firestore
    const auth = emulators.authentication
    
    const { postState } = useInternal()
    const plusSheetRef = useRef<BottomSheet>(null)
    const filterSheetRef = useRef<BottomSheet>(null)
    const rightSheetRef = useRef<BottomSheet>(null)
    const snapPoints = useMemo(() => ['10%', '50%'], [])

    const handleSheetChanges = useCallback((index: number) => {
        console.log('handlesheet', index)
    }, [])
    

    const toggleDrawer = () => navigation.toggleDrawer()
    const drawerProgress = useDrawerProgress();

    const bgStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            drawerProgress.value, 
            [0.98, 0.99], 
            ["rgba(53, 57, 63, 1)", "rgba(53, 57, 63, 0)"]
        )
        return {
            backgroundColor
        }
    })
    

    const items = [{id: 1, color: '#00ff00'}, {id: 2, color: '#0000ff'}, {id: 3, color: 'pink'}, {id: 4, color: 'purple'},   {id: 5, color: 'orange'}] 
    // const items = [{id: 1, color: '#00ff00'}, {id: 2, color: '#0000ff'}] 



    const renderItems = (() => {
        return (
            <>
                <Posts navigation={navigation}/>  
            </>
        )
    })

    const MiddlePanel = () => {

        return (
            <Animated.View style={[styles.middlePanel]}>
                <Animated.View style={[{flex: 1, marginTop: StatusBar.currentHeight, backgroundColor: "#35393F", paddingHorizontal: 15, borderTopLeftRadius: 12}]}>
                    <TouchableWithoutFeedback onPress={toggleDrawer} >
                        <MaterialCommunityIcons name="menu" style={{paddingTop: 15}} color={'lightgrey'} size={26} />
                    </TouchableWithoutFeedback>               
                    
                    <FlatList 
                        showsVerticalScrollIndicator={false}
                        data={items}
                        renderItem={renderItems}
                        contentContainerStyle={{paddingBottom: 10}}
                        ItemSeparatorComponent={<View style={{marginVertical: 5}}></View>}
                        style={{marginTop: 10}}
                    /> 

                    
                </Animated.View>
                
                <View style={{flexDirection: 'row', backgroundColor: '#202225'}}>
 
                        <Pressable 
                        style={{backgroundColor: '#202225', flex: 1, alignItems: 'center', paddingVertical: 5}}
                        onPress={()=>{filterSheetRef.current.expand()}}
                        >
                            <MaterialCommunityIcons name="filter-variant" size={ICON_SIZE} color="lightgrey"/>
                        </Pressable>

                        <Pressable 
                        style={{backgroundColor: '#202225', flex: 1, alignItems: 'center', paddingVertical: 5}}
                        onPress={()=>{navigation.navigate('NewPost')}}
                        >
                            <MaterialIcons name="add" size={ICON_SIZE} color="lightgrey"/>
                        </Pressable>

                        <Pressable 
                        style={{backgroundColor: '#202225', flex: 1, alignItems: 'center', paddingVertical: 5}}
                        onPress={()=>{rightSheetRef.current.expand()}}
                        >
                            
                            <MaterialCommunityIcons name="filter-variant" size={ICON_SIZE} color="lightgrey"/>
                        </Pressable>

                    </View> 
                

                    <BottomSheet
                        enablePanDownToClose
                        ref={filterSheetRef}
                        index={-1}
                        snapPoints={snapPoints}
                        onChange={handleSheetChanges}
                        backgroundStyle={{backgroundColor: '#202225'}}
                        handleIndicatorStyle={{backgroundColor: "lightgrey"}}
                    >
                        <View>
                            <Text style={{color: "lightgrey"}}>Filter item</Text>
                        </View>
                    </BottomSheet>

                    <BottomSheet
                        enablePanDownToClose
                        ref={rightSheetRef}
                        index={-1}
                        snapPoints={snapPoints}
                        onChange={handleSheetChanges}
                        backgroundStyle={{backgroundColor: '#202225'}}
                        handleIndicatorStyle={{backgroundColor: "lightgrey"}}
                    >
                        <View>
                            <Text style={{color: "lightgrey"}}>Right???</Text>
                        </View>
                    </BottomSheet>
            </Animated.View>

        )
    }

    return (
        <SafeAreaView style={[styles.AndroidSafeArea, styles.container]}>
            <StatusBar barStyle={'light-content'} translucent backgroundColor={"rgba(0,0,0,0)"}/>
            <MiddlePanel />
            {/* <Backdrop /> */}
            
        </SafeAreaView>
    )
}

export default ServerScreen

const styles = StyleSheet.create({
    AndroidSafeArea: {
        // paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    container: {
        flex: 1,
        backgroundColor: '#202225',

    },
    middlePanel: {
        flex: 1,
        height: '100%',
        // backgroundColor: 'blue'
    },
    solid: {
        backgroundColor: 'red',
        opacity: 1,

    }
})