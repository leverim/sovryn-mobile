import { DefaultTheme } from '@react-navigation/native';
import React from 'react';
import {
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';

type PressableButtonProps = {
  title: string;
  loading?: boolean;
} & PressableProps;

export const PressableButton: React.FC<PressableButtonProps> = ({
  title,
  ...props
}) => {
  return (
    <Pressable
      {...props}
      style={[
        styles.container,
        (props.disabled || props.loading) && styles.containerDisabled,
        props.style as any,
      ]}>
      <View>
        <Text style={styles.text}>{title}</Text>
      </View>
      {props.loading && (
        <View style={styles.spinnderContainer}>
          <ActivityIndicator size="small" color={DefaultTheme.colors.primary} />
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    width: '100%',
    justifyContent: 'center',
    alignContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  containerDisabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '500',
    fontSize: 18,
    color: DefaultTheme.colors.primary,
  },
  spinnderContainer: {
    marginLeft: 12,
  },
});
