import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Text } from 'components/Text';
import { decodeParameters } from 'utils/contract-utils';
import { commifyDecimals, formatUnits } from 'utils/helpers';
import { ChainId } from 'types/network';
import { DataModalProps } from './ConfirmationModal';
import { AddressBadge } from 'components/AddressBadge';
import { Item } from './Item';
import { findAsset, getNativeAsset } from 'utils/asset-utils';

export const VestingWithdrawTokensData: React.FC<DataModalProps> = ({
  request,
}) => {
  const [receiver] = useMemo(() => {
    return decodeParameters(
      ['address'],
      `0x${request.data!.toString().substring(10)}`,
    );
  }, [request.data]);

  const token = findAsset(
    request.chainId as ChainId,
    request.customData?.tokenId,
  );
  const coin = getNativeAsset(request.chainId as ChainId);

  return (
    <View>
      <Item
        title="Token receiver:"
        content={
          <AddressBadge
            address={receiver}
            chainId={request.chainId as ChainId}
          />
        }
      />

      {token && request.customData?.amount !== undefined && (
        <Item
          title="Receiver will get:"
          content={
            <Text>
              {commifyDecimals(
                formatUnits(request.customData?.amount, token.decimals),
              )}{' '}
              {token.symbol}
            </Text>
          }
        />
      )}

      {String(request.value) !== '0' && (
        <Item
          title="You send:"
          content={
            <Text>
              {commifyDecimals(formatUnits(request.value, coin.decimals))}{' '}
              {coin.symbol}
            </Text>
          }
        />
      )}
    </View>
  );
};
