import React, { useMemo } from 'react';
import { set } from 'lodash';
import { ChainId } from 'types/network';
import { PriceOracleResult } from 'controllers/price-oracles/price-oracle-interface';

// prices[chainId][oracleData[]] = balance;
export type Prices = Partial<Record<ChainId, PriceOracleResult[]>>;

type UsdPriceContextState = {
  prices: Prices;
  loading: boolean;
  loaded: boolean;
};

type UsdPriceContextActions = {
  execute: (value?: boolean) => void;
  initPrices: (prices: Prices) => void;
  setPrices: (chainId: ChainId, prices: PriceOracleResult[]) => void;
};

type UsdPriceContextType = UsdPriceContextState & UsdPriceContextActions;

export enum PRICE_ACTION {
  EXECUTE,
  INIT_PRICES,
  SET_PRICES,
}

type Action =
  | {
      type: PRICE_ACTION.EXECUTE;
      value: boolean;
    }
  | {
      type: PRICE_ACTION.INIT_PRICES;
      value: Prices;
    }
  | {
      type: PRICE_ACTION.SET_PRICES;
      value: {
        chainId: ChainId;
        prices: PriceOracleResult[];
      };
    };

export const UsdPriceContext = React.createContext<UsdPriceContextType>({
  prices: {} as Prices,
  loading: false,
} as unknown as UsdPriceContextType);

export const UsdPriceProvider: React.FC = ({ children }) => {
  const [state, dispatch] = React.useReducer(
    (prevState: UsdPriceContextState, action: Action) => {
      switch (action.type) {
        case PRICE_ACTION.EXECUTE:
          return {
            ...prevState,
            loading: true,
            loaded: action.value ? false : prevState.loaded,
          };
        case PRICE_ACTION.SET_PRICES:
          return {
            ...prevState,
            prices: set(
              prevState.prices,
              [action.value.chainId],
              action.value.prices,
            ),
            loading: false,
            loaded: true,
          };
        case PRICE_ACTION.INIT_PRICES:
          return { ...prevState, prices: action.value, loading: false };
      }
    },
    {
      prices: {} as Prices,
      loading: true,
      loaded: false,
    },
  );

  const actions: UsdPriceContextActions = React.useMemo(
    () => ({
      execute: (showIndicator: boolean = false) => {
        dispatch({
          type: PRICE_ACTION.EXECUTE,
          value: showIndicator,
        });
      },
      initPrices: (balances: Prices) => {
        dispatch({
          type: PRICE_ACTION.INIT_PRICES,
          value: balances,
        });
      },
      setPrices: (chainId: ChainId, prices: PriceOracleResult[]) => {
        dispatch({
          type: PRICE_ACTION.SET_PRICES,
          value: { chainId, prices },
        });
      },
    }),
    [],
  );

  const value = useMemo(() => ({ ...state, ...actions }), [state, actions]);

  return (
    <UsdPriceContext.Provider value={value}>
      {children}
    </UsdPriceContext.Provider>
  );
};
