import { DarkTheme } from '@react-navigation/native';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleSheet, View, Alert, Dimensions } from 'react-native';
import { Modal, ModalContent } from 'react-native-modals';

import { passcode, PassCodeType } from 'controllers/PassCodeController';
import { useBiometryType } from 'hooks/useBiometryType';
import { PassCodeSetupKeyboard } from './PassCodeSetup';
import { PASSCODE_LENGTH } from 'utils/constants';
import { useKeyboardHeight } from 'hooks/useKeyboardHeight';
import { HandleBackPress } from 'components/HandleBackPress';

type PasscodeConfirmation = {};

export const PasscodeConfirmation: React.FC<PasscodeConfirmation> = () => {
  const biometryType = useBiometryType();
  const [showKeypad, setShowKeypad] = useState(false);

  const height = useKeyboardHeight();

  const containerHeight = useMemo(
    () => Dimensions.get('window').height - (height || 216),
    [height],
  );

  const ref = useRef<{
    title?: string;
    skipBiometrics: boolean;
    resolve: any;
    reject: any;
  }>();

  const keypadPromiseRef = useRef<{ resolve: any; reject: any }>();

  const tryUnlockingWithKeypad = useCallback(() => {
    setShowKeypad(true);
    return new Promise<string>((resolve, reject) => {
      keypadPromiseRef.current = { resolve, reject };
    });
  }, []);

  const tryUnlockingWallet = useCallback(async () => {
    const usesBiometry = await passcode.getPasscodeType();
    console.log('tru unlocking', ref.current);
    if (
      biometryType &&
      usesBiometry === PassCodeType.BIOMETRY &&
      !ref.current?.skipBiometrics
    ) {
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
    await tryUnlockingWallet()
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
      ({ resolve, reject, title, skipBiometrics }) => {
        ref.current = { resolve, reject, title, skipBiometrics };
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
    <Modal
      visible={showKeypad}
      style={[styles.modal, { height: containerHeight }]}>
      {showKeypad && <HandleBackPress onClose={onRejectPressed} />}
      <ModalContent style={[styles.modalContent, { height: containerHeight }]}>
        <View style={[styles.keyboardView, { height: containerHeight }]}>
          <View style={styles.innerContainer}>
            <PassCodeSetupKeyboard
              title={ref.current?.title || 'Unlock wallet'}
              code={code}
              setCode={handleCodeChange}
              onAbort={onRejectPressed}
            />
          </View>
        </View>
      </ModalContent>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: DarkTheme.colors.background,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    margin: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
    flex: 1,
  },
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
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  innerContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
