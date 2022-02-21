import {
  DarkTheme,
  NavigationProp,
  useNavigation,
} from '@react-navigation/native';
import { AssetLogo } from 'components/AssetLogo';
import { Button } from 'components/Buttons/Button';
import { HasRewardsBadge } from 'components/HasRewardsBadge';
import { Text } from 'components/Text';
import { globalStyles } from 'global.styles';
import { AmmPool } from 'models/amm-pool';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AmmRoutesStackProps } from 'routers/amm.routes';
import { getSovAsset } from 'utils/asset-utils';
import { formatAndCommify } from 'utils/helpers';
import { useAmmPoolData } from '../hooks/useAmmPoolData';
import { PoolVersionBadge } from './PoolVersionBadge';

type AmmPoolItemProps = {
  item: AmmPool;
  refresh?: number;
};

export const AmmPoolItem: React.FC<AmmPoolItemProps> = ({ item, refresh }) => {
  const navigation = useNavigation<NavigationProp<AmmRoutesStackProps>>();
  const { state, execute, balance, rewards } = useAmmPoolData(item);
  useEffect(() => {
    execute();
  }, [execute, refresh]);
  const sov = getSovAsset(item.chainId);
  return (
    <View style={topStyles.view}>
      <View style={topStyles.container}>
        <View style={topStyles.logoContainer}>
          <View style={topStyles.supplyAsset1}>
            <AssetLogo source={item.supplyToken1.icon} size={48} />
          </View>
          <View style={topStyles.supplyAsset2}>
            <AssetLogo source={item.supplyToken2.icon} size={48} />
          </View>
        </View>
        <View>
          <Text>
            Staked Balance ({formatAndCommify(state.reserveWeight1, 4, 2)}/
            {formatAndCommify(state.reserveWeight2, 4, 2)}%)
          </Text>
          <View>
            <Text>
              {formatAndCommify(
                state.reserveStakedBalance1,
                item.supplyToken1.decimals,
              )}{' '}
              {item.supplyToken1.symbol}
            </Text>
            <Text>
              {formatAndCommify(
                state.reserveStakedBalance2,
                item.supplyToken2.decimals,
              )}{' '}
              {item.supplyToken2.symbol}
            </Text>
          </View>
        </View>
        <View style={topStyles.badges}>
          {state?.loading && (
            <View style={topStyles.badgeWrapper}>
              <ActivityIndicator />
            </View>
          )}
          {item.usesLM && (
            <View style={topStyles.badgeWrapper}>
              <HasRewardsBadge />
            </View>
          )}
          <View style={topStyles.badgeWrapper}>
            <PoolVersionBadge version={item.version} />
          </View>
        </View>
      </View>
      <View style={bottomStyles.container}>
        <View>
          <Text>Your balance:</Text>
          <Text>
            {formatAndCommify(balance.balance1, item.supplyToken1.decimals)}{' '}
            {item.supplyToken1.symbol}
          </Text>
          <Text>
            {formatAndCommify(balance.balance2, item.supplyToken2.decimals)}{' '}
            {item.supplyToken2.symbol}
          </Text>
          {sov && (
            <>
              <Text>Your Rewards</Text>
              <Text>
                {formatAndCommify(rewards.total, sov.decimals)} {sov.symbol}
              </Text>
            </>
          )}
        </View>
        <View>
          <Button
            title="Deposit"
            primary
            onPress={() =>
              navigation.navigate(`amm.deposit.v${item.version}`, {
                pool: item,
              })
            }
          />
          {/* <Button
            title="Withdraw"
            primary
            disabled={balance.balance1 === '0' && balance.balance2 === '0'}
          /> */}
        </View>
      </View>
    </View>
  );
};

const topStyles = StyleSheet.create({
  view: {
    paddingVertical: globalStyles.page.paddingVertical / 2,
    paddingHorizontal: globalStyles.page.paddingHorizontal,
  },
  container: {
    padding: 12,
    backgroundColor: DarkTheme.colors.card,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    position: 'relative',
  },
  logoContainer: {
    position: 'relative',
    height: 52,
    width: 80,
    marginRight: 12,
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
  badges: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'absolute',
    top: 4,
    right: 2,
  },
  badgeWrapper: {
    paddingHorizontal: 2,
  },
});

const bottomStyles = StyleSheet.create({
  container: {
    backgroundColor: DarkTheme.colors.card,
    paddingTop: 24,
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
