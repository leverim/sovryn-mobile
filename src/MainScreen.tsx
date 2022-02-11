import React, { useContext, useEffect, useMemo } from 'react';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ModalPortal } from 'react-native-modals';

import { AppContext } from 'context/AppContext';
import { useIsDarkTheme } from 'hooks/useIsDarkTheme';

import { SplashScreen } from 'pages/SplashScreen';
import { WelcomeFlow } from 'pages/WelcomeFlow';
import { SignedInScreens } from 'pages/SignedInScreens';
import { useGlobalUsdPrices } from 'hooks/app-context/useGlobalUsdPrices';
import { useAccountBalances } from 'hooks/app-context/useAccountBalances';
import { useGlobalLoan } from 'hooks/app-context/useGlobalLoan';
import { useWalletAddress } from 'hooks/useWalletAddress';

const Stack = createNativeStackNavigator();

export const MainScreen: React.FC = () => {
  const { loading } = useContext(AppContext);

  const address = useWalletAddress();

  useGlobalUsdPrices();
  useAccountBalances(address);
  useGlobalLoan(address);

  const isDark = useIsDarkTheme();
  const theme = useMemo(() => (isDark ? DarkTheme : DefaultTheme), [isDark]);

  return (
    <NavigationContainer theme={theme}>
      {loading ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="splash" component={SplashScreen} />
        </Stack.Navigator>
      ) : (
        <>{address === null ? <WelcomeFlow /> : <SignedInScreens />}</>
      )}
      <ModalPortal />
    </NavigationContainer>
  );
};
