import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WalletScreen } from 'pages/WalletScreen';
import { WalletDetails } from 'pages/WalletScreen/WalletDetails';
import { WalletVestings } from 'pages/WalletScreen/WalletVestings';
import { ReceiveAsset } from 'pages/WalletScreen/ReceiveAsset';
import { Token } from 'types/token';

export type WalletStackProps = {
  'wallet.list': undefined;
  'wallet.details': { token: Token; chainId: number };
  'wallet.vestings': undefined;
  'wallet.receive': { token: Token; chainId: number };
};

const Stack = createNativeStackNavigator<WalletStackProps>();

export const WalletPage: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="wallet.list"
        component={WalletScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="wallet.details" component={WalletDetails} />
      <Stack.Screen name="wallet.vestings" component={WalletVestings} />
      <Stack.Screen name="wallet.receive" component={ReceiveAsset} />
    </Stack.Navigator>
  );
};
