import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LendingIndex } from 'pages/Lending/LendingIndex';
import { LendingDeposit } from 'pages/Lending/LendingDeposit';
import { TokenId } from 'types/token';
import { LendingWithdraw } from 'pages/Lending/LendingWithdraw';

export type LendingRoutesStackProps = {
  'lending.index': undefined;
  'lending.deposit': { tokenId: TokenId };
  'lending.withdraw': { tokenId: TokenId };
};

const Stack = createNativeStackNavigator<LendingRoutesStackProps>();

export const LendingRoutes: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="lending.index"
        component={LendingIndex}
        options={{ title: 'Lending' }}
      />
      <Stack.Screen name="lending.deposit" component={LendingDeposit} />
      <Stack.Screen name="lending.withdraw" component={LendingWithdraw} />
    </Stack.Navigator>
  );
};
