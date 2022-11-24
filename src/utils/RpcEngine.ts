import { FallbackProvider } from 'utils/libs/fallback-provider';
import { providers } from 'ethers';
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

export const getDefaultProvider = (url: string): providers.BaseProvider => {
  const match = url.match(/^(ws|http)s?:/i);
  if (match) {
    switch (match[1]) {
      case 'http':
        return new providers.StaticJsonRpcProvider(url);
      case 'ws':
        return new providers.WebSocketProvider(url);
    }
  }
  throw new Error('unsupported URL scheme');
};

const cache: Record<number, RpcEngine> = {};

export const getProvider = (chainId: ChainId = 1) => {
  if (!cache.hasOwnProperty(chainId)) {
    cache[chainId] = new RpcEngine(chainId);
  }
  return cache[chainId].provider;
};
