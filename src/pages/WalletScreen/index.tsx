import React, { useCallback, useContext, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaPage } from 'templates/SafeAreaPage';
import { AccountBanner } from 'components/AccountBanner';
import { globalStyles } from 'global.styles';
import { useCurrentAccount } from 'hooks/useCurrentAccount';
import { AppContext } from 'context/AppContext';
import { listAssetsForChains } from 'utils/asset-utils';
import { AssetItem } from './components/AssetItem';
import { NavGroup } from 'components/NavGroup/NavGroup';
import { Asset } from 'models/asset';
import { AssetModal } from './components/AssetModal';
import { PendingTransactions } from 'components/TransactionHistory/PendingTransactions';
import { BalanceContext } from 'context/BalanceContext';
import { useWalletAddress } from 'hooks/useWalletAddress';
import { get, set } from 'lodash';
import { BigNumber } from 'ethers';
import { getAllBalances } from 'utils/interactions/price';
import { useIsMounted } from 'hooks/useIsMounted';
import { cache } from 'utils/cache';
import { STORAGE_CACHE_BALANCES } from 'utils/constants';
import Logger from 'utils/Logger';
import { UsdPriceContext } from 'context/UsdPriceContext';
import { priceFeeds } from 'controllers/price-feeds';
import { RefreshControl } from 'components/RefreshControl';

export const WalletScreen: React.FC = () => {
  const { chainIds } = useContext(AppContext);
  const {
    balances,
    execute: startBalances,
    loading,
    loaded,
    setBalances,
  } = useContext(BalanceContext);
  const {
    execute: startPrices,
    initPrices,
    loading: loadingPrices,
    loaded: loadedPrices,
  } = useContext(UsdPriceContext);
  const owner = useWalletAddress()?.toLowerCase();
  const isMounted = useIsMounted();

  const tokens = useMemo(
    () =>
      listAssetsForChains(chainIds).filter(
        item =>
          ['rbtc', 'trbtc', 'sov', 'tsov'].includes(item.id) ||
          BigNumber.from(get(balances, [item.chainId, owner, item.id], '0')).gt(
            '0',
          ),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(chainIds), JSON.stringify(balances), owner],
  );

  const nativeTokens = useMemo(
    () => tokens.filter(item => item.native),
    [tokens],
  );

  const erc20Tokens = useMemo(
    () => tokens.filter(item => item.erc20),
    [tokens],
  );

  const account = useCurrentAccount();

  const [asset, setAsset] = useState<Asset>();

  const execute = useCallback(async () => {
    if (!owner) {
      return;
    }
    try {
      startBalances(true);
      for (const chainId of chainIds) {
        getAllBalances(chainId, owner)
          .then(response => {
            if (isMounted()) {
              setBalances(chainId, owner, response);
              const cached = cache.get(STORAGE_CACHE_BALANCES, {});
              cache.set(
                STORAGE_CACHE_BALANCES,
                set(cached, [chainId, owner], response),
              );
            }
          })
          .catch(e => Logger.error(e, 'getAllBalances in wallet screen'));
      }
    } catch (e) {
      Logger.error(e, 'useAccountBalances in wallet screen');
    }

    try {
      startPrices(true);
      priceFeeds.getAll(chainIds).then(response => {
        if (isMounted()) {
          initPrices(response);
        }
      });
    } catch (e) {
      Logger.error(e, 'useGlobalUsdPrices');
    }
  }, [
    owner,
    startBalances,
    chainIds,
    isMounted,
    setBalances,
    startPrices,
    initPrices,
  ]);

  return (
    <SafeAreaPage
      scrollView
      scrollViewProps={{
        refreshControl: (
          <RefreshControl
            refreshing={
              (loading && !loaded) || (loadingPrices && !loadedPrices)
            }
            onRefresh={execute}
          />
        ),
      }}>
      {account && (
        <View style={globalStyles.page}>
          <AccountBanner account={account} showActions />
        </View>
      )}
      <View style={styles.balanceContainer}>
        <PendingTransactions marginTop={-24} />

        <NavGroup>
          {nativeTokens.map(item => (
            <AssetItem
              key={item.id}
              asset={item}
              onPress={() => setAsset(item)}
            />
          ))}
        </NavGroup>
        <NavGroup>
          {erc20Tokens.map(item => (
            <AssetItem
              key={item.id}
              asset={item}
              onPress={() => setAsset(item)}
            />
          ))}
        </NavGroup>
      </View>
      <AssetModal asset={asset!} onClose={() => setAsset(undefined)} />
    </SafeAreaPage>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  balanceContainer: {
    paddingHorizontal: 5,
    marginHorizontal: 10,
    marginBottom: 25,
  },
});
