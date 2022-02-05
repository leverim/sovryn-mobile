import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { LendingToken, LendingTokenFlags } from 'models/lending-token';
import {
  commifyDecimals,
  formatUnits,
  parseAndCommify,
  parseUnits,
} from 'utils/helpers';
import { tokenUtils } from 'utils/token-utils';
import { Text } from 'components/Text';
import { Button } from 'components/Buttons/Button';
import { BigNumber } from 'ethers';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { LendingRoutesStackProps } from 'routers/lending.routes';
import { useLendingPool } from '../hooks/userLendingPool';

type LendingPoolProps = {
  lendingToken: LendingToken;
};

export const LendingPool: React.FC<LendingPoolProps> = ({ lendingToken }) => {
  const navigation = useNavigation<NavigationProp<LendingRoutesStackProps>>();

  const { value: state, loading } = useLendingPool(lendingToken);

  const token = lendingToken.token;
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
        .div(parseUnits('1', token.decimals))
        .add(state.profitOf || '0')
        .toString();
    }
    return state.profitOf;
  }, [
    iTokenBalance,
    rewardsEnabled,
    state.checkpointPrice,
    state.profitOf,
    state.tokenPrice,
    token.decimals,
  ]);

  return (
    <View style={styles.container}>
      <Text>{token.symbol}</Text>
      {lendingToken.hasFlag(LendingTokenFlags.REWARDS_ENABLED) && (
        <Text>SOV Rewards available</Text>
      )}
      <Text>Interest: {parseAndCommify(state.supplyInterestRate, 18)} %</Text>
      <Text>
        i{lendingToken.token.symbol} price:{' '}
        {parseAndCommify(state.tokenPrice, lendingToken.decimals)}{' '}
        {lendingToken.token.symbol}
        {}
      </Text>
      <Text>
        i{lendingToken.token.symbol} checkpoint price:{' '}
        {parseAndCommify(state.checkpointPrice, lendingToken.decimals)}
        {lendingToken.token.symbol}
      </Text>
      <Text>
        Liquidity: {parseAndCommify(state.marketLiquidity, token.decimals)}{' '}
        {token.symbol}
      </Text>
      <Text>
        Your Balance: {parseAndCommify(state.assetBalanceOf, token.decimals)}{' '}
        {token.symbol} ({parseAndCommify(iTokenBalance, lendingToken.decimals)}{' '}
        i{token.symbol})
      </Text>
      <Text>
        Your Profit: {parseAndCommify(profit, token.decimals)} {token.symbol}
      </Text>
      {loading && <ActivityIndicator size={24} />}
      <View>
        {!lendingToken.hasFlag(LendingTokenFlags.DEPRECATED) && (
          <Button
            title="Deposit"
            primary
            onPress={() =>
              navigation.navigate('lending.deposit', {
                tokenId: lendingToken.loanTokenId,
              })
            }
          />
        )}

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
});
