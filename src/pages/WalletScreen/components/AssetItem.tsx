import React, { useCallback, useState } from 'react';
import {
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { formatAndCommify } from 'utils/helpers';
import { DarkTheme } from '@react-navigation/native';
import { AssetLogo } from 'components/AssetLogo';
import { Text } from 'components/Text';
import { Asset } from 'models/asset';
import { useAssetBalance } from 'hooks/useAssetBalance';
import { useWalletAddress } from 'hooks/useWalletAddress';
import { useBalanceToUsd } from 'hooks/useBalanceToUsd';
import { useAssetUsdBalance } from 'hooks/useAssetUsdBalance';

type AssetItemProps = {
  asset: Asset;
  onPress?: (event: GestureResponderEvent) => void;
  isFirst?: boolean;
  isLast?: boolean;
};

export const AssetItem: React.FC<AssetItemProps> = ({
  asset,
  onPress,
  isFirst,
  isLast,
}) => {
  const owner = useWalletAddress();
  const { weiValue: tokenBalance } = useAssetBalance(asset, owner);
  const { weiValue: usdBalance } = useAssetUsdBalance(asset, tokenBalance);

  const [pressedIn, setPressedIn] = useState(false);

  const handlePress = useCallback(
    (status: boolean) => () => setPressedIn(status),
    [],
  );
  return (
    <Pressable
      style={[
        styles.container,
        pressedIn && styles.pressed,
        isFirst && styles.isFirst,
        isLast && styles.isLast,
        !isLast && styles.hasBottomBorder,
      ]}
      onPress={onPress}
      onPressIn={handlePress(true)}
      onPressOut={handlePress(false)}>
      <View style={styles.logoHolder}>
        <AssetLogo source={asset.icon} />
      </View>
      <View style={styles.contentHolder}>
        <View>
          <Text>{asset.name}</Text>
          <Text>
            {formatAndCommify(tokenBalance, asset.decimals)} {asset.symbol}
          </Text>
        </View>
        <View style={styles.rightContainer}>
          {usdBalance !== null && (
            <Text>${formatAndCommify(usdBalance, asset.decimals)}</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: DarkTheme.colors.card,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 60,
    paddingHorizontal: 12,
  },
  pressed: {
    backgroundColor: DarkTheme.colors.border,
  },
  isFirst: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  isLast: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  hasBottomBorder: {
    borderBottomWidth: 1,
    borderBottomColor: DarkTheme.colors.border,
  },
  rightContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  rightContainerText: {
    marginRight: 4,
    textAlign: 'right',
  },
  logoHolder: {
    width: 42,
  },
  contentHolder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
});
