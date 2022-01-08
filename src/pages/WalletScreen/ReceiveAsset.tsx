import React, { useCallback, useEffect } from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Clipboard from '@react-native-clipboard/clipboard';
import QRCode from 'react-native-qrcode-svg';
import { prettifyTx } from 'utils/helpers';
import { useEvmWallet } from 'hooks/useEvmWallet';
import { WalletStackProps } from 'pages/MainScreen/WalletPage';

type Props = NativeStackScreenProps<WalletStackProps, 'wallet.receive'>;

export const ReceiveAsset: React.FC<Props> = ({
  route: { params },
  navigation,
}) => {
  useEffect(() => {
    navigation.setOptions({
      title: `Receive ${params.token.symbol}`,
    });
  }, [navigation, params]);

  const address = useEvmWallet();

  const onCopyToClipboard = useCallback(
    () => Clipboard.setString(address),
    [address],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.detailsContainer}>
          <Text style={styles.title}>Receive {params.token.symbol}</Text>
          <QRCode
            value={address}
            logoBackgroundColor="transparent"
            size={280}
          />
          <View style={styles.addressContainer}>
            <Text style={styles.address}>
              {prettifyTx(address, 16, 16).toLowerCase()}
            </Text>
          </View>
          <Button onPress={onCopyToClipboard} title="Copy" />
          <View style={styles.noteContainer}>
            <Text style={styles.note}>
              Only send {params.token.symbol} to this address. Any other tokens
              send to this address will be lost.
            </Text>
          </View>
        </View>
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
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 24,
  },
  addressContainer: {
    paddingTop: 36,
    padding: 12,
  },
  address: {
    fontSize: 16,
  },
  noteContainer: {
    marginTop: 24,
    paddingHorizontal: 12,
  },
  note: {
    textAlign: 'center',
  },
});
