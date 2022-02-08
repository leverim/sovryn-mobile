import { assets } from 'config/tokens';
import { intersection } from 'lodash';
import { Asset } from 'models/asset';
import { ChainId } from 'types/network';
import { getNetworkIds } from './network-utils';

export const listAssets = (isTestnet: boolean): Asset[] =>
  assets.filter(item => getNetworkIds(isTestnet).includes(item.chainId));
