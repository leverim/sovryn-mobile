import React, { useContext, useEffect } from 'react';
import { Button, SafeAreaView, Text } from 'react-native';
import { AppContext } from 'context/AppContext';
import { useNavigation } from '@react-navigation/native';

export const SettingsScreen: React.FC = () => {
  const { signOut } = useContext(AppContext);
  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({
      title: 'Settings',
    });
  }, [navigation]);
  return (
    <SafeAreaView>
      <Text>SettingsPage</Text>
      <Button
        title="Account Settings"
        onPress={() => navigation.navigate('settings.account')}
      />
      <Button title="Sign Out" onPress={signOut} />
    </SafeAreaView>
  );
};
