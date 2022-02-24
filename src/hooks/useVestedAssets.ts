import { useCallback, useMemo, useState } from 'react';
import { BigNumber, constants } from 'ethers/lib.esm';
import { contractCall } from 'utils/contract-utils';
import { cache } from 'utils/cache';
import {
  VestingConfig,
  VestingContractMethod,
  VestingContractType,
} from 'models/vesting-config';
import { useDebouncedEffect } from './useDebounceEffect';
import { useFocusEffect } from '@react-navigation/native';
import { useIsMounted } from './useIsMounted';

export type VestingData = {
  // 0 - team vesting, 1 - vesting
  vestingType: number;
  // vesting registry index?
  vestingCreationType: number;
  vestingAddress: string;
};

const vestingTypes: Record<VestingContractMethod, number> = {
  getTeamVesting: 0,
  getVesting: 1,
};

const methodToVestingType = (method: VestingContractMethod) =>
  vestingTypes[method] || 0;

export function useVestedAssets(vesting: VestingConfig, owner: string) {
  const isMounted = useIsMounted();
  const { registryAddress, chainId } = vesting;
  owner = owner.toLowerCase();
  const [stakingContract, setStakingContract] = useState<string>(
    cache.get(`staking_contract_${chainId}_${registryAddress}`),
  );
  const [vestings, setVestings] = useState<VestingData[]>(
    cache.get(`vesting_contracts_${chainId}_${registryAddress}_${owner}`, []),
  );
  const [balances, setBalances] = useState<string[]>(
    cache.get(`vesting_balances_${chainId}_${registryAddress}_${owner}`, []),
  );

  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [loadingBalances, setLoadingBalances] = useState(false);
  const loading = useMemo(
    () => loadingAddresses || loadingBalances,
    [loadingAddresses, loadingBalances],
  );

  useDebouncedEffect(
    () => {
      setLoadingAddresses(true);
      Promise.all([
        // get staking contract
        contractCall<Array<string>>(
          chainId,
          registryAddress,
          'staking()(address)',
          [],
        ).then(response => {
          setStakingContract(response[0]);
          return cache.set(
            `staking_contract_${chainId}_${registryAddress}`,
            response[0],
          );
        }),
        // get list of user vestings.
        vesting.type === VestingContractType.LIST &&
          contractCall<Array<Array<[BigNumber, BigNumber, string]>>>(
            chainId,
            registryAddress,
            'getVestingsOf(address)((uint256,uint256,address)[])',
            [owner],
          )
            .then(response => response[0])
            .then(response =>
              response.map(
                ([vestingType, vestingCreationType, vestingAddress]) => ({
                  vestingType: vestingType.toNumber(),
                  vestingCreationType: vestingCreationType.toNumber(),
                  vestingAddress,
                }),
              ),
            )
            .then(response => {
              setVestings(response);
              return cache.set(
                `vesting_contracts_${chainId}_${registryAddress}_${owner}`,
                response,
              );
            }),
        vesting.type === VestingContractType.SINGLE &&
          Promise.all<VestingData>(
            vesting.vestingMethods.map(method =>
              contractCall(
                vesting.chainId,
                registryAddress,
                `${method}(address)(address)`,
                [owner],
              )
                .then(response => response[0])
                .then(vestingAddress => ({
                  vestingType: methodToVestingType(method),
                  vestingCreationType: 1,
                  vestingAddress,
                })),
            ),
          )
            .then(
              response =>
                response.filter(
                  item => item.vestingAddress !== constants.AddressZero,
                ) as VestingData[],
            )
            .then(response => {
              if (isMounted()) {
                setVestings(response);
              }
              return cache.set(
                `vesting_contracts_${chainId}_${registryAddress}_${owner}`,
                response,
              );
            }),
      ])
        .catch(error => {
          console.log('vestings', error);
        })
        .finally(() => {
          if (isMounted()) {
            setLoadingAddresses(false);
          }
        });
    },
    300,
    [owner, chainId, registryAddress, vesting, isMounted],
  );

  const refreshBalances = useCallback(() => {
    console.log('refresh', vestings.length, stakingContract);
    setBalances(
      cache.get(`vesting_balances_${chainId}_${registryAddress}_${owner}`, []),
    );
    if (vestings.length && stakingContract) {
      setLoadingBalances(true);
      Promise.all(
        vestings.map(vest =>
          contractCall(
            chainId,
            stakingContract,
            'balanceOf(address)(uint256)',
            [vest.vestingAddress],
          ).then(response => response[0].toString()),
        ),
      )
        .then(response => {
          if (isMounted()) {
            setBalances(response);
          }
          cache.set(
            `vesting_balances_${chainId}_${registryAddress}_${owner}`,
            response,
          );
        })
        .catch(e => {
          console.log('balance-of', e);
        })
        .finally(() => {
          if (isMounted()) {
            setLoadingBalances(false);
          }
        });
    }
  }, [chainId, isMounted, owner, registryAddress, stakingContract, vestings]);

  useFocusEffect(useCallback(() => refreshBalances(), [refreshBalances]));

  return {
    stakingContract,
    vestings,
    balances,
    loading,
    loadingAddresses,
    loadingBalances,
    refreshBalances,
  };
}
