import React from 'react';
import { Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header } from 'react-native/Libraries/NewAppScreen';

export const Welcome: React.FC = () => {
  const navigation = useNavigation();
  return (
    <>
      <Header />
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
