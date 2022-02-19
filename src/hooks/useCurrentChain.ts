import { AppContext } from 'context/AppContext';
import { useContext } from 'react';
import { ChainId } from 'types/network';

type CurrentChainResponse = {
  isTestnet: boolean;
  isMainnet: boolean;
  chainId: ChainId;
};

// Returns information about current RSK network.
export function useCurrentChain(): CurrentChainResponse {
  const { isTestnet } = useContext(AppContext);
  return {
    isTestnet,
    isMainnet: !isTestnet,
    chainId: isTestnet ? 31 : 30,
  };
}
