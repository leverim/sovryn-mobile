import React, { useContext, useEffect, useMemo } from 'react';
import { set } from 'lodash';
import NetInfo, {
  NetInfoState,
  NetInfoStateType,
} from '@react-native-community/netinfo';
import { passcode } from 'controllers/PassCodeController';
import { ChainId } from 'types/network';
import { TokenId } from 'types/asset';
import { accounts, AccountType, BaseAccount } from 'utils/accounts';
import { cache } from 'utils/cache';
import { DEFAULT_DERIVATION_PATH, STORAGE_IS_TESTNET } from 'utils/constants';
import { LoanTokenInfo } from 'utils/interactions/loan-token';
import { getCachedBalances } from 'utils/interactions/price';
import { getNetworks } from 'utils/network-utils';
import { settings } from 'utils/settings';
import { clearStorage } from 'utils/storage';
import { wallet } from 'utils/wallet';
import { BalanceContext } from './BalanceContext';
import { UsdPriceContext } from './UsdPriceContext';
import { enabledChainIds, setEnabledChainIds } from 'utils/helpers';
import Logger from 'utils/Logger';

// loanPools[chainId][address][tokenId] = info;
export type LoanPools = Partial<
  Record<ChainId, Record<string, Record<TokenId, LoanTokenInfo>>>
>;

type AppContextState = {
  accountList: BaseAccount[];
  accountSelected: number;
  address: string | null;
  loading: boolean;
  loanPools: LoanPools;
  isTestnet: boolean;
  connectionType: NetInfoStateType;
  isConnected: boolean | null;
  chainIds: ChainId[];
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
  setLoanPools: (
    chainId: ChainId,
    address: string,
    loanPools: Record<TokenId, LoanTokenInfo>,
  ) => void;
  setNetwork: (isTestnet: boolean) => void;
  setChainIds: (chainIds: ChainId[]) => void;
};

type AppContextType = AppContextState & AppContextActions;

export enum APP_ACTION {
  SIGN_IN,
  SIGN_OUT,
  SET_ACCOUNT_LIST,
  SET_ACCOUNT,
  SET_LOAN_POOLS,
  INIT_NETWORK,
  SET_NETWORK,
  SET_CONNECTION_TYPE,
  SET_CHAIN_IDS,
}

type Action =
  | { type: APP_ACTION.SIGN_IN; value: string | null }
  | { type: APP_ACTION.SIGN_OUT }
  | { type: APP_ACTION.SET_ACCOUNT_LIST; value: BaseAccount[] }
  | { type: APP_ACTION.SET_ACCOUNT; value: number }
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
      type: APP_ACTION.INIT_NETWORK;
      value: boolean;
    }
  | { type: APP_ACTION.SET_CONNECTION_TYPE; value: NetInfoState }
  | { type: APP_ACTION.SET_CHAIN_IDS; value: ChainId[] };

export const AppContext = React.createContext<AppContextType>({
  accountList: [],
  accountSelected: 0,
  address: null,
  loading: true,
  isTestnet: false,
} as unknown as AppContextType);

export const AppProvider: React.FC = ({ children }) => {
  const { initBalances } = useContext(BalanceContext);
  const { initPrices } = useContext(UsdPriceContext);

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
        case APP_ACTION.SET_LOAN_POOLS:
          return {
            ...prevState,
            loanPools: set(
              prevState.loanPools,
              [action.value.chainId, action.value.address],
              action.value.loanPools,
            ),
          };
        case APP_ACTION.INIT_NETWORK:
          cache.set(STORAGE_IS_TESTNET, action.value ? '1' : '0');
          return { ...prevState, isTestnet: action.value };
        case APP_ACTION.SET_NETWORK:
          cache.set(STORAGE_IS_TESTNET, action.value ? '1' : '0');
          return { ...prevState, isTestnet: action.value };
        case APP_ACTION.SET_CONNECTION_TYPE:
          return {
            ...prevState,
            connectionType: action.value.type,
            isConnected: action.value.isConnected,
          };
        case APP_ACTION.SET_CHAIN_IDS:
          setEnabledChainIds(action.value).catch(Logger.error);
          return {
            ...prevState,
            chainIds: action.value,
          };
      }
    },
    {
      accountList: [],
      accountSelected: 0,
      address: null,
      loading: true,
      isTestnet: false,
      connectionType: NetInfoStateType.unknown,
      isConnected: false,
      loanPools: {} as LoanPools,
      chainIds: [],
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
      setChainIds: (chainIds: ChainId[]) =>
        dispatch({ type: APP_ACTION.SET_CHAIN_IDS, value: chainIds }),
    }),
    [],
  );

  useEffect(() => {
    Promise.all([cache.load(), settings.load(), accounts.load()]).finally(
      () => {
        dispatch({
          type: APP_ACTION.SET_CHAIN_IDS,
          value: enabledChainIds(),
        });

        const cachedBalances = getNetworks().reduce((p, c) => {
          p[c.chainId] = accounts.list.reduce((pa, ca) => {
            pa[ca.address.toLowerCase()] = getCachedBalances(
              c.chainId,
              ca.address.toLowerCase(),
            );
            return pa;
          }, {} as any);
          return p;
        }, {} as any);

        initPrices(cache.get('prices', {}));
        initBalances(cachedBalances);

        dispatch({
          type: APP_ACTION.INIT_NETWORK,
          value: cache.get(STORAGE_IS_TESTNET) === '1',
        });

        actions.signIn().finally(() => {});
      },
    );
  }, [actions, initBalances, initPrices]);

  useEffect(() => {
    accounts.on('loaded', actions.setAccountList);
    accounts.on('selected', actions.setActiveAccount);
    return () => {
      accounts.off('loaded', actions.setAccountList);
      accounts.off('selected', actions.setActiveAccount);
    };
  }, [actions]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(value => {
      dispatch({ type: APP_ACTION.SET_CONNECTION_TYPE, value });
    });
    return unsubscribe();
  }, []);

  const value = useMemo(() => ({ ...state, ...actions }), [state, actions]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
