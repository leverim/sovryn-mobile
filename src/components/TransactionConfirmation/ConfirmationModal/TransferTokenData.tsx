import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Text } from 'components/Text';
import { decodeParameters } from 'utils/contract-utils';
import { tokenUtils } from 'utils/token-utils';
import { commifyDecimals, formatUnits } from 'utils/helpers';
import { ChainId } from 'types/network';
import { DataModalProps } from './ConfirmationModal';
import { AddressBadge } from 'components/AddressBadge';
import { Item } from './Item';

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
