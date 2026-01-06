import React from 'react'
import { StyleSheet } from 'react-native'
import BottomSheetForm from '../../Components/BottomSheetForm'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

export default function ServiceSlots({
    navigation
}) {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <BottomSheetForm
                onCloseSheet={() => navigation.goBack()}
                isDriverServiceDetailing={true}
                isGetSlots={true}
            />
        </GestureHandlerRootView>
    )
}

const styles = StyleSheet.create({})