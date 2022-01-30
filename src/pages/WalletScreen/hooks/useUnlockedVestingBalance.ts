import { BigNumber } from 'ethers';
import { useDebouncedEffect } from 'hooks/useDebounceEffect';
import { useCallback, useState } from 'react';
import { ChainId } from 'types/network';
import { aggregateCall, contractCall } from 'utils/contract-utils';

// Vesting smart-contract uses two weeks intervals for locks and staking
// todo: find out if this value can be retrieved from SC somewhere.
//   I did some testing and it worked with 4 weeks just fine, but leaving 2 just on case there is
//   some contracts that depends on it.
const TWO_WEEKS_IN_SECONDS = 1209600;

export function useUnlockedVestingBalance(
  chainId: ChainId,
  vestingAddress: string,
) {
  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState('0');

  const getBalance = useCallback(async () => {
    setLoading(true);
    try {
      const {
        blockNumber,
        returnData: { stakingAddress, startDate, endDate, cliff },
      } = await aggregateCall<{
        stakingAddress: string;
        startDate: number;
        endDate: number;
        cliff: number;
      }>(chainId, [
        {
          address: vestingAddress,
          fnName: 'staking()(address)',
          args: [],
          key: 'stakingAddress',
          parser: response => response[0].toString(),
        },
        {
          address: vestingAddress,
          fnName: 'startDate()(uint256)',
          args: [],
          key: 'startDate',
          parser: response => response[0].toNumber(),
        },
        {
          address: vestingAddress,
          fnName: 'endDate()(uint256)',
          args: [],
          key: 'endDate',
          parser: response => response[0].toNumber(),
        },
        {
          address: vestingAddress,
          fnName: 'cliff()(uint256)',
          args: [],
          key: 'cliff',
          parser: response => response[0].toNumber(),
        },
      ]);

      // creed-victor: in the unlikely case that all tokens have been unlocked early, allow to withdraw all of them.
      // https://github.com/DistributedCollective/Sovryn-frontend/blob/9ed58c18911e86fbdaf4ecbecfd509a32aa8f795/src/app/hooks/staking/useGetUnlockedVesting.ts#L50
      const isAllUnlocked = await contractCall(
        chainId,
        stakingAddress,
        'allUnlocked()(bool)',
        [],
      ).then(response => response[0]);

      const end = isAllUnlocked
        ? endDate
        : Math.ceil(new Date().getTime() / 1000);

      const calls = [];
      // could this be done with map or something?
      for (let i = startDate + cliff; i <= end; i += TWO_WEEKS_IN_SECONDS) {
        calls.push([vestingAddress, i, blockNumber - 1]);
      }

      const { returnData: stakes } = await aggregateCall<
        Record<string, string>
      >(
        chainId,
        calls.map((args, index) => ({
          address: stakingAddress,
          fnName: 'getPriorUserStakeByDate(address,uint256,uint256)(uint256)',
          args,
          key: index.toString(),
          parser: response => response[0].toString(),
        })),
      );

      setValue(
        Object.values(stakes)
          .reduce((p, c) => p.add(c), BigNumber.from(0))
          .toString(),
      );
    } catch (e) {
      console.log(e);
      setValue('0');
    } finally {
      setLoading(false);
    }
  }, [chainId, vestingAddress]);

  useDebouncedEffect(
    () => {
      getBalance();
    },
    300,
    [getBalance],
  );

  return { loading, value };
}
