import React, { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { PageContainer, SafeAreaPage } from 'templates/SafeAreaPage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text } from 'components/Text';
import { AddressBookItem, useAddressBook } from 'hooks/useAddressBook';
import { AddressBookModalStackProps } from './AddressBookModalRoutes';
import { AddressField } from 'components/AddressField';
import { Button } from 'components/Buttons/Button';
import { isAddress } from 'utils/rsk';
import { InputField } from 'components/InputField';

type Props = NativeStackScreenProps<
  AddressBookModalStackProps,
  'address-book.create'
>;

export const addressBookSelection: Record<string, AddressBookItem> = {};

export const AddressBookCreate: React.FC<Props> = ({ navigation }) => {
  const { addresses, add } = useAddressBook();
  const [name, setName] = useState(`Bookmark #${addresses.length}`);
  const [address, setAddress] = useState('');
  const [isAddressValid, setAddressValid] = useState(false);

  const handleChange = useCallback((text: string, valid: boolean) => {
    setAddress(text);
    setAddressValid(valid);
  }, []);

  const handleSubmit = useCallback(() => {
    try {
      const item: AddressBookItem = {
        name,
        address: address?.toLowerCase(),
      };
      if (isAddress(item.address)) {
        add(item);
        navigation.goBack();
      } else {
        throw new Error('Address is not valid.');
      }
    } catch (error) {
      Alert.alert('Failed to add', error.message);
    }
  }, [add, address, name, navigation]);

  const errorMessage = useMemo(() => {
    if (!name) {
      return 'Enter bookmark name';
    }
    if (!address) {
      return 'Enter address';
    }
    if (!isAddressValid) {
      return 'Enter valid address';
    }
  }, [address, isAddressValid, name]);

  return (
    <SafeAreaPage>
      <PageContainer>
        <Text>Name</Text>
        <InputField value={name} onChangeText={setName} />
        <AddressField
          title={<Text>Address</Text>}
          value={address}
          onChange={handleChange}
          hideAddressBook
        />
        <Button
          title={errorMessage ? errorMessage : 'Add bookmark'}
          onPress={handleSubmit}
          primary
          disabled={!!errorMessage}
        />
      </PageContainer>
    </SafeAreaPage>
  );
};
