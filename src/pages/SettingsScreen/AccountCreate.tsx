import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { accounts, AccountType } from 'utils/accounts';
import { AppContext } from 'context/AppContext';
import { validateMnemonic, validatePrivateKey } from 'utils/wallet-utils';
import { currentChainId } from 'utils/helpers';
import { isAddress } from 'utils/rsk';
import { InputField } from 'components/InputField';
import { PressableButton } from 'components/PressableButton';
import { SafeAreaPage } from 'templates/SafeAreaPage';
import { Text } from 'components/Text';

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

  const [loading, setLoading] = useState(false);

  const onSave = useCallback(() => {
    setLoading(false);
    createWallet(name, type, secret)
      .then(() => {
        navigation.navigate('settings.account');
      })
      .catch(error => {
        setLoading(false);
        console.error('creating failed', error);
      });
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

    if (type === AccountType.PUBLIC_ADDRESS) {
      return isAddress(secret, currentChainId());
    }

    return false;
  }, [secret, type]);

  return (
    <SafeAreaPage>
      <Text>Name</Text>
      <InputField value={name} onChangeText={setName} />
      <Text>Type</Text>
      <Picker
        selectedValue={type}
        onValueChange={itemValue => setType(itemValue)}>
        <Picker.Item label="Mnemonic seed" value={AccountType.MNEMONIC} />
        <Picker.Item label="Private key" value={AccountType.PRIVATE_KEY} />
        <Picker.Item
          label="Public Address"
          value={AccountType.PUBLIC_ADDRESS}
        />
      </Picker>
      <Text>
        {type === AccountType.MNEMONIC && 'Mnemonic seed'}
        {type === AccountType.PRIVATE_KEY && 'Private key'}
        {type === AccountType.PUBLIC_ADDRESS && 'Address (Read only)'}
      </Text>
      <InputField
        value={secret}
        onChangeText={setSecret}
        multiline
        numberOfLines={6}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="off"
      />
      <PressableButton
        title="Save"
        onPress={onSave}
        disabled={!valid || loading}
        loading={loading}
      />
    </SafeAreaPage>
  );
};
