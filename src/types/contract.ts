import { contracts } from 'config/contracts';
import { ChainId } from './network';

export type Contract = {
  name: string;
  address: Partial<Record<ChainId, string>>;
};

export type ContractName = typeof contracts[number]['name'];
