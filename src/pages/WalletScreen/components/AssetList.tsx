import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from 'context/AppContext';
import { listAssetsForChains } from 'utils/asset-utils';
import { NavGroup } from 'components/NavGroup/NavGroup';
import { Asset } from 'models/asset';
import { AssetItem } from './AssetItem';
import { AssetModal } from './AssetModal';
import { BalanceContext } from 'context/BalanceContext';
import { useWalletAddress } from 'hooks/useWalletAddress';
import { get } from 'lodash';
import { BigNumber } from 'ethers';

export const AssetList: React.FC = () => {
  const { chainIds } = useContext(AppContext);
  const { balances } = useContext(BalanceContext);
  const owner = useWalletAddress()?.toLowerCase();

  const tokens = useMemo(
    () =>
      listAssetsForChains(chainIds).filter(item =>
        BigNumber.from(get(balances, [item.chainId, owner], '0')).gt('0'),
      ),
    [chainIds, balances, owner],
  );

  const nativeTokens = useMemo(
    () => tokens.filter(item => item.native),
    [tokens],
  );

  const erc20Tokens = useMemo(
    () => tokens.filter(item => item.erc20),
    [tokens],
  );

  const [asset, setAsset] = useState<Asset>();

  return (
    <>
      <NavGroup>
        {nativeTokens.map(item => (
          <AssetItem
            key={item.id}
            asset={item}
            onPress={() => setAsset(item)}
          />
        ))}
      </NavGroup>
      <NavGroup>
        {erc20Tokens.map(item => (
          <AssetItem
            key={item.id}
            asset={item}
            onPress={() => setAsset(item)}
          />
        ))}
      </NavGroup>
      <AssetModal asset={asset!} onClose={() => setAsset(undefined)} />
    </>
  );
};
