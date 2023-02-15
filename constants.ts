import { Dimensions, Platform } from 'react-native'

const HOLD_ITEM_TRANSFORM_DURATION = 150;
const HOLD_ITEM_SCALE_DOWN_VALUE = 0.95;
const HOLD_ITEM_SCALE_DOWN_DURATION = 210;

const SPRING_CONIGURATION = {
    damping: 33,
    mass: 1.03,
    stiffness: 500,
    restDisplacementThreshold: 0.001,
    restSpeedThreshold: 0.001
}

const SPRING_CONFIGURATION_MENU = {
    damping: 39,
    mass: 1.09,
    stiffness: 500,
    restDisplacementThreshold: 0.001,
    restSpeedThreshold: 0.001,
}

enum CONTEXT_MENU_STATE {
    UNDETERMINED = 0,
    ACTIVE, 
    END
}

const { height: WINDOW_HEIGHT, width: WINDOW_WIDTH } = Dimensions.get('screen')

// change this to fit screen maybe?
const MENU_CONTAINER_WIDTH = 100;
const MENU_WIDTH = (WINDOW_WIDTH * 60) / 100;

const MENU_TRANSFORM_ORIGIN_TOLERANCE = 10

const IS_IOS = Platform.OS === 'ios'

const FONT_SCALE = Dimensions.get('screen').fontScale

const ICON_SIZE = 25

export {
    CONTEXT_MENU_STATE,
    WINDOW_WIDTH,
    WINDOW_HEIGHT,
    MENU_WIDTH,
    MENU_CONTAINER_WIDTH,
    HOLD_ITEM_SCALE_DOWN_DURATION,
    HOLD_ITEM_TRANSFORM_DURATION,
    HOLD_ITEM_SCALE_DOWN_VALUE,
    SPRING_CONFIGURATION_MENU,
    SPRING_CONIGURATION,
    MENU_TRANSFORM_ORIGIN_TOLERANCE,
    IS_IOS,
    FONT_SCALE,
    ICON_SIZE
}