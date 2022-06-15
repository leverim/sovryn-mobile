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
          description="Earn passive income by lending your assets directly to borrowers or to margin traders."
          cta="Start Lending"
          onPress={() => navigation.navigate('lending')}
        />
        <EarnFeature
          title="Market Maker"
          description="Provide liquidity for Sovryn's protocol and earn fees when users trade with your asset."
          cta="Start Mining"
          onPress={() => navigation.navigate('amm')}
        />
        <EarnFeature
          title="Borrow"
          description="Borrow from Sovryn."
          cta="Borrow"
          onPress={() => navigation.navigate('borrow')}
        />
      </ScrollView>
    </SafeAreaPage>
  );
};
