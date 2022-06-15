import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BorrowIndex } from 'pages/Borrow/BorrowIndex';

export type BorrowRoutesStackProps = {
  'borrow.index': undefined;
};

const Stack = createNativeStackNavigator<BorrowRoutesStackProps>();

export const BorrowRoutes: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName="borrow.index">
      <Stack.Screen
        name="borrow.index"
        component={BorrowIndex}
        options={{ title: 'Borrow' }}
      />
    </Stack.Navigator>
  );
};
