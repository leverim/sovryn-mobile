import React, { useMemo } from 'react';
import { StyleSheet, TextInputProps, View } from 'react-native';
import { useAssetBalance } from 'hooks/useAssetBalance';
import { useEvmWallet } from 'hooks/useEvmWallet';
import { Token, TokenId } from 'types/token';
import { currentChainId } from 'utils/helpers';
import { tokenUtils } from 'utils/token-utils';
import { AmountField } from './AmountField';

type Props = {
  label?: string;
  token?: Token;
  tokenId?: TokenId;
  chainId?: number;
};

export const TokenAmountField: React.FC<Props & TextInputProps> = ({
  token,
  tokenId,
  chainId = currentChainId(),
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

  const owner = useEvmWallet();
  const { value } = useAssetBalance(_token, owner, chainId);

  return (
    <View style={styles.container}>
      <AmountField
        {...props}
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
