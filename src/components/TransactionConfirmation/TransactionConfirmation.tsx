import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useIsDarkTheme } from 'hooks/useIsDarkTheme';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Button } from 'react-native';
import { BottomModal, ModalContent } from 'react-native-modals';
import { TransactionRequest } from '@ethersproject/abstract-provider';
import { transactionController } from 'controllers/TransactionController';
import { Text } from 'components/Text';
import { passcode } from 'controllers/PassCodeController';
import { useBiometryType } from 'hooks/useBiometryType';
import { wallet } from 'utils/wallet';
import { currentChainId } from 'utils/helpers';
import { getProvider } from 'utils/RpcEngine';
import { ChainId } from 'types/network';

type TransactionConfirmationProps = {};

export const TransactionConfirmation: React.FC<
  TransactionConfirmationProps
> = () => {
  const biometryType = useBiometryType();
  const [loading, setLoading] = useState(false);
  const [request, setRequest] = useState<TransactionRequest>();
  const ref = useRef<any>();

  useEffect(() => {
    const subscription = transactionController.hub.on(
      'request',
      (tx, { resolve, reject }) => {
        setRequest(tx);
        ref.current = { resolve, reject };
      },
    );

    return () => {
      subscription.removeAllListeners('request');
    };
  }, []);

  const dark = useIsDarkTheme();

  const onRejectPressed = useCallback(() => {
    ref.current?.reject(new Error('User rejected transaction'));
    setRequest(undefined);
  }, []);

  const onConfirmPressed = useCallback(async () => {
    try {
      await passcode.request('Authenticate to sign transaction');
      const signedTransaction = await wallet.signTransaction(request!);
      const tx = await getProvider(
        (request?.chainId || currentChainId()) as ChainId,
      ).sendTransaction(signedTransaction);
      console.log('tx', tx);
      ref.current?.resolve(tx);
      setRequest(undefined);
    } catch (error) {
      console.log(error);
    }
  }, [request]);

  return (
    <BottomModal visible={!!request} onSwipeOut={onRejectPressed}>
      <ModalContent style={[styles.modal, dark && styles.modalDark]}>
        <View style={[styles.modalView, dark && styles.modalViewDark]}>
          <Text>{JSON.stringify(request)}</Text>
          <Button title="Close" onPress={onRejectPressed} />
          <Button title="Submit" onPress={onConfirmPressed} />
        </View>
      </ModalContent>
    </BottomModal>
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
