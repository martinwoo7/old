import { useState } from 'react';
import { Text, View, StyleSheet, Pressable, TextInput, ScrollView } from 'react-native';
import Modal from 'react-native-modal'

// Animated
import Animated, {
    useSharedValue,
    useAnimatedGestureHandler,
    runOnJS,
    withTiming,
    withDelay,
    useAnimatedStyle,
    Layout,
    BounceIn,
    BounceOut
} from 'react-native-reanimated';

// Gesture
import {
    TapGestureHandler
} from 'react-native-gesture-handler';

// Icons
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

// Secure
import { nanoid } from 'nanoid/non-secure';


const TagComponent = ({ tags, setTags }) => {

    const [visible, setVisible] = useState(false)
    const [customTag, setCustomTag] = useState('')
    const widthValue = useSharedValue('100%')

    const opac = useSharedValue(0)
    const borders = useSharedValue(false)
    const rotate = useSharedValue(0)
    const recent = [
        {
            id: nanoid(5),
            tag: "cats"
        },
        {
            id: nanoid(5),
            tag: "politics"
        },
        {
            id: nanoid(5),
            tag: "recombination"
        },
        {
            id: nanoid(5),
            tag: "a really long tag",
        },
    ]

    const trend = [
        {
            id: nanoid(5),
            tag: 'dogs'
        },
        {
            id: nanoid(5),
            tag: 'politics'
        },
        {
            id: nanoid(5),
            tag: 'valorant'
        },
        {
            id: nanoid(5),
            tag: 'let him cook'
        },
        {
            id: nanoid(5),
            tag: 'another really long tag'
        },
    ]

    const handleAdd = useAnimatedGestureHandler({
        onStart: (_) => {
            if (borders.value) {
                runOnJS(setVisible)(false)
                borders.value = false
                rotate.value = withTiming(0, { duration: 300 })
            } else {
                // const measured = measure(plusRef)
                runOnJS(setVisible)(true)
                borders.value = true
                rotate.value = withTiming(45, { duration: 300 })
            }
        }
    })

    const animateWidth = useAnimatedStyle(() => {
        if (customTag) {
            widthValue.value = '80%'
        } else {
            widthValue.value = '100%'
        }
        return {
            width: withTiming(widthValue.value, { duration: 100 })
        }
    }, [customTag])

    const animateRender = useAnimatedStyle(() => {
        if (customTag) {
            opac.value = 1
        } else {
            opac.value = 0
        }
        return {
            opacity: customTag ? withDelay(150, withTiming(opac.value, {duration: 100})) : withTiming(opac.value, {duration: 100})
        }
    }, [customTag])

    const animatedBorders = useAnimatedStyle(() => {
        return {
            borderBottomLeftRadius: borders.value ? withTiming(0, { duration: 300 }) : withDelay(150, withTiming(12, { duration: 200 })),
            borderBottomRightRadius: borders.value ? withTiming(0, { duration: 300 }) : withDelay(150, withTiming(12, { duration: 200 })),
            borderTopRightRadius: 12,
            borderTopLeftRadius: 12,
        }
    }, [borders])

    const animatedIcon = useAnimatedStyle(() => {
        return {
            transform: [{
                rotate: `${rotate.value}deg`
            }]
        }
    }, [rotate])

    const addTag = useAnimatedGestureHandler({
        onStart: (_) => {
            runOnJS(setVisible)(false)
            runOnJS(setCustomTag)('')
            runOnJS(setTags)(tags.concat(customTag))
            borders.value = false
            rotate.value = withTiming(0, { duration: 300 })
        }
    })

    return (
        <View style={[styles.tag]}>


            <TapGestureHandler onGestureEvent={handleAdd}>
                <Animated.View
                    style={[{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'aliceblue', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, marginRight: 10, marginBottom: 10 }, animatedBorders]}
                >
                    <Text style={{ color: 'lightgrey' }}>#</Text>
                    <Animated.View style={[animatedIcon]}>
                        <Text style={{ color: 'darkgrey' }}><Icon name="plus" /></Text>
                    </Animated.View>


                </Animated.View>
            </TapGestureHandler>
            {tags && tags.length > 0 &&
                tags.map((item, index) => {
                    return (

                        <Animated.View
                            style={{ zIndex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'aliceblue', alignSelf: 'flex-start', borderRadius: 12, marginRight: 10, paddingHorizontal: 8, paddingVertical: 2, marginBottom: 10 }}
                            key={item}
                            entering={BounceIn}
                            layout={Layout.springify()}
                            exiting={BounceOut}

                        >
                            <Text style={{ color: 'lightgrey' }}>#</Text>
                            <Text style={{ color: 'darkgrey' }}>{item}</Text>
                            <Pressable onPress={() => console.log("delete tag")} style={{ marginLeft: 5 }}>
                                <Icon name="close" />
                            </Pressable>
                        </Animated.View>
                    )
                })
            }
            <Modal
                isVisible={visible}
                coverScreen={false}
                hasBackdrop={false}
                style={{ backgroundColor: 'aliceblue', marginTop: 25, marginLeft: 0, borderRadius: 12, borderTopLeftRadius: 0, zIndex: 5, maxHeight: 200}}
                animationIn="fadeIn"
                animationOut="fadeOut"
                animationOutTiming={200}
                animationInTiming={200}
            >
                <View style={{ marginHorizontal: 15, marginTop: 0 }} >
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Animated.View style={[animateWidth, { backgroundColor: '#E0E8F0', display: 'flex', flexDirection: 'row', borderRadius: 12, paddingRight: 10, alignContent: 'center', paddingHorizontal: 10 }]}>
                            <TextInput
                                focusable={false}
                                style={[{ width: '90%', marginLeft: 5 }]}
                                placeholder="Enter tag"
                                placeholderTextColor='darkgrey'
                                onChangeText={(text) => setCustomTag(text)}
                                value={customTag}
                                autoCapitalize="none"
                            />
                            {customTag &&
                                <Pressable style={{ alignSelf: 'center', padding: 5 }} onPress={() => setCustomTag('')}>
                                    <Icon name="close" size={16} />
                                </Pressable>
                            }

                        </Animated.View>
                        {customTag &&
                            <TapGestureHandler onGestureEvent={addTag}>
                                <Animated.View style={[animateRender, { marginLeft: 10, backgroundColor: 'lightblue', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 2 }]}>
                                    <Text>Add</Text>
                                </Animated.View>
                            </TapGestureHandler>
                        }
                    </View>

                    <Text style={{ marginTop: 10, color: 'darkgrey' }}>Recently Used:</Text>
                    <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    keyboardShouldPersistTaps='handled'
                    style={{flexGrow: 0}}
                    contentContainerStyle={{alignItems: 'center' }}
                    >
                        {recent.map((item, index) => {
                            return (
                                <Pressable
                                    key={item.id}
                                    style={{ flexDirection: 'row', alignItems: 'center', borderColor: 'darkgrey', borderWidth: 1, borderRadius: 6, paddingHorizontal: 5, paddingVertical: 1, marginRight: 5}}
                                    onPress={() => setCustomTag(item.tag)}
                                >
                                    <Text style={{ color: 'darkgrey' }} >#</Text>
                                    <Text style={{ color: 'darkgrey' }}>
                                        {item.tag}
                                    </Text>
                                </Pressable>
                            )
                        })}
                    </ScrollView>

                    <Text style={{ marginTop: 15, color: 'darkgrey' }}>Trending:</Text>
                    <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    style={{flexGrow: 0}} 
                    keyboardShouldPersistTaps='handled'
                    contentContainerStyle={{alignItems: 'center'}}
                    >
                        {trend.map((item, index) => {
                            return (
                                <Pressable
                                    key={item.id}
                                    style={{ flexDirection: 'row', alignItems: 'center', borderColor: 'darkgrey', borderWidth: 1, borderRadius: 6, paddingHorizontal: 5, paddingVertical: 1, marginRight: 5 }}
                                    onPress={() => setCustomTag(item.tag)}
                                >
                                    <Text style={{ color: 'darkgrey' }} >#</Text>
                                    <Text style={{ color: 'darkgrey' }}>
                                        {item.tag}
                                    </Text>
                                </Pressable>
                            )
                        })}
                    </ScrollView>

                </View>
            </Modal>
        </View>
    )
};

export default TagComponent;

const styles = StyleSheet.create({
    tag: {
        // backgroundColor: 'green',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        minHeight: 250,
        maxHeight: 350,
        width: '100%',
    }
})