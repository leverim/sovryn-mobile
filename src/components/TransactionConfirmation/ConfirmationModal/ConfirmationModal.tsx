import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BottomModal, ModalContent } from 'react-native-modals';
import {
  TransactionRequest,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
import { Button, StyleSheet, View } from 'react-native';
import { Text } from 'components/Text';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useIsDarkTheme } from 'hooks/useIsDarkTheme';
import { functionSignature } from 'utils/contract-utils';
import { TransactionTypes } from 'ethers/lib/utils';
import { TransactionType } from './transaction-types';
import { tokenUtils } from 'utils/token-utils';
import { currentChainId } from 'utils/helpers';
import { ChainId } from 'types/network';
import { SendCoinData } from './SendCoinData';
import { ContractInteractionData } from './ContractInteractionData';
import { TransferTokenData } from './TransferTokenData';

export type DataModalProps = {
  loading: boolean;
  request: TransactionRequest;
  fee: string;
  onEditRequested: () => void;
  onLoaderFunction: (value: Promise<any>) => void;
};

type ConfirmationModalProps = {
  visible: boolean;
  request?: TransactionRequest;
  onConfirm: () => void;
  onReject: () => void;
};

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  request,
  onReject,
  onConfirm,
}) => {
  const dark = useIsDarkTheme();
  const [loading, setLoading] = useState(false);

  const signature = useMemo(
    () => request?.data?.toString().substring(0, 10) || '0x',
    [request?.data],
  );

  const type = useMemo(() => {
    const _signature = (request?.customData?.type ||
      signature) as TransactionType;
    return Object.values(TransactionType).includes(_signature)
      ? _signature
      : TransactionType.UNKNOWN;
  }, [request?.customData?.type, signature]);

  const renderTitle = useMemo(() => {
    switch (type) {
      default:
        return <Text>Contract Interaction</Text>;
      case TransactionType.SEND_COIN:
        return (
          <Text>
            Send{' '}
            {tokenUtils.getNativeToken(
              (request?.chainId || currentChainId()) as ChainId,
            )?.symbol || 'Coin'}
          </Text>
        );
      case TransactionType.TRANSFER_TOKEN:
        return (
          <Text>
            Transfer{' '}
            {tokenUtils.getTokenByAddress(
              request?.to!,
              request?.chainId as ChainId,
            )?.symbol || 'Token'}
          </Text>
        );
    }
  }, [type, request]);

  const RenderContent = useMemo(() => {
    switch (type) {
      default:
        return ContractInteractionData;
      case TransactionType.SEND_COIN:
        return SendCoinData;
      case TransactionType.TRANSFER_TOKEN:
        return TransferTokenData;
    }
  }, [type]);

  const onLoaderFunctionReceiver = useCallback((promise: Promise<any>) => {
    console.log('job received', promise);
  }, []);

  useEffect(() => {
    // console.log('req', request);
  }, [request]);

  return (
    <BottomModal visible={visible} onSwipeOut={onReject}>
      <ModalContent style={[styles.modal, dark && styles.modalDark]}>
        {renderTitle}
        <View style={[styles.modalView, dark && styles.modalViewDark]}>
          <RenderContent
            loading={false}
            request={request!}
            onEditRequested={() => {}}
            onLoaderFunction={onLoaderFunctionReceiver}
            fee={'0'}
          />
          <Button title="Confirm" onPress={onConfirm} />
          <Button title="Cancel" onPress={onReject} />
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
  modalView: {
    margin: 0,
    width: '100%',
    // backgroundColor: 'white',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 15,
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
});
