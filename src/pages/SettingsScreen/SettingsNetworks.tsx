import React, { useCallback, useContext } from 'react';
import { ScrollView, Switch } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaPage } from 'templates/SafeAreaPage';
import { Text } from 'components/Text';
import { NavGroup } from 'components/NavGroup/NavGroup';
import { NavItem } from 'components/NavGroup/NavItem';
import { SettingsStackProps } from 'routers/settings.routes';
import { globalStyles } from 'global.styles';
import { networks } from 'config/networks';
import { ChainId } from 'types/network';
import { AppContext } from 'context/AppContext';
import { clone, remove, uniq } from 'lodash';

type Props = NativeStackScreenProps<SettingsStackProps, 'settings.networks'>;

export const SettingsNetworks: React.FC<Props> = () => {
  const { isTestnet, setNetwork, chainIds, setChainIds } =
    useContext(AppContext);

  const handleNetworkChange = useCallback(
    () => setNetwork(!isTestnet),
    [setNetwork, isTestnet],
  );

  const networkEnabled = useCallback(
    (chainId: ChainId) => chainIds.includes(chainId),
    [chainIds],
  );

  const toggleChainId = useCallback(
    (chainId: ChainId) => (value: boolean) => {
      let ids: ChainId[] = clone(chainIds);
      if (value) {
        ids = uniq([...ids, chainId]);
      } else {
        remove(ids, item => item === chainId);
      }
      console.log('ids', ids);
      setChainIds(ids);
    },
    [chainIds, setChainIds],
  );

  return (
    <SafeAreaPage>
      <ScrollView style={globalStyles.page}>
        <Text style={globalStyles.title}>Sovryn Protocol</Text>

        <NavGroup>
          <NavItem
            title="Mainnet"
            hideArrow
            value={
              <Switch value={!isTestnet} onValueChange={handleNetworkChange} />
            }
          />
          <NavItem
            title="Testnet"
            hideArrow
            value={
              <Switch value={isTestnet} onValueChange={handleNetworkChange} />
            }
          />
        </NavGroup>

        <Text style={globalStyles.title}>Track Tokens</Text>
        <NavGroup>
          {networks.map(item => (
            <NavItem
              key={item.chainId}
              title={item.name}
              value={
                <Switch
                  value={networkEnabled(item.chainId)}
                  onValueChange={toggleChainId(item.chainId)}
                />
              }
              hideArrow
            />
          ))}
        </NavGroup>
      </ScrollView>
    </SafeAreaPage>
  );
};
