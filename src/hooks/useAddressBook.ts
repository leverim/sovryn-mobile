import { useCallback, useContext, useState } from 'react';
import { AppContext } from 'context/AppContext';
import { useFocusEffect } from '@react-navigation/native';
import { cache } from 'utils/cache';
import { STORAGE_CACHE_ADDRESS_BOOK } from 'utils/constants';

export type AddressBookItem = {
  name: string;
  address: string;
  isAccount?: boolean;
};

export const useAddressBook = () => {
  const { accountList } = useContext(AppContext);

  const getItems = useCallback(() => {
    const accounts = accountList.map(item => ({
      name: item.name,
      address: item.address,
      isAccount: true,
    }));
    const saved = cache.get(STORAGE_CACHE_ADDRESS_BOOK, []);
    return [...accounts, ...saved];
  }, [accountList]);

  const [items, setItems] = useState<AddressBookItem[]>(getItems());

  useFocusEffect(useCallback(() => setItems(getItems()), [getItems]));

  const get = useCallback(
    (address: string) =>
      items.find(item => item.address.toLowerCase() === address.toLowerCase()),
    [items],
  );

  const remove = useCallback(
    (item: AddressBookItem) => {
      if (get(item.address)) {
        const cached = cache.get(
          STORAGE_CACHE_ADDRESS_BOOK,
          [],
        ) as AddressBookItem[];
        const index = cached.indexOf(item);
        if (index !== -1) {
          cached.splice(index, 1);
          cache.set(STORAGE_CACHE_ADDRESS_BOOK, cached);
          setItems(getItems());
        }
      }
    },
    [get, getItems],
  );

  const removeByAddress = useCallback(
    (address: string) => {
      const item = get(address);
      if (item) {
        remove(item);
      }
    },
    [get, remove],
  );

  const add = useCallback(
    (item: AddressBookItem) => {
      if (get(item.address)) {
        throw new Error('Address already in the address book.');
      }
      cache.set(STORAGE_CACHE_ADDRESS_BOOK, [
        ...cache.get(STORAGE_CACHE_ADDRESS_BOOK, []),
        item,
      ]);
      setItems(getItems());
    },
    [get, getItems],
  );

  return {
    addresses: items,
    get,
    add,
    remove,
    removeByAddress,
  };
};
