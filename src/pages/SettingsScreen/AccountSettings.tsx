import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import { Button, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { accounts, AccountType } from 'utils/accounts';
import { AppContext } from 'context/AppContext';
import { UnlockedWallet } from 'utils/wallet';
import { SafeAreaPage } from 'templates/SafeAreaPage';
import { Text } from 'components/Text';
import { Setting, settings } from 'utils/settings';

export const AccountSettings: React.FC = () => {
  const { accountList, accountSelected } = useContext(AppContext);
  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({
      title: 'Account',
    });
  }, [navigation]);

  const onActivate = useCallback(async (index: number) => {
    const { type } = accounts.get(index);
    switch (type) {
      case AccountType.PRIVATE_KEY:
      case AccountType.PUBLIC_ADDRESS:
        await accounts.select(index);
        break;
      case AccountType.MNEMONIC:
        // todo allow to select address and derivation path too
        await accounts.select(index);
        break;
    }
  }, []);

  const dPath = useMemo(() => settings.get(Setting.SELECTED_DPATH), []);

  return (
    <SafeAreaPage>
      <Text>List of accounts</Text>
      {accountList.map((item, index) => (
        <View key={index}>
          <View>
            <Text>{item.name}</Text>
            {item.type === AccountType.MNEMONIC && <Text>(Mnemonic)</Text>}
            {item.type === AccountType.PRIVATE_KEY && (
              <Text>(Private Key)</Text>
            )}
            {item.type === AccountType.PUBLIC_ADDRESS && (
              <Text>(Read only)</Text>
            )}
          </View>
          <View>
            <Text>{new UnlockedWallet(index, 0, dPath).address || '0x'}</Text>
          </View>
          <View>
            {accountSelected === index ? (
              <Text>Active</Text>
            ) : (
              <>
                <Button onPress={() => onActivate(index)} title="Activate">
                  <Text>Activate</Text>
                </Button>
              </>
            )}
          </View>
        </View>
      ))}
      <Button
        title="Add another account"
        onPress={() => navigation.navigate('settings.create')}
      />
    </SafeAreaPage>
  );
};
