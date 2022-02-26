import { DarkTheme } from '@react-navigation/native';
import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { Keyboard, Pressable } from 'react-native';
import { getSovAsset } from 'utils/asset-utils';
import { useAmmPoolData } from './hooks/useAmmPoolData';
import { AmmRoutesStackProps } from 'routers/amm.routes';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PageContainer, SafeAreaPage } from 'templates/SafeAreaPage';
import { Text } from 'components/Text';
import { AmmAmountField } from './components/AmmAmountField';
import { TokenApprovalFlow } from 'components/TokenApprovalFlow';
import { Button } from 'components/Buttons/Button';
import {
  commifyDecimals,
  floorDecimals,
  getContractAddress,
  noop,
} from 'utils/helpers';
import { useSlippage } from 'hooks/useSlippage';
import SettingsIcon from 'assets/settings-icon.svg';
import AddIcon from 'assets/add-icon.svg';
import ArrowDownIcon from 'assets/arrow-down-icon.svg';
import { SwapSettingsModal } from 'pages/SwapPage/components/SwapSettingsModal';
import { transactionController } from 'controllers/TransactionController';
import { encodeFunctionData } from 'utils/contract-utils';
import { PendingTransactions } from 'components/TransactionHistory/PendingTransactions';
import { useIsMounted } from 'hooks/useIsMounted';
import { useAssetUsdBalance } from 'hooks/useAssetUsdBalance';
import { AmountFieldIconWrapper } from 'components/AmountFieldIconWrapper';
import { SwapAmountField } from 'pages/SwapPage/components/SwapAmountField';
import { Asset } from 'models/asset';
import { BigNumber } from 'ethers';
import { ReadWalletAwareWrapper } from 'components/ReadWalletAwareWapper';
import { RefreshControl } from 'components/RefreshControl';

type Props = NativeStackScreenProps<AmmRoutesStackProps, 'amm.withdraw.v2'>;

export const AmmWithdrawV2: React.FC<Props> = ({ route, navigation }) => {
  const { pool } = route.params;
  const { state, execute, rewards } = useAmmPoolData(pool);
  const isMounted = useIsMounted();

  const [amount, setAmount] = useState('');
  const [poolToken, setPoolToken] = useState(pool.poolToken1);

  const which = useMemo(
    () => (poolToken.id === pool.poolToken1.id ? 1 : 2),
    [pool.poolToken1.id, poolToken.id],
  );

  const supplyToken = useMemo(
    () => (which === 1 ? pool.supplyToken1 : pool.supplyToken2),
    [pool.supplyToken1, pool.supplyToken2, which],
  );

  const lpBalance = useMemo(
    () =>
      which === 1 ? state.getUserInfo1.amount : state.getUserInfo2?.amount!,
    [state.getUserInfo1.amount, state.getUserInfo2?.amount, which],
  );

  const setSupplyToken = useCallback(
    (asset: Asset) => {
      setPoolToken(
        asset.id === pool.supplyToken1.id ? pool.poolToken1 : pool.poolToken2!,
      );
    },
    [pool.poolToken1, pool.poolToken2, pool.supplyToken1.id],
  );

  const receiveAmount = useMemo(() => {
    return pool.poolToken1
      .parseUnits(amount)
      .mul(pool.poolToken1.ONE)
      .div(state.poolTokenSupply1)
      .mul(state.reserveStakedBalance1)
      .div(pool.supplyToken1.ONE)
      .toString();
  }, [
    amount,
    pool.poolToken1,
    pool.supplyToken1.ONE,
    state.poolTokenSupply1,
    state.reserveStakedBalance1,
  ]);

  const amount2 = useMemo(() => {
    return pool.poolToken1
      .parseUnits(amount)
      .mul(pool.poolToken1.ONE)
      .div(state.poolTokenSupply1)
      .mul(state.reserveStakedBalance2)
      .div(pool.supplyToken2.ONE)
      .toString();
  }, [
    amount,
    pool.poolToken1,
    pool.supplyToken2.ONE,
    state.poolTokenSupply1,
    state.reserveStakedBalance2,
  ]);

  const [refreshing, setRefreshing] = useState(false);

  const receiverContract = getContractAddress('rbtcWrapper', pool.chainId);

  const [showSettings, setShowSettings] = useState(false);
  const [slippage, setSlippage] = useState('0.2');
  const { minReturn: minReturn } = useSlippage(receiveAmount, 0, slippage);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => {
            Keyboard.dismiss();
            setShowSettings(true);
          }}>
          <SettingsIcon fill={DarkTheme.colors.primary} />
        </Pressable>
      ),
    });
  }, [navigation]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    execute().finally(() => {
      if (isMounted()) {
        setRefreshing(false);
      }
    });
  }, [execute, isMounted]);

  const submit = useCallback(async () => {
    try {
      const tx = await transactionController.request({
        to: receiverContract,
        data: encodeFunctionData(
          'removeLiquidityFromV2(address,address,uint256,uint256)(uint256)',
          [
            pool.converterAddress,
            supplyToken.getWrappedAsset().address,
            poolToken.parseUnits(amount).toString(),
            minReturn,
          ],
        ),
      });
      tx.wait().finally(refresh);
    } catch (e) {
      console.log('amm withdraw v2', e);
    }
  }, [
    amount,
    minReturn,
    pool.converterAddress,
    poolToken,
    receiverContract,
    refresh,
    supplyToken,
  ]);

  const usd = useAssetUsdBalance(supplyToken, receiveAmount);

  const errorTitle = useMemo(() => {
    console.log('b1', lpBalance, amount);
    const b1 = BigNumber.from(lpBalance || '0');
    const a1 = poolToken.parseUnits(amount);

    if (a1.lte(0)) {
      return 'Enter amount';
    }

    if (b1.lt(a1)) {
      return `Insufficient ${poolToken.symbol} balance`;
    }
  }, [amount, lpBalance, poolToken]);

  const sov = getSovAsset(pool.chainId);

  return (
    <SafeAreaPage
      keyboardAvoiding
      scrollView
      scrollViewProps={{
        keyboardShouldPersistTaps: 'handled',
        refreshControl: (
          <RefreshControl
            refreshing={state.loading || refreshing}
            onRefresh={refresh}
          />
        ),
      }}>
      <PageContainer>
        <SwapAmountField
          amount={amount}
          onAmountChanged={setAmount}
          token={poolToken}
          balance={poolToken.formatUnits(lpBalance)}
          title={<Text>Withdraw {pool.poolToken1.symbol} LP tokens:</Text>}
          tokens={[pool.poolToken1, pool.poolToken2!]}
          onTokenChanged={setPoolToken}
        />

        <AmountFieldIconWrapper control={<ArrowDownIcon fill="white" />}>
          <SwapAmountField
            amount={floorDecimals(supplyToken.formatUnits(receiveAmount), 8)}
            onAmountChanged={noop}
            token={supplyToken}
            price={usd.value!}
            title={<Text>Receive {supplyToken.symbol}:</Text>}
            inputProps={{ editable: false }}
            tokens={[pool.supplyToken1, pool.supplyToken2]}
            onTokenChanged={setSupplyToken}
          />
        </AmountFieldIconWrapper>
        <AmountFieldIconWrapper control={<AddIcon fill="white" />}>
          <AmmAmountField
            title={<Text>Vested SOV rewards:</Text>}
            amount={floorDecimals(sov.formatUnits(rewards.total), 8)}
            onAmountChanged={noop}
            token={sov}
            inputProps={{ editable: false }}
          />
        </AmountFieldIconWrapper>

        <ReadWalletAwareWrapper>
          {errorTitle ? (
            <Button primary title={errorTitle} onPress={submit} disabled />
          ) : (
            <TokenApprovalFlow
              chainId={pool.chainId}
              spender={receiverContract}
              tokenId={poolToken.id}
              requiredAmount={amount}>
              <Button primary title="Withdraw" onPress={submit} />
            </TokenApprovalFlow>
          )}
        </ReadWalletAwareWrapper>

        <Text>Slippage: {commifyDecimals(slippage, 3)}%</Text>
        <Text>SOV Rewards will be vested for 10 months</Text>
        <PendingTransactions />
        {showSettings && (
          <SwapSettingsModal
            open={showSettings}
            slippage={slippage}
            onClose={() => setShowSettings(false)}
            onSlippageChange={setSlippage}
          />
        )}
      </PageContainer>
    </SafeAreaPage>
  );
};
