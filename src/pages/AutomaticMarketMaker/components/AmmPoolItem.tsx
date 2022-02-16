import { AssetLogo } from 'components/AssetLogo';
import { AmmPool } from 'models/amm-pool';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useAmmPoolData } from '../hooks/useAmmPoolData';

type AmmPoolItemProps = {
  item: AmmPool;
};

export const AmmPoolItem: React.FC<AmmPoolItemProps> = ({ item }) => {
  const { state } = useAmmPoolData(item);
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.supplyAsset1}>
          <AssetLogo source={item.supplyToken1.icon} size={48} />
        </View>
        <View style={styles.supplyAsset2}>
          <AssetLogo source={item.supplyToken2.icon} size={48} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
  },
  logoContainer: {
    position: 'relative',
    height: 64,
  },
  supplyAsset1: {
    position: 'absolute',
    width: 52,
    height: 52,
    backgroundColor: 'white',
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  supplyAsset2: {
    position: 'absolute',
    width: 52,
    height: 52,
    backgroundColor: 'white',
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    left: 25,
  },
});
