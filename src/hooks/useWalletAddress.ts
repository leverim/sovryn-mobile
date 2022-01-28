import { useMemo } from 'react';
import { currentChainId } from 'utils/helpers';
import { toChecksumAddress } from 'utils/rsk';
import { useCurrentAccount } from './useCurrentAccount';

export function useWalletAddress(): string {
  const { address } = useCurrentAccount();
  return useMemo(() => {
    if (address) {
      return toChecksumAddress(address, currentChainId());
    }
    return null as unknown as string;
  }, [address]);
}
