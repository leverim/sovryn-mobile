import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleSheet, View, LogBox, ScrollView } from 'react-native';
import { Text } from 'components/Text';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useIsDarkTheme } from 'hooks/useIsDarkTheme';
import { TransactionType } from '../types/transaction-types';
import { commifyDecimals, formatUnits, prettifyTx } from 'utils/helpers';
import { ChainId } from 'types/network';
import { SendCoinData } from './components/ConfirmationModal/SendCoinData';
import { ContractInteractionData } from './components/ConfirmationModal/ContractInteractionData';
import { TransferTokenData } from './components/ConfirmationModal/TransferTokenData';
import { ApproveTokenData } from './components/ConfirmationModal/ApproveTokenData';
import { Button } from 'components/Buttons/Button';
import { getProvider } from 'utils/RpcEngine';
import { wallet } from 'utils/wallet';
import { useDebouncedEffect } from 'hooks/useDebounceEffect';
import { Item } from './components/ConfirmationModal/Item';
import { BigNumber } from 'ethers';
import { ErrorHolder } from './components/ConfirmationModal/ErrorHolder';
import { VestingWithdrawTokensData } from './components/ConfirmationModal/VestingWithdrawTokensData';
import { SwapData } from './components/ConfirmationModal/SwapData';
import { LendingDepositData } from './components/ConfirmationModal/LendingDepositData';
import { LendingWithdrawData } from './components/ConfirmationModal/LendingWithdrawData';
import { getNativeAsset } from 'utils/asset-utils';
import { getNetworkByChainId } from 'utils/network-utils';
import {
  getSignatureFromData,
  getTxTitle,
  getTxType,
} from 'utils/transaction-helpers';
import { AmmDepositV1Data } from './components/ConfirmationModal/AmmDepositV1Data';
import { AmmDepositV2Data } from './components/ConfirmationModal/AmmDepositV2Data';
import { AmmWithdrawV1Data } from './components/ConfirmationModal/AmmWithdrawV1Data';
import { AmmWithdrawV2Data } from './components/ConfirmationModal/AmmWithdrawV2Data';
import { SafeAreaPage } from 'templates/SafeAreaPage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ModalStackRoutes } from 'routers/modal.routes';
import { TransactionContext } from 'store/transactions';
import { useCurrentChain } from 'hooks/useCurrentChain';
import { passcode } from 'controllers/PassCodeController';
import { useWalletAddress } from 'hooks/useWalletAddress';
import { clone, sortBy } from 'lodash';
import { useTransactionModal } from 'hooks/useTransactionModal';
import { globalStyles } from 'global.styles';
import { toast } from 'controllers/SnackbarController';

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

type Props = NativeStackScreenProps<ModalStackRoutes, 'modal.tx-confirm'>;

export const TransactionConfirmationModal: React.FC<Props> = ({
  route,
  navigation,
}) => {
  const {
    state,
    actions: { addTransaction },
  } = useContext(TransactionContext);
  const dark = useIsDarkTheme();
  const { chainId: currentChainId } = useCurrentChain();
  const owner = useWalletAddress()?.toLowerCase();
  const showTx = useTransactionModal();

  const closeHandled = useRef<boolean>(false);

  const [dataLoading, setDataLoading] = useState(true);
  const [estimatedGasLimit, setEstimatedGasLimit] = useState(0);
  const [estimatedGasPrice, setEstimatedGasPrice] = useState(0);
  const [error, setError] = useState<string>();
  const [transactionLoading, setLoading] = useState(false);

  const { request, onConfirm, onReject } = route.params;

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      if (!closeHandled.current) {
        onReject(new Error('User rejected transaction'));
      }
    });
    return unsubscribe;
  }, [navigation, onReject]);

  const lastNonce = useMemo(
    () =>
      sortBy(
        clone(state.transactions).filter(
          item =>
            item.response.from.toLowerCase() === owner &&
            item.response.chainId === request.chainId,
        ),
        [item => item.response.nonce],
      )
        .reverse()
        .map(item => item.response.nonce)[0] || undefined,
    [owner, request.chainId, state.transactions],
  );

  const loading = useMemo(
    () => transactionLoading || dataLoading,
    [transactionLoading, dataLoading],
  );

  const signature = useMemo(
    () => getSignatureFromData(request?.data!),
    [request?.data],
  );

  const type = useMemo(() => {
    const _signature = (request?.customData?.type ||
      signature) as TransactionType;
    console.log(_signature);
    return getTxType(_signature);
  }, [request?.customData?.type, signature]);

  const renderTitle = useMemo(
    () => getTxTitle(type, request as any),
    [type, request],
  );

  const RenderContent = useMemo(() => {
    switch (type) {
      default:
        return ContractInteractionData;
      case TransactionType.SEND_COIN:
        return SendCoinData;
      case TransactionType.APPROVE_TOKEN:
        return ApproveTokenData;
      case TransactionType.TRANSFER_TOKEN:
        return TransferTokenData;
      case TransactionType.VESTING_WITHDRAW_TOKENS:
        return VestingWithdrawTokensData;
      case TransactionType.SWAP_NETWORK_SWAP:
      case TransactionType.WRBTC_PROXY_SWAP:
        return SwapData;
      case TransactionType.LENDING_DEPOSIT:
      case TransactionType.LENDING_DEPOSIT_NATIVE:
        return LendingDepositData;
      case TransactionType.LENDING_WITHDRAW:
      case TransactionType.LENDING_WITHDRAW_NATIVE:
        return LendingWithdrawData;
      case TransactionType.ADD_LIQUIDITY_TO_V1:
        return AmmDepositV1Data;
      case TransactionType.ADD_LIQUIDITY_TO_V2:
        return AmmDepositV2Data;
      case TransactionType.REMOVE_LIQUIDITY_FROM_V1:
        return AmmWithdrawV1Data;
      case TransactionType.REMOVE_LIQUIDITY_FROM_V2:
        return AmmWithdrawV2Data;
    }
  }, [type]);

  const renderButtonTitle = useMemo(() => {
    switch (type) {
      default:
        return 'Confirm';
      case TransactionType.APPROVE_TOKEN:
        return 'Approve';
    }
  }, [type]);

  const onLoaderFunctionReceiver = useCallback((promise: Promise<any>) => {
    console.log('job received', promise);
  }, []);

  const [simulatorError, setSimulatorError] = useState<string>();

  useEffect(() => {
    getProvider(request?.chainId as ChainId)
      .getGasPrice()
      .then(response => response.toNumber())
      .then(setEstimatedGasPrice)
      .catch(console.warn);
  }, [request?.chainId]);

  const handleData = useCallback(async () => {
    setDataLoading(true);
    setSimulatorError(undefined);
    if (!request?.from) {
      request!.from = wallet.address?.toLowerCase();
    }

    await getProvider(request?.chainId as ChainId)
      .estimateGas(request!)
      .then(response => response.toNumber())
      .then(setEstimatedGasLimit)
      .catch(console.warn);

    await getProvider(request?.chainId as ChainId)
      .call(request!)
      .catch(err => {
        if (err?.reason) {
          setSimulatorError(err.reason);
        } else if (err.error?.body) {
          try {
            const body = JSON.parse(err.error?.body);
            setSimulatorError(body?.error?.message);
          } catch (_) {
            setSimulatorError('Transaction is likely to fail.');
          }
        } else {
          setSimulatorError(err?.message || 'Transaction is likely to fail.');
        }
        console.warn('tx static call failed: ', JSON.stringify(err));
      });

    setDataLoading(false);
  }, [request]);

  useDebouncedEffect(
    () => {
      handleData();
    },
    300,
    [handleData],
  );

  const gasFee = useMemo(() => {
    return BigNumber.from(request?.gasLimit || estimatedGasLimit || '0')
      .mul(request?.gasPrice || estimatedGasPrice || '0')
      .toString();
  }, [
    request?.gasPrice,
    request?.gasLimit,
    estimatedGasLimit,
    estimatedGasPrice,
  ]);

  const coin = getNativeAsset(request?.chainId as ChainId);

  const errorMessage = useMemo(() => {
    if (error) {
      return error;
    }
    if (simulatorError) {
      return simulatorError;
    }
    return undefined;
  }, [error, simulatorError]);

  const network = getNetworkByChainId(request?.chainId as ChainId);

  const handleRejectPress = useCallback(() => {
    onReject(new Error('User rejected transaction'));
    closeHandled.current = true;
    navigation.goBack();
  }, [navigation, onReject]);

  const handleConfirmPress = useCallback(async () => {
    setError(undefined);
    setLoading(true);
    let password;
    try {
      password = await passcode.request('Authenticate to sign transaction');
    } catch (err: any) {
      console.log('failed code', err);
      setError(err?.message);
      setLoading(false);
      return;
    }

    try {
      const chainId = (request?.chainId || currentChainId) as ChainId;

      if (request && request?.nonce === undefined && lastNonce !== undefined) {
        const current = await getProvider(
          request.chainId as ChainId,
        ).getTransactionCount(wallet.address, 'pending');
        request.nonce = current > lastNonce + 1 ? current : lastNonce + 1;
      }

      console.time('wallet.sendTransaction');

      const tx = await wallet.sendTransaction(chainId, request!, password);

      console.timeEnd('wallet.sendTransaction');

      addTransaction(tx!);

      closeHandled.current = true;
      navigation.goBack();

      showTx(tx.hash);

      onConfirm(tx);

      global.toast.show(`Transaction ${prettifyTx(tx.hash)} submitted.`, {
        type: 'success',
        placement: 'top',
      });
    } catch (err: any) {
      console.warn('tx confirmation failed: ', JSON.stringify(err));
      if (err?.body) {
        try {
          const _err = JSON.parse(err?.body || '{}');
          setError(_err?.error?.message || 'Failed to submit transaction');
        } catch (_) {
          setError('Failed to submit transaction');
        }
      } else {
        setError(String(err).substring(0, 100));
      }
    } finally {
      setLoading(false);
    }
  }, [
    addTransaction,
    currentChainId,
    lastNonce,
    navigation,
    onConfirm,
    request,
    showTx,
  ]);

  return (
    <SafeAreaPage>
      <View style={styles.container}>
        <ScrollView>
          <View style={[styles.main]}>
            <Item title={renderTitle} content={<></>} />

            <RenderContent
              loading={loading}
              request={request!}
              onEditRequested={() => {}}
              onLoaderFunction={onLoaderFunctionReceiver}
            />

            <Item title="Network:" content={<Text>{network.name}</Text>} />
            <Item
              title="Transaction fee:"
              content={
                <Text>
                  {commifyDecimals(formatUnits(gasFee, coin.decimals))}{' '}
                  {coin.symbol}
                </Text>
              }
              hideBorder
            />
          </View>
        </ScrollView>
      </View>
      <View style={[styles.footer, dark && styles.footerDark]}>
        {errorMessage && <ErrorHolder text={errorMessage} />}
        <Button
          title={renderButtonTitle}
          onPress={handleConfirmPress}
          primary
          loading={loading}
          disabled={loading}
        />
        <Button title="Cancel" onPress={handleRejectPress} />
      </View>
    </SafeAreaPage>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  main: {
    paddingHorizontal: globalStyles.page.paddingHorizontal,
  },
  modal: {
    backgroundColor: DefaultTheme.colors.card,
  },
  modalDark: {
    backgroundColor: DarkTheme.colors.card,
  },
  title: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  titleText: {
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  modalView: {
    width: '100%',
  },
  modalViewDark: {
    // backgroundColor: DarkTheme.colors.card,
  },

  footer: {
    width: '100%',
    marginTop: 12,
  },
  footerDark: {},
});
