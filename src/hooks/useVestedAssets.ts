import { useEffect, useState } from 'react';
import { BigNumber } from 'ethers/lib.esm';
import { callToContract, contractCall } from 'utils/contract-utils';
import { cache } from 'utils/cache';
import { currentChainId } from 'utils/helpers';
import { contractUtils } from 'utils/contract';
import { ContractName } from 'types/contract';

export type VestingData = {
  vestingType: number;
  vestingCreationType: number;
  vestingAddress: string;
};

export function useVestedAssets(
  registryContractName: ContractName,
  owner: string,
) {
  owner = owner.toLowerCase();
  const chainId = currentChainId();
  const registryAddress = contractUtils.getContractAddressForChainId(
    contractUtils.getContractByName(registryContractName),
    chainId,
  );
  const [stakingContract, setStakingContract] = useState<string>(
    cache.get(`staking_contract_${chainId}_${registryAddress}`),
  );
  const [vestings, setVestings] = useState<VestingData[]>(
    cache.get(`vesting_contracts_${chainId}_${registryAddress}_${owner}`, []),
  );
  const [balances, setBalances] = useState<string[]>(
    cache.get(`vesting_balances_${chainId}_${registryAddress}_${owner}`, []),
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      // get staking contract
      callToContract<Array<string>>(
        registryContractName,
        'staking()(address)',
        [],
      ).then(response => {
        setStakingContract(response[0]);
        console.log('staking', response[0]);
        return cache.set(
          `staking_contract_${chainId}_${registryAddress}`,
          response[0],
        );
      }),
      // get list of user vestings.
      callToContract<Array<Array<[BigNumber, BigNumber, string]>>>(
        registryContractName,
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
          console.log('vestings', response);
          setVestings(response);
          return cache.set(
            `vesting_contracts_${chainId}_${registryAddress}_${owner}`,
            response,
          );
        }),
    ]).finally(() => setLoading(false));
  }, [owner, chainId, registryAddress, registryContractName]);

  useEffect(() => {
    if (vestings.length && stakingContract) {
      Promise.all(
        vestings.map(vesting =>
          contractCall(
            currentChainId(),
            stakingContract,
            'balanceOf(address)(uint256)',
            [vesting.vestingAddress],
          ).then(response => response[0].toString()),
        ),
      ).then(response => {
        setBalances(response);
        cache.set(
          `vesting_balances_${chainId}_${registryAddress}_${owner}`,
          response,
        );
      });
    }
  }, [vestings, stakingContract, chainId, owner, registryAddress]);

  return {
    stakingContract,
    vestings,
    balances,
    loading,
  };
}
