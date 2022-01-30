import React, { useCallback, useRef } from 'react';
import { SettingsStackProps } from 'pages/MainScreen/SettingsPage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PassCodeSetup } from 'components/PassCode/PassCodeSetup';
import { useFocusEffect } from '@react-navigation/native';
import { accounts } from 'utils/accounts';

type Props = NativeStackScreenProps<SettingsStackProps, 'settings.passcode'>;

export const SettingsPasscodeChange: React.FC<Props> = ({
  route: { params },
  navigation,
}) => {
  const unfocusRef = useRef(false);

  // redirect user out of this screen in case user was in another tab
  // this will add some extra security and will not allow user to change
  //   password without entering current one again
  useFocusEffect(
    useCallback(() => {
      if (unfocusRef.current) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'settings.index' }],
        });
      }
      return () => {
        unfocusRef.current = true;
      };
    }, [navigation]),
  );

  const handleConfirm = useCallback(
    async (newPassword: string) => {
      await accounts.changePassword(params.password, newPassword);
      navigation.reset({
        index: 0,
        routes: [{ name: 'settings.index' }],
      });
    },
    [navigation, params.password],
  );

  return <PassCodeSetup onPasscodeConfirmed={handleConfirm} />;
};
