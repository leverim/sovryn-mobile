import React, { useCallback, useContext } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { WelcomeFlowStackProps } from '.';
import { AppContext } from 'context/AppContext';
import { PassCodeSetup } from 'components/PassCode/PassCodeSetup';

type Props = NativeStackScreenProps<
  WelcomeFlowStackProps,
  'onboarding.passcode'
>;

export const CreatePasscode: React.FC<Props> = ({ route: { params } }) => {
  const { createWallet } = useContext(AppContext);

  const handleConfirm = useCallback(
    async (password: string) => {
      createWallet(params.name, params.type, params.secret, password)
        .then(() => {
          console.log('create wallet.');
        })
        .catch(err => {
          console.error(err);
        });
    },
    [createWallet, params.name, params.type, params.secret],
  );

  return <PassCodeSetup onPasscodeConfirmed={handleConfirm} />;
};
