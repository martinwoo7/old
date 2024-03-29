import { createContext } from "react";
import type Animated from 'react-native-reanimated'
import type { CONTEXT_MENU_STATE } from "../constants";

export type InternalContextType = {
    state: Animated.SharedValue<CONTEXT_MENU_STATE>
    theme: Animated.SharedValue<'light' | 'dark'>
    // menuProps: Animated.SharedValue<MenuInternalProps>
    postState: Animated.SharedValue<CONTEXT_MENU_STATE>
    // server: Animated.SharedValue<string>
}

// @ts-ignore
export const InternalContext = createContext<InternalContextType>();