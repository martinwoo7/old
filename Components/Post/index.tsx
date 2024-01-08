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
// import Animated, {
//     Extrapolate,
//     interpolate,
//     runOnJS,
//     useAnimatedGestureHandler,
//     useAnimatedStyle,
//     useSharedValue,
//     withSpring,
//     withTiming,
//     useAnimatedReaction,
//     useAnimatedScrollHandler
// } from "react-native-reanimated";
import AnimatedNumber from "react-native-animated-numbers";
import BottomSheet from '@gorhom/bottom-sheet'
import moment from 'moment/moment';
import { Portal } from '@gorhom/portal'
import { FullWindowOverlay } from 'react-native-screens';

import { handleDate } from "../../utils/algos";
import { onSnapshot, collection, query, doc, where, getDocs, limit, updateDoc, increment } from "firebase/firestore";
// ** END HOOKS IMPORT


// Different styles depending on the post type
// 0 - Text -> Something like Twitter?
// 1 - Image -> 
// 2 - Video -> 

const decrementLikes = async ( ref, numShards ) => {
    const shardId = Math.floor(Math.random() * numShards).toString();
    const shardRef = doc(ref, 'likes', shardId)
    await updateDoc(shardRef, {
        count: increment(-1)
    })
}

const incrementLikes = async ( ref, numShards ) => {
    const shardId = Math.floor(Math.random() * numShards).toString();
    const shardRef = doc(ref, 'likes', shardId)
    await updateDoc(shardRef, {
        count: increment(1)
    })
}

// export a different version of post for each post type
// export const MessageComponent = forwardRef((props: any, ref) => {
export const MessageComponent = (props: any) => {
    // console.log(props)

    // const menuRef = useRef(null)
    // const commentRef = useRef(null)
    // const likeRef = useRef(null)

    // const db = emulators.firestore
    // const auth = emulators.authentication

    // const liked = useSharedValue(props.new ? 1 : 0)
    // const [likes, setLikes] = useState(0)
    // const [comments, setComments] = useState(0)
    // const options = props.options

    // const scrollX = useSharedValue(0)

    // useEffect(() => {
    
    //     if (!props.new) {
    //         const q = query(
    //             collection(db, 'counters', props.data.id, 'shards')
    //         )
    //         const unsubscribe = onSnapshot(q, (snapshot) => {
    //             let total_count = 0
    //             snapshot.forEach((doc) => {
    //                 total_count += doc.data().count
    //             })
    //             setComments(total_count)
    //         })
    
    //         commentRef.current = unsubscribe
    
    //         return () => {
    //             commentRef.current && commentRef.current()
    //         }
    //     } 
        
    // }, [])

    // useEffect(() => {
        

    //     if (!props.new) {
    //         const q = query(
    //             collection(db, 'counters', props.data.id, 'likes')
    //         )

    //         const unsubscribe = onSnapshot(q, (snapshot) => {
    //             let total_count = 0
    //             snapshot.forEach((doc) => {
    //                 total_count += doc.data().count
    //             })
    //             setLikes(total_count)
    //         })
    
    //         likeRef.current = unsubscribe
    
    //         return () => {
    //             likeRef.current && likeRef.current()
    //         }
    //     } else {
    //         setLikes(1)
    //     }
        
    // }, [])

    // useEffect(() => {

    //     const userLikes = async () => {
    //         const q = query(
    //             collection(db, 'users'),
    //             where("uid", "==", auth.currentUser.uid),
    //             where("likes", "array-contains", props.data.id),
    //             limit(1)
    //         )
    //         const snapshot = await getDocs(q)
    //         if (!snapshot.empty) {
    //             liked.value = 1
    //         }
    //     }

    //     if (!props.new) {
    //         userLikes()
    //     } 
        
    // }, [])


    // const outlineStyle = useAnimatedStyle(() => {
    //     return {
    //         transform: [
    //             {
    //                 scale: interpolate(liked.value, [0, 1], [1, 0], Extrapolate.CLAMP)
    //             }
    //         ]
    //     }
    // }, [liked])

    // const fillStyle = useAnimatedStyle(() => {
    //     return {
    //         transform: [
    //             {
    //                 scale: liked.value
    //             }
    //         ],
    //         opacity: liked.value
    //     }
    // }, [liked])

    // const toggleLikes = (() => {
    //     if (!liked.value) {
    //         incrementLikes(doc(db, 'counters', props.data.id), 10)
    //         liked.value = withSpring(1);
    //     } else {
    //         decrementLikes(doc(db, 'counters', props.data.id), 10)
    //         liked.value = withSpring(0);
    //     }
    // })

    // const scrollHandler = useAnimatedScrollHandler((event) => {
    //     scrollX.value = event.contentOffset.x
    // })

    // const Pagination = ({ index }) => {
    //     const width = useAnimatedStyle(() => {
    //         return {
    //             width: interpolate(scrollX.value,
    //                 [350 * (index - 1), 350 * index, 350 * (index + 1)],
    //                 [8, 16, 8],
    //                 Extrapolate.CLAMP
    //             )
    //         }
    //     })
    //     return (
    //         <Animated.View key={index} style={[styles.normalDot, width]} />
    //     )
    // }

    // const renderEnd = () => {
    //     switch (props.type) {
    //         // text
    //         case 0:
    //             return (
    //                 <Text>at the world.</Text>
    //             )
    //         // picture
    //         case 1:
    //             return (
    //                 <Text>for the world.</Text>
    //             )
    //         // video
    //         case 2:
    //             return (
    //                 <Text>with the world.</Text>
    //             )
    //         case 3:
    //             return (
    //                 <Text>to the world.</Text>
    //             )
    //     }
    // }


    // const handleNavigate = (() => {
    //     props.navigation.navigate('PostStack', { screen: 'PostScreen', params: { data: props.data } })
    // })

    return (
        <>
            {/* <Pressable onPress={handleNavigate} disabled={!props.enabled} >
                <Animated.View style={[styles.container]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }} >


                        <Avatar size={36} rounded containerStyle={{ backgroundColor: 'coral', marginRight: 10 }} title="J" />
                        <Text>{props.data.name}</Text>

                        <Text>{' ' + props.data.verb}</Text>

                        
                        {props.enabled &&
                            <Pressable ref={menuRef} onPress={() => console.log('options')} disabled={!props.enabled} style={{ marginLeft: 'auto' }} >
                                <MaterialCommunityIcons name="dots-vertical" color='lightgrey' size={24} />
                            </Pressable>
                        }


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
                                        <View style={{ width: 350, height: 350 }} key={image.assetId}>
                                            <Image source={{ uri: image.uri }} style={styles.card} />
                                        </View>
                                    )
                                })}
                            </Animated.ScrollView>
                            <View style={styles.indicatorContainer} >
                                {props.data.images.map((image, index) => {
                                    return (
                                        <Pagination index={index} key={image.assetId}/>
                                    )
                                })}

                            </View>
                        </View>
                        : props.type === 1 ?
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

                   
                    {props.type === 3 && options ?
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

                    <View style={{ marginTop: 16, marginLeft: 8, flexDirection: 'row', alignItems: 'center' }}>
                        <Pressable onPress={toggleLikes} disabled={props.new} style={{ width: 80 }}>
                            <Animated.View style={{ flexDirection: 'row', alignItems: 'center' }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                <Animated.View style={[StyleSheet.absoluteFillObject, outlineStyle]}>
                                    <MaterialCommunityIcons name="heart-outline" color="#BF3946" size={24} />
                                </Animated.View>
                                <Animated.View style={fillStyle}>
                                    <MaterialCommunityIcons name="heart" color="#BF3946" size={24} />
                                </Animated.View>

                                <View style={{ alignItems: 'center', width: 40 }}>
                                    
                                    <AnimatedNumber
                                        includeComma
                                        animateToNumber={likes}
                                        // style={{ paddingLeft: 5 }}
                                        animationDuration={500}
                                    />
                                </View>
                            </Animated.View>
                        </Pressable>

                        <Pressable style={{ marginHorizontal: 0, width: 70 }} >
                            <Animated.View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <MaterialCommunityIcons name="chat-outline" color="#2097CE" size={24} />
                                <Text style={{ paddingLeft: 5 }}>{comments}</Text>
                            </Animated.View>
                        </Pressable>

                        <Pressable style={{ flexDirection: 'row' }}>
                            <Animated.View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <MaterialCommunityIcons name="repeat" color="#DFB535" size={24} />
                                <Text style={{ paddingLeft: 5 }}>{0}</Text>
                            </Animated.View>

                        </Pressable>

                        
                        {props.enabled ?
                            handleDate(moment(props.data.createdAt.toDate())) :
                            props.new ?
                                handleDate(moment()) :
                                handleDate(moment(props.data.createdAt.toDate()))
                        }
                    </View>

                </Animated.View>
            </Pressable> */}
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