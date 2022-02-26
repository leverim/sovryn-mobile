import React, { useContext, useLayoutEffect, useMemo } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useWalletAddress } from 'hooks/useWalletAddress';
import { PageContainer, SafeAreaPage } from 'templates/SafeAreaPage';
import { Text } from 'components/Text';
import { TransactionItem } from 'components/TransactionHistory/TransactionItem';
import { TransactionContext } from 'store/transactions';
import { clone, sortBy } from 'lodash';
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
    <SafeAreaPage scrollView>
      <PageContainer>
        <WarningBadge text="This history tracks only transactions made with this app." />
        {items.length > 0 ? (
          <NavGroup>
            {items.map(item => (
              <TransactionItem
                tx={item.response}
                receipt={item.receipt}
                onPress={() => showTx(item.response.hash)}
              />
            ))}
          </NavGroup>
        ) : (
          <Text>Nothing to show.</Text>
        )}
      </PageContainer>
    </SafeAreaPage>
  );
};
