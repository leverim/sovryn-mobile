import React, { useEffect, useState } from 'react';
import codePush from 'react-native-code-push';
import notifee, { EventType } from '@notifee/react-native';
import Toast from 'react-native-toast-notifications';
import { AppProvider } from './src/context/AppContext';
import { RootNavigator } from './src/RootNavigator';
import { notifications } from 'controllers/notifications';
import { useIsMounted } from 'hooks/useIsMounted';
import { BalanceProvider } from 'context/BalanceContext';
import { UsdPriceProvider } from 'context/UsdPriceContext';
import { TransactionsProvider } from 'store/transactions';
import { StatusBar } from 'react-native';
import { DarkTheme } from '@react-navigation/native';

const App: React.FC = () => {
  const isMounted = useIsMounted();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notifee
      .getInitialNotification()
      .then(initialNotification => {
        if (isMounted() && initialNotification) {
          notifications.handleEvents({
            type:
              initialNotification.pressAction?.id !== 'default'
                ? EventType.ACTION_PRESS
                : EventType.PRESS,
            detail: initialNotification,
          });
        }
      })
      .finally(() => {
        if (isMounted()) {
          setLoading(false);
        }
      });
  }, [isMounted]);

  useEffect(() => {
    return notifee.onForegroundEvent(notifications.handleEvents);
  }, []);

  if (loading) {
    return null;
  }

  return (
    <>
      <StatusBar
        backgroundColor={DarkTheme.colors.background}
        barStyle="light-content"
      />
      <UsdPriceProvider>
        <BalanceProvider>
          <TransactionsProvider>
            <AppProvider>
              <RootNavigator />
            </AppProvider>
          </TransactionsProvider>
        </BalanceProvider>
      </UsdPriceProvider>
      <Toast ref={ref => (global.toast = ref!)} />
    </>
  );
};

export default __DEV__
  ? App
  : codePush({
      updateDialog: true,
      checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
      installMode: codePush.InstallMode.IMMEDIATE,
    })(App);
