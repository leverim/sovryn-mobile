import React, { useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { generateMnemonic } from 'utils/wallet-utils';
import { PageContainer, SafeAreaPage } from 'templates/SafeAreaPage';
import { Text } from 'components/Text';
import { WelcomeFlowStackProps } from '.';
import { MnemonicPhrasePrinter } from 'components/MnemonicPhrasePrinter';
import { globalStyles } from 'global.styles';
import { WarningBadge } from 'components/WarningBadge';
import { Button } from 'components/Buttons/Button';

type Props = NativeStackScreenProps<WelcomeFlowStackProps, 'onboarding.create'>;

export const CreateWallet: React.FC<Props> = ({ navigation }) => {
  const mnemonic = useMemo(() => generateMnemonic(), []);

  const handleContinue = useCallback(
    () =>
      navigation.navigate('onboarding.create.verify', {
        seed: mnemonic,
      }),
    [navigation, mnemonic],
  );

  return (
    <SafeAreaPage
      keyboardAvoiding
      scrollView
      scrollViewProps={{ keyboardShouldPersistTaps: 'handled' }}>
      <PageContainer>
        <Text style={[globalStyles.title, styles.title]}>
          Your Recovery Phrase
        </Text>

        <Text style={styles.description}>
          Write down or copy these words in the right order and save them
          somewhere safe.
        </Text>

        <WarningBadge text="Never share recovery phrase with anyone, store it securely!" />

        <MnemonicPhrasePrinter text={mnemonic} />

        <Button title="Continue" onPress={handleContinue} primary />
      </PageContainer>
    </SafeAreaPage>
  );
};

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginBottom: 18,
  },
});
