import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'components/Text';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { decodeParameters } from 'utils/contract-utils';
import { tokenUtils } from 'utils/token-utils';
import { commifyDecimals, formatUnits } from 'utils/helpers';
import { ChainId } from 'types/network';
import { DataModalProps } from './ConfirmationModal';
import { AddressBadge } from 'components/AddressBadge';

export const TransferTokenData: React.FC<DataModalProps> = ({ request }) => {
  const [receiver, amount] = useMemo(() => {
    return decodeParameters(
      ['address', 'uint256'],
      `0x${request.data!.toString().substring(10)}`,
    );
  }, [request.data]);

  const coin = tokenUtils.getNativeToken(request.chainId! as ChainId);
  const token = tokenUtils.getTokenByAddress(
    request.to!,
    request.chainId! as ChainId,
  );

  const nativeValue = useMemo(
    () => formatUnits(request.value, coin.decimals),
    [request.value, coin.decimals],
  );

  return (
    <View>
      <Text>{token.symbol} Token:</Text>
      <AddressBadge
        address={request.to!}
        chainId={request.chainId as ChainId}
      />
      <Text>{token.symbol} Receiver:</Text>
      <AddressBadge address={receiver} chainId={request.chainId as ChainId} />
      <Text>{token.symbol} Amount:</Text>
      <Text>
        {commifyDecimals(formatUnits(amount, token.decimals), token.decimals)}{' '}
        {token.symbol}
      </Text>
      {nativeValue !== '0.0' && (
        <>
          <Text>{coin.symbol} Amount:</Text>
          <Text>
            {commifyDecimals(nativeValue, coin.decimals)} {coin.symbol}
          </Text>
        </>
      )}
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
