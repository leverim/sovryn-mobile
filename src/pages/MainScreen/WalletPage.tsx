import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WalletScreen } from 'pages/WalletScreen';
import { WalletVestings } from 'pages/WalletScreen/WalletVestings';
import { SendAsset } from 'pages/WalletScreen/SendAsset';
import { ChainId } from 'types/network';
import { Asset } from 'models/asset';
import { AddressBookScreen } from 'pages/WalletScreen/AddressBookScreen';

export type WalletStackProps = {
  'wallet.list': undefined;
  'wallet.vestings': { token: Asset; chainId: ChainId };
  'wallet.receive': { token: Asset };
  'wallet.send': { token: Asset };
  addressbook: { id: string; address?: string };
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
      <Stack.Screen
        name="wallet.vestings"
        component={WalletVestings}
        options={{ title: 'Vestings' }}
      />
      <Stack.Screen name="wallet.send" component={SendAsset} />
      <Stack.Screen
        name="addressbook"
        component={AddressBookScreen}
        options={{ title: 'Address Book' }}
      />
    </Stack.Navigator>
  );
};
