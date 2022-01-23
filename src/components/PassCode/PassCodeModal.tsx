import React, { useCallback } from 'react';
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
  const handlePasscode = useCallback(
    (code: string) => {
      console.log(code);
      if (onUnlocked) {
        onUnlocked();
      }
    },
    [onUnlocked],
  );

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      presentationStyle="overFullScreen">
      <SafeAreaView style={styles.container}>
        <PassCodeKeyboard onPasscode={handlePasscode} />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    flex: 1,
  },
});
