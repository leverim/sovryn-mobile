import React, { useCallback, useContext, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { clone } from 'lodash';
import { NavGroup } from 'components/NavGroup/NavGroup';
import { Text } from 'components/Text';
import { useWalletAddress } from 'hooks/useWalletAddress';
import { TransactionContext } from 'store/transactions';
import { TransactionItem } from './TransactionItem';
import { TransactionHistoryItem } from 'store/transactions/types';
import { useTransactionModal } from 'hooks/useTransactionModal';

type PendingTransactionsProps = {
  marginTop?: number;
};

export const PendingTransactions: React.FC<PendingTransactionsProps> = ({
  marginTop = 24,
}) => {
  const { state } = useContext(TransactionContext);
  const owner = useWalletAddress()?.toLowerCase();

  const showTx = useTransactionModal();

  const items = useMemo(() => {
    return clone(state.transactions)
      .filter(
        item =>
          (item.response.from.toLowerCase() === owner &&
            !item.response.confirmations) ||
          !item.receipt,
      )
      .reverse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.transactions, owner]);

  const handleTx = useCallback(
    (item: TransactionHistoryItem) => showTx(item.response.hash),
    [showTx],
  );

  if (!items.length) {
    return null;
  }

  return (
    <View style={[styles.container, { marginTop }]}>
      <Text style={styles.title}>Active transactions:</Text>
      <NavGroup>
        {items.map(item => (
          <TransactionItem
            key={item.response.hash}
            tx={item.response}
            receipt={item.receipt}
            onPress={() => handleTx(item)}
          />
        ))}
      </NavGroup>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  title: {
    fontSize: 16,
    marginBottom: 12,
  },
});
