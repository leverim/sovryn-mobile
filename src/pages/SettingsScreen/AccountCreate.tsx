import React, { useCallback, useContext, useMemo, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { accounts, AccountType } from 'utils/accounts';
import { AppContext } from 'context/AppContext';
import { validateMnemonic, validatePrivateKey } from 'utils/wallet-utils';
import { currentChainId } from 'utils/helpers';
import { isAddress } from 'utils/rsk';
import { InputField } from 'components/InputField';
import { PressableButton } from 'components/PressableButton';
import { SafeAreaPage } from 'templates/SafeAreaPage';
import { ItemType, Picker } from 'components/Picker';
import { passcode } from 'controllers/PassCodeController';
import { SettingsStackProps } from 'pages/MainScreen/SettingsPage';

type Props = NativeStackScreenProps<SettingsStackProps, 'settings.index'>;

export const AccountCreate: React.FC<Props> = ({ navigation }) => {
  const { createWallet } = useContext(AppContext);
  navigation.setOptions({
    title: 'Create New Account',
  });

  const [name, setName] = useState<string>(
    `Account #${accounts.list.length + 1}`,
  );
  const [type, setType] = useState<AccountType>(AccountType.MNEMONIC);
  const [secret, setSecret] = useState<string>('');

  const [loading, setLoading] = useState(false);

  const onSave = useCallback(async () => {
    setLoading(false);
    try {
      const password = await passcode.request('Lock Wallet');
      createWallet(name, type, secret, password)
        .then(() => {
          navigation.navigate('settings.wallets');
        })
        .catch(error => {
          setLoading(false);
          console.error('creating failed', error);
        });
    } catch (e) {
      console.log(e);
    }
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

  const items: ItemType[] = [
    { value: AccountType.MNEMONIC, label: 'Mnemonic seed' },
    { value: AccountType.PRIVATE_KEY, label: 'Private key' },
    { value: AccountType.PUBLIC_ADDRESS, label: 'Address (Read only)' },
  ];

  const label = useMemo(() => {
    switch (type) {
      case AccountType.MNEMONIC:
        return 'Mnemonic seed';
      case AccountType.PRIVATE_KEY:
        return 'Private key';
      case AccountType.PUBLIC_ADDRESS:
        return 'Address (read only)';
    }
  }, [type]);

  return (
    <SafeAreaPage>
      <InputField label="Name" value={name} onChangeText={setName} />
      <Picker label="Type" value={type} items={items} onChange={setType} />
      <InputField
        label={label}
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
