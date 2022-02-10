import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
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
import { getProvider } from 'utils/RpcEngine';
import { encodeFunctionData } from 'utils/contract-utils';
import { utils, constants } from 'ethers/lib.esm';
import { useAssetBalance } from 'hooks/useAssetBalance';
import { SafeAreaPage } from 'templates/SafeAreaPage';
import { transactionController } from 'controllers/TransactionController';
import { Button } from 'components/Buttons/Button';
import { useDebouncedEffect } from 'hooks/useDebounceEffect';
import { ReadWalletAwareWrapper } from 'components/ReadWalletAwareWapper';
import { getNativeAsset, listAssetsForChains } from 'utils/asset-utils';
import { AssetAmountField } from 'components/AssetAmountField';
import { AppContext } from 'context/AppContext';
import { useAssetUsdBalance } from 'hooks/useAssetUsdBalance';
import { parseUnits } from 'utils/helpers';
import { useIsMounted } from 'hooks/useIsMounted';

type Props = NativeStackScreenProps<WalletStackProps, 'wallet.send'>;

export const SendAsset: React.FC<Props> = ({
  route: { params },
  navigation,
}) => {
  const { chainIds } = useContext(AppContext);
  const isMounted = useIsMounted();

  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState('');
  const [token, setToken] = useState(params.token);
  const [nonce, setNonce] = useState('0');
  const [data, setData] = useState('0x');
  const [gas, setGas] = useState('21000');
  const [gasPrice, setGasPrice] = useState('0.06');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setToken(params.token);
  }, [params.token]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: `Send ${token.symbol}`,
    });
  }, [navigation, token.symbol]);

  const to = useMemo(() => {
    return (
      token.native
        ? !receiver
          ? constants.AddressZero
          : receiver
        : token.address
    ).toLowerCase();
  }, [token, receiver]);

  const owner = useWalletAddress().toLowerCase();

  useDebouncedEffect(
    () => {
      getProvider(token.chainId)
        .getTransactionCount(owner)
        .then(response => {
          if (isMounted()) {
            setNonce(response.toString());
          }
        });
    },
    300,
    [owner, token.chainId, isMounted],
  );

  const handleReceiverChange = useCallback(
    (address: string) => setReceiver(address),
    [],
  );

  useDebouncedEffect(
    () => {
      getProvider(token.chainId)
        .getGasPrice()
        .then(response => {
          if (isMounted()) {
            setGasPrice((response.toNumber() / 1e9).toString());
          }
        });
    },
    300,
    [token.chainId, isMounted],
  );

  useDebouncedEffect(
    () => {
      if (!token.native) {
        setData(
          encodeFunctionData('transfer(address,uint256)', [
            (receiver || constants.AddressZero).toLowerCase(),
            utils.parseUnits(amount || '0', token.decimals).toString(),
          ]),
        );
      }
    },
    300,
    [receiver, amount, token],
  );

  useDebouncedEffect(
    () => {
      getProvider(token.chainId)
        .estimateGas({
          to,
          from: owner,
          value: token.native
            ? utils.parseUnits(amount || '0', token.decimals)
            : 0,
          nonce,
          data,
          gasPrice: (Number(gasPrice) * 1e9).toString(),
        })
        .then(response => response.toNumber())
        .then(response => {
          if (isMounted()) {
            setGas(!response ? '21000' : (response * 1.01).toFixed(0));
          }
        });
    },
    300,
    [token, gasPrice, data, nonce, to, amount, owner, isMounted],
  );

  const submit = useCallback(async () => {
    setLoading(true);
    try {
      await transactionController.request({
        to,
        chainId: token.chainId,
        value: utils.hexlify(
          token.native ? utils.parseUnits(amount || '0', token.decimals) : 0,
        ),
        nonce: utils.hexlify(Number(nonce || 0)),
        data,
        gasPrice: utils.hexlify(Number(gasPrice || 0) * 1e9),
        gasLimit: utils.hexlify(Number(gas || 0)),
        customData: {
          tokenId: token.id,
        },
      });
    } catch (e) {
      console.log('Sending asset failed: ', e);
    } finally {
      if (isMounted()) {
        setLoading(false);
      }
    }
  }, [
    to,
    token.chainId,
    token.native,
    token.decimals,
    token.id,
    amount,
    nonce,
    data,
    gasPrice,
    gas,
    isMounted,
  ]);

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
    () => getNativeAsset(token.chainId),
    [token.chainId],
  );

  const { value: nativeBalance } = useAssetBalance(nativeToken, owner);

  const balance = useAssetBalance(token, owner);
  const usd = useAssetUsdBalance(
    token,
    parseUnits(amount, token.decimals).toString(),
  );

  const balanceError = useMemo(() => {
    const _nativeBalance = utils.parseUnits(
      nativeBalance || '0',
      nativeToken.decimals,
    );
    const _fee = utils.parseUnits(fee || '0', nativeToken.decimals);

    if (token.native) {
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
          .gt(utils.parseUnits(balance.value, token.decimals))
      ) {
        return `Not enough ${token.symbol} in your wallet`;
      }
    }
    return null;
  }, [
    nativeBalance,
    nativeToken.decimals,
    nativeToken.symbol,
    fee,
    token.native,
    token.symbol,
    token.decimals,
    amount,
    balance.value,
  ]);

  const tokens = useMemo(() => listAssetsForChains(chainIds), [chainIds]);

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
                chainId={token.chainId}
              />

              <View style={styles.amountContainer}>
                <AssetAmountField
                  token={token}
                  onTokenChanged={setToken}
                  amount={amount}
                  onAmountChanged={setAmount}
                  balance={balance.value!}
                  price={usd.value!}
                  tokens={tokens}
                  fee={fee}
                />
              </View>

              {balanceError === null ? (
                <ReadWalletAwareWrapper>
                  <Button
                    title={`Send ${token.symbol}`}
                    onPress={submit}
                    disabled={!isTxValid || loading}
                    loading={loading}
                    primary
                  />
                </ReadWalletAwareWrapper>
              ) : (
                <Button title={balanceError} disabled primary />
              )}
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
    width: '100%',
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
  amountContainer: {
    marginTop: 12,
    width: '100%',
  },
});
