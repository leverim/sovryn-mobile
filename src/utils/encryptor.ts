import { NativeModules } from 'react-native';

const Aes = NativeModules.Aes;

/**
 * Handles encryption and decryption of sensitive data using password.
 * Borrowed from metamask-mobile.
 */
export class Encryptor {
  protected key = null;
  protected algorithm = 'aes-256-cbc';

  public encrypt = async (password: string, object: any) => {
    const salt = this.generateSalt(16);
    const key = await this.keyFromPassword(password, salt);
    const result: any = await this.encryptWithKey(JSON.stringify(object), key);
    result.salt = salt;
    return JSON.stringify(result);
  };

  public decrypt = async (password: string, encryptedString: any) => {
    const encryptedData = JSON.parse(encryptedString);
    const key = await this.keyFromPassword(password, encryptedData.salt);
    const data = await this.decryptWithKey(encryptedData, key);
    return JSON.parse(data);
  };

  protected generateSalt(byteCount = 32) {
    const view = new Uint8Array(byteCount);
    global.crypto.getRandomValues(view);
    // eslint-disable-next-line no-undef
    const b64encoded = btoa(String.fromCharCode.apply(null, view as any));
    return b64encoded;
  }

  protected generateKey = (password: string, salt: string) =>
    Aes.pbkdf2(password, salt, 5000, 256);

  protected keyFromPassword = (password: string, salt: string) =>
    this.generateKey(password, salt);

  protected encryptWithKey = async (text: string, keyBase64: string) => {
    const iv = await Aes.randomKey(16);
    return Aes.encrypt(text, keyBase64, iv, this.algorithm).then(
      (cipher: any) => ({
        cipher,
        iv,
      }),
    );
  };

  protected decryptWithKey = (encryptedData: any, key: any) =>
    Aes.decrypt(encryptedData.cipher, key, encryptedData.iv, this.algorithm);
}
