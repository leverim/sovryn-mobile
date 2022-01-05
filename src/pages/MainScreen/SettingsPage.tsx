import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SettingsScreen } from 'pages/SettingsScreen';
import { AccountSettings } from 'pages/SettingsScreen/AccountSettings';
import { AccountCreate } from 'pages/SettingsScreen/AccountCreate';

const Stack = createNativeStackNavigator();

export const SettingsPage: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="settings.index" component={SettingsScreen} />
      <Stack.Screen name="settings.account" component={AccountSettings} />
      <Stack.Screen name="settings.create" component={AccountCreate} />
    </Stack.Navigator>
  );
};
