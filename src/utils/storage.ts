import EncryptedStorage from 'react-native-encrypted-storage';
import AsyncStorage from '@react-native-community/async-storage';

export const clearStorage = async () => {
  await EncryptedStorage.clear();
  await AsyncStorage.clear();
};

export const storeItem = (key: string, value: string) =>
  AsyncStorage.setItem(key, value);
export const getItem = (key: string) => AsyncStorage.getItem(key);
export const removeItem = (key: string) => AsyncStorage.removeItem(key);
