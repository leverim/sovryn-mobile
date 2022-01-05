import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Button, SafeAreaView, Text, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { accounts, AccountType } from 'utils/accounts';
import { AppContext } from 'context/AppContext';
import { validateMnemonic, validatePrivateKey } from 'utils/wallet-utils';

export const AccountCreate: React.FC = () => {
  const { createWallet } = useContext(AppContext);
  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({
      title: 'Create New Account',
    });
  }, [navigation]);

  const [name, setName] = useState<string>(
    `Account #${accounts.list.length + 1}`,
  );
  const [type, setType] = useState<AccountType>(AccountType.MNEMONIC);
  const [secret, setSecret] = useState<string>('');

  const onSave = useCallback(async () => {
    await createWallet(name, type, secret);
    navigation.navigate('settings.account');
  }, [name, type, secret, navigation, createWallet]);

  const valid = useMemo(() => {
    if (type === AccountType.MNEMONIC) {
      const words = secret.split(' ');
      if (words.length < 12) {
        return false;
      }
      return validateMnemonic(secret);
    }

    if (type === AccountType.PRIVATE_KEY) {
      return validatePrivateKey(secret);
    }

    return false;
  }, [secret, type]);

  return (
    <SafeAreaView>
      <Text>Name</Text>
      <TextInput value={name} onChangeText={setName} />
      <Text>Type</Text>
      <Picker
        selectedValue={type}
        onValueChange={itemValue => setType(itemValue)}>
        <Picker.Item label="Mnemonic seed" value={AccountType.MNEMONIC} />
        <Picker.Item label="Private key" value={AccountType.PRIVATE_KEY} />
      </Picker>
      <Text>
        {type === AccountType.MNEMONIC ? 'Mnemonic seed' : 'Private Key'}
      </Text>
      <TextInput value={secret} onChangeText={setSecret} />
      <Button title="Save" onPress={onSave} disabled={!valid} />
    </SafeAreaView>
  );
};
