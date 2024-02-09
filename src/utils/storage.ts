import EncryptedStorage from 'react-native-encrypted-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const clearStorage = async () => {
  try {
    await EncryptedStorage.clear();
    await AsyncStorage.clear();
  } catch (error) {
    console.error('error when clearing storages:', error);
  }
};

export const storeItem = (key: string, value: string) =>
  AsyncStorage.setItem(key, value);
export const getItem = (key: string) => AsyncStorage.getItem(key);
export const removeItem = (key: string) => AsyncStorage.removeItem(key);
