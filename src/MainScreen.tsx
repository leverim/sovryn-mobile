import React, { useContext, useMemo } from 'react';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Welcome } from 'pages/WelcomeFlow/Welcome';
import { CreateWallet } from 'pages/WelcomeFlow/CreateWallet';
import { ImportWallet } from 'pages/WelcomeFlow/ImportWallet';
import { SplashScreen } from 'pages/SplashScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { WalletPage } from 'pages/MainScreen/WalletPage';
import { SettingsPage } from 'pages/MainScreen/SettingsPage';
import { AppContext } from 'context/AppContext';

import WalletIcon from 'assets/wallet-icon.svg';
import ExchangeIcon from 'assets/exchange-icon.svg';
import SettingsIcon from 'assets/settings-icon.svg';
import { useIsDarkTheme } from 'hooks/useIsDarkTheme';
import { SwapPage } from 'pages/SwapPage';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export const MainScreen: React.FC = () => {
  const { address, loading } = useContext(AppContext);

  const isDark = useIsDarkTheme();
  const theme = useMemo(() => (isDark ? DarkTheme : DefaultTheme), [isDark]);

  return (
    <NavigationContainer theme={theme}>
      {loading ? (
        <Stack.Navigator>
          <Stack.Screen name="splash" component={SplashScreen} />
        </Stack.Navigator>
      ) : (
        <>
          {address === null ? (
            <Stack.Navigator>
              <Stack.Screen
                name="Welcome"
                component={Welcome}
                options={{ headerShown: false }}
              />
              <Stack.Screen name="CreateWallet" component={CreateWallet} />
              <Stack.Screen name="ImportWallet" component={ImportWallet} />
            </Stack.Navigator>
          ) : (
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
          )}
        </>
      )}
    </NavigationContainer>
  );
};
