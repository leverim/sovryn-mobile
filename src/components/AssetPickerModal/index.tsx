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
import { Text } from '../Text';
import { PressableButton } from '../PressableButton';
import { TokenId } from 'types/token';
import { tokenUtils } from 'utils/token-utils';
import { AssetLogo } from 'components/AssetLogo';
import { commify } from 'ethers/lib/utils';

export type AssetPickerModalProps = {
  value?: TokenId;
  items: TokenId[];
  onChange?: (value: TokenId) => void;
};

type AssetPickerExtraProps = {
  open: boolean;
  onClose?: () => void;
};

export const AssetPickerModal: React.FC<
  AssetPickerModalProps & AssetPickerExtraProps
> = ({ value, items, onChange, open, onClose }) => {
  const dark = useIsDarkTheme();

  const [_value, setValue] = useState<TokenId | undefined>(value);

  const triggerClose = useCallback(() => {
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  const onSelectItem = useCallback(
    (item: TokenId) => {
      setValue(item);
      if (onChange) {
        onChange(item);
      }
      triggerClose();
    },
    [onChange, triggerClose],
  );

  useEffect(() => {
    setValue(value);
  }, [value]);

  return (
    <Modal animationType="slide" visible={open}>
      <SafeAreaView style={[styles.modal, dark && styles.modalDark]}>
        <View style={styles.modalBody}>
          <Text style={styles.modalTitle}>Choose asset:</Text>
          <ScrollView>
            {items.map(item => (
              <Item
                key={item}
                tokenId={item}
                active={item === _value}
                onSelect={onSelectItem}
              />
            ))}
          </ScrollView>
          <PressableButton onPress={triggerClose} title="Close" />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

type ItemProps = {
  tokenId: TokenId;
  active: boolean;
  onSelect: (tokenId: TokenId) => void;
};

const Item: React.FC<ItemProps> = ({ tokenId, active, onSelect }) => {
  const token = useMemo(() => tokenUtils.getTokenById(tokenId), [tokenId]);

  return (
    <Pressable
      onPress={() => onSelect(tokenId)}
      style={[styles.modalItem, active && styles.modalItemActive]}>
      <View style={styles.modalItemLeftSide}>
        <View style={styles.modalItemLogoContainer}>
          <AssetLogo source={token.icon} size={32} />
        </View>
        <View>
          <Text style={styles.tokenSymbolText}>{token.symbol}</Text>
          <Text style={styles.tokenNameText}>{token.name}</Text>
        </View>
      </View>
      {/* <View>
        <Text style={styles.balanceText}>{commify(100000.43)}</Text>
      </View> */}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginTop: 16,
    width: '100%',
  },
  labelContainer: {
    marginBottom: 6,
  },
  label: {
    textAlign: 'left',
  },
  inputContainer: {
    width: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  inputReadOnly: {
    opacity: 0.5,
  },
  inputDark: {
    color: 'white',
  },
  modal: {
    backgroundColor: DefaultTheme.colors.card,
    flex: 1,
  },
  modalDark: {
    backgroundColor: DarkTheme.colors.card,
  },
  modalBody: {
    flex: 1,
    padding: 12,
  },
  modalTitle: {
    marginBottom: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  modalItem: {
    marginBottom: 6,
    padding: 8,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalItemActive: {
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
  modalItemLeftSide: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalItemLogoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: DefaultTheme.colors.card,
    width: 36,
    height: 36,
    marginRight: 8,
    borderRadius: 18,
  },
  tokenSymbolText: {
    color: 'white',
    marginBottom: 2,
  },
  tokenNameText: {
    color: 'gray',
  },
  balanceText: {
    color: 'gray',
  },
});
