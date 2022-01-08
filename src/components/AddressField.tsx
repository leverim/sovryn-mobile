import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { currentChainId } from 'utils/helpers';
import { isAddress } from 'utils/rsk';
import { InputField } from './InputField';

type Props = {
  value: string;
  onChange: (address: string, valid: boolean) => void;
  chainId?: number;
};

export const AddressField: React.FC<Props> = ({
  value,
  onChange,
  chainId = currentChainId(),
}) => {
  const [_value, setValue] = useState(value);

  useEffect(() => setValue(value), [value]);

  // Test if input value can't be considered address.
  const notAddress = useMemo(
    () => !/^(0x)?[0-9a-f]{40}$/i.test(value),
    [value],
  );
  // Test if input value is valid checksumed address.
  const validAddress = useMemo(
    () => isAddress(_value, chainId),
    [_value, chainId],
  );

  const onChangeText = useCallback(
    (address: string) => {
      setValue(address);
      const valid = isAddress(address, chainId);
      if (valid) {
        onChange(address, valid);
      } else {
        onChange('', false);
      }
    },
    [onChange, chainId],
  );

  return (
    <>
      <InputField
        label="Recipient address:"
        value={_value}
        onChangeText={onChangeText}
        placeholder="Enter recipient address"
        autoComplete="off"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {_value.length ? (
        <>
          {notAddress ? (
            <View style={styles.errorContainer}>
              <Text>Enter valid wallet address.</Text>
            </View>
          ) : (
            !validAddress && (
              <View style={styles.errorContainer}>
                <Text>
                  Address checksum is not valid, if you are certain that it can
                  receive this asset
                  <Button
                    title="transform address to lowercase"
                    onPress={() => onChangeText(value.toLowerCase())}
                  />
                </Text>
              </View>
            )
          )}
        </>
      ) : (
        <></>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingVertical: 10,
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
  },
  errorContainer: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
  },
});
