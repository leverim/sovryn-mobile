import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AddressBookIndex } from './AddressBookIndex';
import { AddressBookCreate } from './AddressBookCreate';
import { HeaderTitleComponent } from 'modals/HeaderTitleComponent';

export type AddressBookModalStackProps = {
  'address-book.index': {
    onSelected: (address: string) => void;
    value?: string;
  };
  'address-book.create': undefined;
};

const Stack = createNativeStackNavigator<AddressBookModalStackProps>();

export const AddressBookModalRoutes: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="address-book.index"
      screenOptions={{
        contentStyle: { backgroundColor: 'rgb(34, 34, 34)' },
        headerTitle: props => <HeaderTitleComponent {...props} />,
      }}>
      <Stack.Screen
        name="address-book.index"
        component={AddressBookIndex}
        options={{ title: 'Address Book' }}
      />
      <Stack.Screen
        name="address-book.create"
        component={AddressBookCreate}
        options={{ title: 'Bookmark Address' }}
      />
    </Stack.Navigator>
  );
};
