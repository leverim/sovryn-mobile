import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ChainId } from 'types/network';
import { currentChainId, prettifyTx } from 'utils/helpers';
import { toChecksumAddress } from 'utils/rsk';
import { Text } from './Text';

type AddressBadgeProps = {
  address: string;
  chainId?: ChainId;
};

export const AddressBadge: React.FC<AddressBadgeProps> = ({
  address,
  chainId = currentChainId(),
}) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.text]}>
        {prettifyTx(toChecksumAddress(address, chainId))}
      </Text>
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
