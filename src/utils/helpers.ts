import { ImageSourcePropType } from 'react-native';
import { ContractName } from 'types/contract';
import { contractUtils } from './contract';
import { Setting, settings } from './settings';

export const noop = () => {};

export const currentChainId = () => settings.get(Setting.DEFAULT_CHAIN_ID, 30);

export const getContractAddress = (
  contractName: ContractName,
  chainId: number = currentChainId(),
) => {
  const contract = contractUtils.getContractByName(contractName);
  if (!contractUtils.contractHasChainId(contract, chainId)) {
    throw new Error(
      `Contract ${contractName} does not have ${chainId} chain defined.`,
    );
  }
  return contractUtils.getContractAddressForChainId(contract, chainId);
};

export const prettifyTx = (
  text: string,
  startLength: number = 6,
  endLength: number = 4,
) => {
  if (text?.length <= startLength + endLength + 5) {
    return text;
  }
  const start = text.substr(0, startLength);
  const end = text.substr(-endLength);
  return `${start} ··· ${end}`;
};

export const prepareImageSource = (
  uri?: string,
): ImageSourcePropType | null => {
  if (uri) {
    if (uri.startsWith('assets/')) {
      // todo load by path
      // return require(uri);
    }

    if (uri.startsWith('data:') || uri.startsWith('http')) {
      return {
        uri,
      };
    }
  }
  return null;
};
