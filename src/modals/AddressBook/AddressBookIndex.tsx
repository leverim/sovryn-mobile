import React, { useCallback, useLayoutEffect, useRef } from 'react';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import { PageContainer, SafeAreaPage } from 'templates/SafeAreaPage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text } from 'components/Text';
import { AddressBookItem, useAddressBook } from 'hooks/useAddressBook';
import { DarkTheme } from '@react-navigation/native';
import { SwipeListView } from 'react-native-swipe-list-view';
import AddBoxIcon from 'assets/add-box-icon.svg';
import { AddressBookModalStackProps } from './AddressBookModalRoutes';

type Props = NativeStackScreenProps<
  AddressBookModalStackProps,
  'address-book.index'
>;

export const addressBookSelection: Record<string, AddressBookItem> = {};

export const AddressBookIndex: React.FC<Props> = ({ route, navigation }) => {
  const { addresses, removeByAddress } = useAddressBook();
  const animationIsRunning = useRef(false);

  const handleSelection = useCallback(
    (item: AddressBookItem) => {
      route.params.onSelected(item.address.toLowerCase());
      navigation.goBack();
    },
    [navigation, route.params],
  );

  const handleStartAdd = useCallback(() => {
    navigation.navigate('address-book.create');
  }, [navigation]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <>
          <Pressable onPress={handleStartAdd}>
            <AddBoxIcon fill={DarkTheme.colors.primary} />
          </Pressable>
        </>
      ),
    });
  }, [handleStartAdd, navigation]);

  const handleSwipeValueChange = useCallback(
    (data: {
      key: string;
      value: number;
      direction: 'left' | 'right';
      isOpen: boolean;
    }) => {
      const { key, value } = data;
      if (
        value < -Dimensions.get('window').width &&
        !animationIsRunning.current
      ) {
        animationIsRunning.current = true;
        removeByAddress(key);
        animationIsRunning.current = false;
      }
    },
    [removeByAddress],
  );

  return (
    <SafeAreaPage>
      <PageContainer>
        <SwipeListView
          data={addresses}
          renderItem={({ item }) => (
            <Pressable
              style={styles.container}
              key={item.address}
              onPress={() => handleSelection(item)}>
              <Text style={styles.nameText}>{item.name}</Text>
              <Text style={styles.addressText}>{item.address}</Text>
            </Pressable>
          )}
          keyExtractor={item => item.address}
          renderHiddenItem={({ item }) =>
            item.isAccount ? null : (
              <View style={styles.rowBack}>
                <View style={[styles.backRightBtn, styles.backRightBtnRight]}>
                  <Text>Delete</Text>
                </View>
              </View>
            )
          }
          rightOpenValue={-Dimensions.get('window').width}
          onSwipeValueChange={handleSwipeValueChange}
        />
      </PageContainer>
    </SafeAreaPage>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: DarkTheme.colors.card,
    borderRadius: 8,
    marginBottom: 12,
    height: 64,
  },
  nameText: {
    marginBottom: 4,
  },
  addressText: {},
  rowBack: {
    alignItems: 'center',
    backgroundColor: DarkTheme.colors.notification,
    flexDirection: 'row',
    justifyContent: 'space-between',
    // paddingLeft: 15,
    height: 64,
    borderRadius: 8,
  },
  backRightBtn: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: 75,
  },
  backRightBtnRight: {
    right: 0,
  },
});
