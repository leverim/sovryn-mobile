import React, { useCallback, useContext } from 'react';
import { ScrollView, View } from 'react-native';
import { AppContext } from 'context/AppContext';
import { SafeAreaPage } from 'templates/SafeAreaPage';
import { SettingsStackProps } from 'pages/MainScreen/SettingsPage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavGroup } from 'components/NavGroup/NavGroup';
import { NavItem } from 'components/NavGroup/NavItem';
import { globalStyles } from 'global.styles';
import { Text } from 'components/Text';
import { accounts, AccountType } from 'utils/accounts';
import { passcode } from 'controllers/PassCodeController';

type Props = NativeStackScreenProps<SettingsStackProps, 'settings.wallet'>;

export const WalletPage: React.FC<Props> = ({
  navigation,
  route: { params },
}) => {
  const { accountSelected } = useContext(AppContext);

  const account = accounts.get(params.index);
  navigation.setOptions({ title: account.name });

  const activate = useCallback(
    () => accounts.select(params.index),
    [params.index],
  );

  const onChangePathClicked = useCallback(async () => {
    try {
      const password = await passcode.request('Unlock Wallet');
      navigation.navigate('settings.wallet.derivation', {
        index: params.index,
        account,
        password,
      });
    } catch (e) {
      console.log(e);
    }
  }, [navigation, params.index, account]);

  return (
    <SafeAreaPage>
      <ScrollView style={globalStyles.page}>
        <View>
          <Text>{account.name}</Text>
          <Text>{account.address}</Text>
        </View>

        <NavGroup>
          {accountSelected !== params.index && (
            <NavItem key="activate" title="Make Active" onPress={activate} />
          )}
          <NavItem title="Rename Wallet" />
          {account.type === AccountType.MNEMONIC && (
            <NavItem
              title="Change derivation path"
              value={`${account.dPath}/${account.index}`}
              onPress={onChangePathClicked}
            />
          )}
        </NavGroup>

        {account.type !== AccountType.PUBLIC_ADDRESS && (
          <NavGroup>
            {account.type === AccountType.MNEMONIC && (
              <NavItem title="View Recovery Phrase" />
            )}
            {[AccountType.MNEMONIC, AccountType.PRIVATE_KEY].includes(
              account.type,
            ) && <NavItem title="View Private Key" />}
          </NavGroup>
        )}

        <NavGroup>
          <NavItem title="Delete Wallet" danger />
        </NavGroup>
      </ScrollView>
    </SafeAreaPage>
  );
};
