import { useFocusEffect } from '@react-navigation/native';
import { BigNumber } from 'ethers';
import { useIsMounted } from 'hooks/useIsMounted';
import { useWalletAddress } from 'hooks/useWalletAddress';
import { get, set } from 'lodash';
import { AmmPool } from 'models/amm-pool';
import { useCallback, useMemo, useState } from 'react';
import { cache } from 'utils/cache';
import { STORAGE_CACHE_AMM_POOLS } from 'utils/constants';
import { aggregateCall, CallData } from 'utils/contract-utils';
import { getContractAddress } from 'utils/helpers';

type GetUserInfoResult = {
  amount: string;
  rewardDebt: string;
  accumulatedReward: string;
};

type AggregatorResult = {
  reserveStakedBalance1: string;
  reserveWeight1: number;
  reserveStakedBalance2: string;
  reserveWeight2: number;
  poolTokenSupply1: string;
  poolTokenSupply2?: string;
  getUserInfo1: GetUserInfoResult;
  getUserInfo2?: GetUserInfoResult;
  getUserAccumulatedReward1: string;
  getUserAccumulatedReward2?: string;
};

type ReserveState = {
  loading: boolean;
  loaded: number;
} & AggregatorResult;

export function useAmmPoolData(pool: AmmPool) {
  const isMounted = useIsMounted();
  const owner = useWalletAddress()?.toLocaleLowerCase();
  const [state, setState] = useState<ReserveState>({
    loading: false,
    ...get(
      cache.get(STORAGE_CACHE_AMM_POOLS, {}),
      [pool.chainId, owner, pool.converterAddress],
      {
        loaded: 0,
        reserveStakedBalance1: '0',
        reserveStakedBalance2: '0',
        reserveWeight1: 0,
        reserveWeight2: 0,
        poolTokenSupply1: '0',
        poolTokenSupply2: '0',
        getUserAccumulatedReward1: '0',
        getUserAccumulatedReward2: '0',
      },
    ),
  });

  useFocusEffect(
    useCallback(() => {
      if (!state.loading) {
        setState(prevState => ({
          ...prevState,
          ...get(
            cache.get(STORAGE_CACHE_AMM_POOLS, {}),
            [pool.chainId, owner, pool.converterAddress],
            {},
          ),
        }));
      }
    }, [owner, pool.chainId, pool.converterAddress, state.loading]),
  );

  const execute = useCallback(async () => {
    setState(prevState => ({ ...prevState, loading: true }));

    try {
      const liquidityMiningProxyAddress = getContractAddress(
        'liquidityMiningProxy',
        pool.chainId,
      );
      let items: CallData[] = [
        {
          address: pool.converterAddress,
          fnName: 'reserveWeight(address)(uint256)',
          args: [pool.supplyToken1.getWrappedAsset().address],
          key: 'reserveWeight1',
          parser: result => result[0].toNumber(),
        },
        {
          address: pool.converterAddress,
          fnName: 'reserveWeight(address)(uint256)',
          args: [pool.supplyToken2.getWrappedAsset().address],
          key: 'reserveWeight2',
          parser: result => result[0].toNumber(),
        },
        {
          address: pool.poolToken1.address,
          fnName: 'totalSupply()(uint256)',
          args: [],
          key: 'poolTokenSupply1',
          parser: result => result[0].toString(),
        },
      ];

      if (pool.usesLM) {
        items = [
          ...items,
          {
            address: liquidityMiningProxyAddress,
            fnName: 'getUserInfo(address,address)((uint256,uint256,uint256))',
            args: [pool.poolToken1.address, owner],
            key: 'getUserInfo1',
            parser: result => ({
              amount: result[0][0].toString(),
              rewardDebt: result[0][1].toString(), // todo: fgure out what's this
              accumulatedReward: result[0][2].toString(),
            }),
          },
          {
            address: liquidityMiningProxyAddress,
            fnName: 'getUserAccumulatedReward(address,address)(uint256)',
            args: [pool.poolToken1.address, owner],
            key: 'getUserAccumulatedReward1',
            parser: result => result[0].toString(),
          },
        ];
      }

      if (pool.version === 1) {
        items = [
          ...items,
          {
            address: pool.supplyToken1.getWrappedAsset().address,
            fnName: 'balanceOf(address)(uint256)',
            args: [pool.converterAddress],
            key: 'reserveStakedBalance1',
            parser: result => result[0].toString(),
          },
          {
            address: pool.supplyToken2.getWrappedAsset().address,
            fnName: 'balanceOf(address)(uint256)',
            args: [pool.converterAddress],
            key: 'reserveStakedBalance2',
            parser: result => result[0].toString(),
          },
        ];
      }

      if (pool.version === 2) {
        items = [
          ...items,
          {
            address: pool.poolToken2?.address!,
            fnName: 'totalSupply()(uint256)',
            args: [],
            key: 'poolTokenSupply2',
            parser: result => result[0].toString(),
          },
          {
            address: pool.converterAddress,
            fnName: 'reserveStakedBalance(address)(uint256)',
            args: [pool.supplyToken1.getWrappedAsset().address],
            key: 'reserveStakedBalance1',
            parser: result => result[0].toString(),
          },
          {
            address: pool.converterAddress,
            fnName: 'reserveStakedBalance(address)(uint256)',
            args: [pool.supplyToken2.getWrappedAsset().address],
            key: 'reserveStakedBalance2',
            parser: result => result[0].toString(),
          },
          {
            address: getContractAddress('liquidityMiningProxy', pool.chainId),
            fnName: 'getUserInfo(address,address)((uint256,uint256,uint256))',
            args: [pool.poolToken2?.address, owner],
            key: 'getUserInfo2',
            parser: result => ({
              amount: result[0][0].toString(),
              rewardDebt: result[0][1].toString(), // todo: fgure out what's this
              accumulatedReward: result[0][2].toString(),
            }),
          },
        ];

        if (pool.usesLM) {
          items = [
            ...items,
            {
              address: liquidityMiningProxyAddress,
              fnName: 'getUserAccumulatedReward(address,address)(uint256)',
              args: [pool.poolToken2?.address, owner],
              key: 'getUserAccumulatedReward2',
              parser: result => result[0].toString(),
            },
          ];
        }
      }

      aggregateCall<AggregatorResult>(pool.chainId, items)
        .then(({ returnData }) => {
          const now = Date.now();
          cache.set(
            STORAGE_CACHE_AMM_POOLS,
            set(
              cache.get(STORAGE_CACHE_AMM_POOLS, {}),
              [pool.chainId, owner, pool.converterAddress],
              { ...returnData, loaded: now },
            ),
          );
          if (isMounted()) {
            setState(prevState => ({
              ...prevState,
              ...returnData,
              loading: false,
              loaded: now,
            }));
          }
        })
        .catch(e => {
          console.warn(e);
        })
        .finally(() => {
          if (isMounted()) {
            setState(prevState => ({ ...prevState, loading: false }));
          }
        });
    } catch (e) {
      console.error('token', pool.poolToken1Id);
    }
  }, [
    isMounted,
    owner,
    pool.chainId,
    pool.converterAddress,
    pool.poolToken1.address,
    pool.poolToken1Id,
    pool.poolToken2?.address,
    pool.supplyToken1,
    pool.supplyToken2,
    pool.usesLM,
    pool.version,
  ]);

  const balance1 = useMemo(() => {
    if (
      state.getUserInfo1?.amount &&
      state.poolTokenSupply1 &&
      state.reserveStakedBalance1
    ) {
      return BigNumber.from(state.getUserInfo1.amount || '0')
        .mul(pool.supplyToken1.getWrappedAsset().ONE)
        .div(state.poolTokenSupply1 || '0')
        .mul(state.reserveStakedBalance1 || '0')
        .div(pool.supplyToken1.getWrappedAsset().ONE)
        .toString();
    }
    return '0';
  }, [
    pool.supplyToken1,
    state.getUserInfo1?.amount,
    state.poolTokenSupply1,
    state.reserveStakedBalance1,
  ]);

  const balance2 = useMemo(() => {
    if (pool.version === 1) {
      if (
        state.getUserInfo1?.amount &&
        state.poolTokenSupply1 &&
        state.reserveStakedBalance2
      ) {
        return BigNumber.from(state.getUserInfo1.amount || '0')
          .mul(pool.supplyToken2.getWrappedAsset().ONE)
          .div(state.poolTokenSupply1 || '0')
          .mul(state.reserveStakedBalance2 || '0')
          .div(pool.supplyToken2.getWrappedAsset().ONE)
          .toString();
      }
    }

    if (pool.version === 2) {
      if (
        state.getUserInfo2?.amount &&
        state.poolTokenSupply2 &&
        state.reserveStakedBalance2
      ) {
        return BigNumber.from(state.getUserInfo2.amount || '0')
          .mul(pool.supplyToken2.getWrappedAsset().ONE)
          .div(state.poolTokenSupply2 || '0')
          .mul(state.reserveStakedBalance2 || '0')
          .div(pool.supplyToken2.getWrappedAsset().ONE)
          .toString();
      }
    }
    return '0';
  }, [
    pool.supplyToken2,
    pool.version,
    state.getUserInfo1?.amount,
    state.getUserInfo2?.amount,
    state.poolTokenSupply1,
    state.poolTokenSupply2,
    state.reserveStakedBalance2,
  ]);

  const rewards = useMemo(() => {
    const tokenReward1 = BigNumber.from(
      state.getUserInfo1?.accumulatedReward || '0',
    ).add(state.getUserAccumulatedReward1 || '0');
    const tokenReward2 = BigNumber.from(
      state.getUserInfo2?.accumulatedReward || '0',
    ).add(state.getUserAccumulatedReward2 || '0');
    return {
      balance1: tokenReward1.toString(),
      balance2: tokenReward2.toString(),
      total: tokenReward1.add(tokenReward2).toString(),
    };
  }, [
    state.getUserAccumulatedReward1,
    state.getUserAccumulatedReward2,
    state.getUserInfo1?.accumulatedReward,
    state.getUserInfo2?.accumulatedReward,
  ]);

  return {
    state,
    balance: {
      balance1,
      balance2,
    },
    rewards,
    execute,
  };
}
