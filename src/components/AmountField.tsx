import React, { useCallback, useEffect, useState } from 'react';
import { Button, StyleSheet, Text, TextInputProps, View } from 'react-native';
import { InputField } from './InputField';

type Props = {
  label?: string;
  max?: number;
};

export const AmountField: React.FC<Props & TextInputProps> = ({
  max,
  onChangeText,
  value,
  ...props
}) => {
  const [_value, setValue] = useState(value);

  useEffect(() => setValue(value), [value]);

  const onChange = useCallback(
    (text: string) => {
      text = text.replace(',', '.').replace('-', '').replace('e', '');
      setValue(text);
      if (onChangeText) {
        if (!isNaN(Number(text))) {
          onChangeText(text);
        } else {
          onChangeText('');
        }
      }
    },
    [onChangeText],
  );

  const onSelectPartial = useCallback(
    (amount: number) => {
      if (max) {
        onChange((max * amount).toString());
      }
    },
    [onChange, max],
  );

  return (
    <View style={styles.container}>
      <InputField
        {...props}
        value={_value}
        onChangeText={onChange}
        keyboardType="numeric"
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect={false}
      />
      {isNaN(Number(_value)) ? (
        <Text>Amount must be valid number.</Text>
      ) : (
        <></>
      )}
      {max !== undefined ? (
        <View style={styles.buttonContainer}>
          <Button title="25%" onPress={() => onSelectPartial(0.25)} />
          <Button title="50%" onPress={() => onSelectPartial(0.5)} />
          <Button title="100%" onPress={() => onSelectPartial(1)} />
        </View>
      ) : (
        <></>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    width: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    alignContent: 'center',
  },
});
