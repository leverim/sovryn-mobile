import React, { useCallback, useContext, useEffect } from 'react';
import { Button, ScrollView, View } from 'react-native';
import RNRestart from 'react-native-restart';
import { AppContext } from 'context/AppContext';
import { useNavigation } from '@react-navigation/native';
import { Setting, settings } from 'utils/settings';
import {
  ETH_DERIVATION_PATH,
  RSK_DERIVATION_PATH,
  RSK_TESTNET_DERIVATION_PATH,
} from 'utils/constants';
import { SafeAreaPage } from 'templates/SafeAreaPage';
import { Text } from 'components/Text';
import { NavGroup } from 'components/NavGroup/NavGroup';
import { NavItem } from 'components/NavGroup/NavItem';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SettingsStackProps } from 'pages/MainScreen/SettingsPage';
import { accounts } from 'utils/accounts';
import { globalStyles } from 'global.styles';
import { networks } from 'config/networks';
import { ChainId } from 'types/network';

type Props = NativeStackScreenProps<SettingsStackProps, 'settings.index'>;

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { signOut } = useContext(AppContext);

  const setDerivationPath = useCallback((path: string) => {
    settings.set(Setting.SELECTED_DPATH, path);
    RNRestart.Restart();
  }, []);

  const navigate = useCallback(
    (screen: keyof SettingsStackProps) => () => navigation.navigate(screen),
    [navigation],
  );

  const network = networks.find(
    item =>
      item.chainId === (settings.get(Setting.DEFAULT_CHAIN_ID) as ChainId),
  );

  return (
    <SafeAreaPage>
      <ScrollView style={globalStyles.page}>
        <Text style={globalStyles.title}>Settings</Text>
        <NavGroup>
          <NavItem
            title="My Wallets"
            onPress={navigate('settings.wallets')}
            value={accounts.list.length}
          />
          <NavItem
            title="Network"
            onPress={navigate('settings.networks')}
            value={network?.name || 'Unknown'}
          />
        </NavGroup>

        <NavGroup>
          <NavItem
            title="Passcode & Face ID"
            onPress={navigate('settings.wallets')}
            value={'On'}
          />
          <NavItem title="Appearance" onPress={navigate('settings.wallets')} />
        </NavGroup>

        {__DEV__ && (
          <NavGroup>
            <NavItem title="Sign out" onPress={signOut} />
          </NavGroup>
        )}

        <Text>Derivation path ({settings.get(Setting.SELECTED_DPATH)}):</Text>
        <Button
          title={`RSK Mainnet - ${RSK_DERIVATION_PATH}`}
          onPress={() => setDerivationPath(RSK_DERIVATION_PATH)}
        />
        <Button
          title={`Ethereum - ${ETH_DERIVATION_PATH}`}
          onPress={() => setDerivationPath(ETH_DERIVATION_PATH)}
        />
        <Button
          title={`RSK Testnet - ${RSK_TESTNET_DERIVATION_PATH}`}
          onPress={() => setDerivationPath(RSK_TESTNET_DERIVATION_PATH)}
        />
      </ScrollView>
    </SafeAreaPage>
  );
};
