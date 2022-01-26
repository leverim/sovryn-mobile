import React, { useCallback } from 'react';
import { BottomModal, ModalContent } from 'react-native-modals';
import {
  TransactionRequest,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
import { Linking, StyleSheet, View } from 'react-native';
import { Text } from 'components/Text';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useIsDarkTheme } from 'hooks/useIsDarkTheme';
import { Button, ButtonIntent } from 'components/Buttons/Button';
import { TransactionBadge } from 'components/TransactionBadge';
import { Item } from './ConfirmationModal/Item';

export type DataModalProps = {
  loading: boolean;
  request: TransactionRequest;
  fee: string;
  onEditRequested: () => void;
  onLoaderFunction: (value: Promise<any>) => void;
};

type TransactionModalProps = {
  visible: boolean;
  request?: TransactionRequest;
  response?: TransactionResponse;
  onClose: () => void;
};

export const TransactionModal: React.FC<TransactionModalProps> = ({
  visible,
  response,
  onClose,
}) => {
  const dark = useIsDarkTheme();

  console.log(response);

  const handleOpenInExplorer = useCallback(
    () =>
      Linking.openURL(`https://explorer.testnet.rsk.co/tx/${response?.hash}`),
    [response?.hash],
  );

  return (
    <BottomModal visible={visible} onSwipeOut={onClose}>
      <ModalContent style={[styles.modal, dark && styles.modalDark]}>
        <View style={styles.title}>
          <Text style={styles.titleText}>Transaction Submitted</Text>
        </View>
        <View style={[styles.modalView, dark && styles.modalViewDark]}>
          <Item
            title="Hash:"
            content={<TransactionBadge txHash={response?.hash!} />}
          />

          {/* <Item
            title="Transaction fee:"
            content={
              <Text>
                {commifyDecimals(formatUnits(gasFee, coin.decimals), 8)}{' '}
                {coin.symbol}
              </Text>
            }
            hideBorder
          /> */}

          <View style={[styles.footer, dark && styles.footerDark]}>
            <Button
              title="Close"
              onPress={onClose}
              intent={ButtonIntent.PRIMARY}
            />
            <Button title="Open in explorer" onPress={handleOpenInExplorer} />
          </View>
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
    marginTop: 36,
  },
  footerDark: {},
});
