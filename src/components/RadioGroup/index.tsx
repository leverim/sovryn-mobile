import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useIsDarkTheme } from 'hooks/useIsDarkTheme';
import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
} from 'react';
import { Pressable, PressableProps, StyleSheet, View } from 'react-native';

const RadioContext = createContext<any>(null);

function useRadioContext() {
  const context = useContext(RadioContext);
  if (!context) {
    throw new Error(
      'Radio compound components cannot be rendered outside the Radio component',
    );
  }
  return context;
}

type RadioGroupProps = {
  defaultValue: any;
  onChange: (value: string) => void;
};

export const RadioGroup: React.FC<RadioGroupProps> = ({
  children,
  defaultValue,
  onChange,
}) => {
  const [state, setState] = React.useState('');
  const isDark = useIsDarkTheme();

  const handleOnChange = useCallback(
    value => {
      setState(value);
      onChange(value);
    },
    [onChange],
  );

  useEffect(() => {
    setState(defaultValue);
  }, [defaultValue]);

  return (
    <RadioContext.Provider value={[state, handleOnChange]}>
      <View style={[styles.container, isDark && styles.containerDark]}>
        {children}
      </View>
    </RadioContext.Provider>
  );
};

type RadioButtonProps = { value: any } & PressableProps;

export const RadioButton: React.FC<RadioButtonProps> = ({
  value,
  children,
  onPress,
  ...props
}) => {
  const isDark = useIsDarkTheme();
  const [state, onChange] = useRadioContext();
  const checked = value === state;

  const handleOnPress = useCallback(() => {
    onChange(value);
    if (onPress) {
      onPress(value);
    }
  }, [onChange, onPress, value]);

  return (
    <Pressable
      onPress={handleOnPress}
      {...props}
      style={[
        styles.button,
        checked && styles.buttonChecked,
        isDark && checked && styles.buttonCheckedDark,
      ]}>
      {children}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
    padding: 4,
    backgroundColor: DefaultTheme.colors.card,
  },
  containerDark: {
    backgroundColor: DarkTheme.colors.border,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: 8,
    padding: 4,
  },
  buttonChecked: {
    backgroundColor: DefaultTheme.colors.primary,
  },
  buttonCheckedDark: {
    backgroundColor: DarkTheme.colors.primary,
  },
});
