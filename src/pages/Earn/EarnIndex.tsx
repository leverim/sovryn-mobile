import React from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaPage } from 'templates/SafeAreaPage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { globalStyles } from 'global.styles';
import { EarnRoutesStackProps } from 'routers/earn.routes';
import { EarnFeature } from './components/EarnFeature';

type Props = NativeStackScreenProps<EarnRoutesStackProps, 'earn.index'>;

export const EarnIndex: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaPage>
      <ScrollView style={globalStyles.page}>
        <EarnFeature
          title="Lending"
          description="Lend your assets to earn interest."
          cta="Start Lending"
          onPress={() => navigation.navigate('lending')}
        />
      </ScrollView>
    </SafeAreaPage>
  );
};
