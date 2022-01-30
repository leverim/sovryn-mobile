import React from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { ChainId } from 'types/network';
import { currentChainId, getTxInExplorer, prettifyTx } from 'utils/helpers';
import { Text } from './Text';

type TransactionBadgeProps = {
  txHash: string;
  chainId?: ChainId;
};

export const TransactionBadge: React.FC<TransactionBadgeProps> = ({
  txHash,
  chainId = currentChainId(),
}) => {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => Linking.openURL(getTxInExplorer(txHash, chainId))}>
        <Text style={styles.text}>{prettifyTx(txHash)}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  text: {
    fontWeight: '500',
  },
});
