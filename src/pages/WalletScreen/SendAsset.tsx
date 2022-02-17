import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useWalletAddress } from 'hooks/useWalletAddress';
import { WalletStackProps } from 'pages/MainScreen/WalletPage';
import { AddressField } from 'components/AddressField';
import { getProvider } from 'utils/RpcEngine';
import { encodeFunctionData } from 'utils/contract-utils';
import { utils, constants, VoidSigner, BigNumber } from 'ethers/lib.esm';
import { useAssetBalance } from 'hooks/useAssetBalance';
import { PageContainer, SafeAreaPage } from 'templates/SafeAreaPage';
import { transactionController } from 'controllers/TransactionController';
import { Button } from 'components/Buttons/Button';
import { useDebouncedEffect } from 'hooks/useDebounceEffect';
import { ReadWalletAwareWrapper } from 'components/ReadWalletAwareWapper';
import { getNativeAsset, listAssetsForChains } from 'utils/asset-utils';
import { AssetAmountField } from 'components/AssetAmountField';
import { AppContext } from 'context/AppContext';
import { useAssetUsdBalance } from 'hooks/useAssetUsdBalance';
import { formatAndCommify, parseUnits } from 'utils/helpers';
import { useIsMounted } from 'hooks/useIsMounted';
import { Text } from 'components/Text';
import { PendingTransactions } from 'components/TransactionHistory/PendingTransactions';
import { TransactionRequest } from '@ethersproject/abstract-provider';
import { formatUnits } from 'ethers/lib/utils';

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

  const [loading, setLoading] = useState(false);
  const [populating, setPopulating] = useState(false);

  const [populated, setPopulated] = useState<TransactionRequest>();

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

  const handleReceiverChange = useCallback(
    (address: string) => setReceiver(address),
    [],
  );

  const transaction: TransactionRequest = useMemo(
    () => ({
      to,
      value: token.native ? utils.parseUnits(amount || '0', token.decimals) : 0,
      data: token.native
        ? '0x'
        : encodeFunctionData('transfer(address,uint256)', [
            (receiver || constants.AddressZero).toLowerCase(),
            utils.parseUnits(amount || '0', token.decimals).toString(),
          ]),
    }),
    [amount, receiver, to, token.decimals, token.native],
  );

  useDebouncedEffect(
    () => {
      setPopulating(true);
      new VoidSigner(owner, getProvider(token.chainId))
        .populateTransaction(transaction)
        .then(setPopulated)
        .finally(() => {
          if (isMounted()) {
            setPopulating(false);
          }
        });
    },
    100,
    [owner, transaction, token.chainId],
  );

  const submit = useCallback(async () => {
    Keyboard.dismiss();
    setLoading(true);
    try {
      await transactionController.request({
        ...transaction,
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
  }, [transaction, token.id, isMounted]);

  const fee = useMemo(
    () =>
      BigNumber.from(populated?.gasPrice || 0).mul(populated?.gasLimit || '0'),
    [populated?.gasLimit, populated?.gasPrice],
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
    const _fee = fee;

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
    <SafeAreaPage
      keyboardAvoiding
      scrollView
      scrollViewProps={{ keyboardShouldPersistTaps: 'handled' }}>
      <PageContainer>
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
              fee={formatUnits(fee, token.decimals)}
            />
          </View>

          {balanceError === null ? (
            <ReadWalletAwareWrapper>
              <Button
                title={`Send ${token.symbol}`}
                onPress={submit}
                disabled={loading || populating}
                loading={loading || populating}
                primary
              />
            </ReadWalletAwareWrapper>
          ) : (
            <Button title={balanceError} disabled primary />
          )}

          {fee.toString() !== '0' && (
            <Text>
              Transaction fee: {formatAndCommify(fee, token.decimals)}{' '}
              {token.symbol}
            </Text>
          )}

          <PendingTransactions />
        </View>
      </PageContainer>
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
