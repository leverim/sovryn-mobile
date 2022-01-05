import { INFURA_API_KEY } from 'env';

export type EvmNetworkAttributes = {
  chainId: number;
  rpc: string[];
  explorer: string[];
  multicallContract: string;
};

export type Network = {
  id: string;
  name: string;
  dPath: string;
  group: NetworkGroup;
  testnet: boolean;
  evm: boolean;
};

export type EvmNetwork = Network & EvmNetworkAttributes;

export type NetworkType = EvmNetwork | Network;

type NetworkGroup = 'btc' | 'eth' | 'rsk' | 'bsc';

export const networks: NetworkType[] = [
  {
    id: 'btc',
    name: 'Bitcoin',
    dPath: "m/44'/0'/0'/0",
    group: 'btc',
    testnet: false,
    evm: false,
  },
  {
    id: 'eth',
    name: 'Ethereum',
    dPath: "m/44'/60'/0'/0",
    group: 'eth',
    testnet: false,
    evm: true,
    chainId: 1,
    rpc: [
      'https://cloudflare-eth.com',
      `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
    ],
    explorer: ['https://etherscan.io'],
    multicallContract: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
  },
  {
    id: 'bsc',
    name: 'Binance Smart Chain',
    dPath: "m/44'/60'/0'/0",
    group: 'bsc',
    testnet: false,
    evm: true,
    chainId: 56,
    rpc: [
      'https://bsc-dataseed.binance.org',
      'https://bsc-dataseed1.defibit.io',
      'https://bsc-dataseed1.ninicoin.io',
      'https://bsc-dataseed2.defibit.io',
      'https://bsc-dataseed3.defibit.io',
      'https://bsc-dataseed4.defibit.io',
      'https://bsc-dataseed2.ninicoin.io',
      'https://bsc-dataseed3.ninicoin.io',
      'https://bsc-dataseed4.ninicoin.io',
      'https://bsc-dataseed1.binance.org',
      'https://bsc-dataseed2.binance.org',
      'https://bsc-dataseed3.binance.org',
      'https://bsc-dataseed4.binance.org',
    ],
    explorer: ['https://bscscan.io'],
    multicallContract: '0x41263cba59eb80dc200f3e2544eda4ed6a90e76c',
  },
  {
    id: 'rsk',
    name: 'RSK',
    dPath: "m/44'/60'/0'/0",
    // dPath: "m/44'/137'/0'/0",
    group: 'rsk',
    testnet: false,
    evm: true,
    chainId: 30,
    rpc: ['https://public-node.rsk.co', 'https://mainnet.sovryn.app/rpc'],
    explorer: ['https://explorer.rsk.co'],
    multicallContract: '0x6c62bf5440de2cb157205b15c424bceb5c3368f5',
  },
  {
    id: 'rsk-testnet',
    name: 'RSK Smart tBitcoin',
    dPath: "m/44'/60'/0'/0",
    // dPath: "m/44'/37310'/0'/0",
    group: 'rsk',
    testnet: true,
    evm: true,
    chainId: 31,
    rpc: [
      'https://public-node.testnet.rsk.co',
      'https://testnet.sovryn.app/rpc',
    ],
    explorer: ['https://explorer.testnet.rsk.co'],
    multicallContract: '0x9e469e1fc7fb4c5d17897b68eaf1afc9df39f103',
  },
];

export function getNetworks() {
  return networks;
}

export function getEvmNetworks(): EvmNetwork[] {
  return networks.filter(item => item.evm) as EvmNetwork[];
}
