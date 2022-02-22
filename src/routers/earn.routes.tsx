import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EarnIndex } from 'pages/Earn/EarnIndex';
import { LendingRoutes } from './lending.routes';
import { AmmRoutes } from './amm.routes';

export type EarnRoutesStackProps = {
  'earn.index': undefined;
  lending: undefined;
  amm: undefined;
};

const Stack = createNativeStackNavigator<EarnRoutesStackProps>();

export const EarnRoutes: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="earn.index"
        component={EarnIndex}
        options={{ title: 'Earn' }}
      />
      <Stack.Screen
        name="lending"
        component={LendingRoutes}
        options={{ title: 'Lending', headerShown: false }}
      />
      <Stack.Screen
        name="amm"
        component={AmmRoutes}
        options={{ title: 'Automatic Market Maker', headerShown: false }}
      />
    </Stack.Navigator>
  );
};
