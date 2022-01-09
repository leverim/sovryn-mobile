import React from 'react';
import ReactNative, { StyleSheet, TextProps } from 'react-native';
import { useIsDarkTheme } from 'hooks/useIsDarkTheme';

export const Text: React.FC<TextProps> = ({ children, style, ...props }) => {
  const dark = useIsDarkTheme();
  return (
    <ReactNative.Text
      {...props}
      style={[styles.text, dark && styles.dark, style]}>
      {children}
    </ReactNative.Text>
  );
};

const styles = StyleSheet.create({
  text: {
    color: 'black',
  },
  dark: {
    color: 'white',
  },
});
