import { useContext, useMemo } from 'react';
import { AppContext } from 'context/AppContext';
import { getEvmWallet } from 'utils/wallet';

export function useEvmWallet(dPath: string, index: number = 0) {
  const { mnemonic } = useContext(AppContext);
  return useMemo(
    () => getEvmWallet(mnemonic as string, dPath, index).address,
    [mnemonic, dPath, index],
  );
}
