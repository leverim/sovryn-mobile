import { ethers } from 'ethers';
import type { Token } from 'types/token';

function checkTokens<S extends string>(arr: (Token & { id: S })[]) {
  return arr;
}

export const tokens = checkTokens([
  {
    id: 'rbtc',
    symbol: 'RBTC',
    name: 'Smart Bitcoin',
    address: {
      30: ethers.constants.AddressZero,
      31: ethers.constants.AddressZero,
    },
    decimals: 18,
    icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
    native: true,
  },
  {
    id: 'wrbtc',
    symbol: 'wRBTC',
    name: 'Wrapped Smart Bitcoin',
    address: {
      30: '0x542fDA317318eBF1d3DEAf76E0b632741A7e677d',
    },
    decimals: 18,
    icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
  },
  {
    id: 'bpro',
    symbol: 'BRPO',
    name: 'BPRO',
    address: {
      30: '0x440cd83c160de5c96ddb20246815ea44c7abbca8',
    },
    decimals: 18,
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7605.png',
  },
  {
    id: 'sov',
    symbol: 'SOV',
    name: 'Sovryn',
    address: {
      1: '0xbdab72602e9ad40fc6a6852caf43258113b8f7a5',
      30: '0xEFc78fc7d48b64958315949279Ba181c2114ABBd',
      31: '0x6a9A07972D07e58F0daf5122d11E069288A375fb',
    },
    decimals: 18,
    icon: 'https://assets.coingecko.com/coins/images/16248/small/sov.PNG',
  },
  {
    id: 'rif',
    symbol: 'RIF',
    name: 'RSK Infrastructure Framework',
    address: {
      30: '0x2acc95758f8b5f583470ba265eb685a8f45fc9d5',
    },
    decimals: 18,
    icon: 'https://cryptologos.cc/logos/rsk-infrastructure-framework-rif-logo.png',
  },
  {
    id: 'xusd',
    symbol: 'XUSD',
    name: 'XUSD',
    address: {
      30: '0xb5999795BE0EbB5bAb23144AA5FD6A02D080299F',
    },
    decimals: 18,
    icon: '',
  },
  {
    id: 'rusdt',
    symbol: 'RUSDT',
    name: 'RUSDT',
    address: {
      30: '0xEf213441a85DF4d7acBdAe0Cf78004E1e486BB96',
    },
    decimals: 18,
    icon: '',
  },
  {
    id: 'eths',
    symbol: 'ETHS',
    name: 'Bridged Ethereum',
    address: {
      30: '0x1D931Bf8656d795E50eF6D639562C5bD8Ac2B78f',
    },
    decimals: 18,
    icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
  },
  {
    id: 'bnbs',
    symbol: 'BNBS',
    name: 'Bridged Binance Coin',
    address: {
      30: '0x6D9659bdF5b1A1dA217f7BbAf7dBAF8190E2e71B',
    },
    decimals: 18,
    icon: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.png',
  },
  {
    id: 'fish',
    symbol: 'FISH',
    name: 'BabelFish',
    address: {
      30: '0x055A902303746382FBB7D18f6aE0df56eFDc5213',
    },
    decimals: 18,
    icon: '',
  },
  {
    id: 'mynt',
    symbol: 'MYNT',
    name: 'Mynt',
    address: {
      30: '0x2e6B1d146064613E8f521Eb3c6e65070af964EbB',
    },
    decimals: 18,
    icon: '',
  },
  {
    id: 'doc',
    symbol: 'DOC',
    name: 'Dollar On Chain',
    address: {
      30: '0xe700691da7b9851f2f35f8b8182c69c53ccad9db',
    },
    decimals: 18,
    icon: '',
  },
  {
    id: 'rdoc',
    symbol: 'RDOC',
    name: 'RIF Dollar On Chain',
    address: {
      30: '0x2d919f19D4892381d58EdEbEcA66D5642ceF1A1F',
    },
    decimals: 18,
    icon: '',
  },
  {
    id: 'moc',
    symbol: 'MOC',
    name: 'Money On Chain',
    address: {
      30: '0x9aC7Fe28967b30e3a4E6E03286D715B42B453d10',
    },
    decimals: 18,
    icon: '',
  },
]);
