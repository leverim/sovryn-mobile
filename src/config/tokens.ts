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
    id: 'eth',
    symbol: 'ETH',
    name: 'Ethereum',
    address: {
      1: ethers.constants.AddressZero,
    },
    decimals: 18,
    icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    native: true,
  },
  {
    id: 'bnb',
    symbol: 'BNB',
    name: 'Binance Coin',
    address: {
      1: ethers.constants.AddressZero,
    },
    decimals: 18,
    icon: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.png',
    native: true,
  },
  {
    id: 'wrbtc',
    symbol: 'wRBTC',
    name: 'Wrapped Smart Bitcoin',
    address: {
      30: '0x542fDA317318eBF1d3DEAf76E0b632741A7e677d',
      31: '0x69FE5cEC81D5eF92600c1A0dB1F11986AB3758Ab',
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
      31: '0x4dA7997A819bb46B6758b9102234c289Dd2ad3bf',
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
      31: '0x19f64674d8a5b4e652319f5e239efd3bc969a1fe',
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
      31: '0x74858FE37d391f81F89472e1D8BC8Ef9CF67B3b1',
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
      31: '0x4D5a316D23eBE168d8f887b4447bf8DbFA4901CC',
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
      31: '0x0Fd0d8D78Ce9299Ee0e5676a8d51F938C234162c',
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
      31: '0x801F223Def9A4e3a543eAcCEFB79dCE981Fa2Fb5',
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
      31: '0xaa7038D80521351F243168FefE0352194e3f83C3',
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
      31: '0x139483e22575826183F5b56dd242f8f2C1AEf327',
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
      31: '0xCB46c0ddc60D18eFEB0E586C17Af6ea36452Dae0',
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
      31: '0xc3de9f38581f83e281f260d0ddbaac0e102ff9f8',
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
      31: '0x45a97b54021a3f99827641afe1bfae574431e6ab',
    },
    decimals: 18,
    icon: '',
  },
]);
