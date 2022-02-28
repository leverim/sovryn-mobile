import type { Network } from 'types/network';

function checkNetworks<S extends string, R extends number>(
  arr: (Network & { id: S } & { chainId: R })[],
) {
  return arr;
}

export const networks = checkNetworks([
  {
    id: 'eth',
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpc: [
      'https://cloudflare-eth.com',
      'https://api.mycryptoapi.com/eth',
      // `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
    ],
    explorer: ['https://etherscan.io'],
    multicallContract: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
    multicallSupportsTry: true,
  },
  {
    id: 'rsk',
    chainId: 30,
    name: 'RSK',
    rpc: ['https://mainnet.sovryn.app/rpc', 'https://public-node.rsk.co'],
    explorer: ['https://explorer.rsk.co'],
    multicallContract: '0x6c62bf5440de2cb157205b15c424bceb5c3368f5',
  },
  {
    id: 'trsk',
    chainId: 31,
    name: 'RSK Testnet',
    rpc: [
      // `https://rsk.getblock.io/testnet/?api_key=${GETBLOCK_API_KEY}`,
      'https://testnet.sovryn.app/rpc',
      'https://public-node.testnet.rsk.co',
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
      // 'https://bsc-dataseed1.defibit.io',
      // 'https://bsc-dataseed1.ninicoin.io',
    ],
    explorer: ['https://bscscan.io'],
    multicallContract: '0x41263cba59eb80dc200f3e2544eda4ed6a90e76c',
    multicallSupportsTry: false,
  },
  {
    id: 'tbsc',
    name: 'Binance Smart Testnet',
    chainId: 97,
    rpc: [
      'https://data-seed-prebsc-1-s1.binance.org:8545',
      // 'https://data-seed-prebsc-2-s1.binance.org:8545',
      // 'https://data-seed-prebsc-1-s2.binance.org:8545',
      // 'https://data-seed-prebsc-2-s2.binance.org:8545',
    ],
    explorer: ['https://testnet.bscscan.io'],
    multicallContract: '0xae11c5b5f29a6a25e955f0cb8ddcc416f522af5c',
    isTestnet: true,
  },
]);
