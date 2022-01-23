import React, { useEffect } from 'react';
import { Button, ScrollView, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useWalletAddress } from 'hooks/useWalletAddress';
import { useAssetBalance } from 'hooks/useAssetBalance';
import { AssetLogo } from 'components/AssetLogo';
import { VestedAssets } from './components/VestedAssets';
import { AddressBadge } from 'components/AddressBadge';
import { WalletStackProps } from 'pages/MainScreen/WalletPage';
import { SafeAreaPage } from 'templates/SafeAreaPage';
import { Text } from 'components/Text';
import { DefaultTheme } from '@react-navigation/native';
import { commifyDecimals } from 'utils/helpers';

type Props = NativeStackScreenProps<WalletStackProps, 'wallet.details'>;

export const WalletDetails: React.FC<Props> = ({
  route: { params },
  navigation,
}) => {
  useEffect(() => {
    navigation.setOptions({
      title: params.token.name,
    });
  }, [params, navigation]);

  const address = useWalletAddress();
  const { value } = useAssetBalance(params.token, address, params.chainId);

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
          <AddressBadge address={address} />
          <View style={styles.buttons}>
            <Button
              title="Send"
              onPress={() => navigation.navigate('wallet.send', params)}
            />
            <Button
              title="Receive"
              onPress={() => navigation.navigate('wallet.receive', params)}
            />
          </View>
        </View>
        {params.token.id === 'sov' && (
          <VestedAssets
            registryContractName="vestingRegistry"
            owner={address}
            asset={params.token}
          />
        )}
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
  address: {
    marginBottom: 12,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
