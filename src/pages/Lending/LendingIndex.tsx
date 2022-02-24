import React, { useMemo } from 'react';
import { RefreshControl } from 'react-native';
import { PageContainer, SafeAreaPage } from 'templates/SafeAreaPage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LendingRoutesStackProps } from 'routers/lending.routes';
import { currentChainId } from 'utils/helpers';
import { lendingTokens } from 'config/lending-tokens';
import { LendingPool } from './components/LendingPool';
import { useWalletAddress } from 'hooks/useWalletAddress';
import { useGlobalLoans } from 'hooks/app-context/useGlobalLoans';

type Props = NativeStackScreenProps<LendingRoutesStackProps, 'lending.index'>;

export const LendingIndex: React.FC<Props> = () => {
  const chainId = currentChainId();
  const owner = useWalletAddress()?.toLowerCase();
  const { execute } = useGlobalLoans(owner);
  const pools = useMemo(
    () => lendingTokens.filter(item => item.chainId === chainId),
    [chainId],
  );
  return (
    <SafeAreaPage
      scrollView
      scrollViewProps={{
        refreshControl: (
          <RefreshControl refreshing={false} onRefresh={execute} />
        ),
      }}>
      <PageContainer>
        {pools.map(item => (
          <LendingPool key={item.loanTokenAddress} lendingToken={item} />
        ))}
      </PageContainer>
    </SafeAreaPage>
  );
};
