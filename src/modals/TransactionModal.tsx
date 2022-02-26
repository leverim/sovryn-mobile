import React, { useCallback, useMemo } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { BigNumber } from 'ethers';
import { Text } from 'components/Text';
import { useIsDarkTheme } from 'hooks/useIsDarkTheme';
import { Button } from 'components/Buttons/Button';
import { TransactionBadge } from 'components/TransactionBadge';
import { formatAndCommify, getTxInExplorer } from 'utils/helpers';
import { ChainId } from 'types/network';
import { useSelectTransaction } from 'hooks/useSelectTransaction';
import { getNativeAsset } from 'utils/asset-utils';
import { getNetworkByChainId } from 'utils/network-utils';
import { Item } from 'modals/components/ConfirmationModal/Item';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ModalStackRoutes } from 'routers/modal.routes';
import { PageContainer, SafeAreaPage } from 'templates/SafeAreaPage';

type Props = NativeStackScreenProps<ModalStackRoutes, 'modal.transaction'>;

export const TransactionModal: React.FC<Props> = ({ route, navigation }) => {
  const { hash } = route.params;

  const dark = useIsDarkTheme();
  const { response, receipt } = useSelectTransaction(hash);
  const coin = getNativeAsset(response.chainId as ChainId);
  const network = getNetworkByChainId(response.chainId as ChainId);
  const handleOpenInExplorer = useCallback(
    () =>
      Linking.openURL(
        getTxInExplorer(response?.hash!, response?.chainId as ChainId),
      ),
    [response?.hash, response?.chainId],
  );
  const fee = useMemo(() => {
    return receipt
      ? BigNumber.from(receipt.gasUsed).mul(
          receipt.effectiveGasPrice || response.gasPrice,
        )
      : BigNumber.from(response.gasLimit).mul(response.gasPrice!);
  }, [receipt, response]);

  return (
    <SafeAreaPage>
      <PageContainer style={styles.container}>
        <View style={styles.main}>
          <Item title="Network:" content={<Text>{network.name}</Text>} />
          <Item
            title="Hash:"
            content={<TransactionBadge txHash={response.hash} />}
          />
          <Item
            title="Status:"
            content={
              <Text>
                {receipt?.status === 1 && 'Confirmed'}
                {receipt?.status === 0 && 'Failed'}
                {(!response.confirmations || !receipt) && 'Pending'}
              </Text>
            }
          />
          <Item title="Nonce:" content={<Text>{response.nonce}</Text>} />
          <Item
            title="Fee:"
            content={
              <Text>
                {formatAndCommify(fee, coin.decimals)} {coin.symbol}
              </Text>
            }
            hideBorder
          />
        </View>
        <View style={[styles.footer, dark && styles.footerDark]}>
          <Button title="Close" onPress={navigation.goBack} primary />
          <Button title="Open in explorer" onPress={handleOpenInExplorer} />
        </View>
      </PageContainer>
    </SafeAreaPage>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  main: {},
  modalView: {
    width: '100%',
  },
  modalViewDark: {
    // backgroundColor: DarkTheme.colors.card,
  },

  footer: {
    width: '100%',
    marginTop: 36,
  },
  footerDark: {},
});
