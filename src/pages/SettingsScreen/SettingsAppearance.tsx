import React from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaPage } from 'templates/SafeAreaPage';
import { SettingsStackProps } from 'routers/settings.routes';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { globalStyles } from 'global.styles';
import { Text } from 'components/Text';

type Props = NativeStackScreenProps<SettingsStackProps, 'settings.appearance'>;

export const SettingsAppearance: React.FC<Props> = () => {
  return (
    <SafeAreaPage>
      <ScrollView style={globalStyles.page}>
        <Text>todo.</Text>
      </ScrollView>
    </SafeAreaPage>
  );
};
