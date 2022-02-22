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

export const AmmDepositV1Data: React.FC<DataModalProps> = ({ request }) => {
  const { supplyToken1, supplyToken2, amount1, amount2, poolToken, minReturn } =
    useMemo(() => {
      // address,address[],uint256[],uint256
      const decoded = decodeParameters(
        ['address', 'address[]', 'uint256[]', 'uint256'],
        `0x${request.data!.toString().substring(10)}`,
      );

      return {
        supplyToken1: findAssetByAddress(
          request.chainId as ChainId,
          decoded[1][0],
        ),
        supplyToken2: findAssetByAddress(
          request.chainId as ChainId,
          decoded[1][1],
        ),
        amount1: decoded[2][0],
        amount2: decoded[2][1],
        poolToken: ammPools.find(
          item => item.converterAddress === decoded[0].toLowerCase(),
        )?.poolToken1,
        minReturn: decoded[3],
      };
    }, [request]);

  return (
    <View>
      <Item
        title="Deposit:"
        content={
          <Text>
            {formatAndCommify(amount1, supplyToken1.decimals)}{' '}
            {supplyToken1.symbol}
          </Text>
        }
      />
      <Item
        title=""
        content={
          <Text>
            {formatAndCommify(amount2, supplyToken2.decimals)}{' '}
            {supplyToken2.symbol}
          </Text>
        }
      />
      {poolToken && (
        <Item
          title="Minimum received:"
          content={
            <Text>
              {formatAndCommify(minReturn, poolToken.decimals)}{' '}
              {poolToken.symbol}
            </Text>
          }
        />
      )}
    </View>
  );
};
