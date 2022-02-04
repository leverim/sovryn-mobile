import { LendingToken, LendingTokenFlags } from 'models/lending-token';

export const lendingTokens: LendingToken[] = [
  // mainnet
  new LendingToken(30, 'rbtc', '0xa9DcDC63eaBb8a2b6f39D7fF9429d88340044a7A', [
    'xusd',
    'doc',
    'bpro',
    'sov',
  ]),
  new LendingToken(
    30,
    'xusd',
    '0x8F77ecf69711a4b346f23109c40416BE3dC7f129',
    ['rbtc', 'doc', 'bpro', 'sov'],
    LendingTokenFlags.REWARDS_ENABLED,
  ),
  new LendingToken(30, 'doc', '0xd8D25f03EBbA94E15Df2eD4d6D38276B595593c1', [
    'rbtc',
    'xusd',
    'bpro',
    'sov',
  ]),
  new LendingToken(30, 'bpro', '0x6E2fb26a60dA535732F8149b25018C9c0823a715', [
    'rbtc',
    'xusd',
    'doc',
    'sov',
  ]),
  new LendingToken(
    30,
    'rusdt',
    '0x849C47f9C259E9D62F289BF1b2729039698D8387',
    [],
    LendingTokenFlags.DEPRECATED,
  ),
  // testnet
  new LendingToken(31, 'rbtc', '0xe67Fe227e0504e8e96A34C3594795756dC26e14B', [
    'xusd',
    'doc',
    'bpro',
    'sov',
  ]),
  new LendingToken(
    31,
    'xusd',
    '0x9bD0cE087b14ef67C3D37C891139AaE7d94a961A',
    ['rbtc', 'doc', 'bpro', 'sov'],
    LendingTokenFlags.REWARDS_ENABLED,
  ),
  new LendingToken(31, 'doc', '0x74e00A8CeDdC752074aad367785bFae7034ed89f', [
    'rbtc',
    'xusd',
    'bpro',
    'sov',
  ]),
  new LendingToken(31, 'bpro', '0x6226b4B3F29Ecb5f9EEC3eC3391488173418dD5d', [
    'rbtc',
    'xusd',
    'doc',
    'sov',
  ]),
  new LendingToken(
    31,
    'rusdt',
    '0xd1f225BEAE98ccc51c468d1E92d0331c4f93e566',
    [],
    LendingTokenFlags.DEPRECATED,
  ),
];
