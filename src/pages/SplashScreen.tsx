import React from 'react';
import { ImageBackground, StyleSheet } from 'react-native';

export const SplashScreen: React.FC = ({ children }) => {
  return (
    <ImageBackground
      accessibilityRole={'image'}
      source={require('../assets/logo.png')}
      style={styles.background}
      imageStyle={styles.logo}>
      {children}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  logo: {
    opacity: 0.2,
    overflow: 'visible',
    resizeMode: 'cover',
  },
  text: {
    fontSize: 40,
    fontWeight: '600',
    textAlign: 'center',
    color: 'white',
  },
});
