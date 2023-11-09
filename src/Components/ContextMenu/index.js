import React, {useRef, useEffect} from "react"
import {
    Modal,
    Pressable,
    View,
    Text,
    StyleSheet,
    TouchableHighlight,
    TouchableOpacity,
    Animated,
    PanResponder,
    Alert
} from 'react-native'
// import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler"
// import Animated, { useAnimatedStyle, useSharedValue }from "react-native-reanimated"

const ContextMenu = (props) => {

    const pan = useRef(new Animated.ValueXY()).current
    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: Animated.event([
            null,
            {   
                dx: pan.x,
                dy: pan.y,
            },
            
        ],
        {useNativeDriver: false}
        ),
        onPanResponderRelease: () => {
            if (parseInt(JSON.stringify(pan.y)) > 300) {
                // console.log('Modal closed')
                props.handleVisible()
                pan.setValue({x: 0, y: 0})
            } else {
                Animated.spring(
                    pan,
                    {toValue: {x: 0, y: 0}, useNativeDriver: true, overshootClamping: true},
                ).start()
            }
        }
    })

    return(
        <Modal
            animationType="fade"
            visible={props.visible}
            transparent={true}
            onRequestClose={()=>{
                console.log('Modal closed')
                props.handleVisible()
            }}
            statusBarTranslucent
        >
            
            <Pressable 
                onPress={(event) => { if (event.target == event.currentTarget) {
                    props.handleVisible()
                }}}
                style={{backgroundColor: 'rgba(0,0,0,0.5)'}}
            >
                <View style={{height: '100%'}}>
                    <Animated.View
                        {...panResponder.panHandlers}
                        style={[
                            {transform: [{translateY: pan.y.interpolate({
                                inputRange: [0, 600],
                                outputRange: [0, 600],
                                extrapolate: 'clamp'
                            })
                        }]}, styles.modalContainer]}
                    >
                        <View style={{height: 5, backgroundColor: 'lightgrey', width: 32, borderRadius: 45, marginTop: 10, alignSelf:"center", marginBottom: 15}}/>

                        <TouchableOpacity
                            activeOpacity={0.6}
                            style={styles.buttons}
                        >
                            <Text>Archive</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={0.6}
                            style={styles.buttons}
                            onPress={()=>{props.handleVisible(); props.handleDelete()}}
                        >
                            <Text>Delete</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={0.6}
                            style={styles.buttons}
                        >
                            <Text>Mute Notifications</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={0.6}
                            style={styles.buttons}
                        >
                            <Text>Open chat head</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={0.6}
                            style={styles.buttons}
                        >
                            <Text>Mark as unread</Text>
                        </TouchableOpacity>
                    </Animated.View>

                </View>
            </Pressable>
        </Modal>
    )
}
export default ContextMenu;

const styles = StyleSheet.create({
    modalContainer: {
        // height: '50%', 
        flexBasis: 'auto',
        marginTop: 'auto', 
        backgroundColor: 'white',
        borderTopLeftRadius: 15, 
        borderTopRightRadius: 15, 
        // justifyContent: 'center', 
        // alignItems: 'center'

    },
    buttons: {
        padding: 15,
    }
})

