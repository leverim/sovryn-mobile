import { useEffect, useState } from 'react';
import { Keyboard, KeyboardEvent } from 'react-native';

export function useKeyboardHeight() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  function onKeyboardDidShow(e: KeyboardEvent) {
    setKeyboardHeight(e.endCoordinates.height);
  }

  function onKeyboardDidHide() {
    setKeyboardHeight(0);
  }

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', onKeyboardDidShow);
    const hide = Keyboard.addListener('keyboardDidHide', onKeyboardDidHide);
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return keyboardHeight;
}
