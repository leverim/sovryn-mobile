import React from 'react';
import { Button } from 'react-native';
import { Header } from 'react-native/Libraries/NewAppScreen';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { WelcomeFlowStackProps } from '.';

type Props = NativeStackScreenProps<WelcomeFlowStackProps, 'onboarding'>;

export const Welcome: React.FC<Props> = ({ navigation }) => {
  return (
    <>
      <Header />
      <Button
        title="Import Wallet"
        onPress={() => navigation.navigate('onboarding.import')}
      />
      <Button
        title="Create Wallet"
        onPress={() => navigation.navigate('onboarding.create')}
      />
    </>
  );
};
