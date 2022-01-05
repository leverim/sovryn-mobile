import { EventEmitter } from 'events';
import { NetworkType } from './networks';
import { getItem, storeItem } from './storage';

export type Asset = {
  id: string;
  symbol: string;
  name: string;
  networkId: string;
  decimals: number;
  icon: string;
  address?: string;
  testnet?: boolean;
};

const defaultAssets: Asset[] = [
  // {
  //   id: 'btc',
  //   symbol: 'BTC',
  //   name: 'Bitcoin',
  //   networkId: 'btc',
  //   decimals: 8,
  //   icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
  // },
  // {
  //   id: 'eth',
  //   symbol: 'ETH',
  //   name: 'Ethereum',
  //   networkId: 'eth',
  //   decimals: 18,
  //   icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
  // },
  // {
  //   id: 'bnb',
  //   symbol: 'BNB',
  //   name: 'Binance Coin',
  //   networkId: 'bsc',
  //   decimals: 18,
  //   icon: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.png',
  // },
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
  // {
  //   id: 'esov',
  //   symbol: 'ESOV',
  //   name: 'Sovryn',
  //   networkId: 'eth',
  //   decimals: 18,
  //   icon: 'assets/tokens/btc.svg',
  //   address: '0xbdab72602e9ad40fc6a6852caf43258113b8f7a5',
  // },
  {
    id: 'tsov',
    symbol: 'SOV',
    name: 'Sovryn Testnet',
    networkId: 'rsk-testnet',
    decimals: 18,
    icon: 'assets/tokens/btc.svg',
    address: '0x6a9A07972D07e58F0daf5122d11E069288A375fb',
    testnet: true,
  },
];

class AssetManager extends EventEmitter {
  private _items: Asset[] = defaultAssets;
  constructor() {
    super();
  }
  public get items() {
    return this._items;
  }
  public async set(asset: Asset) {
    const current = this._items.findIndex(item => item.id === asset.id);
    if (current !== -1) {
      this._items[current] = asset;
    } else {
      this._items.push(asset);
    }
    await this.save();
    this.onUpdated();
  }
  public get(key: string) {
    return this._items.find(item => item.id === key) as Asset;
  }
  public async load() {
    this._items = await getItem('token_list').then(response => {
      try {
        return JSON.parse(response || JSON.stringify(defaultAssets));
      } catch (error) {
        return [];
      }
    });
    this.onUpdated();
  }
  protected async save() {
    await storeItem('token_list', JSON.stringify(this._items));
  }
  protected async onUpdated() {
    this.emit('updated', this._items);
  }
}

export const assets = new AssetManager();

export function getAssetNetwork(assetId: string): NetworkType {
  return assets.items.find(item => item.id === assets.get(assetId).id)
    ?.networkId as unknown as NetworkType;
}
