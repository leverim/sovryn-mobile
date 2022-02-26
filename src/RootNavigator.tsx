import React, { useContext, useMemo, useRef } from 'react';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
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
import { AssetPickerModal } from 'modals/AssetPickerModal';
import { ReceiveAssetModal } from 'modals/ReceiveAssetModal';
import { HeaderTitleComponent } from 'modals/HeaderTitleComponent';
import { TransactionHistoryModal } from 'modals/TransactionHistoryModal';
import { TransactionDetailsModal } from 'modals/TransactionDetailsModal';
import { TransactionConfirmationModal } from 'modals/TransactionConfirmationModal';
import { PasscodeConfirmation } from 'modals/PasscodeConfirmationModal';

const Stack = createNativeStackNavigator();

export const RootNavigator: React.FC = () => {
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
        <Stack.Navigator
          initialRouteName="home"
          screenOptions={{ headerShown: false }}>
          <Stack.Group>
            <Stack.Screen
              name="home"
              component={address === null ? WelcomeFlow : SignedInScreens}
            />
          </Stack.Group>
          <Stack.Group
            screenOptions={{
              presentation: 'modal',
              headerShown: true,
              contentStyle: { backgroundColor: 'rgb(34, 34, 34)' },
              headerTitle: props => <HeaderTitleComponent {...props} />,
            }}>
            <Stack.Screen
              name="modal.asset-picker"
              component={AssetPickerModal}
              options={{ title: 'Select Asset' }}
            />
            <Stack.Screen
              name="modal.receive-asset"
              component={ReceiveAssetModal}
              options={{ title: 'Receive Asset' }}
            />
            <Stack.Screen
              name="modal.transactions"
              component={TransactionHistoryModal}
              options={{ title: 'Transaction History' }}
            />
            <Stack.Screen
              name="modal.transaction"
              component={TransactionDetailsModal}
              options={{ title: 'Transaction Details' }}
            />
            <Stack.Screen
              name="modal.tx-confirm"
              component={TransactionConfirmationModal}
              options={{ title: 'Confirm Transaction' }}
            />
            <Stack.Screen
              name="modal.passcode-confirm"
              component={PasscodeConfirmation}
              options={{ title: 'Verify with Passcode' }}
            />
          </Stack.Group>
        </Stack.Navigator>
      )}
      <ModalPortal />
    </NavigationContainer>
  );
};
