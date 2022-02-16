import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AmmPool, AmmPoolVersion } from 'models/amm-pool';
import { AmmIndex } from 'pages/AutomaticMarketMaker/AmmIndex';

export type AmmRoutesStackProps = {
  'amm.index': { verions?: AmmPoolVersion };
  'amm.deposit': { pool: AmmPool };
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
      {/* <Stack.Screen name="amm.deposit" component={LendingDeposit} /> */}
      {/* <Stack.Screen name="amm.withdraw" component={LendingWithdraw} /> */}
    </Stack.Navigator>
  );
};
