import React, { useCallback, useContext } from 'react';
import { Alert, Linking, ScrollView } from 'react-native';
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
import { passcode } from 'controllers/PassCodeController';
import { usePrettyBiometryName } from 'hooks/useBiometryType';

type Props = NativeStackScreenProps<SettingsStackProps, 'settings.index'>;

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { signOut } = useContext(AppContext);
  const biometryName = usePrettyBiometryName();

  const navigate = useCallback(
    (screen: keyof SettingsStackProps) => () => navigation.navigate(screen),
    [navigation],
  );

  const handlePasscodePage = useCallback(async () => {
    try {
      const password = await passcode.request('Enter your passcode', true);
      navigation.navigate('settings.passcode', { password });
    } catch (error) {
      console.warn(error);
    }
  }, [navigation]);

  const handleDeleteRequest = useCallback(async () => {
    Alert.alert(
      'Danger Alert!!!',
      'This will delete your recovery seeds, private keys, passcode and any other information app had about your wallets! Make sure you have your recovery information stored safelly somewhere else before proceeding! Action is inreversable!!!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await passcode.request('Unlock Wallet');
              signOut();
            } catch (e) {
              Alert.alert('Data was not removed.');
            }
          },
        },
      ],
    );
  }, [signOut]);

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
            title={`Passcode ${biometryName ? `& ${biometryName}` : ''}`}
            onPress={handlePasscodePage}
          />
          {/* <NavItem
            title="Appearance"
            onPress={navigate('settings.appearance')}
          /> */}
        </NavGroup>

        <NavGroup>
          <NavItem
            title="Learn about Sovryn"
            onPress={() => Linking.openURL('https://wiki.sovryn.app')}
          />
          <NavItem
            title="Report issue"
            onPress={() =>
              Linking.openURL(
                'https://github.com/defray-labs/sovryn-mobile/issues',
              )
            }
          />
        </NavGroup>

        <NavGroup>
          <NavItem title="Delete data" onPress={handleDeleteRequest} danger />
        </NavGroup>
      </ScrollView>
    </SafeAreaPage>
  );
};
