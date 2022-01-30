import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SettingsScreen } from 'pages/SettingsScreen';
import { WalletListPage } from 'pages/SettingsScreen/WalletListPage';
import { AccountCreate } from 'pages/SettingsScreen/AccountCreate';
import { SettingsNetworks } from 'pages/SettingsScreen/SettingsNetworks';
import { WalletPage } from 'pages/SettingsScreen/WalletPage';
import { Account } from 'utils/accounts';
import { WalletDerivationPath } from 'pages/SettingsScreen/WalletDerivationPath';
import { WalletPrivateKey } from 'pages/SettingsScreen/WalletPrivateKey';
import { WalletRecoveryPhrase } from 'pages/SettingsScreen/WalletRecoveryPhrase';
import { SettingsPasscode } from 'pages/SettingsScreen/SettingsPasscode';
import { SettingsAppearance } from 'pages/SettingsScreen/SettingsAppearance';
import { SettingsPasscodeChange } from 'pages/SettingsScreen/SettingsPasscodeChange';

type AccountProps = {
  index: number;
  account: Account;
  password: string;
};

export type SettingsStackProps = {
  'settings.index': undefined;
  'settings.networks': undefined;
  'settings.wallets': undefined;
  'settings.wallet': { index: number };
  'settings.wallet.derivation': AccountProps;
  'settings.wallet.private-key': AccountProps;
  'settings.wallet.recovery-phrase': AccountProps;
  'settings.create': undefined;
  'settings.appearance': undefined;
  'settings.passcode': { password: string };
  'settings.passcode.change': { password: string };
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
        name="settings.passcode"
        component={SettingsPasscode}
        options={{ title: 'Passcode' }}
      />
      <Stack.Screen
        name="settings.passcode.change"
        component={SettingsPasscodeChange}
        options={{ title: 'Change Passcode' }}
      />
      <Stack.Screen
        name="settings.appearance"
        component={SettingsAppearance}
        options={{ title: 'Appearance' }}
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
        name="settings.wallet.private-key"
        component={WalletPrivateKey}
        options={{ title: 'View Private Key' }}
      />
      <Stack.Screen
        name="settings.wallet.recovery-phrase"
        component={WalletRecoveryPhrase}
        options={{ title: 'View Recovery Phrase' }}
      />
      <Stack.Screen
        name="settings.create"
        component={AccountCreate}
        options={{ title: 'Add Wallet' }}
      />
    </Stack.Navigator>
  );
};
