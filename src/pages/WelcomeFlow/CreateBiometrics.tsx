import React, { useCallback, useContext, useEffect, useState } from 'react';
import { PressableButton } from 'components/PressableButton';
import { SafeAreaPage } from 'templates/SafeAreaPage';
import { Text } from 'components/Text';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { passcode, PassCodeType } from 'controllers/PassCodeController';
import { BIOMETRY_TYPE } from 'react-native-keychain';
import { WelcomeFlowStackProps } from '.';
import { AppContext } from 'context/AppContext';
import { AccountType } from 'utils/accounts';

type Props = NativeStackScreenProps<
  WelcomeFlowStackProps,
  'onboarding.biometrics'
>;

export const CreateBiometrics: React.FC<Props> = ({ route: { params } }) => {
  const { createWallet } = useContext(AppContext);

  const [biometricsType, setBiometricsType] = useState<BIOMETRY_TYPE | null>(
    null,
  );

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    passcode.supportedBiometrics().then(setBiometricsType);
  }, []);

  const handleConfirm = useCallback(
    (type: PassCodeType) => () => {
      setLoading(true);
      passcode.setPassword(params.passcode, type).then(() => {
        createWallet('Wallet #1', AccountType.MNEMONIC, params.secret)
          .then(() => {
            console.log('seed');
          })
          .catch(err => {
            console.error(err);
          })
          .finally(() => setLoading(false));
      });
    },
    [params.secret, params.passcode, createWallet],
  );

  return (
    <SafeAreaPage>
      <Text>Enable {biometricsType}</Text>

      <Text>Secure your wallet with {biometricsType}</Text>

      <PressableButton
        title="Enable"
        onPress={handleConfirm(PassCodeType.BIOMETRY)}
        loading={loading}
        disabled={loading}
      />

      <PressableButton
        title="Skip for now"
        onPress={handleConfirm(PassCodeType.PASSCODE)}
        loading={loading}
        disabled={loading}
      />
    </SafeAreaPage>
  );
};
