import { keccak256 } from 'eth-lib/lib/hash';
import { isString } from 'lodash';

export const stripHexPrefix = (string: string) => {
  if (!isString(string)) {
    throw new Error('string parameter should be a string.');
  }

  return string.startsWith('0x') || string.startsWith('0X')
    ? string.slice(2)
    : string;
};

export const checkAddressChecksum = (
  address: string,
  chainId: number | null = null,
) => {
  if (!isString(address)) {
    throw new Error('address parameter needs to be a string.');
  }

  const stripAddress = stripHexPrefix(address).toLowerCase();
  const prefix = chainId != null ? chainId.toString() + '0x' : '';
  const keccakHash = keccak256(prefix + stripAddress)
    .toString('hex')
    .replace(/^0x/i, '');

  for (let i = 0; i < stripAddress.length; i++) {
    const output =
      parseInt(keccakHash[i], 16) >= 8
        ? stripAddress[i].toUpperCase()
        : stripAddress[i];
    if (stripHexPrefix(address)[i] !== output) {
      return false;
    }
  }
  return true;
};

export const isAddress = (address: string, chainId: number | null = null) => {
  if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
    return false;
    // If it's ALL lowercase or ALL upppercase
  } else if (
    /^(0x|0X)?[0-9a-f]{40}$/.test(address) ||
    /^(0x|0X)?[0-9A-F]{40}$/.test(address)
  ) {
    return true;
    // Otherwise check each case
  } else {
    return checkAddressChecksum(address, chainId);
  }
};

export function toChecksumAddress(
  address: string,
  chainId: number | null = null,
) {
  if (!isString(address)) {
    throw new Error('address parameter should be a string.');
  }

  if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
    throw new Error(
      `Given address "${address}" is not a valid Ethereum address.`,
    );
  }

  const stripAddress = stripHexPrefix(address).toLowerCase();
  const prefix = chainId != null ? chainId.toString() + '0x' : '';
  const keccakHash = keccak256(prefix + stripAddress)
    .toString('hex')
    .replace(/^0x/i, '');
  let checksumAddress = '0x';

  for (let i = 0; i < stripAddress.length; i++) {
    checksumAddress +=
      parseInt(keccakHash[i], 16) >= 8
        ? stripAddress[i].toUpperCase()
        : stripAddress[i];
  }

  return checksumAddress;
}
