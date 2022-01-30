import notifee, {
  IOSAuthorizationStatus,
  Notification,
  Event,
  EventType,
} from '@notifee/react-native';
import { Linking, Platform } from 'react-native';
import { ChainId } from 'types/network';
import { getTxInExplorer, prettifyTx } from 'utils/helpers';

export enum TxNotificationStatus {
  SENT,
  CONFIRMED,
  CALL_EXCEPTION = 'CALL_EXCEPTION',
  TRANSACTION_REPLACED = 'TRANSACTION_REPLACED',
}

const txTitles = {
  [TxNotificationStatus.SENT]: 'Transaction sent',
  [TxNotificationStatus.CONFIRMED]: 'Transaction confirmed',
  [TxNotificationStatus.CALL_EXCEPTION]: 'Transaction failed',
  [TxNotificationStatus.TRANSACTION_REPLACED]: 'Transaction replaced',
};

export class Notifications {
  constructor() {
    this.setupCategories();
  }
  public async isAllowed() {
    if (Platform.OS === 'ios') {
      // Required for iOS
      // See https://notifee.app/react-native/docs/ios/permissions
      return await notifee
        .requestPermission()
        .then(
          settings =>
            settings.authorizationStatus >= IOSAuthorizationStatus.AUTHORIZED,
        )
        .catch(e => {
          console.warn('err', e);
          return true;
        });
    }
    return true;
  }

  public async setupCategories() {
    await notifee.setNotificationCategories([
      {
        id: 'tx',
        actions: [
          {
            id: 'open-explorer',
            title: 'Open in explorer',
            foreground: true,
          },
        ],
      },
    ]);
  }

  public async send(notification: Notification) {
    await this.isAllowed();

    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });

    return await notifee.displayNotification({
      android: {
        channelId,
        ...notification.android,
      },
      ...notification,
    });
  }

  public async sendTx(
    chainId: ChainId,
    hash: string,
    status: TxNotificationStatus = TxNotificationStatus.SENT,
  ) {
    return this.send({
      title: txTitles[status] || txTitles[TxNotificationStatus.CALL_EXCEPTION],
      subtitle: prettifyTx(hash),
      data: {
        hash,
        chainId: chainId.toString(),
      },
      ios: {
        categoryId: 'tx',
      },
    });
  }

  public async handleEvents({ detail, type }: Event) {
    const { notification, pressAction } = detail;
    if (notification && pressAction) {
      // Check if the user pressed the "Open in Explorer" action
      if (
        type === EventType.ACTION_PRESS &&
        pressAction?.id === 'open-explorer' &&
        notification.ios?.categoryId === 'tx'
      ) {
        // Remove the notification
        await notifee.cancelNotification(notification.id!);
        await Linking.openURL(
          getTxInExplorer(
            notification.data?.hash!,
            Number(notification.data?.chainId!) as ChainId,
          ),
        );
      }
    }
  }
}

export const notifications = new Notifications();
