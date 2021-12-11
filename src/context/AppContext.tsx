import React, { useEffect, useMemo } from 'react';
import { clearStorage, retrieveMnemonic, storeMnemonic } from 'utils/storage';

type AppContextState = {
  mnemonic: string | null;
  loading: boolean;
};

type AppContextActions = {
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  createWallet: (mnemonic: string) => Promise<void>;
};

type AppContextType = AppContextState & AppContextActions;

export enum APP_ACTION {
  SIGN_IN,
  SIGN_OUT,
}

type Action =
  | { type: APP_ACTION.SIGN_IN; value: string | null }
  | { type: APP_ACTION.SIGN_OUT };

export const AppContext = React.createContext<AppContextType>({
  mnemonic: null,
  loading: true,
} as AppContextType);

export const AppProvider: React.FC = ({ children }) => {
  const [state, dispatch] = React.useReducer(
    (prevState: AppContextState, action: Action) => {
      switch (action.type) {
        case APP_ACTION.SIGN_IN:
          return {
            ...prevState,
            mnemonic: action.value,
            loading: false,
          };
        case APP_ACTION.SIGN_OUT:
          return {
            ...prevState,
            mnemonic: null,
            loading: false,
          };
      }
    },
    {
      mnemonic: null,
      loading: true,
    },
  );

  const actions: AppContextActions = React.useMemo(
    () => ({
      signIn: async () => {
        const mnemonic = await retrieveMnemonic();
        console.log('sign in', mnemonic);
        dispatch({ type: APP_ACTION.SIGN_IN, value: mnemonic });
      },
      createWallet: async (mnemonic: string) => {
        await storeMnemonic(mnemonic);
        dispatch({ type: APP_ACTION.SIGN_IN, value: mnemonic });
      },
      signOut: async () => {
        // todo disable function if it's not development build.
        await clearStorage();
        console.log('signing out');
        dispatch({ type: APP_ACTION.SIGN_OUT });
      },
    }),
    [],
  );

  useEffect(() => {
    actions.signIn().finally(() => console.log('finished sign-in'));
  }, [actions]);

  const value = useMemo(() => ({ ...state, ...actions }), [state, actions]);

  useEffect(() => {
    console.log('state', state);
  }, [state]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
