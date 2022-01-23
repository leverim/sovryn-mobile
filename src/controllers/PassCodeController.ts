import { Platform } from 'react-native';
import {
  ACCESS_CONTROL,
  setGenericPassword,
  Options,
  getGenericPassword,
  getSupportedBiometryType,
  ACCESSIBLE,
} from 'react-native-keychain';

const PASSCODE_USERNAME = 'sovryn';

class PassCodeController {
  protected _loaded: boolean = false;

  public async supportedBiometrics() {
    return getSupportedBiometryType(this.opions());
  }

  public async setPassword(value: string) {
    await setGenericPassword(PASSCODE_USERNAME, value, this.opions());
    if (Platform.OS === 'ios') {
      await this.unlock();
    }
  }

  public async unlock() {
    return getGenericPassword(this.opions()).then(credentials => {
      if (credentials) {
        return credentials.username === PASSCODE_USERNAME
          ? credentials.password
          : false;
      }
      return false;
    });
  }

  protected opions(): Options {
    return {
      accessControl: ACCESS_CONTROL.BIOMETRY_ANY,
      // accessGroup: string;
      accessible: ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      // authenticationPrompt: string | AuthenticationPrompt;
      // authenticationType: AUTHENTICATION_TYPE;
      service: 'com.defray.sovryn',
      // securityLevel: SECURITY_LEVEL;
      // storage: STORAGE_TYPE;
      // rules: SECURITY_RULES;
    };
  }
}

export const passcode = new PassCodeController();
