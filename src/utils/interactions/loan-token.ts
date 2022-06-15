import { LendingToken, LendingTokenFlags } from 'models/lending-token';
import { aggregateCall, CallData } from 'utils/contract-utils';
import { getContractAddress } from 'utils/helpers';

export type LoanTokenInfo = {
  supplyInterestRate: string;
  marketLiquidity: string;
  tokenPrice: string;
  // user
  balanceOf: string;
  assetBalanceOf: string;
  profitOf: string;
  checkpointPrice: string;
  // lm
  getUserAccumulatedReward: string;
  getUserPoolTokenBalance: string;
};

export type BorrowTokenInfo = {
  borrowInterestRate: string;
  marketLiquidity: string;
  tokenPrice: string;
};

export const getLoanTokenInfo = async (
  lendingToken: LendingToken,
  owner: string,
) => {
  const calls: CallData[] = [
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
  ];

  if (lendingToken.hasFlag(LendingTokenFlags.REWARDS_ENABLED)) {
    const liquidityMiningProxy = getContractAddress(
      'liquidityMiningProxy',
      lendingToken.supplyToken.chainId,
    );
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
          fnName: 'getUserPoolTokenBalance(address,address)(uint256)',
          args: [lendingToken.loanTokenAddress, owner],
          key: 'getUserPoolTokenBalance',
          parser: value => value[0].toString(),
        },
      ] as CallData[]),
    );
  }

  return aggregateCall<LoanTokenInfo>(lendingToken.chainId, calls).then(
    ({ returnData }) => returnData,
  );
};

export const getBorrowTokenInfo = async (lendingToken: LendingToken) => {
  const calls: CallData[] = [
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
      fnName: 'borrowInterestRate()(uint256)',
      args: [],
      key: 'borrowInterestRate',
      parser: value => value[0].toString(),
    },
  ];

  return aggregateCall<BorrowTokenInfo>(lendingToken.chainId, calls).then(
    ({ returnData }) => returnData,
  );
};
