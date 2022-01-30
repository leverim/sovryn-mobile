import React from 'react';
import { Text } from 'components/Text';
import { tokenUtils } from 'utils/token-utils';
import { commifyDecimals, formatUnits } from 'utils/helpers';
import { ChainId } from 'types/network';
import { DataModalProps } from './ConfirmationModal';
import { AddressBadge } from 'components/AddressBadge';
import { Item } from './Item';

export const SendCoinData: React.FC<DataModalProps> = ({ request }) => {
  const coin = tokenUtils.getNativeToken(request.chainId! as ChainId);
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
