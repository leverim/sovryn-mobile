import React, { useCallback, useContext, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { validateMnemonic } from 'utils/wallet-utils';
import { AppContext } from 'context/AppContext';
import { AccountType } from 'utils/accounts';
import { InputField } from 'components/InputField';
import { PressableButton } from 'components/PressableButton';

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

  const [loading, setLoading] = useState(false);

  const handleConfirm = useCallback(() => {
    setLoading(true);
    createWallet('Account #1', AccountType.MNEMONIC, seed)
      .then(() => {
        console.log('saved');
      })
      .catch(error => {
        setLoading(false);
        console.error('saving failed', error);
      });
  }, [seed, createWallet]);

  return (
    <View>
      <Text>Enter your seed phrase:</Text>
      <InputField
        value={seed}
        onChangeText={setSeed}
        multiline
        numberOfLines={6}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="off"
      />
      {loading && <Text>Importing, please wait. It might take a while.</Text>}
      <PressableButton
        title="Confirm"
        onPress={handleConfirm}
        loading={loading}
        disabled={loading || !valid}
      />
    </View>
  );
};
