import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { WalletPage } from './MainScreen/WalletPage';
import { SwapPage } from './SwapPage';
import { SettingsRoutes } from '../routers/settings.routes';

import WalletIcon from 'assets/wallet-icon.svg';
import ExchangeIcon from 'assets/exchange-icon.svg';
import SettingsIcon from 'assets/settings-icon.svg';
import PercentIcon from '../assets/percent-icon.svg';
import { PassCodeModal } from 'components/PassCode/PassCodeModal';
import { passcode } from 'controllers/PassCodeController';
import { TransactionConfirmation } from 'components/TransactionConfirmation/TransactionConfirmation';
import { PasscodeConfirmation } from 'components/PassCode/PasscodeConfirmation';
import { EarnRoutes } from 'routers/earn.routes';

const _USE_LOCK_SCREEN = !__DEV__;

export type SignedInScreensTabProps = {
  wallet: undefined;
  swap: undefined;
  settings: undefined;
  earn: undefined;
};

const Tab = createBottomTabNavigator<SignedInScreensTabProps>();

export const SignedInScreens = () => {
  const appState = useRef(AppState.currentState);
  const [askToUnlock, setAskToUnlock] = useState(!passcode.unlocked);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current === 'background' && nextAppState === 'active') {
        console.log('app has come to the foreground!');
        passcode.setUnlocked(false);
        setAskToUnlock(true);
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleUnlock = useCallback(() => {
    console.log('unlocking');
    process.nextTick(() => {
      setAskToUnlock(false);
      passcode.setUnlocked(true);
    });
  }, []);

  return (
    <>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen
          name="wallet"
          component={WalletPage}
          options={{
            title: 'Wallet',
            tabBarIcon: ({ color }) => <WalletIcon fill={color} />,
          }}
        />
        <Tab.Screen
          name="swap"
          component={SwapPage}
          options={{
            title: 'Swap',
            tabBarIcon: ({ color }) => <ExchangeIcon fill={color} />,
          }}
        />
        <Tab.Screen
          name="earn"
          component={EarnRoutes}
          options={{
            title: 'Earn',
            tabBarIcon: ({ color }) => <PercentIcon fill={color} />,
          }}
        />
        <Tab.Screen
          name="settings"
          component={SettingsRoutes}
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <SettingsIcon fill={color} />,
          }}
        />
      </Tab.Navigator>
      {_USE_LOCK_SCREEN && (
        <PassCodeModal visible={askToUnlock} onUnlocked={handleUnlock} />
      )}
      <TransactionConfirmation />
      <PasscodeConfirmation />
    </>
  );
};
