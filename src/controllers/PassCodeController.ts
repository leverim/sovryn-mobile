import AsyncStorage from '@react-native-community/async-storage';
import { ethers } from 'ethers';
import { Platform } from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import {
  ACCESS_CONTROL,
  setGenericPassword,
  Options,
  getGenericPassword,
  getSupportedBiometryType,
  ACCESSIBLE,
  resetGenericPassword,
} from 'react-native-keychain';
import { Buffer } from 'buffer';
import { STORAGE_PASSCODE, STORAGE_PASSCODE_TYPE } from 'utils/constants';

const PASSCODE_USERNAME = 'sovryn';

const defaultKeychainOptions: Options = {
  service: 'com.defray.sovryn',
  authenticationPrompt: {
    title: 'Authenticate to allow unlocking the app using biometrics',
  },
  accessible: ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export enum PassCodeType {
  BIOMETRY = 'biometry',
  PASSCODE = 'passcode',
}

class PassCodeController {
  protected _loaded: boolean = false;

  protected _unlocked: boolean = false;

  public async supportedBiometrics() {
    return getSupportedBiometryType(defaultKeychainOptions);
  }

  public async getPasscodeType() {
    return (await AsyncStorage.getItem(
      STORAGE_PASSCODE_TYPE,
    )) as PassCodeType | null;
  }

  public async setPassword(value: string, type: PassCodeType) {
    try {
      await AsyncStorage.setItem(STORAGE_PASSCODE_TYPE, type);

      if (type === PassCodeType.BIOMETRY) {
        await setGenericPassword(PASSCODE_USERNAME, value, {
          ...defaultKeychainOptions,
          ...{ accessControl: ACCESS_CONTROL.BIOMETRY_CURRENT_SET },
        });

        if (Platform.OS === 'ios') {
          await this.unlock();
        }
      }

      await EncryptedStorage.setItem(
        STORAGE_PASSCODE,
        ethers.utils.sha512(Buffer.from(value)),
      );
    } catch (error) {
      console.error(error);
      // if something went wrong adding password - reset it
      await this.resetPassword();
    }
  }

  public async verify(password: string) {
    const saved = await EncryptedStorage.getItem(STORAGE_PASSCODE);
    return ethers.utils.sha512(Buffer.from(password)) === saved;
  }

  public async hasPasscode() {
    const code = await EncryptedStorage.getItem(STORAGE_PASSCODE);
    return !!code;
  }

  public async unlock() {
    const type = await this.getPasscodeType();

    if (!type) {
      return Promise.resolve(false);
    }

    return getGenericPassword({
      ...defaultKeychainOptions,
      accessControl: ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
    }).then(credentials => {
      if (credentials) {
        return credentials.username === PASSCODE_USERNAME
          ? credentials.password
          : false;
      }
      return false;
    });
  }

  public async resetPassword() {
    await AsyncStorage.removeItem(STORAGE_PASSCODE_TYPE);
    await EncryptedStorage.removeItem(STORAGE_PASSCODE);
    return resetGenericPassword({ service: defaultKeychainOptions.service });
  }

  public async setUnlocked(value: boolean) {
    this._unlocked = value;
    return this;
  }

  public get unlocked() {
    return this._unlocked;
  }
}

export const passcode = new PassCodeController();
