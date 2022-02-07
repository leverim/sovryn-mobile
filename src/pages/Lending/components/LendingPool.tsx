import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { LendingToken, LendingTokenFlags } from 'models/lending-token';
import { formatAndCommify, parseUnits } from 'utils/helpers';
import { Text } from 'components/Text';
import { Button } from 'components/Buttons/Button';
import { BigNumber } from 'ethers';
import {
  DarkTheme,
  NavigationProp,
  useNavigation,
} from '@react-navigation/native';
import { LendingRoutesStackProps } from 'routers/lending.routes';
import { useLendingPool } from '../hooks/useLendingPool';

type LendingPoolProps = {
  lendingToken: LendingToken;
};

export const LendingPool: React.FC<LendingPoolProps> = ({ lendingToken }) => {
  const navigation = useNavigation<NavigationProp<LendingRoutesStackProps>>();

  const { value: state, loading } = useLendingPool(lendingToken);

  const rewardsEnabled = lendingToken.hasFlag(
    LendingTokenFlags.REWARDS_ENABLED,
  );

  const iTokenBalance = useMemo(
    () =>
      BigNumber.from(state.balanceOf || '0').add(
        state.getUserPoolTokenBalance || '0',
      ),
    [state.balanceOf, state.getUserPoolTokenBalance],
  );

  const profit = useMemo(() => {
    if (rewardsEnabled) {
      return BigNumber.from(state.tokenPrice || '0')
        .sub(state.checkpointPrice || '0')
        .mul(iTokenBalance)
        .div(parseUnits('1', lendingToken.supplyToken.decimals))
        .add(state.profitOf || '0')
        .toString();
    }
    return state.profitOf;
  }, [
    iTokenBalance,
    lendingToken.supplyToken.decimals,
    rewardsEnabled,
    state.checkpointPrice,
    state.profitOf,
    state.tokenPrice,
  ]);

  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>{lendingToken.supplyToken.symbol}</Text>
      {lendingToken.hasFlag(LendingTokenFlags.REWARDS_ENABLED) && (
        <Text>SOV Rewards available</Text>
      )}
      <Text style={styles.descriptionText}>
        Interest: {formatAndCommify(state.supplyInterestRate, 18)} %
      </Text>
      <Text style={styles.descriptionText}>
        {lendingToken.loanToken.symbol} price:{' '}
        {formatAndCommify(state.tokenPrice, lendingToken.supplyToken.decimals)}{' '}
        {lendingToken.supplyToken.symbol}
      </Text>
      {/* <Text style={styles.descriptionText}>
        {lendingToken.loanToken.symbol} checkpoint price:{' '}
        {formatAndCommify(
          state.checkpointPrice,
          lendingToken.supplyToken.decimals,
        )}{' '}
        {lendingToken.supplyToken.symbol}
      </Text> */}
      <Text style={styles.descriptionText}>
        Liquidity:{' '}
        {formatAndCommify(
          state.marketLiquidity,
          lendingToken.supplyToken.decimals,
        )}{' '}
        {lendingToken.supplyToken.symbol}
      </Text>
      <Text style={styles.descriptionText}>
        Your Balance:{' '}
        {formatAndCommify(
          state.assetBalanceOf,
          lendingToken.supplyToken.decimals,
        )}{' '}
        {lendingToken.supplyToken.symbol} (
        {formatAndCommify(iTokenBalance, lendingToken.loanToken.decimals)}{' '}
        {lendingToken.loanToken.symbol})
      </Text>
      <Text style={styles.descriptionText}>
        Your Profit:{' '}
        {formatAndCommify(profit, lendingToken.supplyToken.decimals)}{' '}
        {lendingToken.supplyToken.symbol}
      </Text>
      {loading && <ActivityIndicator size={24} />}
      <View style={styles.buttonContainer}>
        <View style={styles.buttonView}>
          <Button
            title="Withdraw"
            primary
            onPress={() =>
              navigation.navigate('lending.withdraw', {
                tokenId: lendingToken.loanTokenId,
              })
            }
          />
        </View>
        {!lendingToken.hasFlag(LendingTokenFlags.DEPRECATED) && (
          <View style={styles.buttonView}>
            <Button
              title="Deposit"
              primary
              onPress={() =>
                navigation.navigate('lending.deposit', {
                  tokenId: lendingToken.loanTokenId,
                })
              }
            />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    backgroundColor: DarkTheme.colors.card,
    borderWidth: 1,
    borderColor: DarkTheme.colors.border,
    borderRadius: 12,
    padding: 12,
  },
  titleText: {
    fontSize: 18,
    marginBottom: 8,
    fontWeight: '500',
  },
  descriptionText: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '300',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    flex: 1,
    marginHorizontal: -6,
  },
  buttonView: {
    flex: 1,
    paddingHorizontal: 6,
  },
});
