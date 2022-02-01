import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Text } from 'components/Text';
import { decodeParameters } from 'utils/contract-utils';
import { tokenUtils } from 'utils/token-utils';
import { commifyDecimals, formatUnits } from 'utils/helpers';
import { ChainId } from 'types/network';
import { DataModalProps } from './ConfirmationModal';
import { Item } from './Item';
import { TransactionType } from './transaction-types';
import { unwrapSwappableToken } from 'config/swapables';
import { TokenId } from 'types/token';

export const SwapData: React.FC<DataModalProps> = ({ request }) => {
  const { tokenSend, tokenReceive, amount, minReturn } = useMemo(() => {
    const signature = request?.data?.toString().substring(0, 10) || '0x';

    const [path, _amount, _minReturn] = decodeParameters(
      signature === TransactionType.SWAP_NETWORK_SWAP
        ? ['address[]', 'uint256', 'uint256']
        : ['address[]', 'uint256', 'uint256', 'address', 'address', 'uint256'],
      `0x${request.data!.toString().substring(10)}`,
    );

    let _tokenSend = tokenUtils.getTokenByAddress(
      path[0],
      request.chainId as ChainId,
    );
    let _tokenReceive = tokenUtils.getTokenByAddress(
      path[path.length - 1],
      request.chainId as ChainId,
    );

    if (signature === TransactionType.WRBTC_PROXY_SWAP) {
      const unwrappedSend = unwrapSwappableToken(
        _tokenSend.id as TokenId,
        request.chainId as ChainId,
      );
      if (unwrappedSend !== _tokenSend.id) {
        _tokenSend = tokenUtils.getTokenById(unwrappedSend);
      }
      const unwrappedReceive = unwrapSwappableToken(
        _tokenReceive.id as TokenId,
        request.chainId as ChainId,
      );
      if (unwrappedReceive !== _tokenReceive.id) {
        _tokenReceive = tokenUtils.getTokenById(unwrappedReceive);
      }
    }

    return {
      tokenSend: _tokenSend,
      tokenReceive: _tokenReceive,
      amount: _amount,
      minReturn: _minReturn,
    };
  }, [request]);

  return (
    <View>
      <Item
        title="Send:"
        content={
          <Text>
            {commifyDecimals(formatUnits(amount, tokenSend.decimals))}{' '}
            {tokenSend.symbol}
          </Text>
        }
      />
      <Item
        title="Receive:"
        content={
          <Text>
            ~{commifyDecimals(formatUnits(minReturn, tokenReceive.decimals))}{' '}
            {tokenReceive.symbol}
          </Text>
        }
      />
    </View>
  );
};
