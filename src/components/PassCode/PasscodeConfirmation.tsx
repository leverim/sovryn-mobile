import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef } from 'react';

import { passcode, PassCodeType } from 'controllers/PassCodeController';
import { useBiometryType } from 'hooks/useBiometryType';
import { ModalStackRoutes } from 'routers/modal.routes';

type PasscodeConfirmation = {};

export const PasscodeConfirmation: React.FC<PasscodeConfirmation> = () => {
  const biometryType = useBiometryType();
  const navigation = useNavigation<NavigationProp<ModalStackRoutes>>();

  const ref = useRef<{
    title?: string;
    skipBiometrics: boolean;
    resolve: any;
    reject: any;
  }>();

  const keypadPromiseRef = useRef<{ resolve: any; reject: any }>();

  const handleConfirmation = useCallback((code: string) => {
    ref.current?.resolve(code);
  }, []);

  const handleRejection = useCallback((err: Error) => {
    ref.current?.reject(err);
  }, []);

  const tryUnlockingWithKeypad = useCallback(() => {
    navigation.navigate('modal.passcode-confirm', {
      title: ref.current?.title,
      onConfirm: handleConfirmation,
      onReject: handleRejection,
    });

    return new Promise<string>((resolve, reject) => {
      keypadPromiseRef.current = { resolve, reject };
    });
  }, [handleConfirmation, handleRejection, navigation]);

  const tryUnlockingWallet = useCallback(async () => {
    const usesBiometry = await passcode.getPasscodeType();
    console.log('@:try unlocking', ref.current);
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
          } else {
          }
        }
      })
      .catch(error => console.log('@:try unlocking failed?', error));
    // ref.current && ref.current.resolve && ref.current.resolve(['0x111']);
    // setRequest(undefined);
  }, [tryUnlockingWallet]);

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

  return <></>;
};
