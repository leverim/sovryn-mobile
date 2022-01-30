import { Contract } from 'types/contract';

function checkContracts<S extends string>(arr: (Contract & { name: S })[]) {
  return arr;
}

export const contracts = checkContracts([
  {
    name: 'sovrynProtocol',
    address: {
      30: '0x5A0D867e0D70Fcc6Ade25C3F1B89d618b5B4Eaa7',
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
      30: '0x437AC62769f386b2d238409B7f0a7596d36506e4',
      31: '0x7f38c422b99075f63C9c919ECD200DF8d2Cf5BD4',
    },
  },
  {
    name: 'rbtcWrapper',
    address: {
      30: '0xa917BF723433d020a15629eba71f6C2a6B38e52d',
      31: '0x6b1a4735b1e25cce9406b2d5d7417ce53d1cf90e',
    },
  },
  {
    name: 'swapNetwork',
    address: {
      30: '0x98aCE08D2b759a265ae326F010496bcD63C15afc',
      31: '0x61172B53423E205a399640e5283e51FE60EC2256',
    },
  },
]);
