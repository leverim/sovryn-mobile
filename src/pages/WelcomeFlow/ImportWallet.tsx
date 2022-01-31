import React, { useCallback, useMemo, useState } from 'react';
import { validateMnemonic, validatePrivateKey } from 'utils/wallet-utils';
import { InputField } from 'components/InputField';
import { PageContainer, SafeAreaPage } from 'templates/SafeAreaPage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { WelcomeFlowStackProps } from '.';
import { Button } from 'components/Buttons/Button';
import { AccountType } from 'utils/accounts';
import { currentChainId } from 'utils/helpers';
import { toChecksumAddress, isAddress } from 'utils/rsk';
import { addHexPrefix } from 'ethereumjs-util';
import { useDebouncedEffect } from 'hooks/useDebounceEffect';
import { getDefaultProvider } from 'ethers';
import { Keyboard } from 'react-native';

type Props = NativeStackScreenProps<WelcomeFlowStackProps, 'onboarding.import'>;

export const ImportWallet: React.FC<Props> = ({ navigation }) => {
  const chainId = currentChainId();
  const [name, setName] = useState('Sovryn Wallet #1');
  const [secret, setSecret] = useState('');

  const type = useMemo(() => {
    const value = secret || '';
    if ([40, 42].includes(value.length) && isAddress(value.toLowerCase())) {
      return AccountType.PUBLIC_ADDRESS;
    }
    if ([64, 66].includes(value.length) && validatePrivateKey(value)) {
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

  useDebouncedEffect(
    () => {
      if (type === undefined && secret?.length && secret.endsWith('.eth')) {
        getDefaultProvider('https://cloudflare-eth.com')
          .resolveName(secret)
          .then(response => {
            if (response) {
              setName(secret);
              setSecret(response);
              Keyboard.dismiss();
            }
          })
          .catch(e => {
            console.warn('ens error', e);
          });
      }
    },
    300,
    [type, secret],
    true,
  );

  return (
    <SafeAreaPage keyboardAvoiding scrollView>
      <PageContainer>
        <InputField label="Wallet Name" value={name} onChangeText={setName} />

        <InputField
          label="Private key, Mnemonic seed, public address or ENS domain"
          placeholder="Private key / Mnemonic Seed / Public address / ENS domain"
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
      </PageContainer>
    </SafeAreaPage>
  );
};
