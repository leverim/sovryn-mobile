import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CoinRow } from 'components/CoinRow';
import { useEvmWallet } from 'hooks/useEvmWallet';
import { currentChainId, prettifyTx } from 'utils/helpers';
import { getProvider } from 'utils/RpcEngine';
import { ErrorBoundary } from '@sentry/react-native';
import { tokenUtils } from 'utils/token-utils';
import { AddressBadge } from 'components/AddressBadge';

export const WalletScreen: React.FC = () => {
  const tokens = useMemo(
    () => tokenUtils.listTokensForChainId(currentChainId()),
    [],
  );

  const address = useEvmWallet();
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
          <AddressBadge address={address} />
          {ens && <Text>{ens}</Text>}
        </View>
        <View style={styles.balanceContainer}>
          {tokens.map(item => (
            <ErrorBoundary key={item.id}>
              <CoinRow item={item} />
            </ErrorBoundary>
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
