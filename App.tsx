import React from 'react';
import { ModalPortal } from 'react-native-modals';
import { init, wrap } from '@sentry/react-native';
import { AppProvider } from './src/context/AppContext';
import { MainScreen } from './src/MainScreen';

init({
  dsn: 'https://3a91eacf25944a5a8cbc58b87a3e05a6@o1102915.ingest.sentry.io/6129518',
  environment: __DEV__ ? 'dev' : 'prod',
});

const App = () => {
  return (
    <AppProvider>
      <MainScreen />
      <ModalPortal />
    </AppProvider>
  );
};

export default wrap(App);
