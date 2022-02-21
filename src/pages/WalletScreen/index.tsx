import React, { useContext, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
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
import { get } from 'lodash';
import { BigNumber } from 'ethers';

export const WalletScreen: React.FC = () => {
  const { chainIds } = useContext(AppContext);
  const { balances } = useContext(BalanceContext);
  const owner = useWalletAddress()?.toLowerCase();

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

  return (
    <SafeAreaPage>
      <ScrollView>
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
      </ScrollView>
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
