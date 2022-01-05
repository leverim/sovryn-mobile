import React, { useEffect, useMemo } from 'react';
import { accounts, AccountType, BaseAccount } from 'utils/accounts';
import { assets } from 'utils/assets';
import { cache } from 'utils/cache';
import { settings } from 'utils/settings';
import { clearStorage } from 'utils/storage';
import { wallet } from 'utils/wallet';

type AppContextState = {
  accountList: BaseAccount[];
  accountSelected: number;
  address: string | null;
  loading: boolean;
};

type AppContextActions = {
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  createWallet: (
    name: string,
    type: AccountType,
    secret: string,
  ) => Promise<void>;
  setAccountList: (accounts: BaseAccount[]) => void;
  setActiveAccount: (index: number) => void;
};

type AppContextType = AppContextState & AppContextActions;

export enum APP_ACTION {
  SIGN_IN,
  SIGN_OUT,
  SET_ACCOUNT_LIST,
  SET_ACCOUNT,
}

type Action =
  | { type: APP_ACTION.SIGN_IN; value: string | null }
  | { type: APP_ACTION.SIGN_OUT }
  | { type: APP_ACTION.SET_ACCOUNT_LIST; value: BaseAccount[] }
  | { type: APP_ACTION.SET_ACCOUNT; value: number };

export const AppContext = React.createContext<AppContextType>({
  accountList: [],
  accountSelected: 0,
  address: null,
  loading: true,
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
      }
    },
    {
      accountList: [],
      accountSelected: 0,
      address: null,
      loading: true,
    },
  );

  const actions: AppContextActions = React.useMemo(
    () => ({
      signIn: async () => {
        dispatch({ type: APP_ACTION.SIGN_IN, value: wallet.address || null });
      },
      createWallet: async (name: string, type: AccountType, secret: string) => {
        await accounts.create(name, type, secret);
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
        await clearStorage();
        dispatch({ type: APP_ACTION.SIGN_OUT });
      },
    }),
    [],
  );

  useEffect(() => {
    Promise.all([
      assets.load(),
      cache.load(),
      settings.load(),
      accounts.load(),
    ]).finally(() => actions.signIn().finally(() => {}));
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
