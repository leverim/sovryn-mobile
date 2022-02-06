import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Text } from 'components/Text';
import { decodeParameters } from 'utils/contract-utils';
import { tokenUtils } from 'utils/token-utils';
import { formatAndCommify } from 'utils/helpers';
import { ChainId } from 'types/network';
import { DataModalProps } from './ConfirmationModal';
import { Item } from './Item';
import { TransactionType } from './transaction-types';
import { lendingTokens } from 'config/lending-tokens';
import { AddressBadge } from 'components/AddressBadge';

export const LendingDepositData: React.FC<DataModalProps> = ({ request }) => {
  const { receiver, amount, rewardsEnabled, supplyToken, loanToken } =
    useMemo(() => {
      const signature = request?.data?.toString().substring(0, 10) || '0x';

      const isNative = signature === TransactionType.LENDING_DEPOSIT_NATIVE;

      const decoded = decodeParameters(
        isNative ? ['address', 'bool'] : ['address', 'uint256', 'bool'],
        `0x${request.data!.toString().substring(10)}`,
      );

      const _loanToken = tokenUtils.getTokenByAddress(
        request.to!,
        request.chainId as ChainId,
      );

      return {
        receiver: decoded[0],
        amount: isNative ? request.value : decoded[1],
        rewardsEnabled: isNative ? decoded[1] : decoded[2],
        supplyToken: lendingTokens.find(
          item =>
            item.chainId === request.chainId &&
            item.loanTokenId === _loanToken.id,
        )?.supplyToken!,
        loanToken: _loanToken,
      };
    }, [request]);

  const receiveAmount = request.customData?.receiveAmount || null;

  return (
    <View>
      <Item
        title="Send:"
        content={
          <Text>
            {formatAndCommify(amount, supplyToken.decimals)}{' '}
            {supplyToken.symbol}
          </Text>
        }
      />
      <Item
        title="Receive:"
        content={
          <Text>
            {receiveAmount !== null && (
              <>~{formatAndCommify(receiveAmount, loanToken.decimals)} </>
            )}
            {loanToken.symbol}
          </Text>
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
        title="Eligable for SOV rewards:"
        content={<Text>{rewardsEnabled ? 'Yes' : 'No'}</Text>}
      />
    </View>
  );
};
