import { getSwappableToken } from 'config/swapables';
import { useState } from 'react';
import { ChainId } from 'types/network';
import { TokenId } from 'types/asset';
import { findAsset } from 'utils/asset-utils';
import { callToContract } from 'utils/contract-utils';
import { formatUnits, parseUnits } from 'utils/helpers';
import { useDebouncedEffect } from './useDebounceEffect';

const usdTokenId = 'rusdt';

export function useGetUsdBalance(
  chainId: ChainId,
  tokenId: TokenId,
  amount: string,
  ofOne: boolean = false,
) {
  const [value, setValue] = useState('0');
  const [loading, setLoading] = useState(false);

  useDebouncedEffect(
    () => {
      if (!tokenId || !amount || amount === '0') {
        setLoading(false);
        setValue('0');
        return;
      }

      setLoading(true);
      callToContract(
        'sovrynProtocol',
        'getSwapExpectedReturn(address,address,uint256)(uint256)',
        [
          findAsset(chainId, getSwappableToken(tokenId, chainId)).address,
          findAsset(chainId, getSwappableToken(usdTokenId, chainId)).address,
          parseUnits(
            ofOne ? '1' : amount,
            findAsset(chainId, tokenId).decimals,
          ),
        ],
      )
        .then(response => {
          if (!ofOne) {
            return response[0];
          }
          return response[0]
            .mul(parseUnits(amount, findAsset(chainId, tokenId).decimals))
            .div(parseUnits('1', findAsset(chainId, tokenId).decimals));
        })
        .then(response =>
          formatUnits(response, findAsset(chainId, usdTokenId).decimals),
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
    [tokenId, amount],
  );

  return {
    value,
    loading,
  };
}
