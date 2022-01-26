import React, { useMemo } from 'react';
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
import { TransactionType } from './transaction-types';
import { tokenUtils } from 'utils/token-utils';
import { commifyDecimals, currentChainId, formatUnits } from 'utils/helpers';
import { ChainId } from 'types/network';
import { DataModalProps } from './ConfirmationModal';
import { AddressBadge } from 'components/AddressBadge';

export const SendCoinData: React.FC<DataModalProps> = ({ request }) => {
  const dark = useIsDarkTheme();

  const coin = tokenUtils.getNativeToken(request.chainId! as ChainId);

  return (
    <View>
      <Text>Receiver:</Text>
      <AddressBadge
        address={request.to!}
        chainId={request.chainId as ChainId}
      />
      <Text>Amount:</Text>
      <Text>
        {commifyDecimals(
          formatUnits(request.value, coin.decimals),
          coin.decimals,
        ).toString()}{' '}
        {coin.symbol}
      </Text>
    </View>
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
