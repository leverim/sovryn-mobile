import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { TransactionRequest, TransactionResponse } from '@ethersproject/abstract-provider';
import { transactionController } from 'controllers/TransactionController';
import { passcode } from 'controllers/PassCodeController';
import { wallet } from 'utils/wallet';
import { ChainId } from 'types/network';
import { TransactionContext } from 'store/transactions';
import { useWalletAddress } from 'hooks/useWalletAddress';
import { clone, sortBy } from 'lodash';
import { getProvider } from 'utils/RpcEngine';
import { useTransactionModal } from 'hooks/useTransactionModal';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { ModalStackRoutes } from 'routers/modal.routes';
import { useCurrentChain } from 'hooks/useCurrentChain';

export const TransactionConfirmation: React.FC = () => {
  const navigation = useNavigation<NavigationProp<ModalStackRoutes>>();
  const { chainId: currentChainId } = useCurrentChain();

  const ref = useRef<any>();

  const onRejectPressed = useCallback((error: Error) => {
    // todo: add snack about rejected transaction?
    ref.current?.reject(error);
    ref.current = undefined;
  }, []);

  const onConfirmPressed = useCallback(async (tx: TransactionResponse) => {
    // todo: add snack about submitted tx?
    ref.current?.resolve(tx);
    ref.current = undefined;
  }, []);

  useEffect(() => {
    const subscription = transactionController.hub.on(
      'request',
      (tx: TransactionRequest, { resolve, reject }) => {
        tx.chainId = tx.chainId || currentChainId; // make sure chainId is always set.
        ref.current = { resolve, reject };
        navigation.navigate('modal.tx-confirm', {
          request: tx,
          onConfirm: onConfirmPressed,
          onReject: onRejectPressed,
        });
      },
    );

    return () => {
      subscription.removeAllListeners('request');
    };
  }, [currentChainId, navigation, onConfirmPressed, onRejectPressed]);

  return <></>;
};
