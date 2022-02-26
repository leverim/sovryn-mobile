import { DarkTheme } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Alert } from 'react-native';

import { passcode } from 'controllers/PassCodeController';
import { PASSCODE_LENGTH } from 'utils/constants';
import { PageContainer, SafeAreaPage } from 'templates/SafeAreaPage';
import { PassCodeSetupKeyboard } from 'components/PassCode/PassCodeSetup';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ModalStackRoutes } from 'routers/modal.routes';

type Props = NativeStackScreenProps<ModalStackRoutes, 'modal.passcode-confirm'>;

export const PasscodeConfirmation: React.FC<Props> = ({
  route,
  navigation,
}) => {
  const closeHandled = useRef<boolean>(false);
  const { title, onConfirm, onReject } = route.params;

  const [code, setCode] = useState('');

  const handleValidCode = useCallback(
    (value: string) => {
      onConfirm(value);
      closeHandled.current = true;
      navigation.goBack();
    },
    [navigation, onConfirm],
  );

  const onRejectPressed = useCallback(() => {
    onReject(new Error('Authorization aborted'));
    closeHandled.current = true;
    navigation.goBack();
  }, [navigation, onReject]);

  const handleCodeChange = useCallback(
    async value => {
      setCode(value);

      if (value.length === PASSCODE_LENGTH) {
        const verify = await passcode.verify(value);
        if (verify) {
          setCode('');
          handleValidCode(value);
        } else {
          setCode('');
          Alert.alert('Pascode is invalid');
        }
      }
    },
    [handleValidCode],
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      if (!closeHandled.current) {
        onRejectPressed();
      }
    });
    return unsubscribe;
  }, [navigation, onReject, onRejectPressed]);

  return (
    <SafeAreaPage>
      <PageContainer>
        <View style={[styles.keyboardView]}>
          <View style={styles.innerContainer}>
            <PassCodeSetupKeyboard
              title={title || 'Unlock wallet'}
              code={code}
              setCode={handleCodeChange}
              onAbort={onRejectPressed}
            />
          </View>
        </View>
      </PageContainer>
    </SafeAreaPage>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    width: '100%',
    backgroundColor: DarkTheme.colors.background,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  keyboardView: {
    padding: 20,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
