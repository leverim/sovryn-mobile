import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { Button, ScrollView, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Clipboard from '@react-native-clipboard/clipboard';
import QRCode from 'react-native-qrcode-svg';
import { useWalletAddress } from 'hooks/useWalletAddress';
import { SafeAreaPage } from 'templates/SafeAreaPage';
import { Text } from 'components/Text';
import { TokenPickerButton } from 'components/TokenPickerButton';
import { Asset } from 'models/asset';
import { listAssetsForChains } from 'utils/asset-utils';
import { AppContext } from 'context/AppContext';
import { toChecksumAddress } from 'utils/rsk';
import { getNetworkByChainId } from 'utils/network-utils';
import { useRoute } from '@react-navigation/native';
import { useModalNavigation } from 'hooks/useModalNavigation';
import { ModalStackRoutes } from 'routers/modal.routes';
import { WarningBadge } from 'components/WarningBadge';

type Props = NativeStackScreenProps<ModalStackRoutes, 'modal.receive-asset'>;

export const ReceiveAssetModal: React.FC<Props> = ({
  route: { params },
  navigation,
}) => {
  const { chainIds } = useContext(AppContext);
  const [token, setToken] = useState(params.asset);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: `Receive ${token.symbol}`,
    });
  }, [navigation, token.symbol]);

  const address = useWalletAddress();

  const onCopyToClipboard = useCallback(
    () => Clipboard.setString(address.toLowerCase()),
    [address],
  );

  useEffect(() => setToken(params.asset), [params.asset]);

  const tokens = useMemo(() => listAssetsForChains(chainIds), [chainIds]);
  const onTokenChange = useCallback((asset: Asset) => setToken(asset), []);

  const network = useMemo(
    () => getNetworkByChainId(token.chainId),
    [token.chainId],
  );

  const pickerKey = '_receive';

  const route = useRoute<any>();
  useEffect(() => {
    if (route.params?.[pickerKey]) {
      onTokenChange(route.params[pickerKey]);
    }
  }, [route.params, pickerKey, onTokenChange]);

  const nav = useModalNavigation();

  const openAssetPicker = useCallback(() => {
    nav.navigate('modal.asset-picker', {
      parentRoute: route.name,
      pickerKey,
      value: token,
      items: tokens,
    });
  }, [nav, route.name, token, tokens]);

  return (
    <SafeAreaPage>
      <ScrollView style={styles.container}>
        <View style={styles.detailsContainer}>
          <TokenPickerButton token={token} onPress={openAssetPicker} />
          <Text style={styles.networkName}>Network: {network.name}</Text>
          <View style={[styles.qrWrapper]}>
            <QRCode
              value={address.toLowerCase()}
              backgroundColor="white"
              color="black"
              size={200}
            />
          </View>
          <View style={styles.addressContainer}>
            <Text style={styles.address}>
              {toChecksumAddress(address, token.chainId)}
            </Text>
          </View>
          <View style={styles.noteContainer}>
            <WarningBadge
              text={`Only send ${token.symbol} to this address. Any other tokens send to this address will be lost.`}
            />
          </View>
          <Button onPress={onCopyToClipboard} title="Copy Address" />
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
  networkName: {
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 4,
    marginTop: 8,
  },
  addressContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    maxWidth: 270,
  },
  address: {
    fontSize: 16,
    textAlign: 'center',
  },
  noteContainer: {
    // marginTop: 24,
    paddingHorizontal: 12,
  },
  note: {
    textAlign: 'center',
  },
  qrWrapper: {
    marginTop: 8,
    padding: 24,
    borderRadius: 12,
    backgroundColor: 'white',
  },
});
