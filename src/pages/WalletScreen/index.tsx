import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { CoinRow } from 'components/CoinRow';
import { currentChainId } from 'utils/helpers';
import { ErrorBoundary } from '@sentry/react-native';
import { tokenUtils } from 'utils/token-utils';
import { SafeAreaPage } from 'templates/SafeAreaPage';
import { AccountBanner } from 'components/AccountBanner';
import { globalStyles } from 'global.styles';
import { useCurrentAccount } from 'hooks/useCurrentAccount';

export const WalletScreen: React.FC = () => {
  const chainId = currentChainId();
  const tokens = useMemo(
    () => tokenUtils.listTokensForChainId(chainId),
    [chainId],
  );
  const account = useCurrentAccount();

  return (
    <SafeAreaPage>
      <ScrollView>
        {account && (
          <View style={globalStyles.page}>
            <AccountBanner account={account} showActions />
          </View>
        )}
        <View style={styles.balanceContainer}>
          {tokens.map(item => (
            <ErrorBoundary key={item.id}>
              <CoinRow token={item} chainId={chainId} />
            </ErrorBoundary>
          ))}
        </View>
      </ScrollView>
    </SafeAreaPage>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
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
