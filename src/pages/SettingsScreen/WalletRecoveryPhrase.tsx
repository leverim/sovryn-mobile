import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaPage } from 'templates/SafeAreaPage';
import { SettingsStackProps } from 'pages/MainScreen/SettingsPage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { globalStyles } from 'global.styles';
import { Text } from 'components/Text';
import { AccountType } from 'utils/accounts';
import { makeWalletPrivateKey, wallet } from 'utils/wallet';
import { WarningBadge } from 'components/WarningBadge';
import { MnemonicPhrasePrinter } from 'components/MnemonicPhrasePrinter';

type Props = NativeStackScreenProps<
  SettingsStackProps,
  'settings.wallet.private-key'
>;

export const WalletRecoveryPhrase: React.FC<Props> = ({
  route: { params },
}) => {
  const { account, password } = params;

  const [phrase, setPhrase] = useState<string>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    wallet
      .unlockWalletSecrets(password, account.secret!)
      .then(secrets => setPhrase(secrets.mnemonic))
      .catch(() => setPhrase(undefined))
      .finally(() => setLoading(false));
  }, [account, password]);

  return (
    <SafeAreaPage>
      <ScrollView style={globalStyles.page}>
        <Text style={globalStyles.title}>Your Recovery Phrase</Text>

        <WarningBadge text="Never share recovery phrase with anyone, store it securely!" />

        {phrase && <MnemonicPhrasePrinter text={phrase} />}

        <View style={globalStyles.spacer} />
      </ScrollView>
    </SafeAreaPage>
  );
};
