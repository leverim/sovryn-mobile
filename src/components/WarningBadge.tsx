import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from './Text';
import WarningIcon from 'assets/warning-icon.svg';

type WarningBadgeProps = {
  text?: string;
};

export const WarningBadge: React.FC<WarningBadgeProps> = ({
  text,
  children,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <WarningIcon fill="#f4a361" width={28} />
      </View>
      <View style={styles.content}>
        {text && !children && <Text style={styles.text}>{text}</Text>}
        {text && children && children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f4a36158',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    flexShrink: 1,
  },
  icon: {
    flexShrink: 0,
    flexGrow: 0,
    width: 28,
  },
  content: {
    marginLeft: 8,
    flexGrow: 1,
    flexShrink: 1,
  },
  text: {
    fontSize: 12,
    fontWeight: '300',
  },
});
