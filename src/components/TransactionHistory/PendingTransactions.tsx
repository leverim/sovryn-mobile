import React, { useCallback, useContext, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { NavGroup } from 'components/NavGroup/NavGroup';
import { Text } from 'components/Text';
import { useWalletAddress } from 'hooks/useWalletAddress';
import { TransactionContext } from 'store/transactions';
import { TransactionItem } from './TransactionItem';
import { clone } from 'lodash';
import { TransactionHistoryItem } from 'store/transactions/types';
import { TransactionModal } from 'components/TransactionConfirmation/TransactionModal';

export const PendingTransactions: React.FC = () => {
  const { state } = useContext(TransactionContext);
  const owner = useWalletAddress()?.toLowerCase();

  const items = useMemo(() => {
    return (
      clone(state.transactions)
        //   .filter(
        //     item =>
        //       //   item.response.from.toLowerCase() === owner &&
        //       !item.response.confirmations || !item.receipt,
        //   )
        .reverse()
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.transactions, owner]);

  const [hash, setHash] = useState<string>();
  const handleTx = useCallback(
    (item: TransactionHistoryItem) => setHash(item.response.hash),
    [],
  );
  const handleClose = useCallback(() => setHash(undefined), []);

  if (!items.length) {
    return null;
  }

  return (
    <View style={styles.container}>
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
      <TransactionModal visible={!!hash} hash={hash} onClose={handleClose} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 24,
  },
  title: {
    fontSize: 16,
    marginBottom: 12,
  },
});
