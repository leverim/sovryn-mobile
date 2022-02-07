import { useContext, useMemo } from 'react';
import { AppContext } from 'context/AppContext';
import { useWalletAddress } from 'hooks/useWalletAddress';
import { LendingToken } from 'models/lending-token';
import { noop } from 'utils/helpers';

// export function useLendingPool(lendingToken: LendingToken) {
//   const owner = useWalletAddress().toLowerCase();
//   const [state, setState] = useState<Partial<LoanTokenInfo>>(
//     cache.get(
//       `lending_${lendingToken.chainId}_${lendingToken.loanTokenAddress}_${owner}`,
//       {},
//     ),
//   );
//   const [loading, setLoading] = useState(false);
//   const isMounted = useIsMounted();

//   const execute = useCallback(() => {
//     setLoading(true);
//     getLoanTokenInfo(lendingToken, owner)
//       .then(returnData => {
//         if (isMounted()) {
//           setState(returnData);
//           cache.set(
//             `lending_${lendingToken.chainId}_${lendingToken.loanTokenAddress}_${owner}`,
//             returnData,
//           );
//           setLoading(false);
//         }
//       })
//       .catch(e => {
//         console.warn(lendingToken.loanTokenId, e);
//         if (isMounted()) {
//           setLoading(false);
//         }
//       });
//   }, [isMounted, lendingToken, owner]);

//   useDebouncedEffect(
//     () => {
//       execute();
//     },
//     300,
//     [execute],
//   );

//   return {
//     value: state,
//     loading,
//     execute,
//   };
// }

export function useLendingPool(lendingToken: LendingToken) {
  const { loanPools } = useContext(AppContext);

  const owner = useWalletAddress().toLowerCase();

  const pool = useMemo(() => {
    return loanPools[lendingToken.chainId]?.[owner][lendingToken.loanTokenId]!;
  }, [lendingToken.chainId, lendingToken.loanTokenId, loanPools, owner]);

  return {
    value: pool,
    loading: false,
    execute: noop,
  };
}
