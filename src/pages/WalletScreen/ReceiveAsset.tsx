import React, { useCallback, useLayoutEffect } from 'react';
import { Button, ScrollView, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Clipboard from '@react-native-clipboard/clipboard';
import QRCode from 'react-native-qrcode-svg';
import { prettifyTx } from 'utils/helpers';
import { useWalletAddress } from 'hooks/useWalletAddress';
import { WalletStackProps } from 'pages/MainScreen/WalletPage';
import { useIsDarkTheme } from 'hooks/useIsDarkTheme';
import { SafeAreaPage } from 'templates/SafeAreaPage';
import { Text } from 'components/Text';

type Props = NativeStackScreenProps<WalletStackProps, 'wallet.receive'>;

export const ReceiveAsset: React.FC<Props> = ({
  route: { params },
  navigation,
}) => {
  useLayoutEffect(() => {
    navigation.setOptions({
      title: `Receive ${params.token.symbol}`,
    });
  }, [navigation, params]);

  const address = useWalletAddress();

  const onCopyToClipboard = useCallback(
    () => Clipboard.setString(address.toLowerCase()),
    [address],
  );

  const dark = useIsDarkTheme();

  return (
    <SafeAreaPage>
      <ScrollView style={styles.container}>
        <View style={styles.detailsContainer}>
          <Text style={styles.title}>Receive {params.token.symbol}</Text>
          <View style={[styles.qrWrapper, dark && styles.qrWrapperDark]}>
            <QRCode
              value={address.toLowerCase()}
              backgroundColor={dark ? 'black' : 'white'}
              color={dark ? 'white' : 'black'}
              size={280}
            />
          </View>
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
  qrWrapper: {
    padding: 8,
    backgroundColor: 'white',
  },
  qrWrapperDark: {
    backgroundColor: 'black',
  },
});
