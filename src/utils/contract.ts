import { contracts } from 'config/contracts';
import type { ContractName, Contract } from 'types/contract';
import { ChainId } from 'types/network';
import { currentChainId } from './helpers';

// todo rename
export const contractUtils = {
  listContracts: (): Contract[] => {
    return contracts;
  },
  listContractsForChainId: (chainId: ChainId): Contract[] => {
    return contracts.filter(item => item.address[chainId]);
  },
  getContractByName: (contractName: ContractName): Contract => {
    return contracts.find(item => item.name === contractName) as Contract;
  },
  getContractAddressForChainId: (contract: Contract, chainId: number) => {
    return contract.address[chainId]?.toLowerCase();
  },
  contractHasChainId: (contract: Contract, chainId: ChainId) => {
    return contract.address.hasOwnProperty(chainId);
  },
  getContractAddress: (
    tokenId: ContractName,
    chainId: ChainId = currentChainId(),
  ) => {
    return contractUtils.getContractAddressForChainId(
      contractUtils.getContractByName(tokenId),
      chainId,
    );
  },
};
