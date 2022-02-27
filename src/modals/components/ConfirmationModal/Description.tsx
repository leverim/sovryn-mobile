import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'components/Text';

type DescriptionProps = {
  text: string;
};

export const Description: React.FC<DescriptionProps> = ({ text }) => {
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
    marginBottom: 32,
  },
  text: {
    textAlign: 'center',
  },
});
