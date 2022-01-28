import React, { useCallback } from 'react';
import { ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import RNRestart from 'react-native-restart';
import { Setting, settings } from 'utils/settings';
import { SafeAreaPage } from 'templates/SafeAreaPage';
import { Text } from 'components/Text';
import { NavGroup } from 'components/NavGroup/NavGroup';
import { NavItem } from 'components/NavGroup/NavItem';
import { SettingsStackProps } from 'pages/MainScreen/SettingsPage';
import { globalStyles } from 'global.styles';
import { networks } from 'config/networks';
import { ChainId } from 'types/network';

type Props = NativeStackScreenProps<SettingsStackProps, 'settings.networks'>;

export const SettingsNetworks: React.FC<Props> = () => {
  const setChainId = useCallback((chainId: number) => {
    settings.set(Setting.DEFAULT_CHAIN_ID, chainId);
    RNRestart.Restart();
  }, []);

  return (
    <SafeAreaPage>
      <ScrollView style={globalStyles.page}>
        <Text style={globalStyles.title}>Switch Network</Text>
        <NavGroup>
          {networks.map(item => (
            <NavItem
              key={item.chainId}
              title={item.name}
              onPress={() => setChainId(item.chainId)}
              value={
                item.chainId ===
                (settings.get(Setting.DEFAULT_CHAIN_ID) as ChainId)
                  ? 'Current'
                  : undefined
              }
            />
          ))}
        </NavGroup>
      </ScrollView>
    </SafeAreaPage>
  );
};
