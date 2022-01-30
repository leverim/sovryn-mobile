import React from 'react';
import { VestingData } from 'hooks/useVestedAssets';
import { commifyDecimals, formatUnits } from 'utils/helpers';
import { NavItem } from 'components/NavGroup/NavItem';
import { VestingConfig } from 'models/vesting-config';

type VestedAssetRowProps = {
  vestingConfig: VestingConfig;
  vestingData: VestingData;
  balance: string;
  onWithdraw: () => void;
};

export const VestedAssetRow: React.FC<VestedAssetRowProps> = ({
  vestingConfig,
  balance,
  onWithdraw,
  ...props
}) => {
  return (
    <NavItem
      {...props}
      title={`${commifyDecimals(
        formatUnits(balance, vestingConfig.token.decimals),
      )} ${vestingConfig.token.symbol}`}
      value="Withdraw"
      onPress={onWithdraw}
    />
  );
};
