import React, { useEffect, useMemo, useState } from 'react';
import { NavItem, NavItemProps } from 'components/NavGroup/NavItem';
import { prettifyTx } from 'utils/helpers';
import { ChainId } from 'types/network';
import { useDebouncedEffect } from 'hooks/useDebounceEffect';
import { toChecksumAddress } from 'utils/rsk';
import { Wallet } from 'ethers';
import { makeWalletPrivateKey } from 'utils/wallet';
import { AccountType } from 'utils/accounts';
import Logger from 'utils/Logger';

type Props = {
  masterSeed: string;
  derivationPath: string;
  index: number;
  chainId: ChainId;
} & Partial<NavItemProps>;

export const WalletAddressItem: React.FC<Props> = ({
  masterSeed,
  derivationPath,
  chainId,
  index,
  ...props
}) => {
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState<string>();

  // generating address from master seed blocks other scripts, so we set loading state
  // as soon as possible and debouncing actual generation.
  // this make sure that view is rerendered with loading state visible
  useEffect(() => {
    setLoading(true);
  }, [masterSeed, derivationPath, chainId, index]);

  useDebouncedEffect(
    () => {
      setLoading(true);
      new Promise<string>((resolve, reject) => {
        try {
          const checksumedAddress = toChecksumAddress(
            new Wallet(
              makeWalletPrivateKey(
                AccountType.MNEMONIC,
                masterSeed,
                derivationPath,
                index,
              ),
            ).address,
            chainId,
          );
          resolve(checksumedAddress);
        } catch (e) {
          reject(e);
        }
      })
        .then(result => {
          setAddress(result);
          setLoading(false);
        })
        .catch(Logger.error);
    },
    300,
    [masterSeed, derivationPath, chainId, index],
  );

  const renderAddress = useMemo(() => {
    if (loading) {
      return 'generating, please wait...';
    }
    if (!address) {
      return 'failed to generate!';
    }
    return prettifyTx(address, 8, 8);
  }, [loading, address]);

  return <NavItem {...props} title={`#${index}. ${renderAddress}`} />;
};
