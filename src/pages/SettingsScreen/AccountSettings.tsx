import React, { useCallback, useContext, useEffect } from 'react';
import { Button, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { accounts, AccountType } from 'utils/accounts';
import { AppContext } from 'context/AppContext';
import { prettifyTx } from 'utils/helpers';
import { Wallet } from 'utils/wallet';
import { SafeAreaPage } from 'templates/SafeAreaPage';
import { Text } from 'components/Text';

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
            <Text>
              {prettifyTx(new Wallet(index).derive()?.address || '0x')}
            </Text>
          </View>
          <View>
            {accountSelected === index ? (
              <Text>Active</Text>
            ) : (
              <Button onPress={() => onActivate(index)} title="Activate">
                <Text>Activate</Text>
              </Button>
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
