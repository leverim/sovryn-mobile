import { utils, Wallet } from 'ethers';

export const generateMnemonic = () =>
  utils.entropyToMnemonic(utils.randomBytes(16));

export const validateMnemonic = (mnemonic: string) =>
  utils.isValidMnemonic(mnemonic);

const cache: Record<string, Wallet> = {};

export const getEvmWallet = (
  mnemonic: string,
  dPath: string,
  index: number,
) => {
  const key = `${dPath}/${index}`;
  if (!cache.hasOwnProperty(key)) {
    cache[key] = Wallet.fromMnemonic(mnemonic, key);
  }
  return cache[key];
};
