import { getNetworks, NetworkType } from './networks';

export type Asset = {
  id: string;
  symbol: string;
  name: string;
  networkId: string;
  decimals: number;
  icon: string;
  address?: string;
};

export const assets: Asset[] = [
  {
    id: 'btc',
    symbol: 'BTC',
    name: 'Bitcoin',
    networkId: 'btc',
    decimals: 8,
    icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
  },
  {
    id: 'eth',
    symbol: 'ETH',
    name: 'Ethereum',
    networkId: 'eth',
    decimals: 18,
    icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
  },
  {
    id: 'bnb',
    symbol: 'BNB',
    name: 'Binance Coin',
    networkId: 'bsc',
    decimals: 18,
    icon: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.png',
  },
  {
    id: 'rbtc',
    symbol: 'RBTC',
    name: 'Smart Bitcoin',
    networkId: 'rsk',
    decimals: 18,
    icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
  },
  {
    id: 'sov',
    symbol: 'SOV',
    name: 'Sovryn',
    networkId: 'rsk',
    decimals: 18,
    icon: 'assets/tokens/btc.svg',
    address: '0xEFc78fc7d48b64958315949279Ba181c2114ABBd',
  },
  {
    id: 'esov',
    symbol: 'ESOV',
    name: 'Sovryn',
    networkId: 'eth',
    decimals: 18,
    icon: 'assets/tokens/btc.svg',
    address: '0xbdab72602e9ad40fc6a6852caf43258113b8f7a5',
  },
  {
    id: 'tsov',
    symbol: 'SOV',
    name: 'Sovryn Testnet',
    networkId: 'rsk-testnet',
    decimals: 18,
    icon: 'assets/tokens/btc.svg',
    address: '0x6a9A07972D07e58F0daf5122d11E069288A375fb',
  },
];

export function getAssets() {
  return assets;
}

export function getAssetNetwork(assetId: string): NetworkType {
  return getNetworks().find(
    item =>
      item.id === getAssets().find(asset => asset.id === assetId)?.networkId,
  ) as NetworkType;
}
