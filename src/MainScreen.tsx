/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, { useContext, useEffect, useMemo } from 'react';
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
import { BrowserPage } from 'pages/MainScreen/BrowserPage';

import WalletIcon from 'assets/wallet-icon.svg';
import DappIcon from 'assets/dapp-icon.svg';
import SettingsIcon from 'assets/settings-icon.svg';
import { useIsDarkTheme } from 'hooks/useIsDarkTheme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export const MainScreen: React.FC = () => {
  const { address, loading } = useContext(AppContext);

  // useEffect(() => {
  //   console.log('get loanpools list:');
  //   contractCall<[string[]]>(
  //     30,
  //     '0x5a0d867e0d70fcc6ade25c3f1b89d618b5b4eaa7',
  //     'getLoanPoolsList(uint256,uint256)(bytes32[])',
  //     [0, 5],
  //   )
  //     .then(e => {
  //       console.log(e?.[0]);
  //       console.log(
  //         'loans',
  //         e?.[0].map(item => ethers.utils.parseBytes32String(item)),
  //       );
  //     })
  //     .catch(console.error);
  // }, []);

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
                component={BrowserPage}
                options={{
                  title: 'Swap',
                  tabBarIcon: ({ color }) => <DappIcon fill={color} />,
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
