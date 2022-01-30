import { useIsDarkTheme } from 'hooks/useIsDarkTheme';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import debounce from 'lodash/debounce';
import { Text } from './Text';

type Props = {
  label?: string;
  debounceDelay?: number;
};

export const InputField: React.FC<Props & TextInputProps> = ({
  label,
  debounceDelay = 300,
  onChangeText,
  value,
  ...props
}) => {
  const dark = useIsDarkTheme();
  const editable = useMemo(
    () => props.editable === undefined || props.editable === true,
    [props.editable],
  );

  const [_value, setValue] = useState<string | undefined>(value);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedOnChangeText = useCallback(
    debounce(text => onChangeText && onChangeText(text), debounceDelay),
    [debounceDelay, onChangeText],
  );

  const handleTextChange = useCallback(
    (text: string) => {
      setValue(text);
      debouncedOnChangeText(text);
    },
    [debouncedOnChangeText],
  );

  useEffect(() => setValue(value), [value]);

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
        </View>
      )}
      <View
        style={[
          styles.inputContainer,
          props.multiline && styles.inputContainerMultiline,
        ]}>
        <TextInput
          placeholderTextColor={'gray'}
          value={_value}
          onChangeText={handleTextChange}
          style={[
            styles.input,
            !editable && styles.inputReadOnly,
            dark && styles.inputDark,
            props.multiline && styles.inputMultiline,
          ]}
          {...props}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginTop: 16,
    width: '100%',
  },
  labelContainer: {
    marginBottom: 6,
  },
  label: {
    textAlign: 'left',
  },
  inputContainer: {
    width: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainerMultiline: {
    height: 128,
  },
  input: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    fontSize: 16,
    height: 40,
    width: '100%',
  },
  inputMultiline: {
    height: 120,
  },
  inputReadOnly: {
    opacity: 0.5,
  },
  inputDark: {
    color: 'white',
  },
});
