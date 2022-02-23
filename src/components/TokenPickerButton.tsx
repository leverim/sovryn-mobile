import React from 'react';
import { GestureResponderEvent, Pressable, StyleSheet } from 'react-native';
import DownIcon from 'assets/chevron-down.svg';
import { AssetLogo } from 'components/AssetLogo';
import { Text } from 'components/Text';
import { Asset } from 'models/asset';

type TokenPickerButtonProps = {
  token?: Asset;
  onPress?: (event: GestureResponderEvent) => void;
  hideCaret?: boolean;
};

export const TokenPickerButton: React.FC<TokenPickerButtonProps> = React.memo(
  ({ token, onPress, hideCaret = false }) => {
    return (
      <Pressable onPress={onPress} style={styles.container}>
        {token !== undefined ? (
          <>
            <AssetLogo source={token.icon} size={32} />
            <Text style={styles.symbol}>{token.symbol}</Text>
            {!hideCaret && <DownIcon fill="white" />}
          </>
        ) : (
          <Text>Select</Text>
        )}
      </Pressable>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  symbol: {
    marginLeft: 8,
    marginRight: 2,
  },
});
