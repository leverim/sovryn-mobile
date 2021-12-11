import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WalletScreen } from 'pages/WalletScreen';
import { WalletDetails } from 'pages/WalletScreen/WalletDetails';

const Stack = createNativeStackNavigator();

export const WalletPage: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="wallet.list"
        component={WalletScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="wallet.details" component={WalletDetails} />
      {/*<Stack.Screen name="ImportWallet" component={ImportWallet} />*/}
    </Stack.Navigator>
  );
};
