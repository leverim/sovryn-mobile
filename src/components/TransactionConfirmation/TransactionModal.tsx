import React, { useCallback, useMemo } from 'react';
import { BottomModal, ModalContent } from 'react-native-modals';
import { TransactionRequest } from '@ethersproject/abstract-provider';
import { Linking, StyleSheet, View } from 'react-native';
import { BigNumber } from 'ethers';
import { Text } from 'components/Text';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useIsDarkTheme } from 'hooks/useIsDarkTheme';
import { Button } from 'components/Buttons/Button';
import { TransactionBadge } from 'components/TransactionBadge';
import { Item } from './ConfirmationModal/Item';
import { formatAndCommify, getTxInExplorer } from 'utils/helpers';
import { ChainId } from 'types/network';
import { useSelectTransaction } from 'hooks/useSelectTransaction';
import { getNativeAsset } from 'utils/asset-utils';
import { getNetworkByChainId } from 'utils/network-utils';
import { useHandleBackButton } from 'hooks/useHandleBackButton';

export type DataModalProps = {
  loading: boolean;
  request: TransactionRequest;
  fee: string;
  onEditRequested: () => void;
  onLoaderFunction: (value: Promise<any>) => void;
};

type TransactionModalProps = {
  visible: boolean;
  hash?: string;
  onClose: () => void;
};

export const TransactionModal: React.FC<TransactionModalProps> = ({
  visible,
  hash,
  onClose,
}) => {
  const dark = useIsDarkTheme();
  return (
    <BottomModal visible={visible} onSwipeOut={onClose}>
      <ModalContent style={[styles.modal, dark && styles.modalDark]}>
        {hash && <TransactionModalContent hash={hash} onClose={onClose} />}
      </ModalContent>
    </BottomModal>
  );
};

type TransactionModalContentProps = {
  hash: string;
  onClose: () => void;
};

const TransactionModalContent: React.FC<TransactionModalContentProps> = ({
  hash,
  onClose,
}) => {
  useHandleBackButton(onClose);
  const dark = useIsDarkTheme();
  const { response, receipt } = useSelectTransaction(hash);
  const coin = getNativeAsset(response.chainId as ChainId);
  const network = getNetworkByChainId(response.chainId as ChainId);
  const handleOpenInExplorer = useCallback(
    () =>
      Linking.openURL(
        getTxInExplorer(response?.hash!, response?.chainId as ChainId),
      ),
    [response?.hash, response?.chainId],
  );
  const fee = useMemo(() => {
    return receipt
      ? BigNumber.from(receipt.gasUsed).mul(
          receipt.effectiveGasPrice || response.gasPrice,
        )
      : BigNumber.from(response.gasLimit).mul(response.gasPrice!);
  }, [receipt, response]);

  const title = useMemo(() => {
    if (!receipt || !response.confirmations) {
      return 'Transaction Submitted';
    }
    return receipt.status ? 'Transaction Confirmed' : 'Transaction Failed';
  }, [receipt, response.confirmations]);

  return (
    <>
      <View style={styles.title}>
        <Text style={styles.titleText}>{title}</Text>
      </View>
      <View style={[styles.modalView, dark && styles.modalViewDark]}>
        <Item title="Network:" content={<Text>{network.name}</Text>} />
        <Item
          title="Hash:"
          content={<TransactionBadge txHash={response.hash} />}
        />
        <Item
          title="Status:"
          content={
            <Text>
              {receipt?.status === 1 && 'Confirmed'}
              {receipt?.status === 0 && 'Failed'}
              {(!response.confirmations || !receipt) && 'Pending'}
            </Text>
          }
        />
        {receipt?.status === 1 && (
          <Item title="Status:" content={<Text>Confirmed</Text>} />
        )}
        {receipt?.status === 0 && (
          <Item title="Status:" content={<Text>Failed</Text>} />
        )}
        {(!response.confirmations || !receipt) && (
          <Item title="Status:" content={<Text>Pending</Text>} />
        )}
        <Item title="Nonce:" content={<Text>{response.nonce}</Text>} />
        <Item
          title="Fee:"
          content={
            <Text>
              {formatAndCommify(fee, coin.decimals)} {coin.symbol}
            </Text>
          }
          hideBorder
        />

        <View style={[styles.footer, dark && styles.footerDark]}>
          <Button title="Close" onPress={onClose} primary />
          <Button title="Open in explorer" onPress={handleOpenInExplorer} />
        </View>
      </View>
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
