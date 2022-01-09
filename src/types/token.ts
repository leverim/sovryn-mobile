import { tokens } from 'config/tokens';
import { ChainId } from './network';

export type Token = {
  id: string;
  symbol: string;
  name: string;
  address: Partial<Record<ChainId, string>>;
  decimals: number;
  icon: string;
  native?: boolean;
};

export type TokenId = typeof tokens[number]['id'];
