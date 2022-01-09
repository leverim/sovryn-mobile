import React, { useMemo } from 'react';
import { StyleSheet, TextInputProps, View } from 'react-native';
import { useAssetBalance } from 'hooks/useAssetBalance';
import { useWalletAddress } from 'hooks/useWalletAddress';
import { Token, TokenId } from 'types/token';
import { currentChainId } from 'utils/helpers';
import { tokenUtils } from 'utils/token-utils';
import { AmountField } from './AmountField';
import { ChainId } from 'types/network';

type Props = {
  label?: string;
  token?: Token;
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
  const _token: Token | never = useMemo(() => {
    if (token) {
      return token;
    }
    if (tokenId) {
      return tokenUtils.getTokenById(tokenId);
    }
    throw new Error("'token' or 'tokenId' must be set.");
  }, [token, tokenId]);

  const owner = useWalletAddress();
  const { value } = useAssetBalance(_token, owner, chainId);

  return (
    <View style={styles.container}>
      <AmountField
        {...props}
        fee={fee}
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
