import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useWalletAddress } from 'hooks/useWalletAddress';
import { currentChainId } from 'utils/helpers';
import { tokenUtils } from 'utils/token-utils';
import { SafeAreaPage } from 'templates/SafeAreaPage';
import { Text } from 'components/Text';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SwapStackProps } from '..';

type Props = NativeStackScreenProps<SwapStackProps, 'swap.index'>;

export const SwapIndexScreen: React.FC<Props> = () => {
  const chainId = currentChainId();
  const tokens = useMemo(
    () => tokenUtils.listTokensForChainId(chainId),
    [chainId],
  );

  const owner = useWalletAddress();

  return (
    <SafeAreaPage>
      <ScrollView>
        <View style={styles.container}>
          <Text>Swap your coins - WIP</Text>
        </View>
      </ScrollView>
    </SafeAreaPage>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
  },
  profileContainer: {
    marginBottom: 12,
    padding: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 5,
    marginHorizontal: 10,
    marginBottom: 25,
    flex: 1,
  },
});
