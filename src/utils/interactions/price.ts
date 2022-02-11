import { AssetType } from 'models/asset';
import { ChainId } from 'types/network';
import { TokenId } from 'types/asset';
import { listAssetsForChain } from 'utils/asset-utils';
import { aggregateCall, CallData } from 'utils/contract-utils';
import { getNetworks } from 'utils/network-utils';

/**
 * @deprecated
 * @todo move to balance controller
 **/
export const getAllBalances = (chainId: ChainId, owner: string) => {
  const { multicallContract } = getNetworks().find(
    item => item.chainId === chainId,
  )!;

  return aggregateCall<Record<TokenId, string>>(
    chainId,
    listAssetsForChain(chainId).map(
      item =>
        ({
          address: (item.type === AssetType.NATIVE
            ? multicallContract
            : item.address
          )?.toLowerCase(),
          fnName:
            item.type === AssetType.NATIVE
              ? 'getEthBalance(address)(uint256)'
              : 'balanceOf(address)(uint256)',
          args: [owner.toLowerCase()],
          key: item.id,
          parser: response => response[0].toString(),
        } as CallData),
    ),
  ).then(async ({ returnData }) => returnData);
};
