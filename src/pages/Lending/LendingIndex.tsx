import React, { useMemo } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaPage } from 'templates/SafeAreaPage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { globalStyles } from 'global.styles';
import { LendingRoutesStackProps } from 'routers/lending.routes';
import { currentChainId } from 'utils/helpers';
import { lendingTokens } from 'config/lending-tokens';
import { LendingPool } from './components/LendingPool';

type Props = NativeStackScreenProps<LendingRoutesStackProps, 'lending.index'>;

export const LendingIndex: React.FC<Props> = () => {
  const chainId = currentChainId();
  const pools = useMemo(
    () => lendingTokens.filter(item => item.chainId === chainId),
    [chainId],
  );
  return (
    <SafeAreaPage>
      <ScrollView style={globalStyles.page}>
        {pools.map(item => (
          <LendingPool key={item.loanTokenAddress} lendingToken={item} />
        ))}
      </ScrollView>
    </SafeAreaPage>
  );
};
