import { utils } from 'ethers';
import React, { useCallback, useEffect, useState } from 'react';
import { Button, StyleSheet, TextInputProps, View } from 'react-native';
import { InputField } from './InputField';
import { Text } from './Text';

type Props = {
  label?: string;
  max?: number;
  fee?: number;
};

export const AmountField: React.FC<Props & TextInputProps> = ({
  max,
  fee = 0,
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
      if (max !== undefined) {
        let _amount = max * amount;

        if (_amount + fee > max) {
          if (fee > max) {
            _amount = 0;
          } else {
            _amount = _amount - fee;
          }
        }

        onChange(_amount.toString());
      }
    },
    [onChange, max, fee],
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
      {max !== undefined && (
        <View style={styles.balanceContainer}>
          <View>
            <Text style={styles.balanceText}>
              Available: {utils.commify(max.toFixed(4))}
            </Text>
          </View>
          <View style={styles.buttonContainer}>
            <Button title="25%" onPress={() => onSelectPartial(0.25)} />
            <Button title="50%" onPress={() => onSelectPartial(0.5)} />
            <Button title="100%" onPress={() => onSelectPartial(1)} />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    width: '100%',
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignContent: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    alignContent: 'center',
  },
  balanceText: {
    fontSize: 14,
  },
});
