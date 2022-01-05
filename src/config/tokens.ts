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
  },
]);
