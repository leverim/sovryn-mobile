import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useIsDarkTheme } from 'hooks/useIsDarkTheme';
import { Token, TokenId } from 'types/token';
import { tokenUtils } from 'utils/token-utils';
import { AssetLogo } from 'components/AssetLogo';
import { InputField } from 'components/InputField';
import { AmountField } from 'components/AmountField';
import { PressableButton } from 'components/PressableButton';
import { Text } from 'components/Text';
import { RadioButton, RadioGroup } from 'components/RadioGroup';
import { getProvider } from 'utils/RpcEngine';
import { currentChainId } from 'utils/helpers';
import { formatUnits } from 'ethers/lib/utils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type SwapSettingsModalProps = {
  open: boolean;
  slippage?: string;
  gasPrice?: string;
  onClose: () => void;
  onSlippageChange: (slippage: string) => void;
  onGasPriceChange: (gasPrice: string) => void;
};

type AssetPickerExtraProps = {
  open: boolean;
  onClose?: () => void;
};

const slippageAmounts = [0.1, 0.5, 1, 3];

export const SwapSettingsModal: React.FC<SwapSettingsModalProps> = ({
  open,
  slippage,
  gasPrice,
  onClose,
  onSlippageChange,
  onGasPriceChange,
}) => {
  const dark = useIsDarkTheme();

  const [_slippage, setSlippage] = useState<string | undefined>(slippage);
  const [_gasPrice, setGasPrice] = useState<string | undefined>(gasPrice);

  const [networkGasPrice, setNetworkGasPrice] = useState<string | undefined>();

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

  const onChangeGasPrice = useCallback(
    (value: string) => {
      setGasPrice(value);
      if (onGasPriceChange) {
        onGasPriceChange(value);
      }
    },
    [onGasPriceChange],
  );

  useEffect(() => {
    setSlippage(slippage);
  }, [slippage]);

  useEffect(() => {
    setGasPrice(gasPrice);
  }, [gasPrice]);

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

  useEffect(() => {
    getProvider(currentChainId())
      .getGasPrice()
      .then(response => formatUnits(response, 9).toString())
      .then(response => {
        onChangeGasPrice(response);
        setNetworkGasPrice(response);
      });
  }, [onChangeGasPrice]);

  const { bottom } = useSafeAreaInsets();

  return (
    <Modal animationType="slide" visible={open} transparent={true}>
      <View style={styles.centeredView}>
        <View style={[styles.modalView, dark && styles.modalViewDark]}>
          <Text style={styles.modalTitle}>Swap Settings</Text>

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
          <AmountField
            label="Gas Price"
            value={_gasPrice}
            onChangeText={onChangeGasPrice}
          />
          <PressableButton
            onPress={triggerClose}
            title="Close"
            style={{ marginBottom: bottom }}
          />
        </View>
      </View>
    </Modal>
  );
};

type ItemProps = {
  token: Token;
  active: boolean;
  onSelect: (tokenId: TokenId) => void;
};

const styles = StyleSheet.create({
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
});
