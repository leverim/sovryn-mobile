import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { useMemo } from 'react';

export function useSlippage(
  amount: string,
  decimals: number,
  slippage: string = '0.1',
) {
  const minReturn = useMemo(() => {
    const _amount = parseUnits(amount || '0', decimals || 0);
    const _slippage = parseUnits(slippage || '0', 3);
    const toRemove = _amount.mul(_slippage).div(parseUnits('1', 5));
    return _amount.sub(toRemove).toString();
  }, [amount, slippage, decimals]);

  return {
    amount,
    slippage,
    minReturn,
    minReturnFormatted: formatUnits(minReturn, decimals),
  };
}
