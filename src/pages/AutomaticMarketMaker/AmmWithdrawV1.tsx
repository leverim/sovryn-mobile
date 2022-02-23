import { DarkTheme } from '@react-navigation/native';
import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { Keyboard, Pressable, RefreshControl } from 'react-native';
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

type Props = NativeStackScreenProps<AmmRoutesStackProps, 'amm.withdraw.v1'>;

export const AmmWithdrawV1: React.FC<Props> = ({ route, navigation }) => {
  const { pool } = route.params;
  const { state, execute, rewards } = useAmmPoolData(pool);
  const isMounted = useIsMounted();

  const [amount, setAmount] = useState('');

  const amount1 = useMemo(() => {
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
  const { minReturn: minReturn1 } = useSlippage(amount1, 0, slippage);
  const { minReturn: minReturn2 } = useSlippage(amount2, 0, slippage);

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
      console.log({ minReturn1, minReturn2 });
      const tx = await transactionController.request({
        to: receiverContract,
        data: encodeFunctionData(
          'removeLiquidityFromV1(address,uint256,address[],uint256[])(uint256)',
          [
            pool.converterAddress,
            pool.poolToken1.parseUnits(amount).toString(),
            [
              pool.supplyToken1.getWrappedAsset().address,
              pool.supplyToken2.getWrappedAsset().address,
            ],
            [minReturn1, minReturn2],
          ],
        ),
      });
      tx.wait().finally(refresh);
    } catch (e) {
      console.log('amm withdraw v1', e);
    }
  }, [
    amount,
    minReturn1,
    minReturn2,
    pool.converterAddress,
    pool.poolToken1,
    pool.supplyToken1,
    pool.supplyToken2,
    receiverContract,
    refresh,
  ]);

  const usd1 = useAssetUsdBalance(pool.supplyToken1, amount1);
  const usd2 = useAssetUsdBalance(pool.supplyToken2, amount2);

  const errorTitle = useMemo(() => {
    const b1 = pool.poolToken1.parseUnits(state.getUserInfo1.amount);
    const a1 = pool.poolToken1.parseUnits(amount);

    if (a1.lte(0)) {
      return 'Enter amount';
    }

    if (b1.lt(a1)) {
      return `Insufficient ${pool.poolToken1.symbol} balance`;
    }
  }, [amount, pool.poolToken1, state.getUserInfo1.amount]);

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
        <AmmAmountField
          amount={amount}
          onAmountChanged={setAmount}
          token={pool.poolToken1}
          balance={pool.poolToken1.formatUnits(state.getUserInfo1.amount)}
          title={<Text>Withdraw {pool.poolToken1.symbol} LP tokens:</Text>}
        />
        <AmountFieldIconWrapper control={<ArrowDownIcon fill="white" />}>
          <AmmAmountField
            amount={floorDecimals(pool.supplyToken1.formatUnits(amount1), 8)}
            onAmountChanged={noop}
            token={pool.supplyToken1}
            price={usd1.value!}
            title={<Text>Receive {pool.supplyToken1.symbol}:</Text>}
            inputProps={{ editable: false }}
          />
        </AmountFieldIconWrapper>

        <AmountFieldIconWrapper control={<AddIcon fill="white" />}>
          <AmmAmountField
            amount={floorDecimals(pool.supplyToken2.formatUnits(amount2), 8)}
            onAmountChanged={noop}
            token={pool.supplyToken2}
            price={usd2.value!}
            title={<Text>Receive {pool.supplyToken2.symbol}:</Text>}
            inputProps={{ editable: false }}
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
        {errorTitle ? (
          <Button primary title={errorTitle} onPress={submit} disabled />
        ) : (
          <TokenApprovalFlow
            chainId={pool.chainId}
            spender={receiverContract}
            tokenId={pool.poolToken1.id}
            requiredAmount={amount}>
            <Button primary title="Withdraw" onPress={submit} />
          </TokenApprovalFlow>
        )}

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
