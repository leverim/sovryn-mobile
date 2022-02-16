import React, { useMemo } from 'react';
import { ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaPage } from 'templates/SafeAreaPage';
import { globalStyles } from 'global.styles';
import { LendingRoutesStackProps } from 'routers/lending.routes';
import { currentChainId } from 'utils/helpers';
import { ammPools } from 'config/amm-pools';
import { AmmPoolItem } from './components/AmmPoolItem';

type Props = NativeStackScreenProps<LendingRoutesStackProps, 'lending.index'>;

export const AmmIndex: React.FC<Props> = () => {
  const chainId = currentChainId();
  const pools = useMemo(
    () => ammPools.filter(item => item.chainId === chainId),
    [chainId],
  );
  return (
    <SafeAreaPage>
      <ScrollView style={globalStyles.page}>
        {pools.map(item => (
          <AmmPoolItem key={item.converterAddress} item={item} />
        ))}
      </ScrollView>
    </SafeAreaPage>
  );
};
