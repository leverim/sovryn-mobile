import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { passcode } from 'controllers/PassCodeController';

import { WalletPage } from './MainScreen/WalletPage';
import { SwapPage } from './SwapPage';
import { SettingsPage } from './MainScreen/SettingsPage';

import WalletIcon from 'assets/wallet-icon.svg';
import ExchangeIcon from 'assets/exchange-icon.svg';
import SettingsIcon from 'assets/settings-icon.svg';
import { PrivacyOverlay } from 'components/PassCode/PrivacyOverlay';
import { PassCodeModal } from 'components/PassCode/PassCodeModal';

export type SignedInScreensTabProps = {
  wallet: undefined;
  swap: undefined;
  settings: undefined;
};

const Tab = createBottomTabNavigator<SignedInScreensTabProps>();

export const SignedInScreens = () => {
  const appState = useRef(AppState.currentState);
  const isUnlocking = useRef(false);
  const [currentState, setCurrentState] = useState(AppState.currentState);
  const [askToUnlock, setAskToUnlock] = useState(true);

  useEffect(() => {
    passcode.hasPasscode().then(result => {
      console.log('passcode', result);
    });

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current === 'background' &&
        nextAppState === 'active' &&
        !isUnlocking.current
      ) {
        setAskToUnlock(true);
        isUnlocking.current = true;
      }
      console.log('state', appState.current, '->', nextAppState);
      appState.current = nextAppState;
      setCurrentState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const showPrivacyOverlay =
    ['background', 'inactive'].includes(currentState) && !askToUnlock;

  const handleUnlock = useCallback(() => {
    setAskToUnlock(false);
    isUnlocking.current = false;
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
          name="settings"
          component={SettingsPage}
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <SettingsIcon fill={color} />,
          }}
        />
      </Tab.Navigator>
      <PassCodeModal
        visible={askToUnlock && !showPrivacyOverlay}
        onUnlocked={handleUnlock}
      />
      <PrivacyOverlay visible={showPrivacyOverlay} />
    </>
  );
};
