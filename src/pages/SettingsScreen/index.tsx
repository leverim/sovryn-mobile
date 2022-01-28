import React, { useCallback, useContext } from 'react';
import { ScrollView } from 'react-native';
import { AppContext } from 'context/AppContext';
import { Setting, settings } from 'utils/settings';
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
            onPress={navigate('settings.passcode')}
            value={'On'}
          />
          <NavItem
            title="Appearance"
            onPress={navigate('settings.appearance')}
          />
        </NavGroup>

        {__DEV__ && (
          <NavGroup>
            <NavItem title="Sign out" onPress={signOut} danger />
          </NavGroup>
        )}
      </ScrollView>
    </SafeAreaPage>
  );
};
