import React from 'react';
import { StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAssetBalance } from 'hooks/useAssetBalance';
import { useWalletAddress } from 'hooks/useWalletAddress';
import { AssetLogo } from 'components/AssetLogo';
import { Token } from 'types/token';
import { ChainId } from 'types/network';
import { Text } from './Text';
import { commifyDecimals } from 'utils/helpers';
import { useBalanceToUsd } from 'hooks/useBalanceToUsd';

type Props = {
  token: Token;
  chainId: ChainId;
};

export const CoinRow: React.FC<Props> = ({ token, chainId }) => {
  const navigation = useNavigation();

  const address = useWalletAddress();
  const { value, weiValue } = useAssetBalance(token, address, chainId);

  const usdBalance = useBalanceToUsd(chainId, token, weiValue);

  return (
    <TouchableWithoutFeedback
      onPress={() => navigation.navigate('wallet.details', { token, chainId })}>
      <View style={styles.container}>
        <View style={styles.logoWrapper}>
          <AssetLogo source={token.icon} size={32} />
        </View>
        <View style={styles.textWrapper}>
          <View style={styles.textWrapperRow}>
            <Text style={styles.textRow1}>{token.name}</Text>
            <Text style={styles.textRow1}>{commifyDecimals(value)}</Text>
          </View>
          <View style={styles.textWrapperRow}>
            <Text style={styles.textRow2}>{token.symbol}</Text>
            {usdBalance !== null && (
              <Text style={styles.textRow2}>
                ${commifyDecimals(usdBalance, 4)}
              </Text>
            )}
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    width: '100%',
  },
  logoWrapper: {
    width: 32,
    height: 32,
    marginRight: 10,
  },
  logo: {
    width: 32,
    height: 32,
  },
  textWrapper: {
    flexBasis: 1,
    flexGrow: 1,
    flexDirection: 'column',
  },
  textWrapperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textRow1: {
    fontWeight: 'bold',
    marginBottom: 3,
    color: 'black',
  },
  textRow2: {
    fontWeight: '300',
    color: 'black',
  },
});
