import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Text } from 'components/Text';
import { decodeParameters } from 'utils/contract-utils';
import { commifyDecimals, formatUnits } from 'utils/helpers';
import { ChainId } from 'types/network';
import { Item } from './Item';
import { TransactionType } from '../../../types/transaction-types';
import { unwrapSwappableToken } from 'config/swapables';
import { TokenId } from 'types/asset';
import { findAsset, findAssetByAddress } from 'utils/asset-utils';
import { TransactionModalDataProps } from 'types/tx-confirmation';

export const SwapData: React.FC<TransactionModalDataProps> = ({ request }) => {
  const { tokenSend, tokenReceive, amount, minReturn } = useMemo(() => {
    const signature = request?.data?.toString().substring(0, 10) || '0x';

    const [path, _amount, _minReturn] = decodeParameters(
      signature === TransactionType.WRBTC_PROXY_SWAP
        ? ['address[]', 'uint256', 'uint256']
        : ['address[]', 'uint256', 'uint256', 'address', 'address', 'uint256'],
      `0x${request.data!.toString().substring(10)}`,
    );

    let _tokenSend = findAssetByAddress(request.chainId as ChainId, path[0]);
    let _tokenReceive = findAssetByAddress(
      request.chainId as ChainId,
      path[path.length - 1],
    );

    if (signature === TransactionType.WRBTC_PROXY_SWAP) {
      const unwrappedSend = unwrapSwappableToken(
        _tokenSend.id as TokenId,
        _tokenSend.chainId,
      );
      if (unwrappedSend !== _tokenSend.id) {
        _tokenSend = findAsset(request.chainId as ChainId, unwrappedSend);
      }
      const unwrappedReceive = unwrapSwappableToken(
        _tokenReceive.id as TokenId,
        request.chainId as ChainId,
      );
      if (unwrappedReceive !== _tokenReceive.id) {
        _tokenReceive = findAsset(request.chainId as ChainId, unwrappedReceive);
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
