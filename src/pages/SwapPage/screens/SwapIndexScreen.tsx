import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useWalletAddress } from 'hooks/useWalletAddress';
import { currentChainId } from 'utils/helpers';
import { tokenUtils } from 'utils/token-utils';
import { SafeAreaPage } from 'templates/SafeAreaPage';
import { Text } from 'components/Text';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SwapStackProps } from '..';
import { swapables } from 'config/swapables';
import { TokenId } from 'types/token';
import { AssetPickerWithAmount } from 'components/AssetPicker/AssetPickerWithAmount';
import { commify } from 'ethers/lib/utils';

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

  const [sendToken, setSendToken] = useState(tokens[0]);
  const [receiveToken, setReceiveToken] = useState(tokens[1]);

  const [sendAmount, setSendAmount] = useState('');
  const [receiveAmount, setReceiveAmount] = useState('');

  return (
    <SafeAreaPage>
      <ScrollView>
        <View style={styles.container}>
          <Text style={styles.title}>Swap</Text>
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
              tokenId={sendToken}
              onTokenChanged={setSendToken}
              pickerTitle="Send asset"
            />
            <Text>Amount: {sendAmount}</Text>
          </View>

          <View>
            <Text style={styles.label}>You Receive</Text>
            <AssetPickerWithAmount
              amount={receiveAmount}
              onAmountChanged={setReceiveAmount}
              tokenIdList={tokens}
              tokenId={receiveToken}
              onTokenChanged={setReceiveToken}
              pickerTitle="Receive asset"
              readOnlyAmount
            />
            <Text>Amount: {receiveAmount}</Text>
          </View>
        </View>
      </ScrollView>
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
