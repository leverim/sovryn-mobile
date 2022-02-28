import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Text } from 'components/Text';
import { decodeParameters } from 'utils/contract-utils';
import { commifyDecimals, formatUnits } from 'utils/helpers';
import { ChainId } from 'types/network';
import { AddressBadge } from 'components/AddressBadge';
import { Item } from './Item';
import { findAssetByAddress, getNativeAsset } from 'utils/asset-utils';
import { TransactionModalDataProps } from 'types/tx-confirmation';

export const TransferTokenData: React.FC<TransactionModalDataProps> = ({
  request,
}) => {
  const [receiver, amount] = useMemo(() => {
    return decodeParameters(
      ['address', 'uint256'],
      `0x${request.data!.toString().substring(10)}`,
    );
  }, [request.data]);

  const coin = getNativeAsset(request.chainId! as ChainId);
  const token = findAssetByAddress(request.chainId! as ChainId, request.to!);

  const nativeValue = useMemo(
    () => formatUnits(request.value, coin.decimals),
    [request.value, coin.decimals],
  );

  return (
    <View>
      <Item
        title="Token:"
        content={
          <>
            <Text>{token.symbol}</Text>
            <AddressBadge
              address={request.to!}
              chainId={request.chainId as ChainId}
            />
          </>
        }
      />
      <Item
        title="Receiver:"
        content={
          <AddressBadge
            address={receiver}
            chainId={request.chainId as ChainId}
          />
        }
      />
      <Item
        title="Amount:"
        content={
          <Text>
            {commifyDecimals(formatUnits(amount, token.decimals))}{' '}
            {token.symbol}
          </Text>
        }
      />

      {nativeValue !== '0.0' && (
        <Item
          title={`Amount ${coin.symbol}`}
          content={
            <Text>
              {commifyDecimals(formatUnits(amount, coin.decimals))}{' '}
              {coin.symbol}
            </Text>
          }
        />
      )}
    </View>
  );
};
