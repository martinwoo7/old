import React, {useMemo, memo, useEffect} from 'react'
import { PortalProvider, PortalHost } from '@gorhom/portal'
import Animated, { useSharedValue } from 'react-native-reanimated'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { View, StatusBar } from 'react-native'

import Backdrop from '../Backdrop'

import { InternalContext } from '../../Context/internal'
import { HoldMenuProviderProps } from './types'
import { StateProps, Action } from './reducer'
import { CONTEXT_MENU_STATE } from '../../constants'

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
export interface Store {
    state: StateProps;
    dispatch?: React.Dispatch<Action>
}


const ProviderComponent = ({
    children,
    theme: selectedTheme,
}: HoldMenuProviderProps) => {

    const state = useSharedValue<CONTEXT_MENU_STATE>(
        CONTEXT_MENU_STATE.UNDETERMINED
    );
    const postState = useSharedValue<CONTEXT_MENU_STATE>(
        CONTEXT_MENU_STATE.UNDETERMINED
    );
    const theme = useSharedValue<'light' | 'dark'>(selectedTheme || 'light')

    useEffect(() => {
        theme.value = selectedTheme || 'light'
    }, [selectedTheme])

    const internalContextVariables = useMemo(()=>({
        state,
        theme,
        postState,
    }), [state, theme, postState])

    return (
        <GestureHandlerRootView style={{flex: 1}}>
            <InternalContext.Provider value={internalContextVariables}> 
                {children}
                {/* <Backdrop /> */}
            </InternalContext.Provider>         
        </GestureHandlerRootView>
    )
}

const Provider = memo(ProviderComponent)
export default Provider
