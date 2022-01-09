import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useIsDarkTheme } from 'hooks/useIsDarkTheme';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import {
  AssetPickerModal,
  AssetPickerModalProps,
} from 'components/AssetPickerModal';
import { tokenUtils } from 'utils/token-utils';
import { Text } from 'components/Text';
import { TokenId } from 'types/token';
import DownIcon from 'assets/chevron-down.svg';

export const AssetPicker: React.FC<AssetPickerModalProps> = ({
  value,
  items,
  onChange,
}) => {
  const dark = useIsDarkTheme();

  const [open, setOpen] = useState(false);
  const [_value, setValue] = useState<TokenId | undefined>(value);

  const onSelectItem = useCallback(
    (item: TokenId) => {
      setValue(item);
      setOpen(false);
      if (onChange) {
        onChange(item);
      }
    },
    [onChange],
  );

  useEffect(() => {
    setValue(value);
  }, [value]);

  const selected = useMemo(() => {
    return tokenUtils.getTokenById(items.find(item => item === _value)!);
  }, [items, _value]);

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => setOpen(prev => !prev)}
        style={styles.inputContainer}>
        <Text>
          {selected !== undefined ? selected.symbol : 'Select item...'}
        </Text>
        <View>
          <DownIcon fill={dark ? 'white' : 'black'} />
        </View>
      </Pressable>
      <AssetPickerModal
        open={open}
        value={_value}
        items={items}
        onChange={onSelectItem}
        onClose={() => setOpen(false)}
      />
    </View>
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
  inputContainer: {
    width: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    fontSize: 16,
    height: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
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
});
