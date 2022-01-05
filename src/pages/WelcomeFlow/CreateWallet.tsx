import React, { useCallback, useContext, useMemo } from 'react';
import { Button, Text, View } from 'react-native';
import { generateMnemonic } from 'utils/wallet-utils';
import { AppContext } from 'context/AppContext';
import { AccountType } from 'utils/accounts';

export const CreateWallet: React.FC = () => {
  const mnemonic = useMemo(() => generateMnemonic().split(' '), []);
  const { createWallet } = useContext(AppContext);

  const handleConfirm = useCallback(() => {
    createWallet('Account #1', AccountType.MNEMONIC, mnemonic.join(' '))
      .then(() => {
        console.log('saved');
      })
      .catch(() => {
        console.error('saving failed');
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

      <Button title="Confirm" onPress={handleConfirm} />
    </View>
  );
};
