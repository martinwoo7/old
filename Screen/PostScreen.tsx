import React, {useEffect} from "react";
import { 
    Pressable, 
    Text, 
    View, 
    StyleSheet,
    StatusBar,
    Platform,
} from "react-native";
import { MessageComponent } from "../Components/Post";
import { SafeAreaView } from "react-native-safe-area-context";

import { useInternal } from "../Hooks/useInternal";
import { CONTEXT_MENU_STATE, ICON_SIZE } from "../constants";
import Animated, {runOnJS, useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withTiming} from "react-native-reanimated";
import { TapGestureHandler } from "react-native-gesture-handler";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const PostScreen = ({ navigation, route}) => {
    const data = route.params.data
    console.log(data)

    const gestureEvent = useAnimatedGestureHandler({
        onActive: () => {
            runOnJS(navigation.goBack)()
            
        }
    })

    return (
        <>  
            <SafeAreaView style={[styles.AndroidSafeArea, styles.container]}>
                <View style={{marginBottom: 10, paddingTop: 20}}>
                    <TapGestureHandler onGestureEvent={gestureEvent}>
                        <Animated.View>
                            <MaterialCommunityIcons name="arrow-left" color={'lightgrey'} size={ICON_SIZE}/>
                        </Animated.View>
                    </TapGestureHandler>

                </View>
                <Animated.View style={[]}>
                    <MessageComponent data={data} enabled={false} navigation={navigation} state={data.type} tags={data.tags}/>
                </Animated.View>
            </SafeAreaView>
        </>
    )
}

export default PostScreen

const styles = StyleSheet.create({
    AndroidSafeArea: {
        // paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,

    },
    container: {
        marginHorizontal: 10
    },
})

