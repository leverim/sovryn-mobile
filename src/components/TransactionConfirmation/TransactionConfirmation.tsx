import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useIsDarkTheme } from 'hooks/useIsDarkTheme';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Button } from 'react-native';
import { BottomModal, ModalContent } from 'react-native-modals';
import {
  TransactionRequest,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
import { transactionController } from 'controllers/TransactionController';
import { Text } from 'components/Text';
import { passcode } from 'controllers/PassCodeController';
import { useBiometryType } from 'hooks/useBiometryType';
import { wallet } from 'utils/wallet';
import { currentChainId } from 'utils/helpers';
import { getProvider } from 'utils/RpcEngine';
import { ChainId } from 'types/network';
import { ConfirmationModal } from './ConfirmationModal/ConfirmationModal';

type TransactionConfirmationProps = {};

enum Step {
  NONE,
  REQUEST,
  RESPONSE,
}

export const TransactionConfirmation: React.FC<
  TransactionConfirmationProps
> = () => {
  const biometryType = useBiometryType();
  const [loading, setLoading] = useState(false);
  const [request, setRequest] = useState<TransactionRequest>();
  const [step, setStep] = useState<Step>(Step.REQUEST);
  const ref = useRef<any>();
  const responseRef = useRef<TransactionResponse>();

  useEffect(() => {
    const subscription = transactionController.hub.on(
      'request',
      (tx: TransactionRequest, { resolve, reject }) => {
        tx.chainId = tx.chainId || currentChainId(); // make sure chainId is always set.
        setRequest(tx);
        setStep(Step.REQUEST);
        responseRef.current = undefined;
        ref.current = { resolve, reject };
      },
    );

    return () => {
      subscription.removeAllListeners('request');
    };
  }, []);

  const dark = useIsDarkTheme();

  const onRejectPressed = useCallback(() => {
    setRequest(undefined);
    setStep(Step.NONE);
    responseRef.current = undefined;
    ref.current?.reject(new Error('User rejected transaction'));
    ref.current = undefined;
  }, []);

  const onConfirmPressed = useCallback(async () => {
    try {
      await passcode.request('Authenticate to sign transaction');
      const signedTransaction = await wallet.signTransaction(request!);
      const tx = await getProvider(
        (request?.chainId || currentChainId()) as ChainId,
      ).sendTransaction(signedTransaction);
      responseRef.current = tx;
      setStep(Step.RESPONSE);
      ref.current?.resolve(tx);
      ref.current = undefined;
    } catch (error) {
      console.log(error);
    }
  }, [request]);

  const onCloseResponseModal = useCallback(async () => {
    setStep(Step.NONE);
    setRequest(undefined);
    responseRef.current = undefined;
    ref.current = undefined;
  }, []);

  return (
    <>
      <ConfirmationModal
        visible={step === Step.REQUEST && !!request}
        request={request}
        onConfirm={onConfirmPressed}
        onReject={onRejectPressed}
      />

      <BottomModal
        visible={step === Step.RESPONSE}
        onSwipeOut={onCloseResponseModal}>
        <ModalContent style={[styles.modal, dark && styles.modalDark]}>
          <View style={[styles.modalView, dark && styles.modalViewDark]}>
            <Text>{JSON.stringify(responseRef.current)}</Text>
            <Button title="Close" onPress={onCloseResponseModal} />
          </View>
        </ModalContent>
      </BottomModal>
    </>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: DefaultTheme.colors.card,
  },
  modalDark: {
    backgroundColor: DarkTheme.colors.card,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    // width: '100%',
    // backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 0,
    width: '100%',
    // backgroundColor: 'white',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingHorizontal: 35,
    paddingVertical: 50,
    alignItems: 'center',
    // shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalViewDark: {
    // backgroundColor: DarkTheme.colors.card,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    marginHorizontal: 15,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dappInfoContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  dappInfoHostname: {
    marginTop: 6,
    fontSize: 12,
  },
  walletContainer: {
    marginVertical: 30,
    padding: 15,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    flexGrow: 1,
    flexShrink: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  walletImageContainer: {
    marginRight: 15,
  },
  walletText: {
    fontWeight: '400',
    marginBottom: 4,
  },
  titleText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
});
