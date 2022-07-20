import { ChainId } from 'types/network';
import { callToContract } from 'utils/contract-utils';

export enum LoanType {
  IDK = 0,
  TRADE = 1,
  BORROW = 2,
}

export type ActiveLoan = {};

export const getActiveLoanList = async (
  chainId: ChainId,
  user: string,
  loanType: LoanType,
  start: number = 0,
  count: number = 1000,
  isLender: boolean = false,
  unsafeOnly: boolean = false,
) => {
  return callToContract<Array<ActiveLoan>>(
    chainId,
    'sovrynProtocol',
    'getUserLoans(address,uint256,uint256,uint256,bool,bool)(bytes32,address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256)',
    [user, start, count, loanType, isLender, unsafeOnly],
  );
};
