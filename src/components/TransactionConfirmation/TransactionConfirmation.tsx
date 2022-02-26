import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { TransactionRequest } from '@ethersproject/abstract-provider';
import { transactionController } from 'controllers/TransactionController';
import { passcode } from 'controllers/PassCodeController';
import { wallet } from 'utils/wallet';
import { currentChainId } from 'utils/helpers';
import { ChainId } from 'types/network';
import { ConfirmationModal } from './ConfirmationModal/ConfirmationModal';
import { TransactionContext } from 'store/transactions';
import { useWalletAddress } from 'hooks/useWalletAddress';
import { clone, sortBy } from 'lodash';
import { getProvider } from 'utils/RpcEngine';
import { useTransactionModal } from 'hooks/useTransactionModal';

type TransactionConfirmationProps = {};

enum Step {
  NONE,
  REQUEST,
  RESPONSE,
}

export const TransactionConfirmation: React.FC<
  TransactionConfirmationProps
> = () => {
  const {
    state,
    actions: { addTransaction },
  } = useContext(TransactionContext);

  const showTx = useTransactionModal();

  const [loading, setLoading] = useState(false);
  const [request, setRequest] = useState<TransactionRequest>();
  const [step, setStep] = useState<Step>(Step.REQUEST);
  const ref = useRef<any>();

  const [error, setError] = useState<string>();

  const owner = useWalletAddress()?.toLowerCase();
  const lastNonce = useMemo(
    () =>
      sortBy(
        clone(state.transactions).filter(
          item => item.response.from.toLowerCase() === owner,
        ),
        [item => item.response.nonce],
      )
        .reverse()
        .map(item => item.response.nonce)[0] || undefined,
    [owner, state.transactions],
  );

  useEffect(() => {
    const subscription = transactionController.hub.on(
      'request',
      (tx: TransactionRequest, { resolve, reject }) => {
        tx.chainId = tx.chainId || currentChainId(); // make sure chainId is always set.
        setRequest(tx);
        setStep(Step.REQUEST);
        setError(undefined);
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
      return;
    }

    try {
      const chainId = (request?.chainId || currentChainId()) as ChainId;

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

      showTx(tx.hash);

      ref.current?.resolve(tx);
      ref.current = undefined;

      setStep(Step.NONE);
      setRequest(undefined);
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
  }, [request, lastNonce, addTransaction, showTx]);

  const onRequestUpdated = useCallback(
    (value: TransactionRequest) => setRequest(value),
    [],
  );

  if (!request) {
    return null;
  }

  return (
    <ConfirmationModal
      visible={step === Step.REQUEST && !!request}
      request={request}
      error={error}
      loading={loading}
      onConfirm={onConfirmPressed}
      onReject={onRejectPressed}
      onRequestUpdated={onRequestUpdated}
    />
  );
};
