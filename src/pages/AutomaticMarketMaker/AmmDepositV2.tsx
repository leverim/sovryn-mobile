import { DarkTheme } from '@react-navigation/native';
import { globalStyles } from 'global.styles';
import React, { useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { getSovAsset } from 'utils/asset-utils';
import { useAmmPoolData } from './hooks/useAmmPoolData';
import { AmmRoutesStackProps } from 'routers/amm.routes';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PageContainer, SafeAreaPage } from 'templates/SafeAreaPage';
import { Text } from 'components/Text';
import { AmmAmountField } from './components/AmmAmountField';
import { useAssetBalance } from 'hooks/useAssetBalance';
import { useWalletAddress } from 'hooks/useWalletAddress';
import { TokenApprovalFlow } from 'components/TokenApprovalFlow';
import { Button } from 'components/Buttons/Button';
import { getContractAddress } from 'utils/helpers';

type Props = NativeStackScreenProps<AmmRoutesStackProps, 'amm.deposit'>;

export const AmmDepositV2: React.FC<Props> = ({ route }) => {
  const { pool } = route.params;
  const { state, execute, balance, rewards } = useAmmPoolData(pool);
  const sov = getSovAsset(pool.chainId);

  const owner = useWalletAddress();
  const { value: balance1 } = useAssetBalance(
    pool.supplyToken1.getWrappedAsset(),
    owner,
  );
  const { value: balance2 } = useAssetBalance(
    pool.supplyToken2.getWrappedAsset(),
    owner,
  );

  const [amount1, setAmount1] = useState('');
  const [amount2, setAmount2] = useState('');

  const liquidityMiningProxyAddress = getContractAddress(
    'liquidityMiningProxy',
    pool.chainId,
  );

  const approvalToken = useMemo(() => {
    if (pool.supplyToken1.native) {
      return {
        token: pool.supplyToken1,
        amount: '1',
      };
    }
    return {
      token: pool.supplyToken2,
      amount: '1',
    };
  }, [pool.supplyToken1, pool.supplyToken2]);

  return (
    <SafeAreaPage keyboardAvoiding scrollView>
      <PageContainer>
        <Text>test</Text>
        <AmmAmountField
          amount={amount1}
          onAmountChanged={setAmount1}
          token={pool.supplyToken1}
          balance={balance1}
        />
        <AmmAmountField
          amount={amount2}
          onAmountChanged={setAmount2}
          token={pool.supplyToken2}
          balance={balance2}
        />
        <TokenApprovalFlow
          chainId={pool.chainId}
          spender={liquidityMiningProxyAddress}
          tokenId={approvalToken.token.id}
          requiredAmount={approvalToken.amount}>
          <Button primary title="Deposit" />
        </TokenApprovalFlow>
      </PageContainer>
    </SafeAreaPage>
  );
};

const topStyles = StyleSheet.create({
  view: {
    paddingVertical: globalStyles.page.paddingVertical / 2,
    paddingHorizontal: globalStyles.page.paddingHorizontal,
  },
  container: {
    padding: 12,
    backgroundColor: DarkTheme.colors.card,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    position: 'relative',
  },
  logoContainer: {
    position: 'relative',
    height: 52,
    width: 80,
    marginRight: 12,
  },
  supplyAsset1: {
    position: 'absolute',
    width: 52,
    height: 52,
    backgroundColor: 'white',
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  supplyAsset2: {
    position: 'absolute',
    width: 52,
    height: 52,
    backgroundColor: 'white',
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    left: 25,
  },
  badges: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'absolute',
    top: 4,
    right: 2,
  },
  badgeWrapper: {
    paddingHorizontal: 2,
  },
});

const bottomStyles = StyleSheet.create({
  container: {
    backgroundColor: DarkTheme.colors.card,
    paddingTop: 24,
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
