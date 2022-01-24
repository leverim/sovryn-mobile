import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { View } from 'react-native';
import { generateMnemonic } from 'utils/wallet-utils';
import { PressableButton } from 'components/PressableButton';
import { SafeAreaPage } from 'templates/SafeAreaPage';
import { Text } from 'components/Text';
import { InputField } from 'components/InputField';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { passcode, PassCodeType } from 'controllers/PassCodeController';
import { BIOMETRY_TYPE } from 'react-native-keychain';
import { WelcomeFlowStackProps } from '.';
import { AppContext } from 'context/AppContext';
import { AccountType } from 'utils/accounts';

type Props = NativeStackScreenProps<
  WelcomeFlowStackProps,
  'onboarding.passcode'
>;

export const CreatePasscode: React.FC<Props> = ({
  navigation,
  route: { params },
}) => {
  const { createWallet } = useContext(AppContext);

  const [biometricsType, setBiometricsType] = useState<BIOMETRY_TYPE | null>(
    null,
  );

  const [loading, setLoading] = useState(false);

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  const error = useMemo(() => {
    if (!password || password.length < 4) {
      return 'Password is too short.';
    }
    if (password !== passwordConfirmation) {
      return 'Password confirmation does not match.';
    }
    return false;
  }, [password, passwordConfirmation]);

  useEffect(() => {
    passcode.supportedBiometrics().then(setBiometricsType);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (biometricsType) {
      navigation.navigate('onboarding.biometrics', {
        secret: params.secret,
        passcode: password,
      });
    } else {
      setLoading(true);
      passcode.setPassword(password, PassCodeType.PASSCODE).then(() => {
        createWallet('Wallet #1', AccountType.MNEMONIC, params.secret)
          .then(() => {
            console.log('seed');
          })
          .catch(err => {
            console.error(err);
          })
          .finally(() => setLoading(false));
      });
    }
  }, [biometricsType, navigation, params.secret, password, createWallet]);

  return (
    <SafeAreaPage>
      <Text>Create Passcode</Text>
      <View>
        <InputField
          label="Password"
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <View>
        <InputField
          label="Confirm Password"
          value={passwordConfirmation}
          onChangeText={setPasswordConfirmation}
        />
      </View>

      {error && <Text>{error}</Text>}

      <PressableButton
        title="Continue"
        onPress={handleConfirm}
        loading={loading}
        disabled={loading || !!error}
      />
    </SafeAreaPage>
  );
};
