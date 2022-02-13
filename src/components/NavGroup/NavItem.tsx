import React, { useCallback, useMemo, useState } from 'react';
import {
  StyleSheet,
  Pressable,
  GestureResponderEvent,
  View,
} from 'react-native';
import { Text } from 'components/Text';
import { DarkTheme } from '@react-navigation/native';
import ChevronRight from 'assets/chevron-right.svg';

export type NavItemProps = {
  title: string;
  onPress?: (event: GestureResponderEvent) => void;
  hideArrow?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  value?: React.ReactNode;
  danger?: boolean;
};

export const NavItem: React.FC<NavItemProps> = React.memo(
  ({ title, onPress, isFirst, isLast, hideArrow = false, value, danger }) => {
    const [pressedIn, setPressedIn] = useState(false);

    const handlePress = useCallback(
      (status: boolean) => () => setPressedIn(status),
      [],
    );

    const styles = useMemo(
      () => (danger ? dangerStyles : defaultStyles),
      [danger],
    );

    const renderValue = useMemo(() => {
      if (!value) {
        return null;
      }
      if (typeof value === 'string' || typeof value === 'number') {
        return <Text style={styles.rightContainerText}>{value}</Text>;
      }
      return value;
    }, [value, styles]);

    return (
      <Pressable
        style={[
          styles.container,
          pressedIn && styles.pressed,
          isFirst && styles.isFirst,
          isLast && styles.isLast,
          !isLast && styles.hasBottomBorder,
        ]}
        onPress={onPress}
        onPressIn={handlePress(true)}
        onPressOut={handlePress(false)}>
        <View>
          <Text>{title}</Text>
        </View>
        <View style={styles.rightContainer}>
          {renderValue}
          {!hideArrow && (
            <ChevronRight
              fill={pressedIn ? DarkTheme.colors.card : DarkTheme.colors.border}
            />
          )}
        </View>
      </Pressable>
    );
  },
);

const defaultStyles = StyleSheet.create({
  container: {
    backgroundColor: DarkTheme.colors.card,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 12,
  },
  pressed: {
    backgroundColor: DarkTheme.colors.border,
  },
  isFirst: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  isLast: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  hasBottomBorder: {
    borderBottomWidth: 1,
    borderBottomColor: DarkTheme.colors.border,
  },
  rightContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  rightContainerText: {
    marginRight: 4,
    textAlign: 'right',
  },
});

const dangerStyles = StyleSheet.create({
  ...defaultStyles,
  container: {
    ...defaultStyles.container,
    backgroundColor: DarkTheme.colors.notification,
  },
  pressed: {
    backgroundColor: DarkTheme.colors.notification,
    opacity: 0.5,
  },
});
