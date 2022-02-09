import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BottomModal, ModalContent } from 'react-native-modals';
import { DarkTheme } from '@react-navigation/native';
import { AddressBadge } from 'components/AddressBadge';
import { AssetLogo } from 'components/AssetLogo';
import { Text } from 'components/Text';
import { useAssetBalance } from 'hooks/useAssetBalance';
import { useAssetUsdBalance } from 'hooks/useAssetUsdBalance';
import { useWalletAddress } from 'hooks/useWalletAddress';
import { Asset, AssetType } from 'models/asset';
import { formatAndCommify } from 'utils/helpers';
import { VestedAssets } from './VestedAssets/VestedAssets';
import { TokenId } from 'types/asset';

type AssetModalProps = {
  asset: Asset;
  onClose: () => void;
};

export const AssetModal: React.FC<AssetModalProps> = ({ asset, onClose }) => {
  return (
    <BottomModal visible={!!asset} onSwipeOut={onClose} swipeThreshold={50}>
      {!!asset && <AssetModalContent asset={asset} onClose={onClose} />}
    </BottomModal>
  );
};

const AssetModalContent: React.FC<AssetModalProps> = ({ asset }) => {
  const owner = useWalletAddress();
  const { weiValue: tokenBalance } = useAssetBalance(asset, owner);
  const {
    weiValue: usdBalance,
    token: usdToken,
    price,
  } = useAssetUsdBalance(asset, tokenBalance);
  return (
    <ModalContent style={styles.modalContent}>
      <View style={styles.nameView}>
        <AssetLogo source={asset.icon} size={36} />
        <Text style={styles.nameText}>{asset.name}</Text>
      </View>
      <View>
        <Text style={styles.balanceText}>
          {formatAndCommify(tokenBalance, asset.decimals)} {asset.symbol}
        </Text>
        {usdBalance !== null && (
          <Text style={styles.usdBalanceText}>
            ${formatAndCommify(usdBalance, usdToken.decimals)}
          </Text>
        )}
      </View>
      <View>
        {price !== null && (
          <Item
            title="Price"
            content={<Text>${formatAndCommify(price, usdToken.decimals)}</Text>}
          />
        )}
        {asset.type !== AssetType.NATIVE && (
          <Item
            title="Token"
            content={
              <AddressBadge address={asset.address} chainId={asset.chainId} />
            }
          />
        )}
        <VestedAssets tokenId={asset.id as TokenId} chainId={asset.chainId} />
      </View>
    </ModalContent>
  );
};

type ItemProps = {
  title: string;
  content: React.ReactNode;
};

const Item: React.FC<ItemProps> = ({ title, content }) => {
  return (
    <View style={styles.itemContainer}>
      <Text style={styles.itemTitleText}>{title}</Text>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: DarkTheme.colors.card,
    minHeight: 240,
  },
  nameView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  nameText: {
    fontSize: 18,
    marginLeft: 12,
  },
  balanceText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
  },
  usdBalanceText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
  },
  itemContainer: {
    marginBottom: 12,
  },
  itemTitleText: {
    marginBottom: 4,
  },
});
