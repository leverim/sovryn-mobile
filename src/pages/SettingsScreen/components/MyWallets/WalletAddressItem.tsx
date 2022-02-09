import React from 'react';
import { NavItem, NavItemProps } from 'components/NavGroup/NavItem';
import { useAssetBalance } from 'hooks/useAssetBalance';
import { commifyDecimals, currentChainId, prettifyTx } from 'utils/helpers';
import { getNativeAsset } from 'utils/asset-utils';

type Props = { address: string; index: number } & Partial<NavItemProps>;

export const WalletAddressItem: React.FC<Props> = ({
  address,
  index,
  ...props
}) => {
  const coin = getNativeAsset(currentChainId());
  const { value } = useAssetBalance(coin, address);
  return (
    <NavItem
      {...props}
      title={`#${index}. ${prettifyTx(address, 8, 8)}`}
      value={`${commifyDecimals(value)} ${coin.symbol}`}
    />
  );
};
