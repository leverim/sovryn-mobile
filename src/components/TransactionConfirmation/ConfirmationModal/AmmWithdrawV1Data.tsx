import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Text } from 'components/Text';
import { decodeParameters } from 'utils/contract-utils';
import { formatAndCommify } from 'utils/helpers';
import { ChainId } from 'types/network';
import { DataModalProps } from './ConfirmationModal';
import { Item } from './Item';
import { findAssetByAddress } from 'utils/asset-utils';
import { ammPools } from 'config/amm-pools';

export const AmmWithdrawV1Data: React.FC<DataModalProps> = ({ request }) => {
  const {
    supplyToken1,
    supplyToken2,
    amount,
    poolToken,
    minReturn1,
    minReturn2,
  } = useMemo(() => {
    // address,uint256,address[],uint256[]
    const decoded = decodeParameters(
      ['address', 'uint256', 'address[]', 'uint256[]'],
      `0x${request.data!.toString().substring(10)}`,
    );

    return {
      amount: decoded[1],
      poolToken: ammPools.find(
        item => item.converterAddress === decoded[0].toLowerCase(),
      )?.poolToken1,
      supplyToken1: findAssetByAddress(
        request.chainId as ChainId,
        decoded[2][0],
      ),
      supplyToken2: findAssetByAddress(
        request.chainId as ChainId,
        decoded[2][1],
      ),
      minReturn1: decoded[3][0],
      minReturn2: decoded[3][1],
    };
  }, [request]);

  return (
    <View>
      {poolToken && (
        <Item
          title="Send:"
          content={
            <Text>
              {formatAndCommify(amount, poolToken.decimals)} {poolToken.symbol}
            </Text>
          }
        />
      )}

      <Item
        title="Receive (minimum):"
        content={
          <>
            <Text>
              {formatAndCommify(minReturn1, supplyToken1.decimals)}{' '}
              {supplyToken1.symbol}
            </Text>
            <Text>
              {formatAndCommify(minReturn2, supplyToken2.decimals)}{' '}
              {supplyToken2.symbol}
            </Text>
          </>
        }
      />
    </View>
  );
};
