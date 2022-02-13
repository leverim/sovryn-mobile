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
import { Text } from './Text';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { PressableButton } from './PressableButton';
import { NavGroup } from './NavGroup/NavGroup';
import { NavItem } from './NavGroup/NavItem';

export type ValueType = string | number | boolean;

export type ItemType = {
  label: string;
  value: ValueType;
};

type Props<T = string | number | boolean> = {
  label?: string;
  value?: ValueType;
  items: ItemType[];
  onChange?: (value: ValueType) => void;
};

export const Picker: React.FC<Props> = React.memo(
  ({ label, value, items, onChange }) => {
    const dark = useIsDarkTheme();

    const [open, setOpen] = useState(false);
    const [_value, setValue] = useState<ValueType | undefined>(value);

    const onSelectItem = useCallback(
      (item: ValueType) => {
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
      return items.find(item => item.value === _value)?.label;
    }, [items, _value]);

    return (
      <View style={styles.container}>
        {label && (
          <View style={styles.labelContainer}>
            <Text style={styles.label}>{label}</Text>
          </View>
        )}
        <Pressable
          onPress={() => setOpen(prev => !prev)}
          style={styles.inputContainer}>
          <Text>{selected !== undefined ? selected : 'Select item...'}</Text>
        </Pressable>
        <Modal animationType="slide" visible={open}>
          <SafeAreaView style={[styles.modal, dark && styles.modalDark]}>
            <View style={styles.modalBody}>
              <Text style={styles.modalTitle}>Choose one:</Text>
              <ScrollView>
                <NavGroup>
                  {items.map(item => (
                    <NavItem
                      key={item.value.toString()}
                      onPress={() => onSelectItem(item.value)}
                      title={item.label}
                    />
                  ))}
                </NavGroup>
              </ScrollView>
              <PressableButton onPress={() => setOpen(false)} title="Close" />
            </View>
          </SafeAreaView>
        </Modal>
      </View>
    );
  },
);

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
});
