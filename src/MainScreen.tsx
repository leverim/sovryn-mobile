import React, { useContext, useMemo, useRef } from 'react';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ModalPortal } from 'react-native-modals';
import analytics from '@react-native-firebase/analytics';

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

  const routeNameRef = useRef();
  const navigationRef = useRef<any>();

  const address = useWalletAddress();

  useGlobalUsdPrices();
  useAccountBalances(address);
  useGlobalLoan(address);

  const isDark = useIsDarkTheme();
  const theme = useMemo(() => (isDark ? DarkTheme : DefaultTheme), [isDark]);

  return (
    <NavigationContainer
      theme={theme}
      ref={navigationRef}
      onReady={() =>
        (routeNameRef.current = navigationRef.current.getCurrentRoute().name)
      }
      onStateChange={async () => {
        const previousRouteName = routeNameRef.current;
        const currentRouteName = navigationRef.current.getCurrentRoute().name;

        if (previousRouteName !== currentRouteName) {
          await analytics().logScreenView({
            screen_name: currentRouteName,
            screen_class: currentRouteName,
          });
        }
        routeNameRef.current = currentRouteName;
      }}>
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
