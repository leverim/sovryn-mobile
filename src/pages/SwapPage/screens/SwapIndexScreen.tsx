import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useWalletAddress } from 'hooks/useWalletAddress';
import { currentChainId, noop } from 'utils/helpers';
import { tokenUtils } from 'utils/token-utils';
import { SafeAreaPage } from 'templates/SafeAreaPage';
import { Text } from 'components/Text';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SwapStackProps } from '..';
import { getSwappableToken, swapables } from 'config/swapables';
import { TokenId } from 'types/token';
import { AssetPickerWithAmount } from 'components/AssetPicker/AssetPickerWithAmount';
import { commify, formatUnits, parseUnits } from 'ethers/lib/utils';
import { useDebouncedEffect } from 'hooks/useDebounceEffect';
import { callToContract } from 'utils/contract-utils';
import { useSlippage } from 'hooks/useSlippage';
import { PressableButton } from 'components/PressableButton';
import { SwapSettingsModal } from '../components/SwapSettingsModal';
import { erc20, getSwapExpectedReturn } from 'utils/interactions';
import { contractUtils } from 'utils/contract';
import { TokenApprovalFlow } from 'components/TokenApprovalFlow';

type Props = NativeStackScreenProps<SwapStackProps, 'swap.index'>;

export const SwapIndexScreen: React.FC<Props> = () => {
  const chainId = currentChainId();

  const owner = useWalletAddress();

  const tokens: TokenId[] = useMemo(() => {
    return tokenUtils
      .listTokensForChainId(chainId)
      .filter(item => swapables[chainId]?.includes(item.id as TokenId))
      .map(item => item.id as TokenId);
  }, [chainId]);

  const [sendTokenId, setSendTokenId] = useState(tokens[0]);
  const [receiveTokenId, setReceiveTokenId] = useState(tokens[1]);

  const [sendAmount, setSendAmount] = useState('');
  const [receiveAmount, setReceiveAmount] = useState('');

  const sendToken = tokenUtils.getTokenById(sendTokenId);
  const receiveToken = tokenUtils.getTokenById(receiveTokenId);

  const [slippage, setSlippage] = useState('0.1');

  const [sellPrice, setSellPrice] = useState<string>();
  const [buyPrice, setBuyPrice] = useState<string>();

  const { minReturnFormatted: minReturn, slippage: slippage2 } = useSlippage(
    receiveAmount,
    receiveToken.decimals,
    slippage,
  );

  const [conversionPath, setConversionPath] = useState<string[]>([]);

  const sourceTokenAddress = useMemo(
    () =>
      tokenUtils.getTokenAddressForId(
        getSwappableToken(sendTokenId, currentChainId()),
      ),
    [sendTokenId],
  );

  const receiveTokenAddress = useMemo(
    () =>
      tokenUtils.getTokenAddressForId(
        getSwappableToken(receiveTokenId, currentChainId()),
      ),
    [receiveTokenId],
  );

  useDebouncedEffect(
    () => {
      const run = async () => {
        const path = await callToContract(
          'swapNetwork',
          'conversionPath(address,address)(address[])',
          [sourceTokenAddress, receiveTokenAddress],
        ).then(response => response[0]);
        setConversionPath(path);
      };
      run().catch(console.error);
    },
    300,
    [sendAmount, sourceTokenAddress, receiveTokenAddress],
  );

  useDebouncedEffect(
    () => {
      const run = async () => {
        const amount = await getSwapExpectedReturn(
          sendTokenId,
          receiveTokenId,
          sendAmount,
        );
        setReceiveAmount(Number(amount) !== 0 ? amount : '');
      };
      run().catch(console.error);
    },
    300,
    [sendAmount, sendTokenId, receiveTokenId, owner],
  );

  useDebouncedEffect(
    () => {
      getSwapExpectedReturn(sendTokenId, receiveTokenId, '1').then(
        setSellPrice,
      );
      getSwapExpectedReturn(receiveTokenId, sendTokenId, '1').then(setBuyPrice);
    },
    300,
    [sourceTokenAddress, receiveTokenAddress],
  );

  const [showSettings, setShowSettings] = useState(false);

  return (
    <SafeAreaPage>
      <ScrollView>
        <View style={styles.container}>
          <View>
            <Text style={styles.title}>Swap</Text>
            <PressableButton
              title="Settings"
              onPress={() => setShowSettings(true)}
            />
          </View>
          <View>
            <View style={styles.labelWithBalance}>
              <Text>You Pay</Text>
              <Pressable onPress={() => setSendAmount('0.15')}>
                <Text>Balance: {commify(0)}</Text>
              </Pressable>
            </View>
            <AssetPickerWithAmount
              amount={sendAmount}
              onAmountChanged={setSendAmount}
              tokenIdList={tokens}
              tokenId={sendTokenId}
              onTokenChanged={setSendTokenId}
              pickerTitle="Send asset"
              debounceDelay={0}
            />
            <Text>Amount: {sendAmount}</Text>
          </View>

          <View>
            <Text style={styles.label}>You Receive</Text>
            <AssetPickerWithAmount
              amount={receiveAmount}
              onAmountChanged={setReceiveAmount}
              tokenIdList={tokens}
              tokenId={receiveTokenId}
              onTokenChanged={setReceiveTokenId}
              pickerTitle="Receive asset"
              readOnlyAmount
              debounceDelay={0}
            />
          </View>
          <TokenApprovalFlow
            tokenId={sendTokenId}
            spender={contractUtils.getContractAddress('swapNetwork')}
            requiredAmount={sendAmount || '0'}>
            <PressableButton title="Swap" />
          </TokenApprovalFlow>
          <View>
            <View>
              <Text>Sell Price</Text>
              <Text>
                1 {sendToken.symbol} = {sellPrice} {receiveToken.symbol}
              </Text>
            </View>
            <View>
              <Text>Buy Price</Text>
              <Text>
                1 {receiveToken.symbol} = {buyPrice} {sendToken.symbol}
              </Text>
            </View>
            <View>
              <Text>Transaction Fee</Text>
              <Text>
                x {tokenUtils.getNativeToken(currentChainId()).symbol}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <SwapSettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        onGasPriceChange={noop}
        slippage={slippage}
        onSlippageChange={value => setSlippage(value)}
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
});
