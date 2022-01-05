export type ContractType = {
  name: string;
  address: string;
  networkId: string;
};

export const contracts: ContractType[] = [
  {
    name: 'sovrynProtocol',
    address: '0x25380305f223B32FDB844152abD2E82BC5Ad99c3',
    networkId: 'trsk',
  },
  {
    name: 'priceFeeds',
    address: '0x7f38c422b99075f63C9c919ECD200DF8d2Cf5BD4',
    networkId: 'trsk',
  },
  {
    name: 'protocolSettings',
    address: '0xa29CCeD858D46a0F91CC48646fa849D47eC96090',
    networkId: 'trsk',
  },
];
