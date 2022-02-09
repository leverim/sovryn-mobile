import React, { useLayoutEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DefaultTheme } from '@react-navigation/native';
import { useWalletAddress } from 'hooks/useWalletAddress';
import { useAssetBalance } from 'hooks/useAssetBalance';
import { AssetLogo } from 'components/AssetLogo';
import { VestedAssets } from './components/VestedAssets/VestedAssets';
import { AddressBadge } from 'components/AddressBadge';
import { WalletStackProps } from 'pages/MainScreen/WalletPage';
import { SafeAreaPage } from 'templates/SafeAreaPage';
import { Text } from 'components/Text';
import { commifyDecimals } from 'utils/helpers';
import { TokenId } from 'types/asset';
import { Button } from 'components/Buttons/Button';
import { useAssetUsdBalance } from 'hooks/useAssetUsdBalance';

type Props = NativeStackScreenProps<WalletStackProps, 'wallet.details'>;

export const WalletDetails: React.FC<Props> = ({
  route: { params },
  navigation,
}) => {
  useLayoutEffect(() => {
    navigation.setOptions({
      title: params.token.name,
    });
  }, [params, navigation]);

  const address = useWalletAddress();
  const { value, weiValue } = useAssetBalance(params.token, address);
  const { weiValue: usdBalance } = useAssetUsdBalance(params.token, weiValue);

  return (
    <SafeAreaPage>
      <ScrollView style={styles.container}>
        <View style={styles.detailsContainer}>
          <View style={styles.logoWrapper}>
            <AssetLogo
              source={params.token.icon}
              size={64}
              style={styles.logo}
            />
          </View>
          <Text style={styles.balance}>
            {commifyDecimals(value)} {params.token.symbol}
          </Text>
          {usdBalance !== null && (
            <Text style={styles.usdBalance}>
              ${commifyDecimals(usdBalance, 2)}
            </Text>
          )}
          <View style={styles.address}>
            <AddressBadge address={address} />
          </View>
          <View style={styles.buttons}>
            <Button
              title="Send"
              onPress={() => navigation.navigate('wallet.send', params)}
              primary
              pressableStyle={styles.button}
            />
            <Button
              title="Receive"
              onPress={() => navigation.navigate('wallet.receive', params)}
              primary
              pressableStyle={styles.button}
            />
          </View>
        </View>
        <VestedAssets
          tokenId={params.token.id as TokenId}
          chainId={params.chainId}
        />
      </ScrollView>
    </SafeAreaPage>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flexGrow: 1,
  },
  container: {
    padding: 20,
  },
  detailsContainer: {
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 64,
    height: 64,
  },
  balance: {
    fontWeight: 'bold',
    fontSize: 24,
    marginBottom: 8,
  },
  usdBalance: {
    fontWeight: '300',
    fontSize: 16,
    marginBottom: 24,
  },
  address: {
    marginBottom: 12,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    flex: 1,
  },
  button: {
    width: 'auto',
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    margin: 12,
  },
  logoWrapper: {
    width: 84,
    height: 84,
    backgroundColor: DefaultTheme.colors.card,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderRadius: 42,
  },
});
