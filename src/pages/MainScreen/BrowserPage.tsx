import React from 'react';
import { SafeAreaView } from 'react-native';
import { Text } from 'components/Text';

export const BrowserPage: React.FC = () => {
  return (
    <SafeAreaView style={{ flexDirection: 'column', flex: 1 }}>
      <Text>test.</Text>
    </SafeAreaView>
  );
};
