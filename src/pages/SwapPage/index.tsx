import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ethers } from 'ethers';
import { contractCall } from 'utils/contract-utils';
import { SwapIndexScreen } from './screens/SwapIndexScreen';

export type SwapStackProps = {
  'swap.index': undefined;
  'swap.account': undefined;
  'swap.create': undefined;
};

const Stack = createNativeStackNavigator<SwapStackProps>();

export const SwapPage: React.FC = () => {
  // useEffect(() => {
  //   console.log('get loanpools list:');
  //   contractCall<[string[]]>(
  //     30,
  //     '0x5a0d867e0d70fcc6ade25c3f1b89d618b5b4eaa7',
  //     'getLoanPoolsList(uint256,uint256)(bytes32[])',
  //     [0, 5],
  //   )
  //     .then(e => {
  //       console.log(e?.[0]);
  //       console.log(
  //         'loans',
  //         e?.[0].map(item => ethers.utils.parseBytes32String(item)),
  //       );
  //     })
  //     .catch(console.error);
  // }, []);

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="swap.index"
        component={SwapIndexScreen}
        options={{ title: 'Swap', headerShown: false }}
      />
      {/* <Stack.Screen name="swap.account" component={AccountSettings} /> */}
      {/* <Stack.Screen name="swap.create" component={AccountCreate} /> */}
    </Stack.Navigator>
  );
};
