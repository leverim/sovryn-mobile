import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
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
import { AssetLogo } from 'components/AssetLogo';

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
        <View style={styles.assetPlaceholderWrapper}>
          {selected !== undefined ? (
            <>
              <View style={styles.assetIconWrapper}>
                <AssetLogo source={selected.icon} size={24} />
              </View>
              <Text>{selected.symbol}</Text>
            </>
          ) : (
            <Text>Select item...</Text>
          )}
        </View>
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
    paddingHorizontal: 6,
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
  assetPlaceholderWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  assetIconWrapper: {
    marginRight: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: 28,
    height: 28,
    backgroundColor: DefaultTheme.colors.card,
    borderRadius: 14,
  },
});
