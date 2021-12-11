import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Asset, getAssetNetwork } from 'utils/assets';
import { useAssetBalance } from 'hooks/useAssetBalance';
import { useEvmWallet } from 'hooks/useEvmWallet';
import { AssetLogo } from 'components/AssetLogo';

type Props = {
  item: Asset;
};

export const CoinRow: React.FC<Props> = ({ item }) => {
  const navigation = useNavigation();

  const network = useMemo(() => getAssetNetwork(item.id), [item]);
  const address = useEvmWallet(network.dPath, 0);
  const { value } = useAssetBalance(item, address);

  return (
    <TouchableWithoutFeedback
      onPress={() => navigation.navigate('wallet.details', { item })}>
      <View style={styles.container}>
        <View style={styles.logoWrapper}>
          <AssetLogo source={item.icon} size={32} />
        </View>
        <View style={styles.textWrapper}>
          <View style={styles.textWrapperRow}>
            <Text style={styles.textRow1}>{item.name}</Text>
            <Text style={styles.textRow1}>{Number(value).toFixed(4)}</Text>
          </View>
          <View style={styles.textWrapperRow}>
            <Text style={styles.textRow2}>
              {item.symbol}
              {item.address && <> ({network.name})</>}
            </Text>
            {/*<Text style={styles.textRow2}>{Number(value).toFixed(4)}</Text>*/}
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    width: '100%',
  },
  logoWrapper: {
    width: 32,
    height: 32,
    marginRight: 10,
  },
  logo: {
    width: 32,
    height: 32,
  },
  textWrapper: {
    flexBasis: 1,
    flexGrow: 1,
    flexDirection: 'column',
  },
  textWrapperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textRow1: {
    fontWeight: 'bold',
    marginBottom: 3,
  },
  textRow2: {
    fontWeight: '300',
  },
});
