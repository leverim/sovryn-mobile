import { tokens } from 'config/tokens';

export type Token = {
  id: string;
  symbol: string;
  name: string;
  address: Record<number, string>;
  decimals: number;
};

export type TokenId = typeof tokens[number]['id'];
