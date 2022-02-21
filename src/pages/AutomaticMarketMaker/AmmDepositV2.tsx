import { DarkTheme } from '@react-navigation/native';
import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { Keyboard, Pressable, RefreshControl } from 'react-native';
import { useAmmPoolData } from './hooks/useAmmPoolData';
import { AmmRoutesStackProps } from 'routers/amm.routes';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PageContainer, SafeAreaPage } from 'templates/SafeAreaPage';
import { Text } from 'components/Text';
import { AmmAmountField } from './components/AmmAmountField';
import { useAssetBalance } from 'hooks/useAssetBalance';
import { useWalletAddress } from 'hooks/useWalletAddress';
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
import ArrowDownIcon from 'assets/arrow-down-icon.svg';
import { SwapSettingsModal } from 'pages/SwapPage/components/SwapSettingsModal';
import { transactionController } from 'controllers/TransactionController';
import { encodeFunctionData } from 'utils/contract-utils';
import { PendingTransactions } from 'components/TransactionHistory/PendingTransactions';
import { useIsMounted } from 'hooks/useIsMounted';
import { useAssetUsdBalance } from 'hooks/useAssetUsdBalance';
import { AmountFieldIconWrapper } from 'components/AmountFieldIconWrapper';
import { SwapAmountField } from 'pages/SwapPage/components/SwapAmountField';

type Props = NativeStackScreenProps<AmmRoutesStackProps, 'amm.deposit.v2'>;

export const AmmDepositV2: React.FC<Props> = ({ route, navigation }) => {
  const { pool } = route.params;
  const { state, execute } = useAmmPoolData(pool);
  const isMounted = useIsMounted();

  const [token, setToken] = useState(pool.supplyToken1);
  const which = useMemo(
    () => (token.id === pool.supplyToken1.id ? 1 : 2),
    [pool.supplyToken1.id, token.id],
  );

  const owner = useWalletAddress();
  const { value: balance1, execute: executeBalance1 } = useAssetBalance(
    pool.supplyToken1,
    owner,
  );
  const { value: balance2, execute: executeBalance2 } = useAssetBalance(
    pool.supplyToken2,
    owner,
  );

  const [amount, setAmount] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const receiverContract = getContractAddress('rbtcWrapper', pool.chainId);

  const expectedPoolTokens = useMemo(() => {
    const poolTokenSupply =
      which === 1 ? state.poolTokenSupply1 : state.poolTokenSupply2!;
    const initialStakedBalance =
      which === 1 ? state.reserveStakedBalance1 : state.reserveStakedBalance2;
    const _amount = token.parseUnits(amount);
    if (poolTokenSupply === '0' || initialStakedBalance === '0') {
      return amount.toString();
    }
    return _amount.mul(poolTokenSupply).div(initialStakedBalance).toString();
  }, [
    amount,
    state.poolTokenSupply1,
    state.poolTokenSupply2,
    state.reserveStakedBalance1,
    state.reserveStakedBalance2,
    token,
    which,
  ]);

  const [showSettings, setShowSettings] = useState(false);
  const [slippage, setSlippage] = useState('0.1');
  const { minReturn } = useSlippage(expectedPoolTokens, 0, slippage);

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
    Promise.all([execute(), executeBalance1(), executeBalance2()]).finally(
      () => {
        if (isMounted()) {
          setRefreshing(false);
        }
      },
    );
  }, [execute, executeBalance1, executeBalance2, isMounted]);

  const submit = useCallback(async () => {
    try {
      const tx = await transactionController.request({
        to: receiverContract,
        value: token.native ? token.parseUnits(amount) : 0,
        data: encodeFunctionData(
          'addLiquidityToV2(address,address,uint256,uint256)(uint256)',
          [
            pool.converterAddress,
            token.getWrappedAsset().address,
            token.parseUnits(amount).toString(),
            minReturn,
          ],
        ),
      });
      tx.wait().finally(refresh);
    } catch (e) {
      console.log('amm deposit v1', e);
    }
  }, [
    amount,
    minReturn,
    pool.converterAddress,
    receiverContract,
    refresh,
    token,
  ]);

  const balance = useMemo(
    () => (which === 1 ? balance1 : balance2),
    [which, balance1, balance2],
  );
  const usd = useAssetUsdBalance(token, token.parseUnits(amount));
  const poolToken = useMemo(
    () => (which === 1 ? pool.poolToken1 : pool.poolToken2!),
    [pool.poolToken1, pool.poolToken2, which],
  );

  const errorTitle = useMemo(() => {
    const _amount = token.parseUnits(amount);
    if (_amount.lte(0)) {
      return 'Enter amount';
    }
    if (token.parseUnits(balance).lt(_amount)) {
      return `Insufficient ${token.symbol} balance`;
    }
  }, [amount, balance, token]);

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
          token={token}
          balance={balance}
          price={usd.value!}
          title={<Text>Deposit {token.symbol}:</Text>}
          tokens={[pool.supplyToken1, pool.supplyToken2]}
          onTokenChanged={setToken}
        />

        <AmountFieldIconWrapper control={<ArrowDownIcon fill="white" />}>
          <AmmAmountField
            title={<Text>LP tokens received:</Text>}
            amount={floorDecimals(poolToken.formatUnits(expectedPoolTokens), 8)}
            onAmountChanged={noop}
            token={poolToken}
            inputProps={{ editable: false }}
          />
        </AmountFieldIconWrapper>
        {errorTitle ? (
          <Button primary title={errorTitle} onPress={submit} disabled />
        ) : (
          <TokenApprovalFlow
            showTokenName
            chainId={pool.chainId}
            spender={receiverContract}
            tokenId={token.id}
            requiredAmount={amount}>
            <Button primary title="Deposit" onPress={submit} />
          </TokenApprovalFlow>
        )}

        <Text>Slippage: {commifyDecimals(slippage, 3)}%</Text>
        <Text>
          Minimum LP tokens received: {poolToken.formatAndCommify(minReturn)}{' '}
          {poolToken.symbol}
        </Text>
        <Text>LP tokens will be owned by Liquidity Mining smart-contract!</Text>
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
