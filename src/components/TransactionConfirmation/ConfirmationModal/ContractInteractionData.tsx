import React from 'react';
import { View } from 'react-native';
import { Text } from 'components/Text';
import { DataModalProps } from './ConfirmationModal';
import { BigNumber } from 'ethers';

export const ContractInteractionData: React.FC<DataModalProps> = ({ request }) => {
  return (
    <View>
      <Text>To: {request.to}</Text>
      <Text>Amount: {BigNumber.from(request.value).toString()}</Text>
      <Text>Data: {request.data?.toString()}</Text>
      <Text>Chain ID: {request.chainId?.toString()}</Text>
    </View>
  );
};
