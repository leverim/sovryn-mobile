import { contracts } from 'config/contracts';

export type Contract = {
  name: string;
  address: Record<number, string>;
};

export type ContractName = typeof contracts[number]['name'];
