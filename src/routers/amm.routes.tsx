import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AmmPool, AmmPoolVersion } from 'models/amm-pool';
import { AmmIndex } from 'pages/AutomaticMarketMaker/AmmIndex';
import { AmmDepositV1 } from 'pages/AutomaticMarketMaker/AmmDepositV1';

export type AmmRoutesStackProps = {
  'amm.index': { verions?: AmmPoolVersion };
  'amm.deposit.v1': { pool: AmmPool };
  'amm.deposit.v2': { pool: AmmPool };
  'amm.withdraw': { pool: AmmPool };
};

const Stack = createNativeStackNavigator<AmmRoutesStackProps>();

export const AmmRoutes: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="amm.index"
        component={AmmIndex}
        options={{ title: 'Automatic Market Maker Pools' }}
      />
      <Stack.Screen
        name="amm.deposit.v1"
        component={AmmDepositV1}
        options={{ title: 'Deposit' }}
      />
      <Stack.Screen
        name="amm.deposit.v2"
        component={AmmDepositV1}
        options={{ title: 'Deposit' }}
      />
      {/* <Stack.Screen name="amm.withdraw" component={LendingWithdraw} /> */}
    </Stack.Navigator>
  );
};
