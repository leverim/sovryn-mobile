import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaPage } from 'templates/SafeAreaPage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { globalStyles } from 'global.styles';
import { LendingRoutesStackProps } from 'routers/lending.routes';
import {
  commifyDecimals,
  currentChainId,
  formatAndCommify,
  formatUnits,
  numberIsEmpty,
  parseUnits,
} from 'utils/helpers';
import { lendingTokens } from 'config/lending-tokens';
import { tokenUtils } from 'utils/token-utils';
import { useLendingPool } from './hooks/useLendingPool';
import { ReadWalletAwareWrapper } from 'components/ReadWalletAwareWapper';
import { Button } from 'components/Buttons/Button';
import { TokenApprovalFlow } from 'components/TokenApprovalFlow';
import { TokenId } from 'types/token';
import { LendingAmountField } from './components/LendingAmountField';
import { useAssetBalance } from 'hooks/useAssetBalance';
import { useWalletAddress } from 'hooks/useWalletAddress';
import { useBalanceToUsd } from 'hooks/useBalanceToUsd';
import { USD_TOKEN } from 'utils/constants';
import { Text } from 'components/Text';
import { transactionController } from 'controllers/TransactionController';
import { hexlify } from 'ethers/lib/utils';
import { contractCall, encodeFunctionData } from 'utils/contract-utils';
import { LendingTokenFlags } from 'models/lending-token';
import { useDebouncedEffect } from 'hooks/useDebounceEffect';
import { useIsMounted } from 'hooks/useIsMounted';
import Logger from 'utils/Logger';

type Props = NativeStackScreenProps<LendingRoutesStackProps, 'lending.deposit'>;

export const LendingDeposit: React.FC<Props> = ({
  navigation,
  route: { params },
}) => {
  const isMounted = useIsMounted();

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
      title: `${lendingToken.supplyToken.symbol} Lending`,
    });
  }, [navigation, lendingToken.supplyToken.symbol]);

  const { value: pool, loading, execute } = useLendingPool(lendingToken);
  const { value: balance } = useAssetBalance(
    lendingToken.supplyToken,
    owner,
    chainId,
  );
  const sendOneUSD = useBalanceToUsd(
    chainId,
    lendingToken.supplyToken,
    parseUnits('1', lendingToken.supplyToken.decimals).toString(),
  );
  const usdToken = tokenUtils.getTokenById(USD_TOKEN);
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

  const receiveLoanToken = useMemo(() => {
    return parseUnits(amount)
      .mul(parseUnits('1', lendingToken.loanToken.decimals))
      .div(pool.tokenPrice)
      .toString();
  }, [amount, pool.tokenPrice, lendingToken.loanToken.decimals]);

  const [submitting, setSubmitting] = useState(false);
  const handleDeposit = useCallback(async () => {
    setSubmitting(true);
    try {
      const native = tokenUtils.getNativeToken(chainId);
      const isNative = lendingToken.loanTokenId === native.id;
      const weiAmount = parseUnits(amount, lendingToken.supplyToken.decimals);
      const data = isNative
        ? encodeFunctionData('mintWithBTC(address,bool)(uint256)', [
            owner,
            rewardsEnabled,
          ])
        : encodeFunctionData('mint(address,uint256,bool)(uint256)', [
            owner,
            weiAmount,
            rewardsEnabled,
          ]);
      await transactionController.request({
        to: lendingToken.loanTokenAddress,
        value: hexlify(isNative ? weiAmount : 0),
        data,
        customData: {
          token: lendingToken.supplyToken.id,
          receiveAmount: receiveLoanToken,
        },
      });
      setSubmitting(false);
      // tx.wait().finally(execute);
    } catch (e) {
      setSubmitting(false);
    }
  }, [
    amount,
    chainId,
    lendingToken.loanTokenAddress,
    lendingToken.loanTokenId,
    lendingToken.supplyToken.decimals,
    lendingToken.supplyToken.id,
    owner,
    receiveLoanToken,
    rewardsEnabled,
  ]);

  const [_nextInterestRate, setNextInterestRate] = useState(
    pool.supplyInterestRate,
  );
  const [interestLoading, setInterestLoading] = useState(true);

  useDebouncedEffect(
    () => {
      setInterestLoading(true);
      contractCall(
        chainId,
        lendingToken.loanTokenAddress,
        'nextSupplyInterestRate(uint256)(uint256)',
        [parseUnits(amount, lendingToken.supplyToken.decimals)],
      )
        .then(response => response[0].toString())
        .then(response => {
          if (isMounted()) {
            setNextInterestRate(response);
            setInterestLoading(false);
          }
        })
        .catch(error => {
          Logger.error(error, 'nextSupplyInterestRate');
          if (isMounted()) {
            setInterestLoading(undefined!);
            setInterestLoading(false);
          }
        });
    },
    300,
    [chainId, amount, lendingToken.supplyToken.decimals, isMounted],
  );

  const nextInterestRate = useMemo(
    () =>
      _nextInterestRate !== undefined
        ? _nextInterestRate
        : pool.supplyInterestRate,
    [_nextInterestRate, pool.supplyInterestRate],
  );

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
        balance={balance}
        price={sendUSD}
      />
      <Text>Interest rate: {formatAndCommify(nextInterestRate, 18, 4)} %</Text>
      <Text>
        Receive:{' '}
        {formatAndCommify(receiveLoanToken, lendingToken.loanToken.decimals)}{' '}
        {lendingToken.loanToken.symbol}
      </Text>
      <ReadWalletAwareWrapper>
        <TokenApprovalFlow
          tokenId={lendingToken.supplyToken.id as TokenId}
          spender={lendingToken.loanTokenAddress}
          loading={interestLoading}
          disabled={interestLoading}
          requiredAmount={amount}>
          <Button
            title="Lend"
            onPress={handleDeposit}
            primary
            loading={submitting || interestLoading}
            disabled={submitting || interestLoading}
          />
        </TokenApprovalFlow>
      </ReadWalletAwareWrapper>
    </SafeAreaPage>
  );
};
