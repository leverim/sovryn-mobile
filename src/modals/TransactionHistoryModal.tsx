import React, {
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
} from 'react';
import { FlatList } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useWalletAddress } from 'hooks/useWalletAddress';
import { PageContainer, SafeAreaPage } from 'templates/SafeAreaPage';
import { Text } from 'components/Text';
import { TransactionItem } from 'components/TransactionHistory/TransactionItem';
import { TransactionContext } from 'store/transactions';
import { clone, sortBy } from 'lodash';
import { TransactionHistoryItem } from 'store/transactions/types';
import { NavGroup } from 'components/NavGroup/NavGroup';
import { WarningBadge } from 'components/WarningBadge';
import { ModalStackRoutes } from 'routers/modal.routes';
import { useTransactionModal } from 'hooks/useTransactionModal';

type Props = NativeStackScreenProps<ModalStackRoutes, 'modal.transactions'>;

export const TransactionHistoryModal: React.FC<Props> = ({ navigation }) => {
  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Transaction History' });
  }, [navigation]);

  const { state } = useContext(TransactionContext);
  const owner = useWalletAddress()?.toLowerCase();

  const showTx = useTransactionModal();

  const renderItem = useCallback(
    ({ item }: { item: TransactionHistoryItem }) => (
      <TransactionItem
        tx={item.response}
        receipt={item.receipt}
        onPress={() => showTx(item.response.hash)}
      />
    ),
    [showTx],
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
      <PageContainer>
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
      </PageContainer>
    </SafeAreaPage>
  );
};
