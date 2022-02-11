import React, { useMemo } from 'react';
import { set } from 'lodash';
import { ChainId } from 'types/network';
import { TokenId } from 'types/asset';

// balances[chainId][address][tokenId] = balance;
type Balances = Partial<
  Record<ChainId, Record<string, Record<TokenId, string>>>
>;

type BalanceContextState = {
  balances: Balances;
  loading: boolean;
};

type BalanceContextActions = {
  execute: () => void;
  initBalances: (balances: Balances) => void;
  setBalances: (
    chainId: ChainId,
    owner: string,
    balances: Record<TokenId, string>,
  ) => void;
  setBalance: (
    chainId: ChainId,
    owner: string,
    tokenId: TokenId,
    value: string,
  ) => void;
};

type BalanceContextType = BalanceContextState & BalanceContextActions;

export enum BALANCE_ACTION {
  EXECUTE,
  INIT_BALANCES,
  SET_BALANCES,
  SET_BALANCE,
}

type Action =
  | {
      type: BALANCE_ACTION.EXECUTE;
    }
  | {
      type: BALANCE_ACTION.INIT_BALANCES;
      value: Balances;
    }
  | {
      type: BALANCE_ACTION.SET_BALANCES;
      value: {
        chainId: ChainId;
        owner: string;
        balances: Record<TokenId, string>;
      };
    }
  | {
      type: BALANCE_ACTION.SET_BALANCE;
      value: {
        chainId: ChainId;
        owner: string;
        tokenId: TokenId;
        value: string;
      };
    };

export const BalanceContext = React.createContext<BalanceContextType>({
  balances: {} as Balances,
  loading: false,
} as unknown as BalanceContextType);

export const BalanceProvider: React.FC = ({ children }) => {
  const [state, dispatch] = React.useReducer(
    (prevState: BalanceContextState, action: Action) => {
      switch (action.type) {
        case BALANCE_ACTION.EXECUTE:
          return {
            ...prevState,
            loading: true,
          };
        case BALANCE_ACTION.SET_BALANCES:
          return {
            ...prevState,
            balances: set(
              prevState.balances,
              [action.value.chainId, action.value.owner],
              action.value.balances,
            ),
            loading: false,
          };
        case BALANCE_ACTION.SET_BALANCE:
          return {
            ...prevState,
            balances: set(
              prevState.balances,
              [action.value.chainId, action.value.owner, action.value.tokenId],
              action.value.value,
            ),
            loading: false,
          };
        case BALANCE_ACTION.INIT_BALANCES:
          return { ...prevState, balances: action.value, loading: false };
      }
    },
    {
      balances: {} as Balances,
      loading: true,
    },
  );

  const actions: BalanceContextActions = React.useMemo(
    () => ({
      execute: () => {
        dispatch({
          type: BALANCE_ACTION.EXECUTE,
        });
      },
      initBalances: (balances: Balances) => {
        dispatch({
          type: BALANCE_ACTION.INIT_BALANCES,
          value: balances,
        });
      },
      setBalances: (
        chainId: ChainId,
        owner: string,
        balances: Record<TokenId, string>,
      ) => {
        dispatch({
          type: BALANCE_ACTION.SET_BALANCES,
          value: { chainId, owner, balances },
        });
      },
      setBalance: (
        chainId: ChainId,
        owner: string,
        tokenId: TokenId,
        value: string,
      ) => {
        dispatch({
          type: BALANCE_ACTION.SET_BALANCE,
          value: { chainId, owner, tokenId, value },
        });
      },
    }),
    [],
  );

  const value = useMemo(() => ({ ...state, ...actions }), [state, actions]);

  return (
    <BalanceContext.Provider value={value}>{children}</BalanceContext.Provider>
  );
};
