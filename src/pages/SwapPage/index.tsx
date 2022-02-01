import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SwapIndexScreen } from './screens/SwapIndexScreen';

export type SwapStackProps = {
  'swap.index': undefined;
  'swap.account': undefined;
  'swap.create': undefined;
};

const Stack = createNativeStackNavigator<SwapStackProps>();

export const SwapPage: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="swap.index"
        component={SwapIndexScreen}
        options={{ title: 'Swap' }}
      />
    </Stack.Navigator>
  );
};
