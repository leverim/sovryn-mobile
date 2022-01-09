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
      <View>
        <Text>{token.name}</Text>
        <Text>{token.symbol}</Text>
      </View>
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
  },
  modalItemActive: {
    backgroundColor: 'gray',
  },
});
