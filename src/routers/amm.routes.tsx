import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AmmPool, AmmPoolVersion } from 'models/amm-pool';
import { AmmIndex } from 'pages/AutomaticMarketMaker/AmmIndex';
import { AmmDepositV1 } from 'pages/AutomaticMarketMaker/AmmDepositV1';
import { AmmDepositV2 } from 'pages/AutomaticMarketMaker/AmmDepositV2';
import { AmmWithdrawV1 } from 'pages/AutomaticMarketMaker/AmmWithdrawV1';
import { AmmWithdrawV2 } from 'pages/AutomaticMarketMaker/AmmWithdrawV2';

export type AmmRoutesStackProps = {
  'amm.index': { verions?: AmmPoolVersion };
  'amm.deposit.v1': { pool: AmmPool };
  'amm.deposit.v2': { pool: AmmPool };
  'amm.withdraw.v1': { pool: AmmPool };
  'amm.withdraw.v2': { pool: AmmPool };
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
        component={AmmDepositV2}
        options={{ title: 'Deposit' }}
      />
      <Stack.Screen
        name="amm.withdraw.v1"
        component={AmmWithdrawV1}
        options={{ title: 'Withdraw' }}
      />
      <Stack.Screen
        name="amm.withdraw.v2"
        component={AmmWithdrawV2}
        options={{ title: 'Withdraw' }}
      />
    </Stack.Navigator>
  );
};
