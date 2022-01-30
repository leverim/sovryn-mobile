import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SettingsStackProps } from 'pages/MainScreen/SettingsPage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaPage } from 'templates/SafeAreaPage';
import { ScrollView, Switch } from 'react-native';
import { globalStyles } from 'global.styles';
import { NavGroup } from 'components/NavGroup/NavGroup';
import { NavItem } from 'components/NavGroup/NavItem';
import { usePrettyBiometryName } from 'hooks/useBiometryType';
import { passcode, PassCodeType } from 'controllers/PassCodeController';
import { useFocusEffect } from '@react-navigation/native';

type Props = NativeStackScreenProps<SettingsStackProps, 'settings.passcode'>;

export const SettingsPasscode: React.FC<Props> = ({
  route: { params },
  navigation,
}) => {
  const biometry = usePrettyBiometryName();
  const [biometryEnabled, setBiometryEnabled] = useState(false);
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

  useEffect(() => {
    passcode
      .getPasscodeType()
      .then(type => setBiometryEnabled(type === PassCodeType.BIOMETRY))
      .catch(() => setBiometryEnabled(false));
  }, []);

  const handleChangeClick = useCallback(
    () =>
      navigation.navigate('settings.passcode.change', {
        password: params.password,
      }),
    [navigation, params.password],
  );

  const handleBiometryState = useCallback(async () => {
    const verified = await passcode.verify(params.password);
    if (verified) {
      const type = await passcode.getPasscodeType();
      await passcode.setPassword(
        params.password,
        type === PassCodeType.BIOMETRY
          ? PassCodeType.PASSCODE
          : PassCodeType.BIOMETRY,
      );
      setBiometryEnabled(type === PassCodeType.PASSCODE);
    }
  }, [params.password]);

  return (
    <SafeAreaPage>
      <ScrollView style={globalStyles.page}>
        <NavGroup>
          <NavItem title="Change passcode" onPress={handleChangeClick} />
        </NavGroup>
        {biometry && (
          <NavGroup>
            <NavItem
              title={`Unlock with ${biometry}`}
              hideArrow
              value={
                <Switch
                  value={biometryEnabled}
                  onValueChange={handleBiometryState}
                />
              }
            />
          </NavGroup>
        )}
      </ScrollView>
    </SafeAreaPage>
  );
};
