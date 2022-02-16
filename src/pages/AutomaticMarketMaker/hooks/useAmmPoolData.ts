import { useIsMounted } from 'hooks/useIsMounted';
import { AmmPool } from 'models/amm-pool';
import { useCallback, useEffect, useState } from 'react';
import { aggregateCall, CallData } from 'utils/contract-utils';

type ReserveState = {
  loading: boolean;
};

export function useAmmPoolData(pool: AmmPool) {
  const isMounted = useIsMounted();
  const [state, setState] = useState<ReserveState>();

  const execute = useCallback(() => {
    setState(prevState => ({ ...prevState, loading: true }));

    let items: CallData[] = [
      {
        address: pool.converterAddress,
        fnName: 'reserveWeight(address)(uint256)',
        args: [pool.supplyToken1.address],
        key: 'reserveWeight1',
        parser: result => result[0].toNumber(),
      },
    ];

    if (pool.version === 1) {
      items = [
        ...items,
        {
          address: pool.supplyToken1.address,
          fnName: 'balanceOf(address)(uint256)',
          args: [pool.converterAddress],
          key: 'reserveStakedBalance1',
        },
      ];
    }

    if (pool.version === 2) {
      items = [
        ...items,
        {
          address: pool.converterAddress,
          fnName: 'reserveWeight(address)(uint256)',
          args: [pool.supplyToken2.address],
          key: 'reserveWeight2',
          parser: result => result[0].toNumber(),
        },
        {
          address: pool.converterAddress,
          fnName: 'reserveStakedBalance(address)(uint256)',
          args: [pool.supplyToken1.address],
          key: 'reserveStakedBalance1',
        },
        {
          address: pool.converterAddress,
          fnName: 'reserveStakedBalance(address)(uint256)',
          args: [pool.supplyToken2.address],
          key: 'reserveStakedBalance2',
        },
      ];
    }

    aggregateCall(pool.chainId, items)
      .then(result => {
        if (isMounted()) {
          console.log(result);
          setState(prevState => ({ ...prevState, loading: false }));
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
  }, [isMounted, pool]);

  useEffect(() => {
    execute();
  }, [execute]);

  return { state, execute };
}
