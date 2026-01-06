import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import {Payout, Subscriptions, WebConnection} from '../Screens';
import navigationStrings from './navigationStrings';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const Stack = createNativeStackNavigator();
export default function () {
  return (
        <GestureHandlerRootView style={{ flex: 1 }}>
    <Stack.Navigator>
      <Stack.Screen
        name={navigationStrings.SUBSCRIPTIONS}
        component={Subscriptions}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
      </GestureHandlerRootView>
  );
}
