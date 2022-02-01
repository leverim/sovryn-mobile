import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { BottomModal, ModalContent } from 'react-native-modals';
import { useIsDarkTheme } from 'hooks/useIsDarkTheme';
import { AmountField } from 'components/AmountField';
import { PressableButton } from 'components/PressableButton';
import { Text } from 'components/Text';
import { RadioButton, RadioGroup } from 'components/RadioGroup';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type SwapSettingsModalProps = {
  open: boolean;
  slippage?: string;
  onClose: () => void;
  onSlippageChange: (slippage: string) => void;
};

const slippageAmounts = [0.1, 0.5, 1, 3];

export const SwapSettingsModal: React.FC<SwapSettingsModalProps> = ({
  open,
  slippage,
  onClose,
  onSlippageChange,
}) => {
  const dark = useIsDarkTheme();

  const [_slippage, setSlippage] = useState<string | undefined>(slippage);

  const triggerClose = useCallback(() => {
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  const onChangeSlippage = useCallback(
    (value: string) => {
      setSlippage(value);
      if (onSlippageChange) {
        if (Number(value) < 0.1) {
          value = '0.1';
        }

        if (Number(value) > 100) {
          value = '100';
        }

        onSlippageChange(value);
      }
    },
    [onSlippageChange],
  );

  useEffect(() => {
    setSlippage(slippage);
  }, [slippage]);

  const [slippageType, setSlippageType] = useState(
    slippageAmounts.includes(Number(slippage)) ? slippage : 'custom',
  );

  const handleSlippageChange = useCallback(
    value => {
      setSlippageType(value);
      if (slippageAmounts.includes(Number(value))) {
        onChangeSlippage(value);
      }
    },
    [onChangeSlippage],
  );

  const { bottom } = useSafeAreaInsets();

  return (
    <BottomModal visible={open} onSwipeOut={triggerClose}>
      <ModalContent style={[styles.modal, dark && styles.modalDark]}>
        <View>
          <Text style={styles.modalTitle}>Swap Settings</Text>

          <Text style={styles.label}>Slippage tolerance:</Text>
          <RadioGroup
            defaultValue={slippageType}
            onChange={handleSlippageChange}>
            {slippageAmounts.map(value => (
              <RadioButton key={value} value={value.toString()}>
                <Text>{value}%</Text>
              </RadioButton>
            ))}
            <RadioButton value="custom">
              <Text>Custom</Text>
            </RadioButton>
          </RadioGroup>

          {slippageType === 'custom' && (
            <AmountField
              label="Slippage Tolerance"
              value={_slippage}
              onChangeText={onChangeSlippage}
            />
          )}

          <Text style={styles.slippageDescription}>
            Slippage tolerance is a setting for the limit of price slippage you
            are willing to accept.
          </Text>
          <PressableButton
            onPress={triggerClose}
            title="Close"
            style={{ marginBottom: bottom }}
          />
        </View>
      </ModalContent>
    </BottomModal>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: DefaultTheme.colors.card,
  },
  modalDark: {
    backgroundColor: DarkTheme.colors.card,
  },

  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 0,
    width: '100%',
    backgroundColor: 'white',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingHorizontal: 35,
    // paddingVertical: 50,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalViewDark: {
    backgroundColor: DarkTheme.colors.card,
  },
  modalTitle: {
    marginTop: 24,
    marginBottom: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  slippageDescription: {
    marginTop: 12,
    width: '100%',
  },
  label: {
    marginBottom: 8,
  },
});
