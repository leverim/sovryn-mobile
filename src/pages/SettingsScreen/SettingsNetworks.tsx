import React, { useCallback, useContext, useMemo } from 'react';
import { ScrollView, Switch } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaPage } from 'templates/SafeAreaPage';
import { Text } from 'components/Text';
import { NavGroup } from 'components/NavGroup/NavGroup';
import { NavItem } from 'components/NavGroup/NavItem';
import { SettingsStackProps } from 'routers/settings.routes';
import { globalStyles } from 'global.styles';
import { ChainId } from 'types/network';
import { AppContext } from 'context/AppContext';
import { clone, remove, uniq } from 'lodash';
import { listMainnetNetworks, listTestnetNetworks } from 'utils/network-utils';

type Props = NativeStackScreenProps<SettingsStackProps, 'settings.networks'>;

export const SettingsNetworks: React.FC<Props> = () => {
  const { isTestnet, setNetwork, chainIds, setChainIds } =
    useContext(AppContext);

  const handleNetworkChange = useCallback(() => {
    setNetwork(!isTestnet);
    setChainIds(
      (isTestnet ? listMainnetNetworks() : listTestnetNetworks()).map(
        item => item.chainId,
      ),
    );
  }, [isTestnet, setChainIds, setNetwork]);

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
      setChainIds(ids);
    },
    [chainIds, setChainIds],
  );

  const networks = useMemo(
    () => (isTestnet ? listTestnetNetworks() : listMainnetNetworks()),
    [isTestnet],
  );

  return (
    <SafeAreaPage>
      <ScrollView style={globalStyles.page}>
        <Text style={globalStyles.title}>Networks</Text>

        <NavGroup>
          <NavItem
            title="Use testnet networks"
            hideArrow
            value={
              <Switch value={isTestnet} onValueChange={handleNetworkChange} />
            }
          />
        </NavGroup>

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
