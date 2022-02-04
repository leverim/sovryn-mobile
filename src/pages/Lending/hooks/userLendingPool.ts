import { useDebouncedEffect } from 'hooks/useDebounceEffect';
import { useIsMounted } from 'hooks/useIsMounted';
import { useWalletAddress } from 'hooks/useWalletAddress';
import { LendingToken, LendingTokenFlags } from 'models/lending-token';
import { useCallback, useState } from 'react';
import { cache } from 'utils/cache';
import { aggregateCall, CallData } from 'utils/contract-utils';
import { getContractAddress } from 'utils/helpers';

export function useLendingPool(lendingToken: LendingToken) {
  const owner = useWalletAddress().toLowerCase();
  const [state, setState] = useState<
    Partial<{
      balanceOf: string;
      assetBalanceOf: string;
      profitOf: string;
      checkpointPrice: string;
      marketLiquidity: string;
      tokenPrice: string;
      supplyInterestRate: string;
      totalSupply: string;
      totalAssetSupply: string;
      getUserAccumulatedReward: string;
      getPoolInfo: any;
      getUserInfo: any;
      getUserPoolTokenBalance: string;
      decimals: string;
    }>
  >(
    cache.get(
      `lending_${lendingToken.chainId}_${lendingToken.loanTokenAddress}_${owner}`,
      {},
    ),
  );
  const [loading, setLoading] = useState(false);
  const isMounted = useIsMounted();

  const execute = useCallback(() => {
    setLoading(true);
    const calls: CallData[] = [
      {
        address: lendingToken.loanTokenAddress,
        fnName: 'balanceOf(address)(uint256)',
        args: [owner],
        key: 'balanceOf',
        parser: value => value[0].toString(),
      },
      {
        address: lendingToken.loanTokenAddress,
        fnName: 'assetBalanceOf(address)(uint256)',
        args: [owner],
        key: 'assetBalanceOf',
        parser: value => value[0].toString(),
      },
      {
        address: lendingToken.loanTokenAddress,
        fnName: 'profitOf(address)(uint256)',
        args: [owner],
        key: 'profitOf',
        parser: value => value[0].toString(),
      },
      {
        address: lendingToken.loanTokenAddress,
        fnName: 'checkpointPrice(address)(uint256)',
        args: [owner],
        key: 'checkpointPrice',
        parser: value => value[0].toString(),
      },
      {
        address: lendingToken.loanTokenAddress,
        fnName: 'marketLiquidity()(uint256)',
        args: [],
        key: 'marketLiquidity',
        parser: value => value[0].toString(),
      },
      {
        address: lendingToken.loanTokenAddress,
        fnName: 'tokenPrice()(uint256)',
        args: [],
        key: 'tokenPrice',
        parser: value => value[0].toString(),
      },
      {
        address: lendingToken.loanTokenAddress,
        fnName: 'supplyInterestRate()(uint256)',
        args: [],
        key: 'supplyInterestRate',
        parser: value => value[0].toString(),
      },
      {
        address: lendingToken.loanTokenAddress,
        fnName: 'totalSupply()(uint256)',
        args: [],
        key: 'totalSupply',
        parser: value => value[0].toString(),
      },
      {
        address: lendingToken.loanTokenAddress,
        fnName: 'totalAssetSupply()(uint256)',
        args: [],
        key: 'totalAssetSupply',
        parser: value => value[0].toString(),
      },
    ];

    if (lendingToken.hasFlag(LendingTokenFlags.REWARDS_ENABLED)) {
      const liquidityMiningProxy = getContractAddress('liquidityMiningProxy');
      calls.push(
        ...([
          {
            address: liquidityMiningProxy,
            fnName: 'getUserAccumulatedReward(address,address)(uint256)',
            args: [lendingToken.loanTokenAddress, owner],
            key: 'getUserAccumulatedReward',
            parser: value => value[0].toString(),
          },
          {
            address: liquidityMiningProxy,
            fnName: 'getPoolInfo(address)((address,uint96,uint256,uint256))',
            args: [lendingToken.loanTokenAddress],
            key: 'getPoolInfo',
            parser: value => ({
              poolToken: value[0][0],
              allocationPoint: value[0][1].toString(),
              lastRewardBlock: value[0][2].toString(),
              accumulatedRewardPerShare: value[0][3].toString(),
            }),
          },
          {
            address: liquidityMiningProxy,
            fnName: 'getUserInfo(address,address)(uint256,uint256,uint256)',
            args: [lendingToken.loanTokenAddress, owner],
            key: 'getUserInfo',
            parser: value => ({
              amount: value[0].toString(),
              rewardDebt: value[1].toString(),
              accumulatedReward: value[2].toString(),
            }),
          },
          {
            address: liquidityMiningProxy,
            fnName: 'getUserPoolTokenBalance(address,address)(uint256)',
            args: [lendingToken.loanTokenAddress, owner],
            key: 'getUserPoolTokenBalance',
            parser: value => value[0].toString(),
          },
        ] as CallData[]),
      );
    }

    aggregateCall(lendingToken.chainId, calls)
      .then(({ returnData }) => {
        if (isMounted()) {
          setState(returnData);
          cache.set(
            `lending_${lendingToken.chainId}_${lendingToken.loanTokenAddress}_${owner}`,
            returnData,
          );
          setLoading(false);
        }
      })
      .catch(e => {
        console.warn(lendingToken.loanTokenId, e);
        if (isMounted()) {
          setLoading(false);
        }
      });
  }, [isMounted, lendingToken, owner]);

  useDebouncedEffect(
    () => {
      execute();
    },
    300,
    [execute],
  );

  return {
    value: state,
    loading,
    execute,
  };
}
