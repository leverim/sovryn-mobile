import React from 'react';
import { View } from 'react-native';
import { VestingData } from 'hooks/useVestedAssets';
import { commifyDecimals, prettifyTx } from 'utils/helpers';
import { utils } from 'ethers/lib.esm';
import { Token } from 'types/token';
import { NavItem } from 'components/NavGroup/NavItem';

type VestedAssetRowProps = {
  vesting: VestingData;
  balance: string;
  asset: Token;
};

export const VestedAssetRow: React.FC<VestedAssetRowProps> = ({
  vesting,
  balance,
  asset,
  ...props
}) => {
  // const { value, loading, loaded } = useCall(
  //   currentChainId(),
  //   vesting.vestingAddress,
  //   'SOV()(address)',
  //   [],
  // );
  return (
    <NavItem
      {...props}
      title={prettifyTx(vesting.vestingAddress)}
      value={`${commifyDecimals(utils.formatUnits(balance, asset.decimals))} ${
        asset.symbol
      }`}
    />
  );
};
