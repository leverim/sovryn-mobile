import React from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';

export const SafeAreaPage: React.FC = ({ children }) => {
  return <SafeAreaView style={styles.container}>{children}</SafeAreaView>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
