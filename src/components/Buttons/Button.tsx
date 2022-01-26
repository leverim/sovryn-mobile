import { DarkTheme } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, PressableProps, StyleSheet, Text } from 'react-native';

type ButtonProps = {
  title: string;
  loading?: boolean;
  intent?: ButtonIntent;
};

export enum ButtonIntent {
  PRIMARY,
  SECONDARY,
}

export const Button: React.FC<ButtonProps & PressableProps> = ({
  title,
  loading,
  disabled,
  onPressIn,
  onPressOut,
  intent = ButtonIntent.SECONDARY,
  ...pressableProps
}) => {
  const [pressedIn, setPressedIn] = useState(false);

  const handleOnPressIn = useCallback(
    event => {
      setPressedIn(true);
      if (onPressIn) {
        onPressIn(event);
      }
    },
    [onPressIn],
  );

  const handleOnPressOut = useCallback(
    event => {
      setPressedIn(false);
      if (onPressOut) {
        onPressOut(event);
      }
    },
    [onPressOut],
  );

  const styles = useMemo(
    () => (intent === ButtonIntent.PRIMARY ? primaryStyles : defaultStyles),
    [intent],
  );

  return (
    <Pressable
      onPressIn={handleOnPressIn}
      onPressOut={handleOnPressOut}
      style={[
        styles.pressable,
        pressedIn && styles.pressablePressed,
        disabled && styles.pressableDisabled,
      ]}
      disabled={disabled}
      {...pressableProps}>
      <Text style={[styles.text]}>{loading ? 'Loading ...' : title}</Text>
    </Pressable>
  );
};

const defaultStyles = StyleSheet.create({
  pressable: {
    width: '100%',
    paddingVertical: 18,
    paddingHorizontal: 24,
    marginVertical: 6,
  },
  pressablePressed: {
    opacity: 0.5,
  },
  pressableDisabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: 'bold',
    color: DarkTheme.colors.primary,
    fontSize: 16,
    textAlign: 'center',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 0,
  },
});

const primaryStyles = StyleSheet.create({
  pressable: {
    ...defaultStyles.pressable,
    backgroundColor: DarkTheme.colors.primary,
    borderRadius: 12,
  },
  pressablePressed: {
    ...defaultStyles.pressablePressed,
  },
  pressableDisabled: {
    ...defaultStyles.pressableDisabled,
    backgroundColor: DarkTheme.colors.border,
    opacity: 1,
  },
  text: {
    ...defaultStyles.text,
    color: DarkTheme.colors.text,
  },
});
