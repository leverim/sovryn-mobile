import { DarkTheme } from '@react-navigation/native';
import { Text } from 'components/Text';
import React from 'react';
import { StyleSheet, View } from 'react-native';

type ItemProps = {
  hideBorder?: boolean;
  fluidHeight?: boolean;
  image?: React.ReactNode;
  title: string;
  content: React.ReactNode;
};

export const Item: React.FC<ItemProps> = ({
  image,
  title,
  content,
  hideBorder = false,
  fluidHeight = false,
}) => {
  return (
    <View
      style={[
        styles.container,
        hideBorder && styles.containerNoBorder,
        fluidHeight && styles.containerFluid,
      ]}>
      <View style={styles.labelContainer}>
        {image && <View>{image}</View>}
        <View>
          <Text>{title}</Text>
        </View>
      </View>
      <View style={styles.content}>{content}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: DarkTheme.colors.border,
    height: 64,
  },
  containerNoBorder: {
    borderBottomWidth: 0,
  },
  containerFluid: {
    height: 'auto',
    minHeight: 64,
    alignItems: 'flex-start',
    paddingVertical: 24,
  },
  labelContainer: {
    // flex: 1,
  },
  content: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginLeft: 24,
    // flex: 1,
  },
});
