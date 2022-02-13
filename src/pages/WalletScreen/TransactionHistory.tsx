import React, {
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { FlatList } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useWalletAddress } from 'hooks/useWalletAddress';
import { WalletStackProps } from 'pages/MainScreen/WalletPage';
import { SafeAreaPage } from 'templates/SafeAreaPage';
import { Text } from 'components/Text';
import { TransactionItem } from 'components/TransactionHistory/TransactionItem';
import { TransactionContext } from 'store/transactions';
import { clone, sortBy } from 'lodash';
import { TransactionHistoryItem } from 'store/transactions/types';
import { TransactionModal } from 'components/TransactionConfirmation/TransactionModal';
import { NavGroup } from 'components/NavGroup/NavGroup';
import { WarningBadge } from 'components/WarningBadge';

type Props = NativeStackScreenProps<WalletStackProps, 'wallet.transactions'>;

export const TransactionHistory: React.FC<Props> = ({ navigation }) => {
  useLayoutEffect(() => {
    navigation.setOptions({ title: 'History' });
  }, [navigation]);

  const { state } = useContext(TransactionContext);
  const owner = useWalletAddress()?.toLowerCase();

  const [hash, setHash] = useState<string>();

  const renderItem = useCallback(
    ({ item }: { item: TransactionHistoryItem }) => (
      <TransactionItem
        tx={item.response}
        receipt={item.receipt}
        onPress={() => setHash(item.response.hash)}
      />
    ),
    [],
  );

  const items = useMemo(
    () =>
      sortBy(
        clone(state.transactions).filter(
          item => item.response.from.toLowerCase() === owner,
        ),
        [item => item.response.nonce],
      ).reverse(),
    [state.transactions, owner],
  );

  return (
    <SafeAreaPage>
      <WarningBadge text="This history tracks only transactions made with this app." />
      <NavGroup>
        <FlatList
          renderItem={renderItem}
          data={items}
          keyExtractor={item =>
            `${item.response.hash}-${item.response.chainId}`
          }
          ListEmptyComponent={<Text>Nothing to show.</Text>}
        />
      </NavGroup>

      <TransactionModal
        hash={hash}
        visible={!!hash}
        onClose={() => setHash(undefined)}
      />
    </SafeAreaPage>
  );
};
