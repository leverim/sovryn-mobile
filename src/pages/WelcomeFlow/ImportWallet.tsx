import React, { useCallback } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { WelcomeFlowStackProps } from '.';
import { AccountType } from 'utils/accounts';
import { ImportWalletView } from 'components/WalletCreation/ImportWalletView';

type Props = NativeStackScreenProps<WelcomeFlowStackProps, 'onboarding.import'>;

export const ImportWallet: React.FC<Props> = ({ navigation }) => {
  const handleImport = useCallback(
    (name: string, secret: string, type: AccountType) =>
      navigation.navigate('onboarding.passcode', {
        name,
        secret,
        type: type!,
      }),
    [navigation],
  );
  return <ImportWalletView onHandleImport={handleImport} />;
};
