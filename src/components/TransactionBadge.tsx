import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { currentChainId, prettifyTx } from 'utils/helpers';

type TransactionBadgeProps = {
  txHash: string;
  chainId?: number;
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
