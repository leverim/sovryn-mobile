import { getSwappableToken } from 'config/swapables';
import { useState } from 'react';
import { ChainId } from 'types/network';
import { TokenId } from 'types/token';
import { callToContract } from 'utils/contract-utils';
import { formatUnits, parseUnits } from 'utils/helpers';
import { tokenUtils } from 'utils/token-utils';
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
          tokenUtils.getTokenAddressForId(getSwappableToken(tokenId, chainId)),
          tokenUtils.getTokenAddressForId(
            getSwappableToken(usdTokenId, chainId),
          ),
          parseUnits(
            ofOne ? '1' : amount,
            tokenUtils.getTokenById(tokenId).decimals,
          ),
        ],
      )
        .then(response => {
          if (!ofOne) {
            return response[0];
          }
          return response[0]
            .mul(parseUnits(amount, tokenUtils.getTokenById(tokenId).decimals))
            .div(parseUnits('1', tokenUtils.getTokenById(tokenId).decimals));
        })
        .then(response =>
          formatUnits(response, tokenUtils.getTokenById(usdTokenId).decimals),
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
