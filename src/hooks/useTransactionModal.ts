import { useCallback } from 'react';
import { useModalNavigation } from './useModalNavigation';

export const useTransactionModal = () => {
  const navigation = useModalNavigation();
  return useCallback(
    (hash: string) => navigation.navigate('modal.transaction', { hash }),
    [navigation],
  );
};
