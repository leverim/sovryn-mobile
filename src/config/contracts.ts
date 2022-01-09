import { Contract } from 'types/contract';

function checkContracts<S extends string>(arr: (Contract & { name: S })[]) {
  return arr;
}

export const contracts = checkContracts([
  {
    name: 'sovrynProtocol',
    address: {
      31: '0x25380305f223B32FDB844152abD2E82BC5Ad99c3',
    },
  },
  {
    name: 'vestingRegistry',
    address: {
      30: '0xe24ABdB7DcaB57F3cbe4cBDDd850D52F143eE920',
      31: '0x09e8659B6d204C6b1bED2BFF8E3F43F834A5Bbc4',
    },
  },
  {
    name: 'priceFeeds',
    address: {
      31: '0x7f38c422b99075f63C9c919ECD200DF8d2Cf5BD4',
    },
  },
  {
    name: 'protocolSettings',
    address: {
      31: '0xa29CCeD858D46a0F91CC48646fa849D47eC96090',
    },
  },
  {
    name: 'rbtcWrapper',
    address: {
      31: '0x6b1a4735b1E25ccE9406B2d5D7417cE53d1cf90e',
    },
  },
  {
    name: 'swapNetwork',
    address: {
      31: '0x61172B53423E205a399640e5283e51FE60EC2256',
    },
  },
]);
