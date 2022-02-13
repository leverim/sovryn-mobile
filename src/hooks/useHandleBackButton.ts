import { useEffect } from 'react';
import { BackHandler } from 'react-native';

export function useHandleBackButton(callback: () => void) {
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        callback();
        return true;
      },
    );
    return () => {
      backHandler.remove();
    };
  }, [callback]);
}
