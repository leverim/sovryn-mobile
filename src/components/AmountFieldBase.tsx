import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { DarkTheme } from '@react-navigation/native';
import { useDebouncedEffect } from 'hooks/useDebounceEffect';

export type AmountFieldBaseProps = {
  amount: string;
  onAmountChanged: (amount: string) => void;
  inputProps?: TextInputProps;
  debounceDelay?: number;
  rightElement?: React.ReactNode;
  bottomElement?: React.ReactNode;
  containerStyle?: ViewStyle;
};

export const AmountFieldBase: React.FC<AmountFieldBaseProps> = ({
  amount,
  onAmountChanged,
  inputProps,
  debounceDelay = 300,
  rightElement,
  bottomElement,
  containerStyle,
}) => {
  const [_amount, setAmount] = useState<string | undefined>(amount);

  useDebouncedEffect(
    () => {
      if (!_amount) {
        onAmountChanged('');
        return;
      }
      const value = ((_amount || '0').match(/(\d|.)+/g)?.pop() || '').replace(
        ',',
        '.',
      );
      if (!isNaN(Number(value))) {
        onAmountChanged(value);
      }
    },
    debounceDelay,
    [_amount, onAmountChanged],
  );

  // amount was changed from outside
  useEffect(() => {
    setAmount(amount);
  }, [amount]);

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.inputWrapperView}>
        <TextInput
          value={_amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect={false}
          style={[styles.input, inputProps?.style]}
          placeholderTextColor={'gray'}
          placeholder="0.0"
          {...inputProps}
        />
        {rightElement && (
          <View style={styles.inputAddonView}>{rightElement}</View>
        )}
      </View>
      {bottomElement && (
        <View style={styles.bottomElementView}>{bottomElement}</View>
      )}
      {/* <Text style={styles.inputBalanceText}>≈ $US{commify('0.00')}</Text> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    backgroundColor: DarkTheme.colors.border,
    borderRadius: 12,
    marginVertical: 4,
    width: '100%',
  },
  inputWrapperView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  input: {
    fontSize: 32,
    flex: 1,
    flexShrink: 1,
    flexGrow: 1,
    color: 'white',
  },
  inputAddonView: {
    marginLeft: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomElementView: {},
});
