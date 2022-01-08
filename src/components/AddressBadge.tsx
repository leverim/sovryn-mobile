import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { currentChainId, prettifyTx } from 'utils/helpers';
import { toChecksumAddress } from 'utils/rsk';

type AddressBadgeProps = {
  address: string;
  chainId?: number;
};

export const AddressBadge: React.FC<AddressBadgeProps> = ({
  address,
  chainId = currentChainId(),
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {prettifyTx(toChecksumAddress(address, chainId))}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  text: {
    fontWeight: '500',
  },
});
