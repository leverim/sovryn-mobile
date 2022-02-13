import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  Pressable,
  GestureResponderEvent,
  View,
} from 'react-native';
import { Text } from 'components/Text';
import { DarkTheme } from '@react-navigation/native';
import ChevronRight from 'assets/chevron-right.svg';
import { AccountType, BaseAccount } from 'utils/accounts';
import { toChecksumAddress } from 'utils/rsk';
import { currentChainId } from 'utils/helpers';

type NavItemProps = {
  account: BaseAccount;
  onPress?: (event: GestureResponderEvent) => void;
  hideArrow?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  value?: string | number;
};

export const WalletListItem: React.FC<NavItemProps> = React.memo(
  ({ account, onPress, isFirst, isLast, hideArrow = false, value }) => {
    const [pressedIn, setPressedIn] = useState(false);

    const chainId = currentChainId();

    const handlePress = useCallback(
      (status: boolean) => () => setPressedIn(status),
      [],
    );

    return (
      <Pressable
        style={[
          styles.container,
          pressedIn && styles.pressed,
          isFirst && styles.isFirst,
          isLast && styles.isLast,
          !isLast && styles.hasBottomBorder,
        ]}
        onPress={onPress}
        onPressIn={handlePress(true)}
        onPressOut={handlePress(false)}>
        <View>
          <View style={styles.walletHolder}>
            <Text>{account.name}</Text>
            {account.type === AccountType.PUBLIC_ADDRESS && (
              <View style={styles.readOnlyBadge}>
                <Text style={styles.readOnlyText}>Read only</Text>
              </View>
            )}
          </View>
          <Text style={styles.addressText}>
            {toChecksumAddress(account.address, chainId)}
          </Text>
        </View>
        <View style={styles.rightContainer}>
          {value && <Text style={styles.rightContainerText}>{value}</Text>}
          {!hideArrow && (
            <ChevronRight
              fill={pressedIn ? DarkTheme.colors.card : DarkTheme.colors.border}
            />
          )}
        </View>
      </Pressable>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: DarkTheme.colors.card,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 12,
  },
  pressed: {
    backgroundColor: DarkTheme.colors.border,
  },
  isFirst: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  isLast: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  hasBottomBorder: {
    borderBottomWidth: 1,
    borderBottomColor: DarkTheme.colors.border,
  },
  rightContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  rightContainerText: {
    marginRight: 4,
    textAlign: 'right',
  },
  walletHolder: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  addressText: {
    opacity: 0.5,
    fontSize: 12,
  },
  readOnlyBadge: {
    marginLeft: 12,
    paddingVertical: 1,
    paddingHorizontal: 3,
    backgroundColor: DarkTheme.colors.notification,
    borderRadius: 6,
  },
  readOnlyText: {
    fontSize: 12,
  },
});
