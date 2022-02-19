import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaPage } from 'templates/SafeAreaPage';
import { LendingRoutesStackProps } from 'routers/lending.routes';
import { ammPools } from 'config/amm-pools';
import { AmmPoolItem } from './components/AmmPoolItem';
import { useCurrentChain } from 'hooks/useCurrentChain';

type Props = NativeStackScreenProps<LendingRoutesStackProps, 'lending.index'>;

export const AmmIndex: React.FC<Props> = () => {
  const { chainId } = useCurrentChain();
  const [refresh, setRefresh] = useState(0);

  const pools = useMemo(
    () => ammPools.filter(item => item.chainId === chainId),
    [chainId],
  );

  const renderItem = useCallback(
    ({ item }) => <AmmPoolItem item={item} refresh={refresh} />,
    [refresh],
  );

  return (
    <SafeAreaPage>
      <FlatList
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => setRefresh(p => p + 1)}
          />
        }
        data={pools}
        renderItem={renderItem}
        keyExtractor={item => item.converterAddress}
      />
    </SafeAreaPage>
  );
};
