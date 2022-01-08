import React, { useEffect } from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { noop, prettifyTx } from 'utils/helpers';
import { useEvmWallet } from 'hooks/useEvmWallet';
import { useAssetBalance } from 'hooks/useAssetBalance';
import { AssetLogo } from 'components/AssetLogo';
import { VestedAssets } from './components/VestedAssets';
import type { Token } from 'types/token';
import { AddressBadge } from 'components/AddressBadge';

export const WalletDetails: React.FC = () => {
  // @ts-ignore
  const { params } = useRoute<{ item: Token }>();
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      title: params.item.name,
    });
  }, [params, navigation]);

  const address = useEvmWallet();
  const { value } = useAssetBalance(params.item, address);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.detailsContainer}>
          <AssetLogo source={params.item.icon} size={64} style={styles.logo} />
          <Text style={styles.balance}>
            {Number(value).toFixed(6)} {params.item.symbol}
          </Text>
          <AddressBadge address={address} />
          <View style={styles.buttons}>
            <Button title="Send" onPress={noop} />
            <Button title="Receive" onPress={noop} />
          </View>
        </View>
        {params.item.id === 'sov' && (
          <VestedAssets
            registryContractName="vestingRegistry"
            owner={address}
            asset={params.item}
          />
        )}
        <ScrollView>
          <Text>No history.</Text>
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flexGrow: 1,
  },
  container: {
    padding: 20,
  },
  detailsContainer: {
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 16,
  },
  balance: {
    fontWeight: 'bold',
    fontSize: 24,
    marginBottom: 8,
  },
  address: {
    marginBottom: 12,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
