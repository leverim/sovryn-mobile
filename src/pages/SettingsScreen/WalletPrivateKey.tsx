import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaPage } from 'templates/SafeAreaPage';
import { SettingsStackProps } from 'routers/settings.routes';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { globalStyles } from 'global.styles';
import { Text } from 'components/Text';
import { AccountType } from 'utils/accounts';
import { makeWalletPrivateKey, wallet } from 'utils/wallet';
import { WarningBadge } from 'components/WarningBadge';
import Clipboard from '@react-native-clipboard/clipboard';
import { DarkTheme } from '@react-navigation/native';
import CopyIcon from 'assets/copy-icon.svg';

type Props = NativeStackScreenProps<
  SettingsStackProps,
  'settings.wallet.private-key'
>;

export const WalletPrivateKey: React.FC<Props> = ({ route: { params } }) => {
  const { account, password } = params;

  const [privateKey, setPrivateKey] = useState<string>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    wallet
      .unlockWalletSecrets(password, account.secret!)
      .then(secrets => {
        const pk = makeWalletPrivateKey(
          account.type,
          account.type === AccountType.PRIVATE_KEY
            ? secrets.privateKey
            : secrets.masterSeed,
          account.dPath,
          account.index,
        );
        setPrivateKey(pk);
      })
      .catch(() => setPrivateKey(undefined))
      .finally(() => setLoading(false));
  }, [account, password]);

  const [pressed, setPressed] = useState(false);

  return (
    <SafeAreaPage>
      <ScrollView style={globalStyles.page}>
        <Text style={globalStyles.title}>Your Private Key</Text>

        <Pressable
          onPress={() => Clipboard.setString(privateKey!)}
          onPressIn={() => setPressed(true)}
          onPressOut={() => setPressed(false)}
          style={styles.container}>
          <Text style={styles.text}>{privateKey}</Text>
          <View style={[pressed && styles.pressedIcon]}>
            <CopyIcon fill={DarkTheme.colors.primary} />
          </View>
        </Pressable>

        <WarningBadge text="Never share the private key with anyone, store it securely!" />

        <View style={globalStyles.spacer} />
      </ScrollView>
    </SafeAreaPage>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: DarkTheme.colors.card,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text: {
    textAlign: 'left',
    marginRight: 12,
    flexShrink: 1,
  },
  pressedIcon: {
    transform: [{ scale: 1.1 }],
  },
});
