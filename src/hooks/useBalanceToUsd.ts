import { BigNumber } from 'ethers';
import { useContext, useEffect, useMemo } from 'react';
import { getSwappableToken } from 'config/swapables';
import { ChainId } from 'types/network';
import { Token, TokenId } from 'types/token';
import { USD_TOKEN } from 'utils/constants';
import { formatUnits, parseUnits } from 'utils/helpers';
import { tokenUtils } from 'utils/token-utils';
import { useCachedUsdPrice } from './app-context/useCachedUsdPrice';

/** @deprecated */
export function useBalanceToUsd(
  chainId: ChainId,
  token: Token,
  amount: string,
) {
  const xusdPrice = useCachedUsdPrice(
    chainId,
    token.native
      ? getSwappableToken(token.id as TokenId, chainId)
      : (token.id as TokenId),
  );

  return useMemo(() => {
    const xusdToken = tokenUtils.getTokenById(USD_TOKEN);
    if (token.id === xusdToken.id) {
      return formatUnits(BigNumber.from(amount), xusdToken.decimals);
    }

    if (xusdPrice !== null) {
      return formatUnits(
        BigNumber.from(amount)
          .mul(xusdPrice)
          .div(parseUnits('1', xusdToken.decimals)),
        xusdToken.decimals,
      );
    }
    return null;
  }, [amount, xusdPrice, token]);
}
