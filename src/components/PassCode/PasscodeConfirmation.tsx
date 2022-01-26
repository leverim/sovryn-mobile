import { DarkTheme } from '@react-navigation/native';
import { useIsDarkTheme } from 'hooks/useIsDarkTheme';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Modal, ModalContent } from 'react-native-modals';

import { passcode } from 'controllers/PassCodeController';
import { useBiometryType } from 'hooks/useBiometryType';
import { PassCodeSetupKeyboard } from './PassCodeSetup';
import { PASSCODE_LENGTH } from 'utils/constants';

type PasscodeConfirmation = {};

export const PasscodeConfirmation: React.FC<PasscodeConfirmation> = () => {
  const biometryType = useBiometryType();
  const [showKeypad, setShowKeypad] = useState(false);

  const loading = useRef<boolean>(false);
  const ref = useRef<{ title?: string; resolve: any; reject: any }>();

  const keypadPromiseRef = useRef<{ resolve: any; reject: any }>();

  const dark = useIsDarkTheme();

  const tryUnlockingWithKeypad = useCallback(() => {
    console.log('try unlocking with keypad now');
    setShowKeypad(true);
    return new Promise<string>((resolve, reject) => {
      keypadPromiseRef.current = { resolve, reject };
    });
  }, []);

  const tryUnlockingWallet = useCallback(async () => {
    if (biometryType) {
      try {
        return await passcode.unlock(ref.current?.title);
      } catch (error) {
        return await tryUnlockingWithKeypad();
      }
    } else {
      return tryUnlockingWithKeypad();
    }
  }, [biometryType, tryUnlockingWithKeypad]);

  const tryUnlocking = useCallback(async () => {
    const result = await tryUnlockingWallet()
      .then(async password => {
        if (password) {
          const verify = await passcode.verify(password);
          if (verify) {
            ref.current?.resolve(password);
            setShowKeypad(false);
          } else {
          }
        }
      })
      .catch(error => console.log('try unlocking failed?', error));
    console.log('try unlocking finished?', result);
    // ref.current && ref.current.resolve && ref.current.resolve(['0x111']);
    // setRequest(undefined);
  }, [tryUnlockingWallet]);

  const onRejectPressed = useCallback(() => {
    setShowKeypad(false);
    ref.current?.reject(new Error('Authorization aborted'));
  }, []);

  useEffect(() => {
    const subscription = passcode.hub.on(
      'request',
      ({ resolve, reject }, title) => {
        ref.current = { resolve, reject, title };
        tryUnlocking();
      },
    );

    return () => {
      subscription.removeAllListeners('request');
    };
  }, [tryUnlocking]);

  const [code, setCode] = useState('');

  const handleCodeChange = useCallback(async value => {
    setCode(value);

    if (value.length === PASSCODE_LENGTH) {
      const verify = await passcode.verify(value);
      if (verify) {
        keypadPromiseRef.current?.resolve(value);
        setShowKeypad(false);
        setCode('');
      } else {
        setCode('');
        Alert.alert('Pascode is invalid');
      }
    }
  }, []);

  return (
    <Modal visible={showKeypad} style={styles.modal}>
      <ModalContent style={styles.modalContent}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.innerContainer}>
            <PassCodeSetupKeyboard
              title="Unlock wallet"
              code={code}
              setCode={handleCodeChange}
              onAbort={onRejectPressed}
            />
          </View>
        </KeyboardAvoidingView>
      </ModalContent>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: DarkTheme.colors.background,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    margin: 0,
    padding: 0,
  },
  modalContent: {
    backgroundColor: DarkTheme.colors.background,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    padding: 0,
    margin: 0,
  },
  keyboardView: {
    padding: 20,
    flex: 1,
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
