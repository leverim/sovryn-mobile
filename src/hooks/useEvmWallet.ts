import { AppContext } from 'context/AppContext';
import { useContext, useMemo } from 'react';
import { wallet } from 'utils/wallet';

export function useEvmWallet() {
  const { accountList, accountSelected } = useContext(AppContext);
  return useMemo(
    () => wallet.address as unknown as string,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accountSelected, accountList],
  );
}
