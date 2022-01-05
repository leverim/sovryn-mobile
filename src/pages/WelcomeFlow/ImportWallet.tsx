import React, { useCallback, useContext, useMemo, useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import { validateMnemonic } from 'utils/wallet-utils';
import { AppContext } from 'context/AppContext';
import { AccountType } from 'utils/accounts';

export const ImportWallet: React.FC = () => {
  const { createWallet } = useContext(AppContext);
  const [seed, setSeed] = useState('');

  const valid = useMemo(() => {
    const words = seed.split(' ');
    if (words.length < 12) {
      return false;
    }
    return validateMnemonic(seed);
  }, [seed]);

  const handleConfirm = useCallback(() => {
    createWallet('Account #1', AccountType.MNEMONIC, seed)
      .then(() => {
        console.log('saved');
      })
      .catch(() => {
        console.error('saving failed');
      });
  }, [seed, createWallet]);

  return (
    <View>
      <Text>Enter your seed phrase:</Text>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        autoCompleteType="off"
        value={seed}
        onChangeText={setSeed}
      />
      <Button title="Confirm" onPress={handleConfirm} disabled={!valid} />
    </View>
  );
};
