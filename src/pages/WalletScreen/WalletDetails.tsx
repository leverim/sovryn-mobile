import React, { useEffect } from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { noop } from 'utils/helpers';
import { useEvmWallet } from 'hooks/useEvmWallet';
import { useAssetBalance } from 'hooks/useAssetBalance';
import { AssetLogo } from 'components/AssetLogo';
import { VestedAssets } from './components/VestedAssets';
import { AddressBadge } from 'components/AddressBadge';
import { WalletStackProps } from 'pages/MainScreen/WalletPage';

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

  const address = useEvmWallet();
  const { value } = useAssetBalance(params.token, address, params.chainId);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.detailsContainer}>
          <AssetLogo source={params.token.icon} size={64} style={styles.logo} />
          <Text style={styles.balance}>
            {Number(value).toFixed(6)} {params.token.symbol}
          </Text>
          <AddressBadge address={address} />
          <View style={styles.buttons}>
            <Button title="Send" onPress={noop} />
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
        <ScrollView>
          <Text>No history.</Text>
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
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
    marginBottom: 16,
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
});
