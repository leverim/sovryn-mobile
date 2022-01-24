import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { CreateBiometrics } from './CreateBiometrics';
import { CreatePasscode } from './CreatePasscode';
import { CreateWallet } from './CreateWallet';
import { ImportWallet } from './ImportWallet';
import { Welcome } from './Welcome';

export type WelcomeFlowStackProps = {
  onboarding: undefined;
  'onboarding.create': undefined;
  'onboarding.import': undefined;
  'onboarding.passcode': { secret: string };
  'onboarding.biometrics': { secret: string; passcode: string };
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
      <Stack.Screen name="onboarding.create" component={CreateWallet} />
      <Stack.Screen name="onboarding.import" component={ImportWallet} />
      <Stack.Screen name="onboarding.passcode" component={CreatePasscode} />
      <Stack.Screen name="onboarding.biometrics" component={CreateBiometrics} />
    </Stack.Navigator>
  );
};
