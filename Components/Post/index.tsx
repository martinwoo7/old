import React, { useMemo, forwardRef, useEffect, useState, useLayoutEffect, memo, useRef, cloneElement, useImperativeHandle } from "react";
import {
    View,
    Text,
    StyleSheet,
    Touchable,
    SafeAreaView,
    Pressable,
    useWindowDimensions,
    ScrollView,
    Image,
} from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
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
    withTiming,
    useAnimatedReaction,
    useAnimatedScrollHandler
} from "react-native-reanimated";
import AnimatedNumber from "react-native-animated-numbers";
import BottomSheet from '@gorhom/bottom-sheet'
import moment from 'moment/moment';
import { Portal } from '@gorhom/portal'
import { FullWindowOverlay } from 'react-native-screens';

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

// props will contain post contents

// export a different version of post for each post type
// export const MessageComponent = forwardRef((props: any, ref) => {
export const MessageComponent = (props: any) => {
    // console.log(props)
    const sheetRef = useRef<BottomSheet>(null)
    const snapPoints = useMemo(() => ['10%', '50%'], [])

    const likeRef = useRef(null)
    const menuRef = useRef(null)

    const db = emulators.firestore
    const user = emulators.authentication

    const liked = useSharedValue(0)
    const [heart, setHeart] = useState(liked.value == 0 ? false : true)
    const [likes, setLikes] = useState(props.data.likes)
    const [comments, setComments] = useState(props.data.comments)
    const options = props.options

    const scrollX = useSharedValue(0)
    const { width: windowWidth } = useWindowDimensions();

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
            runOnJS(setLikes)(likes + 1)
            runOnJS(setHeart)(true)
            liked.value = withSpring(1);
        } else {
            runOnJS(setLikes)(likes - 1)
            // setLikes((likes) => likes - 1)
            runOnJS(setHeart)(false)
            // setHeart(false)
            liked.value = withSpring(0);
        }
    })

    const scrollHandler = useAnimatedScrollHandler((event) => {
        scrollX.value = event.contentOffset.x
    })

    const Pagination = ({ index }) => {
        const width = useAnimatedStyle(() => {
            return {
                width: interpolate(scrollX.value,
                    [350 * (index - 1), 350 * index, 350 * (index + 1)],
                    [8, 16, 8],
                    Extrapolate.CLAMP
                )
            }
        })
        return (
            <Animated.View key={index} style={[styles.normalDot, width]} />
        )
    }

    const renderEnd = () => {
        switch (props.state || temp.type) {
            // text
            case 0:
                return (
                    <Text>at the world.</Text>
                )
            // picture
            case 1:
                return (
                    <Text>for the world.</Text>
                )
            // video
            case 2:
                return (
                    <Text>with the world.</Text>
                )
            case 3:
                return (
                    <Text>to the world.</Text>
                )
        }
    }

    const dateToTime = (date) => {
        let hours = date.hours()
        let minutes = date.minutes()
        let ampm = hours >= 12 ? 'pm' : 'am'
        hours = hours % 12
        hours = hours ? hours : 12
        minutes = minutes < 10 ? '0' + minutes : minutes
        let strTime = hours + ':' + minutes + ' ' + ampm
        return strTime
    }

    const handleDate = (dat) => {
        const temp = moment(dat)
        const today = moment()
        let date
        if (temp.year() === today.year()) {
            // same year
            if (temp.month() === today.month()) {
                // same month
                if (temp.date() === today.date()) {
                    // same day

                    date = "Today"
                } else {
                    if (today.date() - temp.date() === 1) {
                        date = "Yesterday"
                    } else {
                        date = temp.format("dddd")
                    }
                }

                date = date + " at " + dateToTime(temp)
            } else {
                date = temp.format("MMM Do")
            }
        } else {
            date = temp.format("D MMM YY")
        }

        return (
            <View style={{ marginLeft: 'auto', marginRight: 10 }}>
                <Text style={{ color: 'darkgrey' }}>{date}</Text>
            </View>
        )

    }

    const handleNavigate = (() => {
        props.navigation.navigate('PostScreen', { data: props.data })
    })

    return (
        <>
            <Pressable onPress={handleNavigate} disabled={!props.enabled} >
                <Animated.View style={[styles.container]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }} >


                        <Avatar size={36} rounded containerStyle={{ backgroundColor: 'coral', marginRight: 10 }} title="J" />
                        <Text>{props.data.name}</Text>

                        <Text>{' ' + props.data.verb}</Text>

                        <Pressable ref={menuRef} onPress={() => sheetRef.current.expand()} disabled={!props.enabled} style={{ marginLeft: 'auto' }} >
                            <MaterialCommunityIcons name="dots-vertical" color='lightgrey' size={24} />
                        </Pressable>

                    </View>

                    {props.data.images && props.data.images.length > 0 ?

                        <View style={[styles.scrollContainer]}>
                            <Animated.ScrollView
                                horizontal
                                pagingEnabled
                                showsHorizontalScrollIndicator={false}
                                onScroll={scrollHandler}
                                scrollEventThrottle={1}
                            >
                                {props.data.images.map((image, index) => {
                                    return (
                                        <View style={{ width: 350, height: 350 }} key={index}>
                                            <Image source={{ uri: image.uri }} style={styles.card} />
                                        </View>
                                    )
                                })}
                            </Animated.ScrollView>
                            <View style={styles.indicatorContainer} >
                                {props.data.images.map((image, index) => {
                                    return (
                                        <Pagination index={index} />
                                    )
                                })}

                            </View>
                        </View>
                        : props.state === 1 ?
                            <>
                                <View style={[styles.scrollContainer]}>
                                    <View style={{ width: 325, height: 300, justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderRadius: 8, marginTop: 10 }}>

                                        <Text>Image goes here</Text>
                                    </View>
                                </View>
                                <View style={[styles.normalDot, { alignSelf: 'center', marginTop: 10 }]} />
                            </>
                            :
                            null
                    }
                    <View style={[styles.textContent]}>
                        <Text style={props.data.content ? { color: 'black' } : { color: 'white', fontStyle: 'italic' }}>{props.data.content ? props.data.content : 'interesting content'}</Text>
                        <View style={styles.leftArrow} />
                        <View style={styles.leftArrowOverlap} />
                    </View>

                    {/* poll */}
                    {props.state === 3 && options ?
                        <View style={styles.pollContainer}>
                            {options.map((item, index) => {
                                return (
                                    <Pressable
                                        key={item.key}
                                        style={{ borderColor: 'darkgrey', borderWidth: 0.5, borderRadius: 5, marginBottom: 10, marginHorizontal: 10 }}
                                        disabled={!props.enabled}
                                        onPress={() => console.log("pressed!")}
                                    >
                                        <View style={{ marginHorizontal: 10, marginVertical: 10 }}>
                                            <Text >{item.content ? item.content : 'Option ' + (index + 1)}</Text>
                                        </View>
                                    </Pressable>
                                )
                            })}
                        </View> :

                        null
                    }

                    <View style={{ marginLeft: 8 }}>
                        {renderEnd()}
                    </View>


                    {/* tags? */}
                    <View style={{ flexDirection: 'row', marginHorizontal: 5 }}>
                        {props.tags && props.tags.length > 0 ?
                            <View style={{ marginTop: 20, flexDirection: 'row', flexWrap: 'wrap' }}>
                                {props.tags.map((item, index) => {
                                    return (
                                        <Pressable onPress={() => console.log("pressed on a tag")} key={item} style={{ marginRight: 10 }}>
                                            <Text style={{ color: 'darkgrey' }}>
                                                {'#' + item}
                                            </Text>
                                        </Pressable>
                                    )
                                })}
                            </View> :
                            props.enabled ?
                                null :
                                <Text style={{ color: 'darkgrey', marginTop: 20 }}>{'# (not shown)'}</Text>
                        }

                    </View>

                    {/* container for buttons */}
                    <View style={{ marginTop: 16, marginLeft: 8, flexDirection: 'row', alignItems: 'center' }}>
                        <Pressable onPress={toggleLikes} disabled={!props.enabled}>
                            <Animated.View style={{ flexDirection: 'row', alignItems: 'center' }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                <Animated.View style={[StyleSheet.absoluteFillObject, outlineStyle]}>
                                    <MaterialCommunityIcons name="heart-outline" color="#BF3946" size={24} />
                                </Animated.View>
                                <Animated.View style={fillStyle}>
                                    <MaterialCommunityIcons name="heart" color="#BF3946" size={24} />
                                </Animated.View>

                                {props.new ?
                                    <Text style={{ paddingLeft: 5 }}>0</Text> :
                                    <AnimatedNumber
                                        includeComma
                                        animateToNumber={likes}
                                        style={{ paddingLeft: 5 }}
                                        animationDuration={500}
                                    />
                                }
                            </Animated.View>
                        </Pressable>

                        {/* <TapGestureHandler numberOfTaps={1} onGestureEvent={props.gestureEvent}> */}
                        <Animated.View style={{ marginHorizontal: 10, flexDirection: 'row', alignItems: 'center' }}>
                            <MaterialCommunityIcons name="chat-outline" color="#2097CE" size={24} />
                            <Text style={{ paddingLeft: 5 }}>{comments}</Text>
                        </Animated.View>
                        {/* </TapGestureHandler> */}

                        <Pressable style={{ flexDirection: 'row' }}>
                            <MaterialCommunityIcons name="repeat" color="#DFB535" size={24} />
                            {/* <Text style={{paddingLeft: 5}}>{temp.comments}</Text> */}
                        </Pressable>

                        {/* <Text style={{marginLeft: 'auto', marginRight: 10}}>{handleDate()}</Text> */}

                        {/* {handleDate(time)} */}
                        {props.enabled ?
                            handleDate(moment(props.data.createdAt.toDate())) :
                            props.state !== null ?
                                handleDate(moment()) :
                                handleDate(moment(props.data.createdAt.toDate()))
                        }
                    </View>

                </Animated.View>
            </Pressable>

            {/* <Portal>

                <BottomSheet
                    enablePanDownToClose
                    ref={sheetRef}
                    index={-1}
                    snapPoints={snapPoints}
                    // style={{ height: '100%'}}
                    // onChange={handleSheetChanges}
                    backgroundStyle={{ backgroundColor: '#202225' }}
                    handleIndicatorStyle={{ backgroundColor: "lightgrey" }}
                >
                    <View style={{ display: 'flex', justifyContent: 'center', backgroundColor: 'aliceblue' }}>
                        <Pressable style={{ marginVertical: 10 }}>
                            <Text>Follow</Text>
                        </Pressable>
                        <Pressable style={{ marginVertical: 10 }}>
                            <Text>Block</Text>
                        </Pressable>
                        <Pressable style={{ marginVertical: 10 }}>
                            <Text>Report</Text>
                        </Pressable>
                    </View>
                </BottomSheet>

            </Portal> */}
        </>
    )
}

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
    leftArrow: {
        position: 'absolute',
        backgroundColor: '#45BD3A',
        width: 20,
        height: 25,
        bottom: 0,
        borderBottomRightRadius: 25,
        left: -10
    },
    leftArrowOverlap: {
        position: 'absolute',
        backgroundColor: 'aliceblue',
        width: 20,
        height: 35,
        bottom: -6,
        borderBottomRightRadius: 18,
        left: -20
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
    },
    scrollContainer: {
        // height: 300,
        alignItems: 'center',
        justifyContent: 'center'
    },
    card: {
        flex: 1,
        width: undefined,
        height: undefined,
        marginVertical: 4,
        marginHorizontal: 16,
        borderRadius: 5,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    indicatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    normalDot: {
        height: 8,
        width: 8,
        borderRadius: 4,
        backgroundColor: 'silver',
        marginHorizontal: 4
    },
    modal: {
        width: '100%',
        margin: 0,
        justifyContent: 'flex-end'
    }
})