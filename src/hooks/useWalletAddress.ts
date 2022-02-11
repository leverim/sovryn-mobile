import { AppContext } from 'context/AppContext';
import { useContext, useMemo } from 'react';
import { toChecksumAddress } from 'utils/rsk';
import { useCurrentAccount } from './useCurrentAccount';

export function useWalletAddress(): string {
  const { isTestnet } = useContext(AppContext);
  const account = useCurrentAccount();
  return useMemo(() => {
    if (account?.address) {
      return toChecksumAddress(account?.address, isTestnet ? 31 : 30);
    }
    return null as unknown as string;
  }, [account, isTestnet]);
}
