import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from 'context/AppContext';
import { listAssetsForChains } from 'utils/asset-utils';
import { NavGroup } from 'components/NavGroup/NavGroup';
import { Asset } from 'models/asset';
import { AssetItem } from './AssetItem';
import { AssetModal } from './AssetModal';

export const AssetList: React.FC = () => {
  const { chainIds } = useContext(AppContext);

  const tokens = useMemo(() => listAssetsForChains(chainIds), [chainIds]);

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
