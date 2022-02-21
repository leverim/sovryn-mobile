import { DarkTheme } from '@react-navigation/native';
import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { Keyboard, Pressable, RefreshControl } from 'react-native';
import { getNativeAsset } from 'utils/asset-utils';
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
import { BigNumber } from 'ethers';
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

type Props = NativeStackScreenProps<AmmRoutesStackProps, 'amm.deposit.v1'>;

export const AmmDepositV1: React.FC<Props> = ({ route, navigation }) => {
  const { pool } = route.params;
  const { state, execute } = useAmmPoolData(pool);
  const isMounted = useIsMounted();

  const owner = useWalletAddress();
  const { value: balance1, execute: executeBalance1 } = useAssetBalance(
    pool.supplyToken1,
    owner,
  );
  const { value: balance2, execute: executeBalance2 } = useAssetBalance(
    pool.supplyToken2,
    owner,
  );

  const [amount1, setAmount1] = useState('');
  const [amount2, setAmount2] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const liquidityMiningProxyAddress = getContractAddress(
    'liquidityMiningProxy',
    pool.chainId,
  );

  const approvalToken = useMemo(() => {
    if (!pool.supplyToken1.native) {
      return {
        token: pool.supplyToken1,
        amount: pool.supplyToken1.parseUnits(amount1).toString(),
      };
    }
    return {
      token: pool.supplyToken2,
      amount: pool.supplyToken2.parseUnits(amount2).toString(),
    };
  }, [amount1, amount2, pool.supplyToken1, pool.supplyToken2]);

  const expectedPoolTokens = useMemo(() => {
    return pool.supplyToken2
      .parseUnits(amount2)
      .mul(pool.supplyToken2.ONE)
      .div(state.reserveStakedBalance2)
      .mul(state.poolTokenSupply1)
      .div(pool.poolToken1.ONE)
      .toString();
  }, [
    amount2,
    pool.poolToken1.ONE,
    pool.supplyToken2,
    state.poolTokenSupply1,
    state.reserveStakedBalance2,
  ]);

  const [showSettings, setShowSettings] = useState(false);
  const [slippage, setSlippage] = useState('0.1');
  const { minReturn } = useSlippage(expectedPoolTokens, 0, slippage);

  const handleAmount1Change = useCallback(
    (value: string) => {
      setAmount1(value);
      const amount = BigNumber.from(state.reserveStakedBalance2)
        .mul(pool.supplyToken1.ONE)
        .div(state.reserveStakedBalance1)
        .mul(pool.supplyToken1.parseUnits(value))
        .div(pool.supplyToken1.ONE);
      setAmount2(
        floorDecimals(pool.supplyToken2.formatUnits(amount).toString(), 8),
      );
    },
    [
      pool.supplyToken1,
      pool.supplyToken2,
      state.reserveStakedBalance1,
      state.reserveStakedBalance2,
    ],
  );

  const handleAmount2Change = useCallback(
    (value: string) => {
      setAmount2(value);
      const amount = BigNumber.from(state.reserveStakedBalance1)
        .mul(pool.supplyToken1.ONE)
        .div(state.reserveStakedBalance2)
        .mul(pool.supplyToken1.parseUnits(value))
        .div(pool.supplyToken1.ONE);
      setAmount1(
        floorDecimals(pool.supplyToken2.formatUnits(amount).toString(), 8),
      );
    },
    [
      pool.supplyToken1,
      pool.supplyToken2,
      state.reserveStakedBalance1,
      state.reserveStakedBalance2,
    ],
  );

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

  const nativeBalance = useMemo(() => {
    if (pool.supplyToken1.native) {
      return amount1 || '0';
    }
    if (pool.supplyToken2.native) {
      return amount2 || '0';
    }
    return '0';
  }, [amount1, amount2, pool.supplyToken1.native, pool.supplyToken2.native]);

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
        to: getContractAddress('rbtcWrapper', pool.chainId),
        value: getNativeAsset(pool.chainId).parseUnits(nativeBalance),
        data: encodeFunctionData(
          'addLiquidityToV1(address,address[],uint256[],uint256)(uint256)',
          [
            pool.converterAddress,
            [
              pool.supplyToken1.getWrappedAsset().address,
              pool.supplyToken2.getWrappedAsset().address,
            ],
            [
              pool.supplyToken1.parseUnits(amount1).toString(),
              pool.supplyToken1.parseUnits(amount2).toString(),
            ],
            minReturn,
          ],
        ),
      });
      console.log(tx);
      tx.wait().finally(refresh);
    } catch (e) {
      console.log('amm deposit v1', e);
    }
  }, [
    amount1,
    amount2,
    minReturn,
    nativeBalance,
    pool.chainId,
    pool.converterAddress,
    pool.supplyToken1,
    pool.supplyToken2,
    refresh,
  ]);

  const usd1 = useAssetUsdBalance(
    pool.supplyToken1,
    pool.supplyToken1.parseUnits(amount1),
  );
  const usd2 = useAssetUsdBalance(
    pool.supplyToken2,
    pool.supplyToken2.parseUnits(amount2),
  );

  const errorTitle = useMemo(() => {
    const b1 = pool.supplyToken1.parseUnits(balance1);
    const b2 = pool.supplyToken1.parseUnits(balance2);
    const a1 = pool.supplyToken1.parseUnits(amount1);
    const a2 = pool.supplyToken1.parseUnits(amount2);
    if (b1.lt(a1)) {
      return `Insufficient ${pool.supplyToken1.symbol} balance`;
    }

    if (b2.lt(a2)) {
      return `Insufficient ${pool.supplyToken2.symbol} balance`;
    }
  }, [
    amount1,
    amount2,
    balance1,
    balance2,
    pool.supplyToken1,
    pool.supplyToken2.symbol,
  ]);

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
          amount={amount1}
          onAmountChanged={handleAmount1Change}
          token={pool.supplyToken1}
          balance={balance1}
          price={usd1.value!}
          title={<Text>Deposit {pool.supplyToken1.symbol}:</Text>}
        />
        <AmountFieldIconWrapper control={<AddIcon fill="white" />}>
          <AmmAmountField
            amount={amount2}
            onAmountChanged={handleAmount2Change}
            token={pool.supplyToken2}
            balance={balance2}
            price={usd2.value!}
            title={<Text>Deposit {pool.supplyToken2.symbol}:</Text>}
          />
        </AmountFieldIconWrapper>

        <AmountFieldIconWrapper control={<ArrowDownIcon fill="white" />}>
          <AmmAmountField
            title={<Text>LP tokens received:</Text>}
            amount={floorDecimals(
              pool.poolToken1.formatUnits(expectedPoolTokens),
              8,
            )}
            onAmountChanged={noop}
            token={pool.poolToken1}
            inputProps={{ editable: false }}
          />
        </AmountFieldIconWrapper>
        {errorTitle ? (
          <Button primary title={errorTitle} onPress={submit} disabled />
        ) : (
          <TokenApprovalFlow
            showTokenName
            chainId={pool.chainId}
            spender={liquidityMiningProxyAddress}
            tokenId={approvalToken.token.id}
            requiredAmount={approvalToken.token.formatUnits(
              approvalToken.amount,
            )}>
            <Button primary title="Deposit" onPress={submit} />
          </TokenApprovalFlow>
        )}

        <Text>Slippage: {commifyDecimals(slippage, 3)}%</Text>
        <Text>
          Minimum LP tokens received:{' '}
          {pool.poolToken1.formatAndCommify(minReturn)} {pool.poolToken1.symbol}
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
