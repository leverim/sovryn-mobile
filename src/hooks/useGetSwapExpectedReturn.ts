import { getSwappableToken } from 'config/swapables';
import { useEffect, useState } from 'react';
import { ChainId } from 'types/network';
import { TokenId } from 'types/token';
import { callToContract } from 'utils/contract-utils';
import { formatUnits, numberIsEmpty, parseUnits } from 'utils/helpers';
import { tokenUtils } from 'utils/token-utils';
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
        'sovrynProtocol',
        'getSwapExpectedReturn(address,address,uint256)(uint256)',
        [
          tokenUtils.getTokenAddressForId(
            getSwappableToken(sendTokenId, chainId),
          ),
          tokenUtils.getTokenAddressForId(
            getSwappableToken(receiveTokenId, chainId),
          ),
          parseUnits(
            ofOne ? '1' : amount,
            tokenUtils.getTokenById(sendTokenId).decimals,
          ),
        ],
      )
        .then(response => {
          if (!ofOne) {
            return response[0];
          }
          return response[0]
            .mul(
              parseUnits(amount, tokenUtils.getTokenById(sendTokenId).decimals),
            )
            .div(
              parseUnits('1', tokenUtils.getTokenById(sendTokenId).decimals),
            );
        })
        .then(response =>
          formatUnits(
            response,
            tokenUtils.getTokenById(receiveTokenId).decimals,
          ),
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
