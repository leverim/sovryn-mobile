import { useCallback, useContext, useMemo, useState } from 'react';
import { useWalletAddress } from 'hooks/useWalletAddress';
import { LendingToken } from 'models/lending-token';
import {
  BorrowTokenInfo,
  getBorrowTokenInfo,
} from 'utils/interactions/loan-token';
import Logger from 'utils/Logger';
import { cache } from 'utils/cache';
import {
  STORAGE_CACHE_BORROW_POOLS,
  STORAGE_CACHE_LOAN_POOLS,
} from 'utils/constants';
import { get, set } from 'lodash';
import { BorrowPoolContext } from 'store/borrow-pools';
import { useCallContract } from 'hooks/useContractCall';

const initialValue: BorrowTokenInfo = {
  borrowInterestRate: '0',
  marketLiquidity: '0',
  tokenPrice: '0',
};

export const useActiveBorrowLoans = () => {
  const { state, actions } = useContext(BorrowPoolContext);

  const owner = useWalletAddress().toLowerCase();

  const [loading, setLoading] = useState(false);


  contractCall()

  //


//   const execute = useCallback(async () => {
//     if (!owner) {
//       return;
//     }
//     setLoading(true);
//     try {
//       const result = await getBorrowTokenInfo(lendingToken);

//       console.log(result);

//       const cached = cache.get(STORAGE_CACHE_BORROW_POOLS, {});

//       cache.set(
//         STORAGE_CACHE_LOAN_POOLS,
//         set(cached, [lendingToken.chainId, lendingToken.loanTokenId], result),
//       );

//       actions.set(
//         lendingToken.chainId,
//         owner,
//         get(cache.get(STORAGE_CACHE_LOAN_POOLS, {}), [
//           lendingToken.chainId,
//           owner,
//         ]),
//       );
//     } catch (e) {
//       Logger.error(e, 'useBorrowPool execute');
//     } finally {
//       setLoading(false);
//     }
//   }, [owner, lendingToken, actions]);

  return {
    value: pool,
    loading,
    execute,
  };
};
