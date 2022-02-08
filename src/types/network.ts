import { networks } from 'config/networks';

export type Network = {
  id: string;
  chainId: number;
  name: string;
  rpc: string[];
  explorer: string[];
  multicallContract: string;
  multicallSupportsTry?: boolean;
  isTestnet?: boolean;
};

export type NetworkId = typeof networks[number]['id'];
export type ChainId = typeof networks[number]['chainId'];
