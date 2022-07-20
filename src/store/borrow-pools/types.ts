import { TokenId } from 'types/asset';
import { ChainId } from 'types/network';
import { BorrowTokenInfo } from 'utils/interactions/loan-token';

export enum BorrowPoolAction {
  INIT_POOLS,
  ADD_POOL_INFO,
}

export type BorrowState = Partial<
  Record<ChainId, Partial<Record<TokenId, BorrowTokenInfo>>>
>;

export type State = {
  pools: BorrowState;
};

export type Action =
  | {
      type: BorrowPoolAction.INIT_POOLS;
      value: BorrowState;
    }
  | {
      type: BorrowPoolAction.ADD_POOL_INFO;
      value: {
        chainId: ChainId;
        loanTokenId: TokenId;
        item: BorrowTokenInfo;
      };
    };
