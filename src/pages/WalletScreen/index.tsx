import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CoinRow } from 'components/CoinRow';
import { useEvmWallet } from 'hooks/useEvmWallet';
import { prettifyTx } from 'utils/helpers';
import { getNetworks } from 'utils/networks';
import { getAssets } from 'utils/assets';
import { getProvider } from 'utils/RpcEngine';

export const WalletScreen: React.FC = () => {
  // todo should be tokens actually
  const tokens = useMemo(() => getAssets(), []);

  const address = useEvmWallet(
    getNetworks().find(item => item.id === 'eth')?.dPath || '',
    0,
  );
  const [ens, setEns] = useState<Nullable>(null);

  useEffect(() => {
    getProvider(1)
      .lookupAddress(address)
      .then(result => setEns(result))
      .catch(() => setEns(null));
  }, [address]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.profileContainer}>
          <Text>{ens || prettifyTx(address)}</Text>
        </View>
        <View style={styles.balanceContainer}>
          {tokens.map(item => (
            <CoinRow key={item.id} item={item} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileContainer: {
    marginBottom: 12,
    padding: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 5,
    marginHorizontal: 10,
    flex: 1,
  },
});
