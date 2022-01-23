import React from 'react';
import { View } from 'react-native';
import { VestingData } from 'hooks/useVestedAssets';
import { commifyDecimals, currentChainId, prettifyTx } from 'utils/helpers';
import { utils } from 'ethers/lib.esm';
import { useCall } from 'hooks/useCall';
import { Token } from 'types/token';
import { Text } from 'components/Text';

type VestedAssetRowProps = {
  vesting: VestingData;
  balance: string;
  asset: Token;
};

export const VestedAssetRow: React.FC<VestedAssetRowProps> = ({
  vesting,
  balance,
  asset,
}) => {
  const { value, loading, loaded } = useCall(
    currentChainId(),
    vesting.vestingAddress,
    'SOV()(address)',
    [],
  );

  return (
    <View>
      <Text>{prettifyTx(vesting.vestingAddress)}</Text>
      <Text>
        Balance: {commifyDecimals(utils.formatUnits(balance, asset.decimals))}{' '}
        {asset.symbol}
      </Text>
      {loading && <Text>Loading</Text>}
      {loaded && <Text>Loaded</Text>}
      <Text>{value}</Text>
    </View>
  );
};
