import React, { useContext, useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaPage } from 'templates/SafeAreaPage';
import { AccountBanner } from 'components/AccountBanner';
import { globalStyles } from 'global.styles';
import { useCurrentAccount } from 'hooks/useCurrentAccount';
import { AppContext } from 'context/AppContext';
import { listAssets } from 'utils/asset-utils';
import { AssetItem } from './components/AssetItem';
import { NavGroup } from 'components/NavGroup/NavGroup';

export const WalletScreen: React.FC = () => {
  const { isTestnet } = useContext(AppContext);

  const tokens = useMemo(() => listAssets(isTestnet), [isTestnet]);

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
          <NavGroup>
            {tokens.map(item => (
              <AssetItem key={item.id} asset={item} />
            ))}
          </NavGroup>
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
    paddingHorizontal: 5,
    marginHorizontal: 10,
    marginBottom: 25,
  },
});
