import { ContractName } from 'types/contract';
import { currentChainId, getContractAddress } from 'utils/helpers';
import { useCall } from './useCall';

export function useCallContract<T = string>(
  contractName: ContractName,
  methodAndTypes: string,
  args: any[],
  _default?: T,
) {
  const chainId = currentChainId();
  const to = getContractAddress(contractName, chainId);
  return useCall(chainId, to, methodAndTypes, args, _default);
}
