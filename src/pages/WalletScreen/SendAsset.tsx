import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useWalletAddress } from 'hooks/useWalletAddress';
import { WalletStackProps } from 'pages/MainScreen/WalletPage';
import { AddressField } from 'components/AddressField';
import { TokenAmountField } from 'components/TokenAmountField';
import { getProvider } from 'utils/RpcEngine';
import { encodeFunctionData } from 'utils/contract-utils';
import { utils, constants } from 'ethers/lib.esm';
import { tokenUtils } from 'utils/token-utils';
import { useAssetBalance } from 'hooks/useAssetBalance';
import { SafeAreaPage } from 'templates/SafeAreaPage';
import { Text } from 'components/Text';
import { transactionController } from 'controllers/TransactionController';
import { Button, ButtonIntent } from 'components/Buttons/Button';

type Props = NativeStackScreenProps<WalletStackProps, 'wallet.receive'>;

// TODO: implement debouncing
export const SendAsset: React.FC<Props> = ({
  route: { params },
  navigation,
}) => {
  useEffect(() => {
    navigation.setOptions({
      title: `Send ${params.token.symbol}`,
    });
  }, [navigation, params]);

  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState('');
  const [nonce, setNonce] = useState('0');
  const [data, setData] = useState('0x');
  const [gas, setGas] = useState('21000');
  const [gasPrice, setGasPrice] = useState('0.06');

  const [loading, setLoading] = useState(false);

  const to = useMemo(() => {
    return (
      params.token.native
        ? !receiver
          ? constants.AddressZero
          : receiver
        : tokenUtils.getTokenAddressForChainId(params.token, params.chainId)
    ).toLowerCase();
  }, [params.token, params.chainId, receiver]);

  const owner = useWalletAddress();

  useEffect(() => {
    getProvider(params.chainId)
      .getTransactionCount(owner)
      .then(response => setNonce(response.toString()));
  }, [owner, params.chainId]);

  const handleReceiverChange = useCallback(
    (address: string) => setReceiver(address),
    [],
  );

  useEffect(() => {
    getProvider(params.chainId)
      .getGasPrice()
      .then(response => setGasPrice((response.toNumber() / 1e9).toString()));
  }, [params.chainId]);

  useEffect(() => {
    if (!params.token.native) {
      setData(
        encodeFunctionData('transfer(address,uint256)', [
          (receiver || constants.AddressZero).toLowerCase(),
          utils.parseUnits(amount || '0', params.token.decimals).toString(),
        ]),
      );
    }
  }, [receiver, amount, params.token]);

  useEffect(() => {
    getProvider(params.chainId)
      .estimateGas({
        to,
        value: params.token.native
          ? utils.parseUnits(amount || '0', params.token.decimals)
          : 0,
        nonce,
        data,
        gasPrice: (Number(gasPrice) * 1e9).toString(),
      })
      .then(response => response.toNumber())
      .then(response => {
        setGas(!response ? '21000' : response.toString());
      });
  }, [params.chainId, params.token, gasPrice, data, nonce, to, amount]);

  const submit = useCallback(async () => {
    setLoading(true);
    try {
      await transactionController.request({
        to,
        chainId: params.chainId,
        value: utils.hexlify(
          params.token.native
            ? utils.parseUnits(amount || '0', params.token.decimals)
            : 0,
        ),
        nonce: utils.hexlify(Number(nonce || 0)),
        data,
        gasPrice: utils.hexlify(Number(gasPrice || 0) * 1e9),
        gasLimit: utils.hexlify(Number(gas || 0)),
        customData: {
          tokenId: params.token.id,
        },
      });
    } catch (e) {
      console.log('Sending asset failed: ', e);
    } finally {
      setLoading(false);
    }
  }, [params.chainId, params.token, to, amount, data, gasPrice, gas, nonce]);

  const fee = useMemo(
    () => ((Number(gasPrice || 0) * Number(gas || 0)) / 1e8).toFixed(8),
    [gasPrice, gas],
  );

  const isTxValid = useMemo(
    () =>
      receiver !== '' &&
      amount !== '' &&
      gas !== '' &&
      gasPrice !== '' &&
      receiver !== constants.AddressZero,
    [receiver, amount, gas, gasPrice],
  );

  const nativeToken = useMemo(
    () => tokenUtils.getNativeToken(params.chainId),
    [params.chainId],
  );

  const { value: tokenBalance } = useAssetBalance(
    params.token,
    owner,
    params.chainId,
  );

  // TODO: if token is already native - just assign value
  const { value: nativeBalance } = useAssetBalance(
    nativeToken,
    owner,
    params.chainId,
  );

  const balanceError = useMemo(() => {
    const _nativeBalance = utils.parseUnits(
      nativeBalance || '0',
      nativeToken.decimals,
    );
    const _fee = utils.parseUnits(fee || '0', nativeToken.decimals);

    if (params.token.native) {
      const _amount = _fee.add(
        utils.parseUnits(amount || '0', nativeToken.decimals),
      );
      if (_amount.gt(_nativeBalance)) {
        return `Not enough ${nativeToken.symbol} in your wallet.`;
      }
    } else {
      if (_fee.gt(_nativeBalance)) {
        return `Not enough ${nativeToken.symbol} in your wallet to pay for gas fees.`;
      }

      if (
        utils
          .parseUnits(amount || '0', nativeToken.decimals)
          .gt(utils.parseUnits(tokenBalance, params.token.decimals))
      ) {
        return `Not enough ${params.token.symbol} in your wallet`;
      }
    }
    return undefined;
  }, [nativeBalance, fee, amount, params.token, nativeToken, tokenBalance]);

  return (
    <SafeAreaPage>
      <ScrollView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.detailsContainer}>
              <AddressField
                value={receiver}
                onChange={handleReceiverChange}
                chainId={params.chainId}
              />
              <TokenAmountField
                label={`${params.token.symbol} amount:`}
                value={amount}
                onChangeText={setAmount}
                token={params.token}
                fee={params.token.native ? Number(fee) : 0}
              />
              {!!balanceError && <Text>{balanceError}</Text>}
              <Button
                title={`Send ${params.token.symbol}`}
                onPress={submit}
                disabled={!isTxValid || loading}
                loading={loading}
                intent={ButtonIntent.PRIMARY}
              />
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaPage>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flexGrow: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 80,
  },
  detailsContainer: {
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 24,
  },
  address: {
    fontSize: 16,
  },
  noteContainer: {
    marginTop: 24,
    paddingHorizontal: 12,
  },
  note: {
    textAlign: 'center',
  },
  advanced: {
    flex: 1,
    width: '100%',
  },
});
