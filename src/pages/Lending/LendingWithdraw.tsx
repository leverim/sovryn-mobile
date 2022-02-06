import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { SafeAreaPage } from 'templates/SafeAreaPage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { globalStyles } from 'global.styles';
import { LendingRoutesStackProps } from 'routers/lending.routes';
import {
  currentChainId,
  formatUnits,
  numberIsEmpty,
  formatAndCommify,
  parseUnits,
} from 'utils/helpers';
import { lendingTokens } from 'config/lending-tokens';
import { tokenUtils } from 'utils/token-utils';
import { useLendingPool } from './hooks/useLendingPool';
import { ReadWalletAwareWrapper } from 'components/ReadWalletAwareWapper';
import { Button } from 'components/Buttons/Button';
import { LendingAmountField } from './components/LendingAmountField';
import { useWalletAddress } from 'hooks/useWalletAddress';
import { useBalanceToUsd } from 'hooks/useBalanceToUsd';
import { USD_TOKEN } from 'utils/constants';
import { Text } from 'components/Text';
import { transactionController } from 'controllers/TransactionController';
import { encodeFunctionData } from 'utils/contract-utils';
import { LendingTokenFlags } from 'models/lending-token';
import { BigNumber } from 'ethers';
import { RefreshControl } from 'react-native';

type Props = NativeStackScreenProps<LendingRoutesStackProps, 'lending.deposit'>;

export const LendingWithdraw: React.FC<Props> = ({
  navigation,
  route: { params },
}) => {
  const chainId = currentChainId();
  const owner = useWalletAddress().toLowerCase();
  const lendingToken = useMemo(
    () =>
      lendingTokens.find(
        item => item.chainId === chainId && item.loanTokenId === params.tokenId,
      )!,
    [chainId, params.tokenId],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: `${lendingToken.token.symbol} Unlend`,
    });
  }, [navigation, lendingToken.token.symbol]);

  const { value: pool, loading, execute } = useLendingPool(lendingToken);
  const sendOneUSD = useBalanceToUsd(
    chainId,
    lendingToken.token,
    parseUnits('1', lendingToken.decimals).toString(),
  );
  const usdToken = tokenUtils.getTokenById(USD_TOKEN);
  const rewardsToken = tokenUtils.getTokenById('sov');
  const rewardsEnabled = lendingToken.hasFlag(
    LendingTokenFlags.REWARDS_ENABLED,
  );

  const [amount, setAmount] = useState('');

  const sendUSD = useMemo(() => {
    if (sendOneUSD === null || numberIsEmpty(amount)) {
      return undefined;
    }
    return formatUnits(
      parseUnits(amount, lendingToken.token.decimals)
        .mul(parseUnits(sendOneUSD, usdToken.decimals))
        .div(parseUnits('1', usdToken.decimals)),
      usdToken.decimals,
    );
  }, [sendOneUSD, amount, lendingToken.token.decimals, usdToken.decimals]);

  const loanTokenAmount = useMemo(() => {
    const totalBalance = BigNumber.from(pool.balanceOf || '0').add(
      pool.getUserPoolTokenBalance || '0',
    );
    const weiAmount = parseUnits(amount, lendingToken.token.decimals);
    let tokenAmount = weiAmount
      .mul(parseUnits('1', lendingToken.token.decimals))
      .div(pool.tokenPrice || '0');

    // make sure there is no dust amount left when withdrawing
    if (
      tokenAmount
        .add(parseUnits('0.00001', lendingToken.token.decimals))
        .gte(totalBalance)
    ) {
      return totalBalance.toString();
    }

    return tokenAmount.toString();
  }, [
    amount,
    lendingToken.token.decimals,
    pool.balanceOf,
    pool.getUserPoolTokenBalance,
    pool.tokenPrice,
  ]);

  const error = useMemo(() => {
    const weiAmount = parseUnits(amount, lendingToken.token.decimals);
    if (weiAmount.gt(pool.assetBalanceOf || '0')) {
      return `Insufficient ${lendingToken.token.symbol} lending balance`;
    }
    return null;
  }, [
    amount,
    lendingToken.token.decimals,
    lendingToken.token.symbol,
    pool.assetBalanceOf,
  ]);

  const [submitting, setSubmitting] = useState(false);
  const handleWithdraw = useCallback(async () => {
    setSubmitting(true);
    try {
      const native = tokenUtils.getNativeToken(chainId);
      const isNative = lendingToken.loanTokenId === native.id;
      const tx = await transactionController.request({
        to: lendingToken.loanTokenAddress,
        value: 0,
        data: encodeFunctionData(
          `${isNative ? 'burnToBTC' : 'burn'}(address,uint256,bool)(uint256)`,
          [owner, loanTokenAmount, rewardsEnabled],
        ),
        customData: {
          receiveAmount: parseUnits(amount, lendingToken.token.decimals),
        },
      });
      setSubmitting(false);
      tx.wait().finally(execute);
    } catch (e) {
      setSubmitting(false);
    }
  }, [
    chainId,
    lendingToken.loanTokenId,
    lendingToken.loanTokenAddress,
    lendingToken.token.decimals,
    owner,
    loanTokenAmount,
    rewardsEnabled,
    amount,
    execute,
  ]);

  return (
    <SafeAreaPage
      scrollView
      scrollViewProps={{
        style: globalStyles.page,
        refreshControl: (
          <RefreshControl refreshing={loading} onRefresh={execute} />
        ),
      }}>
      <LendingAmountField
        token={lendingToken.token}
        amount={amount}
        onAmountChanged={setAmount}
        balance={formatUnits(pool.assetBalanceOf, lendingToken.token.decimals)}
        price={sendUSD}
      />
      {rewardsEnabled && (
        <Text>
          Rewards (vested for 10 months?):{' '}
          {formatAndCommify(
            pool.getUserAccumulatedReward!,
            rewardsToken.decimals,
          )}{' '}
          {rewardsToken.symbol}
        </Text>
      )}
      {!!loanTokenAmount && (
        <Text>
          i{lendingToken.token.symbol} amount:{' '}
          {formatAndCommify(loanTokenAmount, lendingToken.decimals)}{' '}
          {lendingToken.token.symbol}
        </Text>
      )}
      <Text>
        i{lendingToken.token.symbol} ={' '}
        {formatAndCommify(pool.tokenPrice!, lendingToken.token.decimals)}{' '}
        {lendingToken.token.symbol}
      </Text>
      <ReadWalletAwareWrapper>
        <Button
          title={error ? error : 'Withdraw'}
          onPress={handleWithdraw}
          primary
          loading={submitting}
          disabled={submitting || !!error}
        />
      </ReadWalletAwareWrapper>
    </SafeAreaPage>
  );
};
