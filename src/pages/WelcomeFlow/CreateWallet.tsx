import React, { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { generateMnemonic } from 'utils/wallet-utils';
import { PressableButton } from 'components/PressableButton';
import { SafeAreaPage } from 'templates/SafeAreaPage';
import { Text } from 'components/Text';
import { WelcomeFlowStackProps } from '.';

type Props = NativeStackScreenProps<WelcomeFlowStackProps, 'onboarding.create'>;

export const CreateWallet: React.FC<Props> = ({ navigation }) => {
  const mnemonic = useMemo(() => generateMnemonic().split(' '), []);

  const handleConfirm = useCallback(
    () =>
      navigation.navigate('onboarding.passcode', {
        secret: mnemonic.join(' '),
      }),
    [navigation, mnemonic],
  );

  return (
    <SafeAreaPage>
      <Text>Create Wallet</Text>
      <View>
        {mnemonic.map((word, index) => (
          <View style={{ padding: 3 }} key={word}>
            <Text>
              #{index + 1}. {word}
            </Text>
          </View>
        ))}
      </View>

      <PressableButton title="Confirm" onPress={handleConfirm} />
    </SafeAreaPage>
  );
};
