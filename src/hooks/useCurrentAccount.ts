import { useContext, useMemo } from 'react';
import { BaseAccount } from 'utils/accounts';
import { AppContext } from 'context/AppContext';

export function useCurrentAccount(): BaseAccount {
  const { accountList, accountSelected } = useContext(AppContext);
  return useMemo(
    () => accountList[accountSelected],
    [accountList, accountSelected],
  );
}
