import './wdyr';
import './shim';
import { LogBox } from 'react-native';
import 'global.shims';
import 'react-native-get-random-values';
import '@ethersproject/shims';
import 'react-native-console-time-polyfill';
import { AppRegistry, Linking } from 'react-native';
import notifee, { EventType } from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';
import { getTxInExplorer } from 'utils/helpers';

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'Require cycle: node_modules/react-native-crypto/index.js -> node_modules/react-native-randombytes/index.js -> node_modules/sjcl/sjcl.js -> node_modules/react-native-crypto/index.js',
  'Require cycle: node_modules/stream-browserify/index.js -> node_modules/stream-browserify/node_modules/readable-stream/readable.js -> node_modules/stream-browserify/index.js',
]);

notifee.onBackgroundEvent(async ({ detail, type }) => {
  const { notification, pressAction } = detail;

  if (
    type === EventType.ACTION_PRESS &&
    pressAction?.id === 'open-explorer' &&
    notification.ios.categoryId === 'tx'
  ) {
    // Remove the notification
    await notifee.cancelNotification(notification?.id);
    await Linking.openURL(
      getTxInExplorer(
        notification.data.hash,
        Number(notification.data.chainId),
      ),
    );
  }
});

AppRegistry.registerComponent(appName, () => App);
