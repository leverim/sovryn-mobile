import type { Network } from 'types/network';
import { INFURA_API_KEY } from 'env';

function checkNetworks<S extends string, R extends number>(
  arr: (Network & { id: S } & { chainId: R })[],
) {
  return arr;
}

export const networks = checkNetworks([
  {
    id: 'eth',
    chainId: 1,
    name: 'Ethereum',
    rpc: [
      'https://cloudflare-eth.com',
      `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
    ],
    explorer: ['https://etherscan.io'],
    multicallContract: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
  },
  {
    id: 'rsk',
    chainId: 30,
    name: 'RootStock',
    rpc: ['https://public-node.rsk.co', 'https://mainnet.sovryn.app/rpc'],
    explorer: ['https://explorer.rsk.co'],
    multicallContract: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
  },
  {
    id: 'trsk',
    chainId: 31,
    name: 'RootStock Testnet',
    rpc: [
      'https://public-node.testnet.rsk.co',
      'https://testnet.sovryn.app/rpc',
    ],
    explorer: ['https://explorer.testnet.rsk.co'],
    multicallContract: '0x9e469e1fc7fb4c5d17897b68eaf1afc9df39f103',
    isTestnet: true,
  },
  {
    id: 'bsc',
    name: 'Binance Smart Chain',
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
]);
