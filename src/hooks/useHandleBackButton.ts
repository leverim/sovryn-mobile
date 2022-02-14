import { useCallback, useEffect } from 'react';
import { BackHandler } from 'react-native';

export function useHandleBackButton(callback: () => void) {
  const handleBackPress = useCallback(() => {
    callback();
    return true;
  }, [callback]);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, [handleBackPress]);
}
