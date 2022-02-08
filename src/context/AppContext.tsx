import { passcode } from 'controllers/PassCodeController';
import React, { useEffect, useMemo } from 'react';
import { set } from 'lodash';
import { ChainId } from 'types/network';
import { TokenId } from 'types/token';
import { accounts, AccountType, BaseAccount } from 'utils/accounts';
import { cache } from 'utils/cache';
import {
  DEFAULT_DERIVATION_PATH,
  STORAGE_IS_TESTNET,
  USD_TOKEN,
} from 'utils/constants';
import { LoanTokenInfo } from 'utils/interactions/loan-token';
import { getCachedBalances, getCachedPrices } from 'utils/interactions/price';
import { getNetworks } from 'utils/network-utils';
import { settings } from 'utils/settings';
import { clearStorage } from 'utils/storage';
import { wallet } from 'utils/wallet';

// prices[chainId][tokenId] = price;
type Prices = Partial<Record<ChainId, Record<TokenId, string>>>;
// balances[chainId][address][tokenId] = balance;
type Balances = Partial<
  Record<ChainId, Record<string, Record<TokenId, string>>>
>;
// loanPools[chainId][address][tokenId] = info;
export type LoanPools = Partial<
  Record<ChainId, Record<string, Record<TokenId, LoanTokenInfo>>>
>;

type AppContextState = {
  accountList: BaseAccount[];
  accountSelected: number;
  address: string | null;
  loading: boolean;
  prices: Prices;
  balances: Balances;
  loanPools: LoanPools;
  isTestnet: boolean;
};

type AppContextActions = {
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  createWallet: (
    name: string,
    type: AccountType,
    secret: string,
    password: string,
  ) => Promise<void>;
  setAccountList: (accounts: BaseAccount[]) => void;
  setActiveAccount: (index: number) => void;
  setPrices: (chainId: ChainId, prices: Record<TokenId, string>) => void;
  setBalances: (
    chainId: ChainId,
    address: string,
    balances: Record<TokenId, string>,
  ) => void;
  setLoanPools: (
    chainId: ChainId,
    address: string,
    loanPools: Record<TokenId, LoanTokenInfo>,
  ) => void;
  setNetwork: (isTestnet: boolean) => void;
};

type AppContextType = AppContextState & AppContextActions;

export enum APP_ACTION {
  SIGN_IN,
  SIGN_OUT,
  SET_ACCOUNT_LIST,
  SET_ACCOUNT,
  SET_PRICES,
  SET_BALANCES,
  SET_LOAN_POOLS,
  INIT_PRICES,
  INIT_BALANCES,
  INIT_NETWORK,
  SET_NETWORK,
}

type Action =
  | { type: APP_ACTION.SIGN_IN; value: string | null }
  | { type: APP_ACTION.SIGN_OUT }
  | { type: APP_ACTION.SET_ACCOUNT_LIST; value: BaseAccount[] }
  | { type: APP_ACTION.SET_ACCOUNT; value: number }
  | {
      type: APP_ACTION.SET_PRICES;
      value: { chainId: ChainId; prices: Record<TokenId, string> };
    }
  | {
      type: APP_ACTION.SET_BALANCES;
      value: {
        chainId: ChainId;
        address: string;
        balances: Record<TokenId, string>;
      };
    }
  | {
      type: APP_ACTION.SET_LOAN_POOLS;
      value: {
        chainId: ChainId;
        address: string;
        loanPools: Record<TokenId, LoanTokenInfo>;
      };
    }
  | {
      type: APP_ACTION.SET_NETWORK;
      value: boolean;
    }
  | {
      type: APP_ACTION.INIT_PRICES;
      value: Prices;
    }
  | {
      type: APP_ACTION.INIT_BALANCES;
      value: Balances;
    }
  | {
      type: APP_ACTION.INIT_NETWORK;
      value: boolean;
    };

export const AppContext = React.createContext<AppContextType>({
  accountList: [],
  accountSelected: 0,
  address: null,
  loading: true,
  isTestnet: false,
  prices: {} as Prices,
  balances: {} as Balances,
} as unknown as AppContextType);

export const AppProvider: React.FC = ({ children }) => {
  const [state, dispatch] = React.useReducer(
    (prevState: AppContextState, action: Action) => {
      switch (action.type) {
        case APP_ACTION.SIGN_IN:
          return {
            ...prevState,
            address: action.value,
            loading: false,
          };
        case APP_ACTION.SIGN_OUT:
          return {
            ...prevState,
            address: null,
            loading: false,
          };
        case APP_ACTION.SET_ACCOUNT_LIST:
          return {
            ...prevState,
            accountList: action.value,
          };
        case APP_ACTION.SET_ACCOUNT:
          return {
            ...prevState,
            accountSelected: action.value,
          };
        case APP_ACTION.SET_PRICES:
          return {
            ...prevState,
            prices: set(
              prevState.prices,
              [action.value.chainId],
              action.value.prices,
            ),
          };
        case APP_ACTION.SET_BALANCES:
          return {
            ...prevState,
            balances: set(
              prevState.balances,
              [action.value.chainId, action.value.address],
              action.value.balances,
            ),
          };
        case APP_ACTION.SET_LOAN_POOLS:
          return {
            ...prevState,
            loanPools: set(
              prevState.loanPools,
              [action.value.chainId, action.value.address],
              action.value.loanPools,
            ),
          };
        case APP_ACTION.INIT_PRICES:
          return { ...prevState, prices: action.value };
        case APP_ACTION.INIT_BALANCES:
          return { ...prevState, balances: action.value };
        case APP_ACTION.INIT_NETWORK:
          cache.set(STORAGE_IS_TESTNET, action.value ? '1' : '0');
          return { ...prevState, isTestnet: action.value };
        case APP_ACTION.SET_NETWORK:
          cache.set(STORAGE_IS_TESTNET, action.value ? '1' : '0');
          return { ...prevState, isTestnet: action.value };
      }
    },
    {
      accountList: [],
      accountSelected: 0,
      address: null,
      loading: true,
      isTestnet: false,
      prices: {} as Prices,
      balances: {} as Balances,
      loanPools: {} as LoanPools,
    },
  );

  const actions: AppContextActions = React.useMemo(
    () => ({
      signIn: async () => {
        dispatch({ type: APP_ACTION.SIGN_IN, value: wallet.address || null });
      },
      createWallet: async (
        name: string,
        type: AccountType,
        secret: string,
        password: string,
      ) => {
        await accounts.create(name, type, password, {
          secret,
          dPath: DEFAULT_DERIVATION_PATH,
          index: 0,
        });
        dispatch({ type: APP_ACTION.SIGN_IN, value: wallet.address || null });
      },
      setAccountList: (items: BaseAccount[]) => {
        dispatch({ type: APP_ACTION.SET_ACCOUNT_LIST, value: items });
      },
      setActiveAccount: (index: number) => {
        dispatch({ type: APP_ACTION.SET_ACCOUNT, value: index });
      },
      signOut: async () => {
        // todo disable function if it's not development build.
        await accounts.delete();
        await clearStorage();
        passcode.resetPassword();
        dispatch({ type: APP_ACTION.SIGN_OUT });
      },
      setPrices: (chainId: ChainId, prices: Record<TokenId, string>) => {
        dispatch({ type: APP_ACTION.SET_PRICES, value: { chainId, prices } });
      },
      setBalances: (
        chainId: ChainId,
        address: string,
        balances: Record<TokenId, string>,
      ) => {
        dispatch({
          type: APP_ACTION.SET_BALANCES,
          value: { chainId, address, balances },
        });
      },
      setLoanPools: (
        chainId: ChainId,
        address: string,
        loanPools: Record<TokenId, LoanTokenInfo>,
      ) => {
        dispatch({
          type: APP_ACTION.SET_LOAN_POOLS,
          value: { chainId, address, loanPools },
        });
      },
      setNetwork: (isTestnet: boolean) =>
        dispatch({ type: APP_ACTION.SET_NETWORK, value: isTestnet }),
      initNetwork: (isTestnet: boolean) =>
        dispatch({ type: APP_ACTION.INIT_NETWORK, value: isTestnet }),
    }),
    [],
  );

  useEffect(() => {
    Promise.all([cache.load(), settings.load(), accounts.load()]).finally(
      () => {
        const cachedPrices = getNetworks().reduce((p, c) => {
          p[c.chainId] = getCachedPrices(c.chainId, USD_TOKEN);
          return p;
        }, {} as Prices);

        const cachedBalances = getNetworks().reduce((p, c) => {
          p[c.chainId] = accounts.list.reduce((pa, ca) => {
            pa[ca.address.toLowerCase()] = getCachedBalances(
              c.chainId,
              ca.address.toLowerCase(),
            );
            return pa;
          }, {} as any);
          return p;
        }, {} as Balances);

        dispatch({ type: APP_ACTION.INIT_PRICES, value: cachedPrices });
        dispatch({ type: APP_ACTION.INIT_BALANCES, value: cachedBalances });

        dispatch({
          type: APP_ACTION.INIT_NETWORK,
          value: cache.get(STORAGE_IS_TESTNET) === '1',
        });

        actions.signIn().finally(() => {});
      },
    );
  }, [actions]);

  useEffect(() => {
    accounts.on('loaded', actions.setAccountList);
    accounts.on('selected', actions.setActiveAccount);
    return () => {
      accounts.off('loaded', actions.setAccountList);
      accounts.off('selected', actions.setActiveAccount);
    };
  }, [actions]);

  const value = useMemo(() => ({ ...state, ...actions }), [state, actions]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
