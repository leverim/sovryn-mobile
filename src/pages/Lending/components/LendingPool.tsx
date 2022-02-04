import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { LendingToken, LendingTokenFlags } from 'models/lending-token';
import { commifyDecimals, formatUnits, parseUnits } from 'utils/helpers';
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

  const token = tokenUtils.getTokenById(lendingToken.loanTokenId);
  const rewardsEnabled = lendingToken.hasFlag(
    LendingTokenFlags.REWARDS_ENABLED,
  );

  const profit = useMemo(() => {
    if (rewardsEnabled) {
      return BigNumber.from(state.tokenPrice || '0')
        .sub(state.checkpointPrice || '0')
        .mul(
          BigNumber.from(state.balanceOf || '0').add(
            state.getUserPoolTokenBalance || '0',
          ),
        )
        .div(parseUnits('1', token.decimals))
        .add(state.profitOf || '0')
        .toString();
    }
    return state.profitOf;
  }, [
    rewardsEnabled,
    state.balanceOf,
    state.checkpointPrice,
    state.getUserPoolTokenBalance,
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
      <Text>
        Interest: {commifyDecimals(formatUnits(state.supplyInterestRate, 18))} %
      </Text>
      <Text>
        Token price: {commifyDecimals(formatUnits(state.tokenPrice, 18))}
      </Text>
      <Text>
        Checkpoint price:{' '}
        {commifyDecimals(formatUnits(state.checkpointPrice, 18))}
      </Text>
      <Text>
        Liquidity:{' '}
        {commifyDecimals(formatUnits(state.marketLiquidity, token.decimals))}{' '}
        {token.symbol}
      </Text>
      <Text>
        Balance:{' '}
        {commifyDecimals(formatUnits(state.assetBalanceOf, token.decimals))}{' '}
        {token.symbol}
      </Text>
      <Text>
        Profit: {commifyDecimals(formatUnits(profit, token.decimals))}{' '}
        {token.symbol}
      </Text>
      {loading && <ActivityIndicator size={24} />}
      <View>
        {!lendingToken.hasFlag(LendingTokenFlags.DEPRECATED) && (
          <Button
            title="Lend"
            primary
            onPress={() =>
              navigation.navigate('lending.deposit', {
                tokenId: lendingToken.loanTokenId,
              })
            }
          />
        )}

        <Button title="Unlend" warning />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
});
