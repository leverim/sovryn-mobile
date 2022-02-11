import { FallbackProvider } from '@ethersproject/providers';
import { getDefaultProvider, providers } from 'ethers';
import type { ChainId, Network } from 'types/network';
import { getNetworks } from 'utils/network-utils';

export class RpcEngine {
  public readonly provider: providers.BaseProvider;
  constructor(chainId: ChainId) {
    const network = getNetworks().find(
      item => item.chainId === chainId,
    ) as Network;
    this.provider = new FallbackProvider(
      network.rpc.map(url => getDefaultProvider(url)),
      1,
    );
  }
}

const cache: Record<number, RpcEngine> = {};

export const getProvider = (chainId: ChainId = 1) => {
  if (!cache.hasOwnProperty(chainId)) {
    cache[chainId] = new RpcEngine(chainId);
  }
  return cache[chainId].provider;
};
