import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { Keyboard, Pressable, StyleSheet, View } from 'react-native';
import { useWalletAddress } from 'hooks/useWalletAddress';
import {
  calculateChange,
  commifyDecimals,
  floorDecimals,
  formatUnits,
  getContractAddress,
  noop,
  numberIsEmpty,
  parseUnits,
} from 'utils/helpers';
import { SafeAreaPage } from 'templates/SafeAreaPage';
import { Text } from 'components/Text';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SwapStackProps } from '..';
import { getSwappableToken } from 'config/swapables';
import { TokenId } from 'types/asset';
import { Button } from 'components/Buttons/Button';
import { ReadWalletAwareWrapper } from 'components/ReadWalletAwareWapper';
import { DarkTheme } from '@react-navigation/native';

import ArrowDownIcon from 'assets/arrow-down-icon.svg';
import { SwapAmountField } from '../components/SwapAmountField';
import { useGetSwapExpectedReturn } from 'hooks/useGetSwapExpectedReturn';
import { TokenApprovalFlow } from 'components/TokenApprovalFlow';
import { useAssetBalance } from 'hooks/useAssetBalance';
import { callToContract, encodeFunctionData } from 'utils/contract-utils';
import { transactionController } from 'controllers/TransactionController';
import { AFFILIATE_ACCOUNT, AFFILIATE_FEE } from 'utils/constants';
import { useSlippage } from 'hooks/useSlippage';
import { SwapSettingsModal } from '../components/SwapSettingsModal';
import SettingsIcon from 'assets/settings-icon.svg';
import { hexlify } from 'ethers/lib/utils';
import { BigNumber } from 'ethers';
import {
  findAsset,
  getNativeAsset,
  getUsdAsset,
  listAssetsForChain,
} from 'utils/asset-utils';
import { useAssetUsdBalance } from 'hooks/useAssetUsdBalance';
import { ChainId } from 'types/network';
import { AppContext } from 'context/AppContext';
import { Asset } from 'models/asset';
import { PendingTransactions } from 'components/TransactionHistory/PendingTransactions';
import { wrappedAssets } from 'config/wrapped-assets';
import { AmountFieldIconWrapper } from 'components/AmountFieldIconWrapper';
import { ammPools } from 'config/amm-pools';
import Logger from 'utils/Logger';
import { useIsMounted } from 'hooks/useIsMounted';
import { RefreshControl } from 'components/RefreshControl';

type Props = NativeStackScreenProps<SwapStackProps, 'swap.index'>;

export const SwapIndexScreen: React.FC<Props> = ({ navigation }) => {
  const { isTestnet } = useContext(AppContext);
  const isMounted = useIsMounted();
  const chainId = isTestnet ? 31 : 30;

  const owner = useWalletAddress().toLowerCase();
  const [submitting, setSubmitting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const tokens: Asset[] = useMemo(() => {
    const swapables = ammPools
      .filter(item => item.chainId === chainId)
      .map(item => [item.supplyToken1.id, item.supplyToken2.id])
      .flat();

    return listAssetsForChain(chainId)
      .filter(item => swapables.includes(item.id as TokenId))
      .filter(item => wrappedAssets[chainId]![1] !== item.id); // exclude wrapped native token;
  }, [chainId]);

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

  const usdToken = getUsdAsset(chainId);
  const nativeToken = getNativeAsset(chainId);

  const [sendToken, setSendToken] = useState(tokens[0]);
  const [receiveToken, setReceiveToken] = useState(tokens[1]);

  useEffect(() => {
    setSendToken(tokens[0]);
    setReceiveToken(tokens[1]);
  }, [tokens]);

  const [sendAmount, setSendAmount] = useState('');

  const handleSetSendToken = useCallback(
    (token: Asset) => {
      if (token.id === receiveToken.id) {
        setReceiveToken(tokens.filter(item => item.id !== token.id)[0]);
      }
      setSendToken(token);
    },
    [receiveToken, tokens],
  );

  const handleSetReceiveToken = useCallback(
    (token: Asset) => {
      if (token.id === sendToken.id) {
        setSendToken(tokens.filter(item => item.id !== token.id)[0]);
      }
      setReceiveToken(token);
    },
    [sendToken, tokens],
  );

  const { value: sendOneUSD } = useAssetUsdBalance(sendToken, sendToken?.ONE);
  const { value: receiveOneUSD } = useAssetUsdBalance(
    receiveToken,
    receiveToken?.ONE,
  );

  const { value: sellPrice, loading: sellPriceLoading } =
    useGetSwapExpectedReturn(chainId, sendToken.id, receiveToken.id, '1');

  const { value: receiveAmount, loading } = useGetSwapExpectedReturn(
    chainId,
    sendToken.id,
    receiveToken.id,
    sendAmount,
    false,
  );

  const handleSwapAssets = useCallback(() => {
    setSendToken(receiveToken);
    setReceiveToken(sendToken);
    setSendAmount(receiveAmount);
  }, [receiveAmount, receiveToken, sendToken]);

  const sendUSD = useMemo(() => {
    if (sendOneUSD === null || numberIsEmpty(sendAmount)) {
      return undefined;
    }
    return formatUnits(
      parseUnits(sendAmount, sendToken.decimals)
        .mul(parseUnits(sendOneUSD, usdToken.decimals))
        .div(parseUnits('1', usdToken.decimals)),
      usdToken.decimals,
    );
  }, [sendOneUSD, sendAmount, sendToken.decimals, usdToken.decimals]);

  const receiveUSD = useMemo(() => {
    if (receiveOneUSD === null || numberIsEmpty(receiveAmount)) {
      return undefined;
    }
    return formatUnits(
      parseUnits(receiveAmount, receiveToken.decimals)
        .mul(parseUnits(receiveOneUSD, usdToken.decimals))
        .div(parseUnits('1', usdToken.decimals)),
      usdToken.decimals,
    );
  }, [receiveOneUSD, receiveAmount, receiveToken.decimals, usdToken.decimals]);

  const difference = useMemo(() => {
    if (!sendUSD || !receiveUSD || loading) {
      return undefined;
    }
    return calculateChange(Number(sendUSD), Number(receiveUSD));
  }, [sendUSD, receiveUSD, loading]);

  const sendBalance = useAssetBalance(sendToken, owner);
  const receiveBalance = useAssetBalance(receiveToken, owner);

  const [slippage, setSlippage] = useState('0.1');
  const { minReturn, minReturnFormatted } = useSlippage(
    receiveAmount,
    receiveToken.decimals,
    slippage,
  );

  const useBtcProxy = [sendToken.id, receiveToken.id].includes(
    nativeToken.id as TokenId,
  );
  const contractAddress = getContractAddress(
    useBtcProxy ? 'rbtcWrapper' : 'swapNetwork',
    chainId,
  );

  const refreshing = useMemo(() => {
    return sendBalance.loading || receiveBalance.loading;
  }, [receiveBalance.loading, sendBalance.loading]);

  const execute = useCallback(() => {
    sendBalance.execute();
    receiveBalance.execute();
  }, [receiveBalance, sendBalance]);

  const handleSubmitButton = useCallback(async () => {
    Keyboard.dismiss();
    setSubmitting(true);

    const _sendToken = findAsset(
      sendToken.chainId,
      getSwappableToken(sendToken.id as TokenId, sendToken.chainId as ChainId),
    );

    const _receiveToken = findAsset(
      receiveToken.chainId,
      getSwappableToken(
        receiveToken.id as TokenId,
        receiveToken.chainId as ChainId,
      ),
    );

    const path = await callToContract(
      chainId,
      'swapNetwork',
      'conversionPath(address,address)(address[])',
      [_sendToken.address, _receiveToken.address],
    ).then(response => response[0]);

    const amount = parseUnits(sendAmount || '0', sendToken.decimals).toString();

    const data = encodeFunctionData(
      `convertByPath${
        useBtcProxy
          ? '(address[],uint256,uint256)'
          : '(address[],uint256,uint256,address,address,uint256)'
      }`,
      useBtcProxy
        ? [path, amount, minReturn]
        : [path, amount, minReturn, owner, AFFILIATE_ACCOUNT, AFFILIATE_FEE],
    );

    try {
      const tx = await transactionController.request({
        to: contractAddress,
        from: owner,
        value: hexlify(BigNumber.from(sendToken.native ? amount : '0')),
        data,
        chainId: sendToken.chainId,
      });

      tx.wait().finally(() => {
        if (isMounted()) {
          execute();
        }
      });
    } catch (e) {
      Logger.error(e, 'swap tx failed.');
    } finally {
      if (isMounted()) {
        setSubmitting(false);
      }
    }
  }, [
    chainId,
    contractAddress,
    execute,
    isMounted,
    minReturn,
    owner,
    receiveToken.chainId,
    receiveToken.id,
    sendAmount,
    sendToken.chainId,
    sendToken.decimals,
    sendToken.id,
    sendToken.native,
    useBtcProxy,
  ]);

  const validationError = useMemo(() => {
    if (sendBalance.loading) {
      return 'Loading ...';
    }
    if (numberIsEmpty(sendAmount) || Number(sendAmount) < 0) {
      return 'Enter an amount';
    }
    if (Number(sendBalance.value) < Number(sendAmount)) {
      return `Insuficient ${sendToken.symbol} balance`;
    }
    return null;
  }, [sendAmount, sendBalance.loading, sendBalance.value, sendToken.symbol]);

  return (
    <SafeAreaPage
      scrollView
      keyboardAvoiding
      scrollViewProps={{
        keyboardShouldPersistTaps: 'handled',
        refreshControl: (
          <RefreshControl refreshing={refreshing} onRefresh={execute} />
        ),
      }}>
      <View style={styles.container}>
        <View>
          <SwapAmountField
            amount={sendAmount}
            onAmountChanged={setSendAmount}
            token={sendToken}
            onTokenChanged={handleSetSendToken}
            price={sendUSD}
            balance={sendBalance.value}
            tokens={tokens}
            title={<Text>Send:</Text>}
          />
          <AmountFieldIconWrapper
            control={
              <Pressable onPress={handleSwapAssets}>
                <ArrowDownIcon fill="white" />
              </Pressable>
            }>
            <SwapAmountField
              amount={
                Number(receiveAmount) > 0
                  ? floorDecimals(Number(receiveAmount), 8)
                  : ''
              }
              onAmountChanged={noop}
              token={receiveToken}
              onTokenChanged={handleSetReceiveToken}
              inputProps={{ editable: false }}
              debounceDelay={0}
              containerStyle={styles.fullWidth}
              price={receiveUSD}
              difference={difference}
              balance={receiveBalance.value}
              tokens={tokens}
              title={<Text>Receive:</Text>}
            />
          </AmountFieldIconWrapper>
        </View>

        <ReadWalletAwareWrapper>
          {validationError ? (
            <Button title={validationError} primary disabled />
          ) : (
            <TokenApprovalFlow
              tokenId={sendToken.id}
              spender={contractAddress}
              loading={loading || submitting}
              disabled={loading || submitting}
              requiredAmount={sendAmount || '0'}>
              <Button
                title="Swap"
                onPress={handleSubmitButton}
                disabled={loading || submitting}
                loading={loading || submitting}
                primary
              />
            </TokenApprovalFlow>
          )}
        </ReadWalletAwareWrapper>

        <View style={styles.estimateView}>
          <Text style={styles.estimateText}>
            Slippage: {commifyDecimals(slippage, 3)}%
          </Text>
          {!sellPriceLoading && sendOneUSD !== null && (
            <>
              <Text style={styles.estimateText}>
                Buy price: 1 {sendToken.symbol} ={' '}
                {commifyDecimals(sellPrice, 4)} {receiveToken.symbol}
              </Text>
            </>
          )}
          {minReturn !== '0' && (
            <Text style={styles.estimateText}>
              Min received: {commifyDecimals(minReturnFormatted)}{' '}
              {receiveToken.symbol}
            </Text>
          )}
        </View>

        <PendingTransactions />
      </View>
      {showSettings && (
        <SwapSettingsModal
          open={showSettings}
          slippage={slippage}
          onClose={() => setShowSettings(false)}
          onSlippageChange={setSlippage}
        />
      )}
    </SafeAreaPage>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
  },
  title: {
    fontSize: 24,
    marginTop: 12,
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    marginTop: 16,
  },
  labelWithBalance: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  profileContainer: {
    marginBottom: 12,
    padding: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 5,
    marginHorizontal: 10,
    marginBottom: 25,
    flex: 1,
  },
  // wrapper
  receiverContainerView: {
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  receiverIconButton: {
    position: 'absolute',
    backgroundColor: DarkTheme.colors.border,
    borderWidth: 4,
    borderBottomColor: DarkTheme.colors.background,
    borderRadius: 12,
    padding: 2,
    width: 36,
    height: 36,
    top: -36 / 2,
  },
  fullWidth: {
    width: '100%',
  },
  // estimate
  estimateView: {
    paddingVertical: 8,
  },
  estimateText: {
    marginBottom: 4,
  },
});
