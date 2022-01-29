import { DarkTheme } from '@react-navigation/native';
import { Text } from 'components/Text';
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, PressableProps, StyleSheet, ViewStyle } from 'react-native';

type BaseButtonProps = {
  loading?: boolean;
  intent?: ButtonIntent;
  pressableStyle?: ViewStyle;
};

type ButtonProps = {
  title: string;
} & BaseButtonProps;

export enum ButtonIntent {
  PRIMARY,
  SECONDARY,
}

export const Button: React.FC<ButtonProps & PressableProps> = ({
  title,
  loading,
  ...props
}) => {
  return (
    <ButtonBase loading={loading} {...props}>
      <Text>{loading ? 'Loading ...' : title}</Text>
    </ButtonBase>
  );
};

export const ButtonBase: React.FC<BaseButtonProps & PressableProps> = ({
  disabled,
  onPressIn,
  onPressOut,
  intent = ButtonIntent.SECONDARY,
  children,
  pressableStyle,
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

  const mapped = useMemo(
    () =>
      React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          // @ts-ignore
          const isTextComponent = child.type?.displayName === 'Text';
          return React.cloneElement(child, {
            ...child.props,
            ...(isTextComponent && { style: [styles.text, child.props.style] }),
          });
        }
        return null;
      }),
    [children, styles.text],
  );

  return (
    <Pressable
      onPressIn={handleOnPressIn}
      onPressOut={handleOnPressOut}
      style={[
        styles.pressable,
        pressedIn && styles.pressablePressed,
        disabled && styles.pressableDisabled,
        pressableStyle,
      ]}
      disabled={disabled}
      {...pressableProps}>
      {mapped}
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