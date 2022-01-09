import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CoinRow } from 'components/CoinRow';
import { useWalletAddress } from 'hooks/useWalletAddress';
import { currentChainId } from 'utils/helpers';
import { getProvider } from 'utils/RpcEngine';
import { ErrorBoundary } from '@sentry/react-native';
import { tokenUtils } from 'utils/token-utils';
import { AddressBadge } from 'components/AddressBadge';

export const WalletScreen: React.FC = () => {
  const chainId = currentChainId();
  const tokens = useMemo(
    () => tokenUtils.listTokensForChainId(chainId),
    [chainId],
  );

  const address = useWalletAddress();
  const [ens, setEns] = useState<Nullable>(null);

  useEffect(() => {
    getProvider(chainId)
      .lookupAddress(address)
      .then(result => setEns(result))
      .catch(() => setEns(null));
  }, [address, chainId]);

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
              <CoinRow token={item} chainId={chainId} />
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
    marginBottom: 25,
    flex: 1,
  },
});
