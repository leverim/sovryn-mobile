import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SettingsScreen } from 'pages/SettingsScreen';
import { WalletListPage } from 'pages/SettingsScreen/WalletListPage';
import { AccountCreate } from 'pages/SettingsScreen/AccountCreate';
import { SettingsNetworks } from 'pages/SettingsScreen/SettingsNetworks';
import { WalletPage } from 'pages/SettingsScreen/WalletPage';
import { Account } from 'utils/accounts';
import { WalletDerivationPath } from 'pages/SettingsScreen/WalletDerivationPath';

export type SettingsStackProps = {
  'settings.index': undefined;
  'settings.networks': undefined;
  'settings.wallets': undefined;
  'settings.wallet': { index: number };
  'settings.wallet.derivation': {
    index: number;
    account: Account;
    password: string;
  };
  'settings.create': undefined;
};

const Stack = createNativeStackNavigator<SettingsStackProps>();

export const SettingsPage: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="settings.index"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen
        name="settings.networks"
        component={SettingsNetworks}
        options={{ title: 'Networks' }}
      />
      <Stack.Screen
        name="settings.wallets"
        component={WalletListPage}
        options={{ title: 'My Wallets' }}
      />
      <Stack.Screen
        name="settings.wallet"
        component={WalletPage}
        options={{ title: 'Wallet' }}
      />
      <Stack.Screen
        name="settings.wallet.derivation"
        component={WalletDerivationPath}
        options={{ title: 'Derivation Path' }}
      />
      <Stack.Screen
        name="settings.create"
        component={AccountCreate}
        options={{ title: 'Add Wallet' }}
      />
    </Stack.Navigator>
  );
};
