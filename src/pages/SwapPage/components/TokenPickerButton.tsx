import React from 'react';
import { GestureResponderEvent, Pressable, StyleSheet } from 'react-native';
import DownIcon from 'assets/chevron-down.svg';
import { AssetLogo } from 'components/AssetLogo';
import { Token } from 'types/token';
import { Text } from 'components/Text';

type TokenPickerButtonProps = {
  token?: Token;
  onPress?: (event: GestureResponderEvent) => void;
};

export const TokenPickerButton: React.FC<TokenPickerButtonProps> = ({
  token,
  onPress,
}) => {
  return (
    <Pressable onPress={onPress} style={styles.container}>
      {token !== undefined ? (
        <>
          <AssetLogo source={token.icon} size={18} />
          <Text style={styles.symbol}>{token.symbol}</Text>
          <DownIcon fill="white" />
        </>
      ) : (
        <Text>Select</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgb(44, 47, 54)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
    borderRadius: 8,
  },
  symbol: {
    marginLeft: 8,
    marginRight: 2,
  },
});
