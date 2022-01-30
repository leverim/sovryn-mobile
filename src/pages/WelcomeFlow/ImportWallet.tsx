import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import { validateMnemonic } from 'utils/wallet-utils';
import { InputField } from 'components/InputField';
import { SafeAreaPage } from 'templates/SafeAreaPage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { WelcomeFlowStackProps } from '.';
import { globalStyles } from 'global.styles';
import { Button } from 'components/Buttons/Button';
import { AccountType } from 'utils/accounts';
import { currentChainId } from 'utils/helpers';
import { toChecksumAddress } from 'utils/rsk';
import { addHexPrefix } from 'ethereumjs-util';

type Props = NativeStackScreenProps<WelcomeFlowStackProps, 'onboarding.import'>;

export const ImportWallet: React.FC<Props> = ({ navigation }) => {
  const chainId = currentChainId();
  const [name, setName] = useState('Sovryn Wallet #1');
  const [secret, setSecret] = useState('');

  const type = useMemo(() => {
    const value = secret || '';
    if ([40, 42].includes(value.length)) {
      return AccountType.PUBLIC_ADDRESS;
    }
    if ([64, 66].includes(value.length)) {
      return AccountType.PRIVATE_KEY;
    }
    if (validateMnemonic(value.trim())) {
      return AccountType.MNEMONIC;
    }
    return undefined;
  }, [secret]);

  const value = useMemo(() => {
    switch (type) {
      default:
        return '';
      case AccountType.PUBLIC_ADDRESS:
        return toChecksumAddress(addHexPrefix(secret), chainId);
      case AccountType.PRIVATE_KEY:
        return addHexPrefix(secret);
      case AccountType.MNEMONIC:
        return secret.trim();
    }
  }, [secret, type, chainId]);

  const handleImport = useCallback(
    () =>
      navigation.navigate('onboarding.passcode', {
        name,
        secret: value,
        type: type!,
      }),
    [name, navigation, value, type],
  );

  return (
    <SafeAreaPage>
      <ScrollView style={globalStyles.page}>
        <InputField label="Wallet Name" value={name} onChangeText={setName} />

        <InputField
          label="Private key, Mnemonic seed or public address"
          placeholder="Private key / Mnemonic Seed / Public address"
          value={secret}
          onChangeText={setSecret}
          multiline
          numberOfLines={12}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
        />

        <Button
          title="Import"
          onPress={handleImport}
          disabled={type === undefined}
          primary
        />
      </ScrollView>
    </SafeAreaPage>
  );
};
