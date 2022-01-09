import { useIsDarkTheme } from 'hooks/useIsDarkTheme';
import React, { useMemo } from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { Text } from './Text';

type Props = {
  label?: string;
};

export const InputField: React.FC<Props & TextInputProps> = ({
  label,
  ...props
}) => {
  const dark = useIsDarkTheme();
  const editable = useMemo(
    () => props.editable === undefined || props.editable === true,
    [props.editable],
  );
  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
        </View>
      )}
      <View style={styles.inputContainer}>
        <TextInput
          placeholderTextColor={'gray'}
          style={[
            styles.input,
            !editable && styles.inputReadOnly,
            dark && styles.inputDark,
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
  input: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    fontSize: 16,
    height: 40,
    width: '100%',
  },
  inputReadOnly: {
    opacity: 0.5,
  },
  inputDark: {
    color: 'white',
  },
});
