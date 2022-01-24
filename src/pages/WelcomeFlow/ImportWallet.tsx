import React, { useCallback, useMemo, useState } from 'react';
import { validateMnemonic } from 'utils/wallet-utils';
import { InputField } from 'components/InputField';
import { PressableButton } from 'components/PressableButton';
import { SafeAreaPage } from 'templates/SafeAreaPage';
import { Text } from 'components/Text';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { WelcomeFlowStackProps } from '.';

type Props = NativeStackScreenProps<WelcomeFlowStackProps, 'onboarding.import'>;

export const ImportWallet: React.FC<Props> = ({ navigation }) => {
  const [seed, setSeed] = useState('');

  const valid = useMemo(() => {
    const words = seed.split(' ');
    if (words.length < 12) {
      return false;
    }
    return validateMnemonic(seed);
  }, [seed]);

  const handleConfirm = useCallback(
    () => navigation.navigate('onboarding.passcode', { secret: seed }),
    [navigation, seed],
  );

  return (
    <SafeAreaPage>
      <Text>Enter your seed phrase:</Text>
      <InputField
        value={seed}
        onChangeText={setSeed}
        multiline
        numberOfLines={6}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="off"
      />
      <PressableButton
        title="Confirm"
        onPress={handleConfirm}
        disabled={!valid}
      />
    </SafeAreaPage>
  );
};
