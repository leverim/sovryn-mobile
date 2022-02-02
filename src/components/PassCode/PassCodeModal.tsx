import React from 'react';
import { Modal, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PassCodeKeyboard } from './PassCodeKeyboard';

type PassCodeModalProps = {
  visible: boolean;
  onUnlocked: () => void;
};

export const PassCodeModal: React.FC<PassCodeModalProps> = ({
  visible,
  onUnlocked,
}) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      presentationStyle="overFullScreen">
      <SafeAreaView style={styles.container}>
        <PassCodeKeyboard onPasscodeVerified={onUnlocked} />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    flex: 1,
  },
});
