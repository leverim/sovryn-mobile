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
import { useLendingPool } from './hooks/useLendingPool';
import { ReadWalletAwareWrapper } from 'components/ReadWalletAwareWapper';
import { Button } from 'components/Buttons/Button';
import { LendingAmountField } from './components/LendingAmountField';
import { useWalletAddress } from 'hooks/useWalletAddress';
import { USD_TOKEN } from 'utils/constants';
import { Text } from 'components/Text';
import { transactionController } from 'controllers/TransactionController';
import { encodeFunctionData } from 'utils/contract-utils';
import { LendingTokenFlags } from 'models/lending-token';
import { BigNumber } from 'ethers';
import { RefreshControl } from 'react-native';
import { findAsset } from 'utils/asset-utils';
import { useAssetUsdBalance } from 'hooks/useAssetUsdBalance';

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
      title: `${lendingToken.supplyToken.symbol} Unlend`,
    });
  }, [navigation, lendingToken.supplyToken.symbol]);

  const { value: pool, loading, execute } = useLendingPool(lendingToken);
  const { value: sendOneUSD } = useAssetUsdBalance(
    lendingToken.supplyToken,
    parseUnits('1', lendingToken.supplyToken.decimals).toString(),
  );
  const usdToken = findAsset(chainId, USD_TOKEN);
  const rewardsToken = findAsset(chainId, 'sov');
  const rewardsEnabled = lendingToken.hasFlag(
    LendingTokenFlags.REWARDS_ENABLED,
  );

  const [amount, setAmount] = useState('');

  const sendUSD = useMemo(() => {
    if (sendOneUSD === null || numberIsEmpty(amount)) {
      return undefined;
    }
    return formatUnits(
      parseUnits(amount, lendingToken.supplyToken.decimals)
        .mul(parseUnits(sendOneUSD, usdToken.decimals))
        .div(parseUnits('1', usdToken.decimals)),
      usdToken.decimals,
    );
  }, [
    sendOneUSD,
    amount,
    lendingToken.supplyToken.decimals,
    usdToken.decimals,
  ]);

  const loanTokenAmount = useMemo(() => {
    const totalBalance = BigNumber.from(pool.balanceOf || '0').add(
      pool.getUserPoolTokenBalance || '0',
    );
    const weiAmount = parseUnits(amount, lendingToken.supplyToken.decimals);
    let tokenAmount = weiAmount
      .mul(parseUnits('1', lendingToken.supplyToken.decimals))
      .div(pool.tokenPrice || '0');

    // make sure there is no dust amount left when withdrawing
    if (
      tokenAmount
        .add(parseUnits('0.00001', lendingToken.supplyToken.decimals))
        .gte(totalBalance)
    ) {
      return totalBalance.toString();
    }

    return tokenAmount.toString();
  }, [
    amount,
    lendingToken.supplyToken.decimals,
    pool.balanceOf,
    pool.getUserPoolTokenBalance,
    pool.tokenPrice,
  ]);

  const error = useMemo(() => {
    const weiAmount = parseUnits(amount, lendingToken.supplyToken.decimals);
    if (weiAmount.gt(pool.assetBalanceOf || '0')) {
      return `Insufficient ${lendingToken.supplyToken.symbol} lending balance`;
    }
    if (weiAmount.lte('0')) {
      return 'Enter amount';
    }
    return null;
  }, [
    amount,
    lendingToken.supplyToken.decimals,
    lendingToken.supplyToken.symbol,
    pool.assetBalanceOf,
  ]);

  const [submitting, setSubmitting] = useState(false);
  const handleWithdraw = useCallback(async () => {
    setSubmitting(true);
    try {
      const tx = await transactionController.request({
        to: lendingToken.loanTokenAddress,
        value: 0,
        data: encodeFunctionData(
          `${
            lendingToken.supplyToken.native ? 'burnToBTC' : 'burn'
          }(address,uint256,bool)(uint256)`,
          [owner, loanTokenAmount, rewardsEnabled],
        ),
        customData: {
          receiveAmount: parseUnits(amount, lendingToken.supplyToken.decimals),
        },
        chainId,
      });
      setSubmitting(false);
      tx.wait().finally(execute);
    } catch (e) {
      setSubmitting(false);
    }
  }, [
    lendingToken.loanTokenAddress,
    lendingToken.supplyToken.native,
    lendingToken.supplyToken.decimals,
    owner,
    loanTokenAmount,
    rewardsEnabled,
    amount,
    chainId,
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
        token={lendingToken.supplyToken}
        amount={amount}
        onAmountChanged={setAmount}
        balance={formatUnits(
          pool.assetBalanceOf,
          lendingToken.supplyToken.decimals,
        )}
        price={sendUSD}
      />
      {rewardsEnabled && (
        <Text>
          Rewards (vested for 10 months):{' '}
          {formatAndCommify(
            pool.getUserAccumulatedReward!,
            rewardsToken.decimals,
          )}{' '}
          {rewardsToken.symbol}
        </Text>
      )}
      {!!loanTokenAmount && (
        <Text>
          {lendingToken.loanToken.symbol} amount:{' '}
          {formatAndCommify(loanTokenAmount, lendingToken.supplyToken.decimals)}{' '}
          {lendingToken.supplyToken.symbol}
        </Text>
      )}
      <Text>
        {lendingToken.loanToken.symbol} ={' '}
        {formatAndCommify(pool.tokenPrice!, lendingToken.supplyToken.decimals)}{' '}
        {lendingToken.supplyToken.symbol}
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
