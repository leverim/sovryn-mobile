import { BigNumber, utils } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import React, { useCallback, useEffect, useState } from 'react';
import { Button, StyleSheet, TextInputProps, View } from 'react-native';
import { parseUnits } from 'utils/helpers';
import { InputField } from './InputField';
import { Text } from './Text';

type Props = {
  label?: string;
  max?: number;
  fee?: number;
  decimals?: number;
};

/**
 * @deprecated
 */
export const AmountField: React.FC<Props & TextInputProps> = ({
  max,
  fee = 0,
  onChangeText,
  value,
  decimals = 18,
  ...props
}) => {
  const [_value, setValue] = useState(value);

  useEffect(() => setValue(value), [value]);

  const onChange = useCallback(
    (text: string) => {
      text = text.match(/(\d|.)+/g)?.pop() || '';
      text = text.replace(',', '.');
      setValue(text);
      if (onChangeText && !isNaN(Number(text))) {
        onChangeText(text);
      }
    },
    [onChangeText],
  );

  // todo: fix decimals
  const onSelectPartial = useCallback(
    (amount: number) => {
      if (max !== undefined) {
        const _max = parseUnits(max.toString(), decimals);
        const _fee = parseUnits(fee.toString(), decimals);

        let _amount = _max.mul(amount * 1000).div(1000);

        if (_amount.add(_fee).gt(_max)) {
          _amount = _fee.gt(_max) ? BigNumber.from('0') : _amount.sub(_fee);
        }

        onChange(formatUnits(_amount, decimals).toString());
      }
    },
    [onChange, max, fee, decimals],
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
