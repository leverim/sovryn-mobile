import React, { useMemo } from 'react';
import { StyleSheet, TextInputProps, View } from 'react-native';
import { useAssetBalance } from 'hooks/useAssetBalance';
import { useWalletAddress } from 'hooks/useWalletAddress';
import { TokenId } from 'types/asset';
import { currentChainId } from 'utils/helpers';
import { AmountField } from './AmountField';
import { ChainId } from 'types/network';
import { Asset } from 'models/asset';
import { findAsset } from 'utils/asset-utils';

type Props = {
  label?: string;
  token?: Asset;
  tokenId?: TokenId;
  chainId?: ChainId;
  fee?: number;
};

export const TokenAmountField: React.FC<Props & TextInputProps> = ({
  token,
  tokenId,
  chainId = currentChainId(),
  fee = 0,
  ...props
}) => {
  const _token: Asset | never = useMemo(() => {
    if (token) {
      return token;
    }
    if (tokenId && chainId) {
      return findAsset(chainId, tokenId);
    }
    throw new Error("'token' or 'tokenId' with 'chainId' must be set.");
  }, [chainId, token, tokenId]);

  const owner = useWalletAddress();
  const { value } = useAssetBalance(_token, owner);

  return (
    <View style={styles.container}>
      <AmountField
        {...props}
        fee={fee}
        decimals={_token.decimals}
        max={Number(value)}
        placeholder={`Enter amount of ${_token.symbol}`}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignContent: 'center',
  },
});
