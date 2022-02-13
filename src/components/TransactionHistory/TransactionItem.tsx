import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { DarkTheme } from '@react-navigation/native';
import type {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/providers';
import { Text } from 'components/Text';
import { prettifyTx } from 'utils/helpers';
import {
  getSignatureFromData,
  getTxTitle,
  getTxType,
} from 'utils/transaction-helpers';
import FailedTxIcon from 'assets/x-circle.svg';
import CheckTxIcon from 'assets/check-circle.svg';

type TransactionItemProps = {
  tx: TransactionResponse;
  onPress: (event: GestureResponderEvent) => void;
  receipt?: TransactionReceipt;
  isFirst?: boolean;
  isLast?: boolean;
};

export const TransactionItem: React.FC<TransactionItemProps> = React.memo(
  ({ tx, receipt, isFirst, isLast, onPress }) => {
    const [pressedIn, setPressedIn] = useState(false);

    const handlePress = useCallback(
      (status: boolean) => () => setPressedIn(status),
      [],
    );

    const status = useMemo(() => {
      if (!receipt || !tx.confirmations) {
        return TransactionStatus.PENDING;
      }
      return receipt.status === 1
        ? TransactionStatus.SUCCESS
        : TransactionStatus.FAILED;
    }, [receipt, tx.confirmations]);

    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePress(true)}
        onPressOut={handlePress(false)}
        style={[
          styles.container,
          pressedIn && styles.pressed,
          isFirst && styles.isFirst,
          isLast && styles.isLast,
          !isLast && styles.hasBottomBorder,
        ]}>
        <View style={styles.statusIconContainer}>
          <TransactionStatusIcon status={status} />
        </View>
        <View>
          <View>
            <Text style={styles.labelText}>
              {getTxTitle(getTxType(getSignatureFromData(tx.data)), tx)}
            </Text>
          </View>
          <Text style={styles.hashText}>{prettifyTx(tx.hash, 12, 12)}</Text>
        </View>
      </Pressable>
    );
  },
);

enum TransactionStatus {
  PENDING,
  SUCCESS,
  FAILED,
}

type TransactionStatusIconProps = {
  status: TransactionStatus;
};

const TransactionStatusIcon: React.FC<TransactionStatusIconProps> = ({
  status,
}) => {
  return (
    <View>
      {status === TransactionStatus.PENDING && <ActivityIndicator size={24} />}
      {status === TransactionStatus.SUCCESS && (
        <CheckTxIcon style={styles.txIcon} fill={DarkTheme.colors.text} />
      )}
      {status === TransactionStatus.FAILED && (
        <FailedTxIcon style={styles.txIcon} fill={DarkTheme.colors.text} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: DarkTheme.colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
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
  txIcon: {
    width: 24,
    height: 24,
  },
  labelText: {
    paddingRight: 4,
  },
  hashText: {
    opacity: 0.5,
    fontSize: 12,
  },
  statusIconContainer: {
    width: 32,
  },
});
