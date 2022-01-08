import { providers } from 'ethers';
import { EvmNetwork, getNetworks, Network } from 'utils/networks';

export class RpcEngine {
  public readonly provider: providers.JsonRpcProvider;
  constructor(chainId: number) {
    const network = getNetworks().find(
      item => item.evm && item.chainId === chainId,
    ) as Network & { evm: true } & EvmNetwork;
    this.provider = new providers.JsonRpcProvider(network.rpc[0], chainId);
  }
}

const cache: Record<number, RpcEngine> = {};

export const getProvider = (chainId: number = 1) => {
  if (!cache.hasOwnProperty(chainId)) {
    cache[chainId] = new RpcEngine(chainId);
  }
  return cache[chainId].provider;
};
