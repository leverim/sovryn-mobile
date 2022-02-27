import QRCodeScanner from 'react-native-qrcode-scanner';
import { BarCodeReadEvent, RNCamera } from 'react-native-camera';
import React, { useCallback } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { DarkTheme, useIsFocused } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ModalStackRoutes } from 'routers/modal.routes';
import { SafeAreaPage } from 'templates/SafeAreaPage';

type Props = NativeStackScreenProps<ModalStackRoutes, 'modal.scan-qr'>;

export const QrScannerModal: React.FC<Props> = ({ route, navigation }) => {
  const isFocused = useIsFocused();

  const onRead = useCallback(
    (event: BarCodeReadEvent) => {
      route.params.onScanned(event.data);
      navigation.goBack();
    },
    [route.params, navigation],
  );

  const { width, height } = Dimensions.get('window');

  return (
    <SafeAreaPage>
      <View style={styles.container}>
        {isFocused && (
          <QRCodeScanner
            onRead={onRead}
            flashMode={RNCamera.Constants.FlashMode.auto}
            reactivate={false}
            cameraStyle={{ width, height }}
          />
        )}
      </View>
    </SafeAreaPage>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: DarkTheme.colors.card,
    overflow: 'hidden',
    flex: 1,
  },
});
