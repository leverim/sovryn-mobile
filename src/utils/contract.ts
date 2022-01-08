import { contracts } from 'config/contracts';
import type { ContractName, Contract } from 'types/contract';

// todo rename
export const contractUtils = {
  listContracts: (): Contract[] => {
    return contracts;
  },
  listContractsForChainId: (chainId: number): Contract[] => {
    return contracts.filter(item => item.address[chainId]);
  },
  getContractByName: (contractName: ContractName): Contract => {
    return contracts.find(item => item.name === contractName) as Contract;
  },
  getContractAddressForChainId: (contract: Contract, chainId: number) => {
    return contract.address[chainId]?.toLowerCase();
  },
  contractHasChainId: (contract: Contract, chainId: number) => {
    return contract.address.hasOwnProperty(chainId);
  },
};
