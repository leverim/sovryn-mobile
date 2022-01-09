import React, { useCallback, useContext, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { generateMnemonic } from 'utils/wallet-utils';
import { AppContext } from 'context/AppContext';
import { AccountType } from 'utils/accounts';
import { PressableButton } from 'components/PressableButton';

export const CreateWallet: React.FC = () => {
  const mnemonic = useMemo(() => generateMnemonic().split(' '), []);
  const { createWallet } = useContext(AppContext);

  const [loading, setLoading] = useState(false);

  const handleConfirm = useCallback(() => {
    setLoading(true);
    createWallet('Account #1', AccountType.MNEMONIC, mnemonic.join(' '))
      .then(() => {
        console.log('saved');
      })
      .catch(error => {
        setLoading(false);
        console.error('saving failed', error);
      });
  }, [mnemonic, createWallet]);

  return (
    <View>
      <Text>Create Wallet</Text>

      <View>
        {mnemonic.map((word, index) => (
          <View style={{ backgroundColor: 'white', padding: 3 }} key={word}>
            <Text>
              #{index + 1}. {word}
            </Text>
          </View>
        ))}
      </View>

      {loading && <Text>Creating, please wait. It might take a while.</Text>}

      <PressableButton
        title="Confirm"
        onPress={handleConfirm}
        loading={loading}
        disabled={loading}
      />
    </View>
  );
};
