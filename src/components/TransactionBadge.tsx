import React from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { ChainId } from 'types/network';
import { currentChainId, prettifyTx } from 'utils/helpers';
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
        onPress={() =>
          Linking.openURL(`https://explorer.testnet.rsk.co/tx/${txHash}`)
        }>
        <Text style={styles.text}>{prettifyTx(txHash)}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    width: '100%',
  },
  text: {
    fontWeight: '500',
  },
});
