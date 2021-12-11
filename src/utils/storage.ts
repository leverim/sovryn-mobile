import EncryptedStorage from 'react-native-encrypted-storage';

export const storeMnemonic = (mnemonic: string) =>
  EncryptedStorage.setItem('mnemonic', mnemonic);

export const retrieveMnemonic = () =>
  EncryptedStorage.getItem('mnemonic').then(response =>
    response ? response : null,
  );

export const clearStorage = () => EncryptedStorage.clear();
