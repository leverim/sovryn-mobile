import QRCodeScanner from 'react-native-qrcode-scanner';
import { BarCodeReadEvent, RNCamera } from 'react-native-camera';
import React, { useCallback } from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, View } from 'react-native';
import { DarkTheme, useIsFocused } from '@react-navigation/native';
import CloseIcon from 'assets/x-circle.svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from './Text';

type QrScannerModalProps = {
  visible: boolean;
  onScanned: (text: string) => void;
  onClose: () => void;
};

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  visible,
  onScanned,
  onClose,
}) => {
  const isFocused = useIsFocused();

  const onRead = useCallback(
    (event: BarCodeReadEvent) => {
      onScanned(event.data);
      onClose();
    },
    [onScanned, onClose],
  );

  const { width, height } = Dimensions.get('window');

  const { top, bottom } = useSafeAreaInsets();

  return (
    <Modal visible={visible} onRequestClose={onClose} animationType="slide">
      <View style={styles.container}>
        {isFocused && (
          <QRCodeScanner
            onRead={onRead}
            flashMode={RNCamera.Constants.FlashMode.auto}
            reactivate={false}
            cameraStyle={{ width, height }}
          />
        )}
        <Pressable
          onPress={onClose}
          style={[styles.closeButton, { paddingTop: top }]}>
          <CloseIcon fill="white" width={36} height={36} />
        </Pressable>
        <View style={[styles.textView, { bottom: bottom }]}>
          <Text>Scan your QR code.</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: DarkTheme.colors.card,
    overflow: 'hidden',
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  textView: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 12,
    margin: 24,
    alignItems: 'center',
    borderRadius: 12,
  },
});
