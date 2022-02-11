import { LendingToken, LendingTokenFlags } from 'models/lending-token';

export const lendingTokens: LendingToken[] = [
  // mainnet
  new LendingToken(30, 'rbtc', 'irbtc', ['xusd', 'doc', 'bpro', 'sov']),
  new LendingToken(
    30,
    'xusd',
    'ixusd',
    ['rbtc', 'doc', 'bpro', 'sov'],
    LendingTokenFlags.REWARDS_ENABLED,
  ),
  new LendingToken(30, 'doc', 'idoc', ['rbtc', 'xusd', 'bpro', 'sov']),
  new LendingToken(30, 'bpro', 'ibpro', ['rbtc', 'xusd', 'doc', 'sov']),
  new LendingToken(30, 'rusdt', 'irusdt', [], LendingTokenFlags.DEPRECATED),
  // testnet
  new LendingToken(31, 'trbtc', 'tirbtc', ['txusd', 'tdoc', 'tbpro', 'tsov']),
  new LendingToken(
    31,
    'txusd',
    'tixusd',
    ['trbtc', 'tdoc', 'tbpro', 'tsov'],
    LendingTokenFlags.REWARDS_ENABLED,
  ),
  new LendingToken(31, 'tdoc', 'tidoc', ['trbtc', 'txusd', 'tbpro', 'tsov']),
  new LendingToken(31, 'tbpro', 'tibpro', ['trbtc', 'txusd', 'tdoc', 'tsov']),
  new LendingToken(31, 'trusdt', 'tirusdt', [], LendingTokenFlags.DEPRECATED),
];
