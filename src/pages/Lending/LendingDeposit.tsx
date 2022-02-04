import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { RefreshControl } from 'react-native';
import { SafeAreaPage } from 'templates/SafeAreaPage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { globalStyles } from 'global.styles';
import { LendingRoutesStackProps } from 'routers/lending.routes';
import {
  commifyDecimals,
  currentChainId,
  formatUnits,
  numberIsEmpty,
  parseUnits,
} from 'utils/helpers';
import { lendingTokens } from 'config/lending-tokens';
import { tokenUtils } from 'utils/token-utils';
import { useLendingPool } from './hooks/userLendingPool';
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
import { encodeFunctionData } from 'utils/contract-utils';
import { LendingTokenFlags } from 'models/lending-token';

type Props = NativeStackScreenProps<LendingRoutesStackProps, 'lending.deposit'>;

export const LendingDeposit: React.FC<Props> = ({
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
      title: `${lendingToken.token.symbol} Lending`,
    });
  }, [navigation, lendingToken.token.symbol]);

  const { value: pool, loading, execute } = useLendingPool(lendingToken);
  const { value: balance } = useAssetBalance(
    lendingToken.token,
    owner,
    chainId,
  );
  const sendOneUSD = useBalanceToUsd(
    chainId,
    lendingToken.token,
    parseUnits('1', lendingToken.decimals).toString(),
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
      parseUnits(amount, lendingToken.token.decimals)
        .mul(parseUnits(sendOneUSD, usdToken.decimals))
        .div(parseUnits('1', usdToken.decimals)),
      usdToken.decimals,
    );
  }, [sendOneUSD, amount, lendingToken.token.decimals, usdToken.decimals]);

  const [submitting, setSubmitting] = useState(false);
  const handleDeposit = useCallback(async () => {
    setSubmitting(true);
    try {
      const native = tokenUtils.getNativeToken(chainId);
      const isNative = lendingToken.loanTokenId === native.id;
      const weiAmount = parseUnits(amount, lendingToken.token.decimals);
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
      const tx = await transactionController.request({
        to: lendingToken.loanTokenAddress,
        value: hexlify(isNative ? weiAmount : 0),
        data,
      });
      setSubmitting(false);
      tx.wait().finally(execute);
    } catch (e) {
      setSubmitting(false);
    }
  }, [
    amount,
    chainId,
    lendingToken.loanTokenAddress,
    lendingToken.loanTokenId,
    lendingToken.token.decimals,
    owner,
    rewardsEnabled,
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
      <Text>
        Interest: {commifyDecimals(formatUnits(pool.supplyInterestRate, 18), 4)}{' '}
        %
      </Text>
      <Text>
        Already Deposited:{' '}
        {commifyDecimals(
          formatUnits(pool.assetBalanceOf, lendingToken.token.decimals),
        )}{' '}
        {lendingToken.token.symbol}
      </Text>
      <LendingAmountField
        token={lendingToken.token}
        amount={amount}
        onAmountChanged={setAmount}
        balance={balance}
        price={sendUSD}
      />
      <ReadWalletAwareWrapper>
        <TokenApprovalFlow
          tokenId={lendingToken.token.id as TokenId}
          spender={lendingToken.loanTokenAddress}
          requiredAmount={amount}>
          <Button
            title="Lend"
            onPress={handleDeposit}
            primary
            loading={submitting}
            disabled={submitting}
          />
        </TokenApprovalFlow>
      </ReadWalletAwareWrapper>
    </SafeAreaPage>
  );
};
