import React, { useCallback, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import {
  DarkTheme,
  NavigationProp,
  useNavigation,
} from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import { AccountType, BaseAccount } from 'utils/accounts';
import { commifyDecimals, currentChainId, prettifyTx } from 'utils/helpers';
import { useAssetBalance } from 'hooks/useAssetBalance';
import { tokenUtils } from 'utils/token-utils';
import { Text } from './Text';
import { WalletStackProps } from 'pages/MainScreen/WalletPage';

import CopyIcon from 'assets/copy-icon.svg';
import SendIcon from 'assets/send-icon.svg';
import ReceiveIcon from 'assets/receive-icon.svg';
import { toChecksumAddress } from 'utils/rsk';

type AccountBannerProps = {
  account: BaseAccount;
  showActions?: boolean;
};

export const AccountBanner: React.FC<AccountBannerProps> = ({
  account,
  showActions,
}) => {
  const navigation =
    useNavigation<NavigationProp<WalletStackProps, 'wallet.details'>>();
  const chainId = currentChainId();
  const coin = tokenUtils.getNativeToken(chainId);
  const { value } = useAssetBalance(coin, account.address, chainId);

  const [pressed, setPressed] = useState(false);

  const handlePress = useCallback(
    (status: boolean) => () => setPressed(status),
    [],
  );

  const handleAddressCopy = useCallback(
    () => Clipboard.setString(account.address),
    [account.address],
  );

  return (
    <View style={styles.container}>
      <View style={styles.nameView}>
        <Text style={styles.nameText}>{account.name}</Text>
        <Pressable
          style={[styles.addressHolder, pressed && styles.addressHolderPressed]}
          onPress={handleAddressCopy}
          onPressIn={handlePress(true)}
          onPressOut={handlePress(false)}>
          <Text style={styles.addressText}>
            {prettifyTx(
              toChecksumAddress(account.address || '', chainId),
              14,
              14,
            )}
          </Text>
          <View style={styles.copyIconHolder}>
            <CopyIcon fill="white" width={22} height={22} />
          </View>
        </Pressable>
      </View>
      <View>
        <Text style={styles.balanceText}>
          {commifyDecimals(value)} {coin.symbol}
        </Text>
      </View>
      <View>
        {showActions && (
          <View style={styles.actions}>
            {account.type !== AccountType.PUBLIC_ADDRESS ? (
              <Pressable
                style={styles.action}
                onPress={() =>
                  navigation.navigate('wallet.send', { token: coin, chainId })
                }>
                <View style={styles.actionIcon}>
                  <SendIcon fill="white" />
                </View>
                <Text style={styles.actionLabel}>Send</Text>
              </Pressable>
            ) : (
              <View />
            )}

            <Pressable
              style={styles.action}
              onPress={() =>
                navigation.navigate('wallet.receive', {
                  token: coin,
                  chainId,
                })
              }>
              <View style={styles.actionIcon}>
                <ReceiveIcon fill="white" />
              </View>
              <Text style={styles.actionLabel}>Receive</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: DarkTheme.colors.card,
    marginBottom: 24,
    borderRadius: 12,
    padding: 16,
  },
  nameView: {
    marginBottom: 24,
  },
  nameText: {
    opacity: 0.5,
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 16,
  },
  addressHolder: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  addressHolderPressed: {
    transform: [{ scaleX: 1.05 }, { scaleY: 1.05 }],
  },
  addressText: {
    fontWeight: '300',
    fontSize: 18,
  },
  copyIconHolder: {
    opacity: 0.5,
    marginLeft: 12,
  },
  balanceText: {
    fontSize: 36,
  },
  actions: {
    marginTop: 24,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  action: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    marginBottom: 12,
  },
  actionLabel: {},
});
