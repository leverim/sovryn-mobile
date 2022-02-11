import React from 'react';
import { Text } from 'components/Text';
import { commifyDecimals, formatUnits } from 'utils/helpers';
import { ChainId } from 'types/network';
import { DataModalProps } from './ConfirmationModal';
import { AddressBadge } from 'components/AddressBadge';
import { Item } from './Item';
import { getNativeAsset } from 'utils/asset-utils';

export const SendCoinData: React.FC<DataModalProps> = ({ request }) => {
  const coin = getNativeAsset(request.chainId! as ChainId);
  return (
    <>
      <Item
        title="Receiver:"
        content={
          <>
            <AddressBadge
              address={request.to!}
              chainId={request.chainId as ChainId}
            />
          </>
        }
      />
      <Item
        title="Amount:"
        content={
          <Text>
            {commifyDecimals(formatUnits(request.value, coin.decimals))}{' '}
            {coin.symbol}
          </Text>
        }
      />
    </>
  );
};
