import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEvmWallet } from 'hooks/useEvmWallet';
import { WalletStackProps } from 'pages/MainScreen/WalletPage';
import { AddressField } from 'components/AddressField';
import { TokenAmountField } from 'components/TokenAmountField';
import { InputField } from 'components/InputField';
import { AmountField } from 'components/AmountField';
import { getProvider } from 'utils/RpcEngine';
import { encodeFunctionData } from 'utils/contract-utils';
import { utils, constants } from 'ethers/lib.esm';
import { wallet } from 'utils/wallet';
import { SendAssetModal } from './components/SendAssets/SendAssetModal';
import { TransactionModal } from 'components/TransactionModal';
import { tokenUtils } from 'utils/token-utils';
import { currentChainId } from 'utils/helpers';

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

  const [showAdvanced, setShowAdvanced] = useState(false);

  const owner = useEvmWallet();

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
          receiver || constants.AddressZero,
          utils.parseUnits(amount || '0', params.token.decimals).toNumber(),
        ]),
      );
    }
  }, [receiver, amount, params.token]);

  useEffect(() => {
    getProvider(params.chainId)
      .estimateGas({
        to: receiver,
        value: params.token.native
          ? utils.parseUnits(amount || '0', params.token.decimals)
          : 0,
        nonce,
        data,
        gasPrice: (Number(gasPrice) * 1e9).toString(),
      })
      .then(response => {
        setGas(response.toString());
      });
  }, [params.chainId, params.token, gasPrice, data, nonce, receiver, amount]);

  const [txHash, setTxHash] = useState<string>();

  const submit = useCallback(async () => {
    const signedTransaction = await wallet.signTransaction({
      to: receiver,
      value: utils.hexlify(
        params.token.native
          ? utils.parseUnits(amount || '0', params.token.decimals)
          : 0,
      ),
      nonce: utils.hexlify(Number(nonce || 0)),
      data,
      gasPrice: utils.hexlify(Number(gasPrice || 0) * 1e9),
      gasLimit: utils.hexlify(Number(gas || 0)),
    });

    const tx = await getProvider(params.chainId).sendTransaction(
      signedTransaction,
    );

    setTxHash(tx.hash);
    setShowModal(false);
  }, [
    params.chainId,
    params.token,
    receiver,
    amount,
    data,
    gasPrice,
    gas,
    nonce,
  ]);

  const fee = useMemo(
    () => ((Number(gasPrice || 0) * Number(gas || 0)) / 1e8).toFixed(8),
    [gasPrice, gas],
  );

  // TODO: Test if transaction will not fail.
  // useEffect(() => {
  //   getProvider(params.chainId)
  //     .call({
  //       to: receiver,
  //       value: params.token.native
  //         ? utils.parseUnits(amount, params.token.decimals)
  //         : 0,
  //       nonce,
  //       data,
  //       gasPrice: (Number(gasPrice) * 1e9).toString(),
  //       gasLimit: gas,
  //     })
  //     .then(response => {
  //       console.log('call static', response);
  //     })
  //     .catch(error => console.info(error));
  // }, [
  //   receiver,
  //   nonce,
  //   data,
  //   gasPrice,
  //   amount,
  //   gas,
  //   params.token,
  //   params.chainId,
  // ]);

  const isTxValid = useMemo(
    () =>
      receiver !== '' &&
      amount !== '' &&
      gas !== '' &&
      gasPrice !== '' &&
      receiver !== constants.AddressZero,
    [receiver, amount, gas, gasPrice],
  );

  const [showModal, setShowModal] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
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
              />
              {showAdvanced && (
                <View style={styles.advanced}>
                  <AmountField
                    label="Gas Price (gwei)"
                    value={gasPrice}
                    onChangeText={setGasPrice}
                  />
                  <AmountField
                    label="Gas Limit"
                    value={gas}
                    onChangeText={setGas}
                  />
                  <AmountField
                    label="Nonce"
                    value={nonce}
                    onChangeText={setNonce}
                  />
                  <InputField
                    label="Data"
                    value={data}
                    onChangeText={setData}
                    multiline
                    numberOfLines={4}
                    editable={params.token.native}
                  />
                </View>
              )}
              <Button
                title={showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
                onPress={() => setShowAdvanced(prevState => !prevState)}
                disabled={receiver === '' || receiver === constants.AddressZero}
              />
              {Number(fee) > 0 && receiver !== '' && amount !== '' && (
                <Text>
                  Tx Fee: {fee}{' '}
                  {tokenUtils.getNativeToken(currentChainId()).symbol}
                </Text>
              )}
              <Button
                title={`Send ${params.token.symbol}`}
                onPress={() => setShowModal(true)}
                disabled={!isTxValid}
              />
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
        <SendAssetModal
          isOpen={showModal}
          receiver={receiver}
          amount={amount}
          fee={fee}
          token={params.token}
          onReject={() => setShowModal(false)}
          onConfirm={submit}
        />
        <TransactionModal
          txHash={txHash}
          onClose={() =>
            navigation.canGoBack() ? navigation.goBack() : setTxHash(undefined)
          }
        />
      </ScrollView>
    </SafeAreaView>
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
