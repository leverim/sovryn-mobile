import { utils, Wallet } from 'ethers';

export const generateMnemonic = () =>
  utils.entropyToMnemonic(utils.randomBytes(16));

export const validateMnemonic = (mnemonic: string) =>
  utils.isValidMnemonic(mnemonic);

export const validatePrivateKey = (pk: string) => {
  try {
    return new Wallet(pk) && true;
  } catch (e) {
    return false;
  }
};
