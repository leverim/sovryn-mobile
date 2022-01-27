import React from 'react';
import { NavItem, NavItemProps } from 'components/NavGroup/NavItem';
import { useAssetBalance } from 'hooks/useAssetBalance';
import { tokenUtils } from 'utils/token-utils';
import { commifyDecimals, currentChainId, prettifyTx } from 'utils/helpers';

type Props = { address: string; index: number } & Partial<NavItemProps>;

export const WalletAddressItem: React.FC<Props> = ({
  address,
  index,
  ...props
}) => {
  const coin = tokenUtils.getNativeToken(currentChainId());
  const { value } = useAssetBalance(coin, address, currentChainId());
  return (
    <NavItem
      {...props}
      title={`#${index}. ${prettifyTx(address, 8, 8)}`}
      value={`${commifyDecimals(value)} ${coin.symbol}`}
    />
  );
};
