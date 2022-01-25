import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { CreatePasscode } from './CreatePasscode';
import { CreateWallet } from './CreateWallet';
import { ImportWallet } from './ImportWallet';
import { Welcome } from './Welcome';

export type WelcomeFlowStackProps = {
  onboarding: undefined;
  'onboarding.create': undefined;
  'onboarding.import': undefined;
  'onboarding.passcode': { secret: string };
};

const Stack = createNativeStackNavigator<WelcomeFlowStackProps>();

export const WelcomeFlow = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="onboarding"
        component={Welcome}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="onboarding.create"
        component={CreateWallet}
        options={{ title: 'Create Wallet' }}
      />
      <Stack.Screen
        name="onboarding.import"
        component={ImportWallet}
        options={{ title: 'Import Wallet' }}
      />
      <Stack.Screen
        name="onboarding.passcode"
        component={CreatePasscode}
        options={{ title: 'Set Up Sovryn Passcode' }}
      />
    </Stack.Navigator>
  );
};
