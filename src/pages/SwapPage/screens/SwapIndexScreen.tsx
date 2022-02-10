import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, View } from 'react-native';
import { useWalletAddress } from 'hooks/useWalletAddress';
import {
  calculateChange,
  commifyDecimals,
  currentChainId,
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
import { getSwappableToken, swapables, wrapSwapables } from 'config/swapables';
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

type Props = NativeStackScreenProps<SwapStackProps, 'swap.index'>;

export const SwapIndexScreen: React.FC<Props> = ({ navigation }) => {
  const chainId = currentChainId();

  const owner = useWalletAddress().toLowerCase();
  const [submitting, setSubmitting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const tokens: TokenId[] = useMemo(() => {
    return listAssetsForChain(chainId)
      .filter(item => swapables[chainId]?.includes(item.id as TokenId))
      .filter(item => wrapSwapables[chainId]![1] !== item.id) // exclude wrapped native token
      .map(item => item.id as TokenId);
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

  const [sendTokenId, setSendTokenId] = useState(tokens[0]);
  const [receiveTokenId, setReceiveTokenId] = useState(tokens[1]);

  const [sendAmount, setSendAmount] = useState('');

  const sendToken = useMemo(
    () => findAsset(chainId, sendTokenId),
    [chainId, sendTokenId],
  );

  const receiveToken = useMemo(
    () => findAsset(chainId, receiveTokenId),
    [chainId, receiveTokenId],
  );

  const handleSetSendTokenId = useCallback(
    (tokenId: TokenId) => {
      if (tokenId === receiveTokenId) {
        setReceiveTokenId(tokens.filter(item => item !== tokenId)[0]);
      }
      setSendTokenId(tokenId);
    },
    [receiveTokenId, tokens],
  );

  const handleSetReceiveTokenId = useCallback(
    (tokenId: TokenId) => {
      if (tokenId === sendTokenId) {
        setSendTokenId(tokens.filter(item => item !== tokenId)[0]);
      }
      setReceiveTokenId(tokenId);
    },
    [sendTokenId, tokens],
  );

  const { value: sendOneUSD } = useAssetUsdBalance(
    sendToken,
    parseUnits('1', sendToken.decimals).toString(),
  );
  const { value: receiveOneUSD } = useAssetUsdBalance(
    receiveToken,
    parseUnits('1', sendToken.decimals).toString(),
  );

  const { value: sellPrice, loading: sellPriceLoading } =
    useGetSwapExpectedReturn(chainId, sendTokenId, receiveTokenId, '1');

  const { value: receiveAmount, loading } = useGetSwapExpectedReturn(
    chainId,
    sendTokenId,
    receiveTokenId,
    sendAmount,
    false,
  );

  const handleSwapAssets = useCallback(() => {
    setSendTokenId(receiveTokenId);
    setReceiveTokenId(sendTokenId);
    setSendAmount(receiveAmount);
  }, [receiveAmount, receiveTokenId, sendTokenId]);

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

  const useBtcProxy = [sendTokenId, receiveTokenId].includes(
    nativeToken.id as TokenId,
  );
  const contractAddress = getContractAddress(
    useBtcProxy ? 'rbtcWrapper' : 'swapNetwork',
    chainId,
  );

  const handleSubmitButton = useCallback(async () => {
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

    console.log('path!', path, amount, minReturn);

    await transactionController
      .request({
        to: contractAddress,
        from: owner,
        value: hexlify(BigNumber.from(sendToken.native ? amount : '0')),
        data,
        chainId: sendToken.chainId,
      })
      .then(() => {
        setSubmitting(false);
      })
      .catch(e => {
        console.warn(e);
        setSubmitting(false);
      });
  }, [
    contractAddress,
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
    if (sendBalance.value < sendAmount) {
      return `Insuficient ${sendToken.symbol} balance`;
    }
    return null;
  }, [sendAmount, sendBalance.loading, sendBalance.value, sendToken.symbol]);

  return (
    <SafeAreaPage scrollView keyboardAvoiding>
      <View style={styles.container}>
        <View>
          <SwapAmountField
            amount={sendAmount}
            onAmountChanged={setSendAmount}
            token={sendToken}
            onTokenChanged={handleSetSendTokenId}
            price={sendUSD}
            balance={sendBalance.value}
            tokens={tokens}
          />

          <View style={styles.receiverContainerView}>
            <SwapAmountField
              amount={receiveAmount}
              onAmountChanged={noop}
              token={receiveToken}
              onTokenChanged={handleSetReceiveTokenId}
              inputProps={{ editable: false }}
              debounceDelay={0}
              containerStyle={styles.fullWidth}
              price={receiveUSD}
              difference={difference}
              balance={receiveBalance.value}
              tokens={tokens}
            />
            <Pressable
              style={styles.receiverIconButton}
              onPress={handleSwapAssets}>
              <ArrowDownIcon fill="white" />
            </Pressable>
          </View>
        </View>

        {validationError ? (
          <Button title={validationError} primary disabled />
        ) : (
          <ReadWalletAwareWrapper>
            <TokenApprovalFlow
              tokenId={sendTokenId}
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
          </ReadWalletAwareWrapper>
        )}

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
      </View>
      <SwapSettingsModal
        open={showSettings}
        slippage={slippage}
        onClose={() => setShowSettings(false)}
        onSlippageChange={setSlippage}
      />
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
