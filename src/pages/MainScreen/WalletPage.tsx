import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WalletScreen } from 'pages/WalletScreen';
import { WalletDetails } from 'pages/WalletScreen/WalletDetails';
import { WalletVestings } from 'pages/WalletScreen/WalletVestings';
import { ReceiveAsset } from 'pages/WalletScreen/ReceiveAsset';
import { SendAsset } from 'pages/WalletScreen/SendAsset';
import { ChainId } from 'types/network';
import { Asset } from 'models/asset';
import { TransactionHistory } from 'pages/WalletScreen/TransactionHistory';

export type WalletStackProps = {
  'wallet.list': undefined;
  'wallet.transactions': undefined;
  'wallet.details': { token: Asset; chainId: ChainId };
  'wallet.vestings': { token: Asset; chainId: ChainId };
  'wallet.receive': { token: Asset };
  'wallet.send': { token: Asset };
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
      <Stack.Screen name="wallet.transactions" component={TransactionHistory} />
      <Stack.Screen name="wallet.details" component={WalletDetails} />
      <Stack.Screen
        name="wallet.vestings"
        component={WalletVestings}
        options={{ title: 'Vestings' }}
      />
      <Stack.Screen name="wallet.receive" component={ReceiveAsset} />
      <Stack.Screen name="wallet.send" component={SendAsset} />
    </Stack.Navigator>
  );
};
