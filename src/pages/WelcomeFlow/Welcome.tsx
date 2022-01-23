import React from 'react';
import { Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header } from 'react-native/Libraries/NewAppScreen';
import { passcode } from 'controllers/PassCodeController';

export const Welcome: React.FC = () => {
  const navigation = useNavigation();

  const save = async () => {
    passcode
      .setPassword('123457')
      .then(saved => console.log('saved', saved))
      .catch(error => console.log('error', error));
  };

  const get = async () => {
    const text = await passcode.unlock();
    console.log('secret', text);
  };

  const check = async () => passcode.supportedBiometrics().then(console.log);

  return (
    <>
      <Header />

      <Button title="Check" onPress={check} />
      <Button title="Save" onPress={save} />
      <Button title="Retrieve" onPress={get} />

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
