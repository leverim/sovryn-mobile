import React, { useCallback, useContext } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { WelcomeFlowStackProps } from '.';
import { AppContext } from 'context/AppContext';
import { AccountType } from 'utils/accounts';
import { PassCodeSetup } from 'components/PassCode/PassCodeSetup';

type Props = NativeStackScreenProps<
  WelcomeFlowStackProps,
  'onboarding.passcode'
>;

export const CreatePasscode: React.FC<Props> = ({ route: { params } }) => {
  const { createWallet } = useContext(AppContext);

  const handleConfirm = useCallback(async () => {
    createWallet('Wallet #1', AccountType.MNEMONIC, params.secret)
      .then(() => {
        console.log('create wallet.');
      })
      .catch(err => {
        console.error(err);
      });
  }, [params.secret, createWallet]);

  return <PassCodeSetup onPasscodeConfirmed={handleConfirm} />;
};
