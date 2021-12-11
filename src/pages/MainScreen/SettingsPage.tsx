import React, { useContext } from 'react';
import { Button, SafeAreaView, Text } from 'react-native';
import { AppContext } from 'context/AppContext';

export const SettingsPage: React.FC = () => {
  const { signOut } = useContext(AppContext);
  return (
    <SafeAreaView>
      <Text>SettingsPage</Text>
      <Button title="Sign Out" onPress={signOut} />
    </SafeAreaView>
  );
};
