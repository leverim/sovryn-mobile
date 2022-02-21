import React from 'react';
import { DarkTheme } from '@react-navigation/native';
import { StyleSheet, View } from 'react-native';

type AmountFieldIconWrapperProps = {
  control: React.ReactNode;
  controlSize?: number;
};

export const AmountFieldIconWrapper: React.FC<AmountFieldIconWrapperProps> = ({
  children,
  control,
  controlSize = 36,
}) => {
  return (
    <View style={styles.receiverContainerView}>
      {children}
      <View
        style={[
          styles.receiverIconButton,
          { top: -controlSize / 2, width: controlSize, height: controlSize },
        ]}>
        {control}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  receiverContainerView: {
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  receiverIconButton: {
    position: 'absolute',
    backgroundColor: DarkTheme.colors.border,
    borderWidth: 4,
    borderBottomColor: DarkTheme.colors.background,
    borderRadius: 12,
    padding: 2,
    width: 36,
    height: 36,
    top: -36 / 2,
  },
});
