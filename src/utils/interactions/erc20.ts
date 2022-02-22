import { ChainId } from 'types/network';
import { aggregateCall, contractCall } from 'utils/contract-utils';

export const erc20 = {
  getInfo(chainId: ChainId, address: string) {
    return aggregateCall(chainId, [
      {
        address,
        fnName: 'name()(string)',
        args: [],
        key: 'name',
        parser: result => result[0],
      },
      {
        address,
        fnName: 'symbol()(string)',
        args: [],
        key: 'symbol',
        parser: result => result[0],
      },
      {
        address,
        fnName: 'decimals()(uint8)',
        args: [],
        key: 'decimals',
        parser: result => result[0],
      },
      {
        address,
        fnName: 'totalSupply()(uint256)',
        args: [],
        key: 'totalSupply',
        parser: result => result[0],
      },
    ]).then(({ returnData }) => returnData);
  },
  getBalance(chainId: ChainId, tokenAddress: string, ownerAddress: string) {
    return contractCall(chainId, tokenAddress, 'balanceOf(address)(uint256)', [
      ownerAddress,
    ]);
  },
  getAllowance(
    chainId: ChainId,
    tokenAddress: string,
    ownerAddress: string,
    spenderAddress: string,
  ) {
    return contractCall(
      chainId,
      tokenAddress,
      'allowance(address,address)(uint256)',
      [ownerAddress, spenderAddress],
    ).then(response => response[0]);
  },
};
