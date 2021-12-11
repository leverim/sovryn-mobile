/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
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

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export const MainScreen: React.FC = () => {
  const { mnemonic, loading } = useContext(AppContext);
  return (
    <NavigationContainer>
      {loading ? (
        <Stack.Navigator>
          <Stack.Screen name="splash" component={SplashScreen} />
        </Stack.Navigator>
      ) : (
        <>
          {mnemonic === null ? (
            <Stack.Navigator>
              <Stack.Screen name="Welcome" component={Welcome} />
              <Stack.Screen name="CreateWallet" component={CreateWallet} />
              <Stack.Screen name="ImportWallet" component={ImportWallet} />
            </Stack.Navigator>
          ) : (
            <Tab.Navigator screenOptions={{ headerShown: false }}>
              <Tab.Screen
                name="wallet"
                component={WalletPage}
                options={{
                  tabBarIcon: ({ color }) => <WalletIcon fill={color} />,
                }}
              />
              <Tab.Screen
                name="browser"
                component={BrowserPage}
                options={{
                  tabBarIcon: ({ color }) => <DappIcon fill={color} />,
                }}
              />
              <Tab.Screen
                name="settings"
                component={SettingsPage}
                options={{
                  headerShown: true,
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
