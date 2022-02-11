import { getSwappableToken } from 'config/swapables';
import { useEffect, useState } from 'react';
import { ChainId } from 'types/network';
import { TokenId } from 'types/asset';
import { findAsset } from 'utils/asset-utils';
import { callToContract } from 'utils/contract-utils';
import { formatUnits, numberIsEmpty, parseUnits } from 'utils/helpers';
import { useDebouncedEffect } from './useDebounceEffect';

export function useGetSwapExpectedReturn(
  chainId: ChainId,
  sendTokenId: TokenId,
  receiveTokenId: TokenId,
  amount: string,
  ofOne: boolean = false,
) {
  const [value, setValue] = useState('0');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
  }, [amount, sendTokenId, receiveTokenId]);

  useDebouncedEffect(
    () => {
      if (!sendTokenId || !receiveTokenId || numberIsEmpty(amount)) {
        setLoading(false);
        setValue('0');
        return;
      }

      setLoading(true);
      callToContract(
        chainId,
        'sovrynProtocol',
        'getSwapExpectedReturn(address,address,uint256)(uint256)',
        [
          findAsset(chainId, getSwappableToken(sendTokenId, chainId)).address,
          findAsset(chainId, getSwappableToken(receiveTokenId, chainId))
            .address,
          parseUnits(
            ofOne ? '1' : amount,
            findAsset(chainId, sendTokenId).decimals,
          ),
        ],
      )
        .then(response => {
          if (!ofOne) {
            return response[0];
          }
          return response[0]
            .mul(parseUnits(amount, findAsset(chainId, sendTokenId).decimals))
            .div(parseUnits('1', findAsset(chainId, sendTokenId).decimals));
        })
        .then(response =>
          formatUnits(response, findAsset(chainId, receiveTokenId).decimals),
        )
        .then(response => {
          setValue(response);
          setLoading(false);
        })
        .catch(e => {
          console.warn(e);

          setValue('0');
          setLoading(false);
        });
    },
    300,
    [sendTokenId, receiveTokenId, amount],
  );

  return {
    value,
    loading,
  };
}
