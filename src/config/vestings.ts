import { VestingConfig, VestingContractType } from 'models/vesting-config';

export const vestings: VestingConfig[] = [
  new VestingConfig(30, 'sov', '0xe24ABdB7DcaB57F3cbe4cBDDd850D52F143eE920'),
  new VestingConfig(31, 'sov', '0x09e8659B6d204C6b1bED2BFF8E3F43F834A5Bbc4'),
  new VestingConfig(
    30,
    'fish',
    '0x036ab2DB0a3d1574469a4a7E09887Ed76fB56C41',
    VestingContractType.SINGLE,
    ['getVesting', 'getTeamVesting'],
  ),
  new VestingConfig(
    31,
    'fish',
    '0xFd8ea2e5e8591fA791d44731499cDF2e81CD6a41',
    VestingContractType.SINGLE,
    ['getVesting', 'getTeamVesting'],
  ),
];
