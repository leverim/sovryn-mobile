import React, { useContext, useMemo } from 'react';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AppContext } from 'context/AppContext';
import { useIsDarkTheme } from 'hooks/useIsDarkTheme';

import { SplashScreen } from 'pages/SplashScreen';
import { WelcomeFlow } from 'pages/WelcomeFlow';
import { SignedInScreens } from 'pages/SignedInScreens';

const Stack = createNativeStackNavigator();

export const MainScreen: React.FC = () => {
  const { address, loading } = useContext(AppContext);

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
    </NavigationContainer>
  );
};
