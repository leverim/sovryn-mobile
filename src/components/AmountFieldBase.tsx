import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  NativeSyntheticEvent,
  StyleSheet,
  TextInput,
  TextInputContentSizeChangeEventData,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { DarkTheme } from '@react-navigation/native';
import { useDebouncedEffect } from 'hooks/useDebounceEffect';
import { Text } from './Text';

export type AmountFieldBaseProps = {
  title?: React.ReactNode;
  amount: string;
  onAmountChanged: (amount: string) => void;
  inputProps?: TextInputProps;
  debounceDelay?: number;
  rightElement?: React.ReactNode;
  bottomElement?: React.ReactNode;
  containerStyle?: ViewStyle;
};

const DEFAULT_INPUT_TEXT_SIZE = 32;
const SPACE_FOR_LETTER = 24;

export const AmountFieldBase: React.FC<AmountFieldBaseProps> = ({
  amount,
  onAmountChanged,
  inputProps,
  debounceDelay = 300,
  rightElement,
  bottomElement,
  containerStyle,
  title,
}) => {
  const fromOutside = useRef<boolean>(false);
  const [_amount, setAmount] = useState<string | undefined>(amount);

  useDebouncedEffect(
    () => {
      if (fromOutside.current) {
        return;
      }
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
    fromOutside.current = true;
    setAmount(amount);
  }, [amount]);

  const inputRef = useRef<TextInput | null>(null);
  const [inputWidth, setInputWidth] = useState(0);
  const [fontSize, setFontSize] = useState(DEFAULT_INPUT_TEXT_SIZE);

  useEffect(() => {
    const width = (_amount?.length || 1) * SPACE_FOR_LETTER;
    if (width > inputWidth) {
      const percentage = inputWidth / width;
      const scaledSize = Math.min(
        DEFAULT_INPUT_TEXT_SIZE,
        Math.max(DEFAULT_INPUT_TEXT_SIZE * percentage, 16),
      );
      setFontSize(scaledSize);
    } else {
      setFontSize(DEFAULT_INPUT_TEXT_SIZE);
    }
  }, [_amount, inputWidth]);

  const handleAmountChange = useCallback((value: string) => {
    fromOutside.current = false;
    setAmount(value);
  }, []);

  return (
    <View style={[styles.container, containerStyle]}>
      {title}
      <View style={styles.inputWrapperView}>
        <TextInput
          ref={inputRef}
          value={_amount}
          onChangeText={handleAmountChange}
          keyboardType="numeric"
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect={false}
          style={[styles.input, inputProps?.style, { fontSize }]}
          placeholderTextColor={'gray'}
          placeholder="0.0"
          onLayout={event => setInputWidth(event.nativeEvent.layout.width)}
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
    height: 64,
  },
  inputAddonView: {
    marginLeft: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomElementView: {},
});
