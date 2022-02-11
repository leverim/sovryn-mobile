import React, { useMemo } from 'react';
import { BigNumber } from 'ethers';
import { utils } from 'ethers/lib.esm';
import { useVestedAssets } from 'hooks/useVestedAssets';
import { TokenId } from 'types/asset';
import { commifyDecimals } from 'utils/helpers';
import { ChainId } from 'types/network';
import { VestingConfig } from 'models/vesting-config';
import { useWalletAddress } from 'hooks/useWalletAddress';
import { NavGroup } from 'components/NavGroup/NavGroup';
import { NavItem } from 'components/NavGroup/NavItem';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { WalletStackProps } from 'pages/MainScreen/WalletPage';

type VestedAssetsProps = {
  tokenId: TokenId;
  chainId: ChainId;
};

export const VestedAssets: React.FC<VestedAssetsProps> = ({
  tokenId,
  chainId,
}) => {
  const config = useMemo(
    () => VestingConfig.get(tokenId, chainId),
    [tokenId, chainId],
  );
  return config ? <VestedToken vesting={config} /> : null;
};

type VestedTokenProps = {
  vesting: VestingConfig;
};

export const VestedToken: React.FC<VestedTokenProps> = ({ vesting }) => {
  const { navigate } = useNavigation<NavigationProp<WalletStackProps>>();
  const owner = useWalletAddress();
  const { vestings, balances } = useVestedAssets(vesting, owner);

  const balance = useMemo(
    () =>
      utils.formatUnits(
        balances.reduce((p, c) => p.add(c), BigNumber.from(0)),
        vesting.token.decimals,
      ),
    [balances, vesting.token],
  );

  if (!vestings.length) {
    return null;
  }

  return (
    <NavGroup>
      <NavItem
        title={`Vested ${vesting.token.symbol}`}
        value={`${commifyDecimals(balance)} ${vesting.token.symbol}`}
        onPress={() =>
          navigate('wallet.vestings', {
            token: vesting.token,
            chainId: vesting.chainId,
          })
        }
      />
    </NavGroup>
  );
};
