import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useVestedAssets } from 'hooks/useVestedAssets';
import { VestedAssetRow } from './components/VestedAssets/VestedAssetRow';
import { SafeAreaPage } from 'templates/SafeAreaPage';
import { Text } from 'components/Text';

export const WalletVestings: React.FC = () => {
  // @ts-ignore
  const { params } = useRoute<any>();
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      title: `Vested ${params?.asset.symbol}`,
    });
  }, [params, navigation]);

  const { vestings, balances } = useVestedAssets(
    params.registryContractName,
    params.owner,
  );

  return (
    <SafeAreaPage>
      <ScrollView style={styles.container}>
        <View style={styles.detailsContainer}>
          {/* <AssetLogo source={params.item.icon} size={64} style={styles.logo} /> */}
          <Text style={styles.balance}>
            {/* {Number(value).toFixed(6)} {params.item.symbol} */}
          </Text>
        </View>
        <ScrollView>
          {vestings.map((item, index) => (
            <VestedAssetRow
              key={item.vestingAddress}
              vesting={item}
              balance={balances[index]}
              asset={params.asset}
            />
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaPage>
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
