import { AssetType } from 'models/asset';
import { ChainId } from 'types/network';
import { TokenId } from 'types/asset';
import { getUsdAsset, listAssetsForChain } from 'utils/asset-utils';
import { cache } from 'utils/cache';
import { aggregateCall, CallData } from 'utils/contract-utils';
import { currentChainId } from 'utils/helpers';
import { getNetworks } from 'utils/network-utils';
import { getSwapExpectedReturn } from '.';

export const getUsdPrice = (
  amount: string,
  tokenId: TokenId,
  chainId: ChainId = currentChainId(),
) => {
  return getSwapExpectedReturn(
    tokenId,
    getUsdAsset(chainId).id,
    amount,
    chainId,
  );
};

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
  ).then(async ({ returnData }) => {
    await cache.set(`balances_${chainId}_${owner.toLowerCase()}`, returnData);
    return returnData;
  });
};

export const getCachedBalances = (chainId: ChainId, owner: string) => {
  return cache.get<Record<TokenId, string>>(
    `balances_${chainId}_${owner?.toLowerCase()}`,
    {} as Record<TokenId, string>,
  );
};
