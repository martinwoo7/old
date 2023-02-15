import React, {cloneElement, memo, useMemo, useState, useRef, useEffect} from "react";
import { ViewProps, View, Text, Pressable} from 'react-native'
import { 
    LongPressGestureHandlerGestureEvent,
    TapGestureHandler, 
    TapGestureHandlerGestureEvent,
    LongPressGestureHandler
} from "react-native-gesture-handler";
import useDeviceOrientation from "../../Hooks/useDeviceOrientation";
import { 
    TransformOriginAnchorPosition ,
    getTransformOrigin,
    calculateMenuHeight
} from "../../utils/calculations";
import { 
    WINDOW_HEIGHT,
    WINDOW_WIDTH,
    HOLD_ITEM_TRANSFORM_DURATION,
    HOLD_ITEM_SCALE_DOWN_DURATION,
    HOLD_ITEM_SCALE_DOWN_VALUE,
    SPRING_CONIGURATION,
    CONTEXT_MENU_STATE
} from "../../constants";
import Animated, {
    useSharedValue,
    runOnJS,
    measure,
    useAnimatedGestureHandler,
    useAnimatedProps,
    useAnimatedRef,
    useAnimatedStyle,
    withTiming,
    withDelay,
    withSpring,
    withSequence,
    useAnimatedReaction
} from "react-native-reanimated";

import styles from './styles'
import type { HoldItemProps, GestureHandlerProps } from './types';

import { Portal, PortalHost } from '@gorhom/portal'
import { nanoid } from 'nanoid/non-secure'
import * as Haptics from 'expo-haptics';

import styleGuide from "../../styleGuide";
import { useInternal } from "../../Hooks/useInternal";
// import { Message } from "../Post";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";


type Context = { didMeasureLayout: boolean}
const HoldItemComponent = ({
    items,
    bottom,
    containerStyles,
    disableMove,
    menuAnchorPosition,
    activateOn,
    hapticFeedback,
    actionParams,
    closeOnTap,
    children,
    navigation
}) => {
    const { state } = useInternal()
    const deviceOrientation = useDeviceOrientation()

    const isActive = useSharedValue(false)
    const isAnimationStarted = useSharedValue(false)

    const itemRectY = useSharedValue<number>(0)
    const itemRectX = useSharedValue<number>(0)
    const itemRectWidth = useSharedValue<number>(0)
    const itemRectHeight = useSharedValue<number>(0)
    const itemScale = useSharedValue<number>(1)
    const transformValue = useSharedValue<number>(0)

    const transformOrigin = useSharedValue<TransformOriginAnchorPosition>(
        menuAnchorPosition || 'top-right'
    )

    const key = useMemo(() => `hold-item-${nanoid()}`, []);
    const menuHeight = useMemo(() => {
        const itemsWithSeparator = items.filter(item => item.withSeparator)
        return calculateMenuHeight(items.length, itemsWithSeparator.length)
    },[items])

    const isHold = !activateOn || activateOn === 'hold'
    

    const containerRef = useAnimatedRef<Animated.View>()
    const childRef = useRef()

    const id = nanoid(10)
    const [change, setChange] = useState(false)
  
    const [h, setH] = useState(0)

    useEffect(() => {
        console.log(children)
    }, [])
    
    const hapticResponse = () => {
        const style = !hapticFeedback ? 'Medium' : hapticFeedback;
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

    const activateAnimation = (ctx: any) => {
        'worklet';
        if (!ctx.didMeasureLayout) {
            const measured = measure(containerRef)
            // console.log(measured)
            itemRectY.value = measured.pageY;
            itemRectX.value = measured.pageX;
            itemRectHeight.value = measured.height;
            itemRectWidth.value = measured.width;

            if (!menuAnchorPosition) {
                const position = getTransformOrigin(
                    measured.pageX,
                    itemRectWidth.value,
                    deviceOrientation === 'portrait' ? WINDOW_WIDTH : WINDOW_HEIGHT,
                    bottom
                );
                transformOrigin.value = position
            }
        }
    };

    const calculateTransformValue = () => {
        'worklet';
        const height = deviceOrientation === 'portrait' ? WINDOW_HEIGHT : WINDOW_WIDTH
        const isAnchorPointTop = transformOrigin.value.includes('top')

        let ty = 0
        if (!disableMove) {
            if (isAnchorPointTop) {
                const topTransform =
                    itemRectY.value + itemRectHeight.value + menuHeight +
                    styleGuide.spacing + (safeAreaInset?.bottom || 0)

                ty = topTransform > height ? height - topTransform : 0
            }
        } else {
            const bottomTransform = itemRectY.value - menuHeight - (safeAreaInset?.top || 0)
            ty = bottomTransform < 0 ? -bottomTransform + styleGuide.spacing * 2 : 0
        }
        // return ty
        // probably have to make this adaptive
        // console.log(-itemRectY.value + 50)
        return -itemRectY.value + 80
    }

    const scaleBack = () => {
        'worklet';
        itemScale.value = withTiming(1, {
            duration: HOLD_ITEM_TRANSFORM_DURATION / 2,
        });
    }

    const onComplete = (isFinished?: boolean) => {
        'worklet';
        const isListValid = items && items.length > 0
        if (isFinished && isListValid) {
            state.value = CONTEXT_MENU_STATE.ACTIVE;
  
            isActive.value = true
            scaleBack();
            if (hapticFeedback !== 'None') {
                runOnJS(hapticResponse)()
            }
        }

        isAnimationStarted.value = false
    }

    const scaleHold = () => {
        'worklet';
        itemScale.value = withTiming(
            HOLD_ITEM_SCALE_DOWN_VALUE,
            { duration: HOLD_ITEM_SCALE_DOWN_DURATION },
            onComplete
        )
    }

    const scaleTap = () => {
        'worklet';
        isAnimationStarted.value = true

        itemScale.value = withSequence(
            withTiming(HOLD_ITEM_SCALE_DOWN_VALUE, {
                duration: HOLD_ITEM_SCALE_DOWN_DURATION
            }),
            withTiming(
                1,
                {
                    duration: HOLD_ITEM_TRANSFORM_DURATION / 2
                },
                onComplete
            )
        )
    };

    const canCallActiveFunctions = () => {
        'worklet';
        const willActivateWithTap = activateOn === 'double-tap' || activateOn === 'tap'
        return (
            (willActivateWithTap && !isAnimationStarted.value) || !willActivateWithTap
        )
    }

    const gestureEvent = useAnimatedGestureHandler<LongPressGestureHandlerGestureEvent | TapGestureHandlerGestureEvent,
    Context
    >({
        onActive: (_, context) => {
            if (canCallActiveFunctions()) {
                // if (!context.didMeasureLayout) {
                //     activateAnimation(context);
                //     transformValue.value = calculateTransformValue()

                //     // set commentProps

                //     context.didMeasureLayout = true
                // }

                // if (!isActive.value) {
                    
                //     if (isHold) {
                //         scaleHold()
                //         // scaleTap()
                //     } else {
                //         scaleTap()
                //     }
                // }
                isActive.value = true
            }
        },
        onFinish: (_, context) => {
            // context.didMeasureLayout = false;
            // if (isHold) {
            //     scaleBack()
            // }
            navigation.navigate('PostScreen', {})
        }
    });

    const gestureEvent2 = useAnimatedGestureHandler<LongPressGestureHandlerGestureEvent | TapGestureHandlerGestureEvent,
    Context
    >({
        onActive: (_, context) => {
    
            if (!context.didMeasureLayout) {
                activateAnimation(context)
                transformValue.value = calculateTransformValue()
                
                // set comments props

                context.didMeasureLayout = true
            }

            if (!isActive.value) {
                scaleTap()
            }
        },
        onFinish: (_, context) => {
            context.didMeasureLayout = false;
        }
    });
    const overlayGestureEvent = useAnimatedGestureHandler<TapGestureHandlerGestureEvent,
    Context
    >({
        onActive: _ => {
            if (closeOnTap) state.value = CONTEXT_MENU_STATE.END
        }
    });

    const animatedContainerStyle = useAnimatedStyle(() => {
        const animateOpacity = () => 
            withDelay(HOLD_ITEM_TRANSFORM_DURATION, withTiming(1, { duration: 0 }))
    
        return {
            opacity: isActive.value ? 0 : animateOpacity(),
            // opacity: 1,
            transform: [
                {
                    scale: isActive.value ? withTiming(1, {duration: HOLD_ITEM_TRANSFORM_DURATION}) : itemScale.value
                }
            ]
        }
    });
    const containerStyle = React.useMemo(
        () => [containerStyles, animatedContainerStyle],
        [containerStyles, animatedContainerStyle]
    );

    const animatedPortalStyle = useAnimatedStyle(() => {
        const animateOpacity = () =>
            withDelay(HOLD_ITEM_TRANSFORM_DURATION, withTiming(0, { duration: 0}))
        let ty = calculateTransformValue()
        const transformAnimation = () => 
            disableMove ? 0 : isActive.value ? withSpring(ty, SPRING_CONIGURATION) : withTiming(-0.1, { duration: HOLD_ITEM_TRANSFORM_DURATION})
        
        return {
            // zIndex: 10,
            // top: itemRectY.value,
            // left: itemRectX.value,
            // width: itemRectWidth.value,
            // height: itemRectHeight.value,
            transform: [
                {
                    translateY: transformAnimation(),
                },
                {
                    scale: isActive.value ? withTiming(1, { duration: HOLD_ITEM_TRANSFORM_DURATION }) : itemScale.value
                }
            ]
        }
    })
    // const portalContainerStyle = useMemo(
    //     () => [styles.holdItem, animatedPortalStyle],
    //     [animatedPortalStyle]
    // )
    const portalContainerStyle = useAnimatedStyle(() => {
        let ty = calculateTransformValue()
        const transformAnimation = () => 
            disableMove ? 0 : 
            isActive.value ? withSpring(ty, SPRING_CONIGURATION) : 
            withTiming(-0.1, { duration: HOLD_ITEM_TRANSFORM_DURATION})

        return {
            // position: isActive.value ? 20 : 0,
            transform: [
                {
                    translateY: transformAnimation()
                }
            ]
        }
    })

    const animatedPortalProps = useAnimatedProps<ViewProps>(() => ({
        pointerEvents: isActive.value ? 'auto' : 'none',
    }));

    useAnimatedReaction(() => state.value, _state => {
        if (_state === CONTEXT_MENU_STATE.END) {
            isActive.value = false

        }
    });

    
    const GestureHandler = useMemo(() => {
        switch (activateOn) {
            case `double-tap`:
                return ({ children: handlerChildren }: GestureHandlerProps) => (
                    <TapGestureHandler numberOfTaps={2} onGestureEvent={gestureEvent} waitFor={childRef}>
                        {handlerChildren}
                    </TapGestureHandler>
                );
            case `tap`:
                return ({ children: handlerChildren }: GestureHandlerProps) => (
                    <TapGestureHandler numberOfTaps={1} onGestureEvent={gestureEvent} waitFor={childRef} >
                        {handlerChildren}
                    </TapGestureHandler>
                );
            default:
                return ({ children: handlerChildren }: GestureHandlerProps) => (
                    <LongPressGestureHandler minDurationMs={150} onGestureEvent={gestureEvent} waitFor={childRef} >
                        {handlerChildren}
                    </LongPressGestureHandler>
                )
        }
    }, [activateOn, gestureEvent])

    // portal overlay prevents touch actions in the content
    const PortalOverlay = useMemo(() => {
        return () => (
            <TapGestureHandler numberOfTaps={1} onGestureEvent={overlayGestureEvent}>
                <Animated.View style={[styles.portalOverlay]}/>
            </TapGestureHandler>
        )
    }, [overlayGestureEvent])
    
    
    // TODO: find some way to maintain state through the portal
    const Wrapper = (props: any) => {
        // if (props.show === CONTEXT_MENU_STATE.ACTIVE) {
        if (props.show === true) {
            console.log("changed!")
            return <Portal hostName="outside">{props.children}</Portal>
        }
        return <Portal hostName={id}>{props.children}</Portal>
    }

    const onLayout = ((event: any) => {
        if ( h === 0 ) {
            const {x, y ,width, height} = event.nativeEvent.layout
            console.log(event.nativeEvent.layout)
            setH(Math.round(height))
        }
    })

    const childClone = cloneElement(children, {gestureEvent: gestureEvent2, ref: childRef})
    const animate = useAnimatedStyle(() => {
        const transformStyle = () => 
            isActive.value ? withTiming(400, {duration: 150}) : 0
        
        return {
            transform: [
                {
                    translateX: transformStyle()
                }
            ]
        }
    })
    return (
 
            
        <View style={{marginBottom: 20}}>
            {/* <Animated.View onLayout={onLayout} ref={containerRef} style={[h === 0 ? {position: 'absolute'}: {position: 'relative'} , {opacity: 1, width: '100%', height: h}]}>
                <Text>Placeholder content</Text>
            </Animated.View> */}

            <GestureHandler>
                {/* <Animated.View 
                    style={[h !== 0 ? {position: 'absolute'} : {position: 'relative'}, {width: '100%'}]}
                > */}

                    {/* <Animated.View
                        
                        key={key}
                        style={[portalContainerStyle]}
                        // animatedProps={animatedPortalProps}
                    >    */}
                        {/* <PortalOverlay /> */}
                        {/* {childClone} */}
                        {/* <Message /> */}
                    {/* </Animated.View> */}
                    {/* {childClone}
                </Animated.View> */}
                <Animated.View style={[animate]}>
                    {children}
                </Animated.View>
            </GestureHandler>
        </View> 
    )
}

const HoldItem = memo(HoldItemComponent)
export default HoldItem