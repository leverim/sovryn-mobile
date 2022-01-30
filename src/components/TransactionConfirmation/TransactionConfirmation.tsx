import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  TransactionRequest,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
import { transactionController } from 'controllers/TransactionController';
import { passcode } from 'controllers/PassCodeController';
import { wallet } from 'utils/wallet';
import { currentChainId } from 'utils/helpers';
import { getProvider } from 'utils/RpcEngine';
import { ChainId } from 'types/network';
import { ConfirmationModal } from './ConfirmationModal/ConfirmationModal';
import { TransactionModal } from './TransactionModal';
import { notifications, TxNotificationStatus } from 'controllers/notifications';

type TransactionConfirmationProps = {};

enum Step {
  NONE,
  REQUEST,
  RESPONSE,
}

export const TransactionConfirmation: React.FC<
  TransactionConfirmationProps
> = () => {
  const [loading, setLoading] = useState(false);
  const [request, setRequest] = useState<TransactionRequest>();
  const [step, setStep] = useState<Step>(Step.REQUEST);
  const ref = useRef<any>();
  const responseRef = useRef<TransactionResponse>();

  const [error, setError] = useState<string>();

  useEffect(() => {
    const subscription = transactionController.hub.on(
      'request',
      (tx: TransactionRequest, { resolve, reject }) => {
        tx.chainId = tx.chainId || currentChainId(); // make sure chainId is always set.
        setRequest(tx);
        setStep(Step.REQUEST);
        setError(undefined);
        responseRef.current = undefined;
        ref.current = { resolve, reject };
      },
    );

    return () => {
      subscription.removeAllListeners('request');
    };
  }, []);

  const onRejectPressed = useCallback(() => {
    setRequest(undefined);
    setStep(Step.NONE);
    responseRef.current = undefined;
    ref.current?.reject(new Error('User rejected transaction'));
    ref.current = undefined;
  }, []);

  const onConfirmPressed = useCallback(async () => {
    setError(undefined);
    setLoading(true);
    let password;
    try {
      password = await passcode.request('Authenticate to sign transaction');
    } catch (err: any) {
      setError(err?.message);
      setLoading(false);
      console.log('authorization error', err);
      return;
    }

    try {
      const signedTransaction = await wallet.signTransaction(
        request!,
        password,
      );

      console.log('tx signed', signedTransaction);
      const chainId = (request?.chainId || currentChainId()) as ChainId;

      const tx = await getProvider(chainId).sendTransaction(signedTransaction);
      responseRef.current = tx;

      setStep(Step.RESPONSE);
      ref.current?.resolve(tx);
      ref.current = undefined;

      await notifications.sendTx(chainId, tx.hash);

      tx.wait(1)
        .then(receipt => {
          if (receipt) {
            notifications.sendTx(
              chainId,
              receipt.transactionHash,
              TxNotificationStatus.CONFIRMED,
            );
          }
        })
        .catch(_error => {
          console.warn('tx error', _error);
          notifications.sendTx(
            chainId,
            tx.hash,
            _error.code || TxNotificationStatus.CALL_EXCEPTION,
          );
        });
    } catch (err: any) {
      console.log('signature error', err);
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
  }, [request]);

  const onCloseResponseModal = useCallback(async () => {
    setStep(Step.NONE);
    setRequest(undefined);
    responseRef.current = undefined;
    ref.current = undefined;
  }, []);

  const onRequestUpdated = useCallback(
    (value: TransactionRequest) => setRequest(value),
    [],
  );

  if (!request) {
    return null;
  }

  return (
    <>
      <ConfirmationModal
        visible={step === Step.REQUEST && !!request}
        request={request}
        error={error}
        loading={loading}
        onConfirm={onConfirmPressed}
        onReject={onRejectPressed}
        onRequestUpdated={onRequestUpdated}
      />

      <TransactionModal
        visible={step === Step.RESPONSE}
        onClose={onCloseResponseModal}
        request={request}
        response={responseRef.current}
      />
    </>
  );
};
