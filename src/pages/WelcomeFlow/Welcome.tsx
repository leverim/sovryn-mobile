import React from 'react';
import { Button, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header } from 'react-native/Libraries/NewAppScreen';

export const Welcome: React.FC = () => {
  const navigation = useNavigation();
  return (
    <>
      <Header />
      <Text>Hello there</Text>
      <Button
        title="Import Wallet"
        onPress={() => navigation.navigate('ImportWallet')}
      />
      <Button
        title="Create Wallet"
        onPress={() => navigation.navigate('CreateWallet')}
      />
    </>
  );
};
