import React, {forwardRef, useEffect, useState, useLayoutEffect, memo, useRef, cloneElement} from "react";
import { 
    View,
    Text,
    StyleSheet,
    Touchable,
    SafeAreaView,
    Pressable
} from "react-native";
import emulators from "../../firebase";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Avatar } from "@rneui/themed";
import Animated, { 
    Extrapolate, 
    interpolate, 
    runOnJS, 
    useAnimatedGestureHandler, 
    useAnimatedStyle, 
    useSharedValue, 
    withSpring, 
    withTiming ,
    useAnimatedReaction
} from "react-native-reanimated";
import AnimatedNumber from "react-native-animated-numbers";
import { TapGestureHandler, TapGestureHandlerGestureEvent, LongPressGestureHandlerGestureEvent } from "react-native-gesture-handler";
import * as Haptics from 'expo-haptics';
// ** HOOKS IMPORT
import { useInternal } from "../../Hooks/useInternal";
import { CONTEXT_MENU_STATE } from "../../constants";

// ** END HOOKS IMPORT


// Different styles depending on the post type
// 0 - Text -> Something like Twitter?
// 1 - Image -> 
// 2 - Video -> 

const temp = {
    content: "Testing content. This is a strong message and a long message",
    createdAt: new Date(2022, 11, 30),
    createdBy: "ufsaqZFjpdujUJSmb79l9kEAUvbN",
    name: "Jimmy",
    type: 0,
    score: 0,
    likes: 0,
    comments: 0,
    verb: "shouted",
    // liked: 0
}

const Wrapper = (props: any) => {
    const { postState } = useInternal()
    const isActive = useSharedValue(false)
    const data = props.data

    const hapticResponse = () => {
        const style = !props.hapticFeedback ? 'Medium' : props.hapticFeedback;
        switch (style) {
          case `Selection`:
            Haptics.selectionAsync();
            break;
          case `Light`:
          case `Medium`:
          case `Heavy`:
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle[style]);
            break;
          case `Success`:
          case `Warning`:
          case `Error`:
            Haptics.notificationAsync(Haptics.NotificationFeedbackType[style]);
            break;
          default:
        }
      };
      
    // const onComplete = (isFinished?: boolean) => {
    //     'worklet';
    //     runOnJS(props.navigation.navigate)('PostScreen', data)
    // }

    const gestureEvent = useAnimatedGestureHandler({
        onActive: (_, ctx) => {
            // activateAnimation(ctx)
            if (!isActive.value) {
                postState.value = CONTEXT_MENU_STATE.ACTIVE
                runOnJS(props.navigation.navigate)('PostScreen', data)
                isActive.value = true
                runOnJS(hapticResponse)()
            }
            
        }
    })

    const animateSlide = useAnimatedStyle(() => {
        const transformAnimation = () => 
            isActive.value ? 
            withTiming(500, {duration: 400}) : 
            withTiming(-0.1, {duration: 400})
        return {
            transform: [
                {
                    translateX: transformAnimation()
                }
            ]
        }
    })

    useAnimatedReaction(() => postState.value, _state => {
        if (_state === CONTEXT_MENU_STATE.END) {
            isActive.value = false
        }
    })

    const childRef = useRef()
    const childCopy = cloneElement(props.children, {ref: childRef})
    return (
        <TapGestureHandler onGestureEvent={gestureEvent} waitFor={childRef}>
            <Animated.View
                style={[animateSlide]}
            >
                {childCopy}
            </Animated.View>
        </TapGestureHandler>
    )
}

// props will contain post contents

// export a different version of post for each post type
export const MessageComponent = forwardRef((props: any, ref) => {
    const db = emulators.firestore
    const user = emulators.authentication

    const liked = useSharedValue(0)
    const [heart, setHeart] = useState(liked.value == 0 ? false : true )
    const [likes, setLikes] = useState(props.data.likes)
    const [comments, setComments] = useState(props.data.comments)

    const outlineStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    scale: interpolate(liked.value, [0, 1], [1, 0], Extrapolate.CLAMP)
                }
            ]
        }
    }, [heart])
    const fillStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    scale: liked.value
                }
            ],
            opacity: liked.value
        }
    }, [heart])

    const toggleLikes = (() => {
        console.log('pressed!')
        if (!heart) {
            setLikes((likes) => likes + 1)
            setHeart(true)
            liked.value = withSpring(1);
        } else {
            setLikes((likes) => likes - 1)
            setHeart(false)
            liked.value = withSpring(0);
        }
         
    })
    
    return(
        // Parent container

        <View style={[styles.container]}>
            <View style={{flexDirection: 'row', alignItems:'center'}} >

            
                <Avatar size={36} rounded containerStyle={{backgroundColor: 'coral', marginRight: 10}} title="J" />
                <Text>{props.data.name}</Text>

                <Text>{' ' + props.data.verb}</Text>
            </View>
            <View style={[styles.textContent]}>
                <Text>{props.data.content}</Text>
                <View style={styles.rightArrow} />
                <View style={styles.rightArrowOverlap} />
            </View>
            <View style={{marginLeft: 8}}><Text>at the world.</Text></View>

            {/* container for buttons */}
            
            <View style={{marginTop: 16, marginLeft: 8, flexDirection: 'row', alignItems:'center'}}>
                <TapGestureHandler ref={ref} onGestureEvent={toggleLikes} enabled={props.enabled}>
                    <Animated.View style={{flexDirection: 'row', alignItems:'center'}}>
                        <Animated.View style={[StyleSheet.absoluteFillObject, outlineStyle ]}>
                            <MaterialCommunityIcons name="heart-outline" color="#BF3946" size={24}/>
                        </Animated.View>
                        <Animated.View style={fillStyle}>
                            <MaterialCommunityIcons name="heart" color="#BF3946" size={24}/>
                        </Animated.View>
                        
                        {props.enabled ? 
                        <AnimatedNumber 
                            includeComma
                            animateToNumber={likes}
                            style={{paddingLeft: 5}}
                            animationDuration={500}
                        />:
                        <Text style={{paddingLeft: 5}}>0</Text> 
                        }
                    </Animated.View>
                </TapGestureHandler>

                {/* <TapGestureHandler numberOfTaps={1} onGestureEvent={props.gestureEvent}> */}
                    <Animated.View style={{marginHorizontal: 10, flexDirection: 'row', alignItems:'center'}}>
                        <MaterialCommunityIcons name="chat-outline" color="#2097CE" size={24}/>
                        <Text style={{paddingLeft: 5}}>{comments}</Text>
                    </Animated.View>
                {/* </TapGestureHandler> */}
                
                <Pressable style={{flexDirection: 'row'}}>
                    <MaterialCommunityIcons name="repeat" color="#DFB535" size={24}/>
                    {/* <Text style={{paddingLeft: 5}}>{temp.comments}</Text> */}
                </Pressable>
            </View>

        </View>
    )
})

const Posts = ({ navigation }, props: any) => {
    
    return (
        <Wrapper navigation={navigation} data={temp}>
            <MessageComponent data={temp} enabled={true}/>
        </Wrapper>
    )
}

const Picture = () => {
    return (
        <View>
            <Text>There is a picture in here</Text>
        </View>
    )
}

// const Message = memo(MessageComponent)
export { Posts }

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'aliceblue',
        padding: 10,
        borderRadius: 12,

    },
    textContent: {
        backgroundColor: "#45BD3A",
        alignSelf: 'flex-start',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginLeft: 10,
        marginRight: 10,
        marginVertical: 10
    },
    rightArrow: {
        position: 'absolute',
        backgroundColor: '#45BD3A',
        // backgroundColor: 'red',
        width: 20,
        height: 25,
        bottom: 0,
        borderBottomLeftRadius: 25,
        right: -10
    },
    rightArrowOverlap: {
        position: 'absolute',
        backgroundColor: 'aliceblue',
        // backgroundColor: 'red',
        width: 20,
        height: 35,
        bottom: -6,
        borderBottomLeftRadius: 18,
        right: -20,
    }
})