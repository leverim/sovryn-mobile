import { DarkTheme } from '@react-navigation/native';
import { Button } from 'components/Buttons/Button';
import { Text } from 'components/Text';
import React from 'react';
import { GestureResponderEvent, StyleSheet, View } from 'react-native';

type Props = {
  title: string;
  description: string;
  cta: string;
  onPress: (event?: GestureResponderEvent) => void;
};

export const EarnFeature: React.FC<Props> = ({
  title,
  description,
  cta,
  onPress,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>{title}</Text>
      <Text style={styles.descriptionText}>{description}</Text>
      <Button title={cta} onPress={onPress} primary />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    backgroundColor: DarkTheme.colors.card,
    borderWidth: 1,
    borderColor: DarkTheme.colors.border,
    borderRadius: 12,
    padding: 12,
  },
  titleText: {
    fontSize: 18,
    marginBottom: 8,
    fontWeight: '500',
  },
  descriptionText: {
    fontSize: 14,
    marginBottom: 12,
    fontWeight: '300',
  },
});
