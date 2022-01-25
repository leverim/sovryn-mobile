import React from 'react';
import { BlurView } from '@react-native-community/blur';
import { Text } from 'components/Text';
import { Modal, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type PrivacyOverlayProps = {
  visible: boolean;
};

export const PrivacyOverlay: React.FC<PrivacyOverlayProps> = ({ visible }) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      presentationStyle="overFullScreen">
      <BlurView style={styles.blurView} />
      <SafeAreaView style={styles.container}>
        <View style={styles.inner}>
          <Text style={styles.title}>Sovryn Wallet</Text>
          <Text style={styles.subTitle}>Privacy Overlay</Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0)',
    flex: 1,
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  inner: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
  },
  subTitle: {
    marginTop: 8,
    fontSize: 12,
  },
});
