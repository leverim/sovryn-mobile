import React, { useCallback, useContext } from 'react';
import { Alert, ScrollView } from 'react-native';
import { AppContext } from 'context/AppContext';
import { SafeAreaPage } from 'templates/SafeAreaPage';
import { SettingsStackProps } from 'routers/settings.routes';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavGroup } from 'components/NavGroup/NavGroup';
import { NavItem } from 'components/NavGroup/NavItem';
import { globalStyles } from 'global.styles';
import { accounts, AccountType } from 'utils/accounts';
import { passcode } from 'controllers/PassCodeController';
import { AccountBannerMini } from 'components/AccountBannerMini';

type Props = NativeStackScreenProps<SettingsStackProps, 'settings.wallet'>;

export const WalletPage: React.FC<Props> = ({
  navigation,
  route: { params },
}) => {
  const { accountSelected } = useContext(AppContext);

  const account = accounts.get(params.index);

  const activate = useCallback(
    () => accounts.select(params.index),
    [params.index],
  );

  const onRenameWallet = useCallback(() => {
    Alert.prompt(
      'Enter new name',
      undefined,
      async (value: string) => {
        await accounts.update(params.index, {
          name: value,
        });
      },
      undefined,
      account.name,
    );
  }, [params.index, account.name]);

  const unlockAndNavigate = useCallback(
    (screen: keyof SettingsStackProps) => async () => {
      try {
        const password = await passcode.request('Unlock Wallet');
        navigation.navigate(screen, {
          index: params.index,
          account,
          password,
        });
      } catch (e) {
        console.log(e);
      }
    },
    [navigation, params.index, account],
  );

  const deleteWallet = useCallback(() => {
    Alert.alert('Delete account?', 'You will not be able to recover it.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await passcode.request('Unlock Wallet');
            await accounts.remove(params.index);
            navigation.navigate('settings.wallets');
          } catch (e) {
            Alert.alert('Wallet was not removed.');
          }
        },
      },
    ]);
  }, [navigation, params.index]);

  return (
    <SafeAreaPage>
      <ScrollView style={globalStyles.page}>
        <AccountBannerMini account={account} />

        <NavGroup>
          {accountSelected !== params.index && (
            <NavItem key="activate" title="Make Active" onPress={activate} />
          )}
          <NavItem title="Rename Wallet" onPress={onRenameWallet} />
          {account.type === AccountType.MNEMONIC && (
            <NavItem
              title="Change derivation path"
              value={`${account.dPath}/${account.index}`}
              onPress={unlockAndNavigate('settings.wallet.derivation')}
            />
          )}
        </NavGroup>

        {account.type !== AccountType.PUBLIC_ADDRESS && (
          <NavGroup>
            {account.type === AccountType.MNEMONIC && (
              <NavItem
                title="View Recovery Phrase"
                onPress={unlockAndNavigate('settings.wallet.recovery-phrase')}
              />
            )}
            {[AccountType.MNEMONIC, AccountType.PRIVATE_KEY].includes(
              account.type,
            ) && (
              <NavItem
                title="View Private Key"
                onPress={unlockAndNavigate('settings.wallet.private-key')}
              />
            )}
          </NavGroup>
        )}

        {accountSelected !== params.index && (
          <NavGroup>
            <NavItem title="Delete Wallet" onPress={deleteWallet} danger />
          </NavGroup>
        )}
      </ScrollView>
    </SafeAreaPage>
  );
};
