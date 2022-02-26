import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'components/Text';
import { DarkTheme } from '@react-navigation/native';

type ErrorHolderProps = {
  text: string;
};

export const ErrorHolder: React.FC<ErrorHolderProps> = ({ text }) => {
  return (
    <View style={[styles.container]}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 32,
    width: '100%',
  },
  text: {
    textAlign: 'center',
    color: DarkTheme.colors.notification,
    width: '100%',
  },
});
