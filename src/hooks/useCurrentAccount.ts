import { useContext, useMemo } from 'react';
import { BaseAccount } from 'utils/accounts';
import { AppContext } from 'context/AppContext';

export function useCurrentAccount(): BaseAccount {
  const { accountList, accountSelected } = useContext(AppContext);
  return useMemo(
    () => accountList[accountSelected],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(accountList), accountSelected],
  );
}
