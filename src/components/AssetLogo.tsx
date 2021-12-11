import React from 'react';
import { Image, ImageStyle, StyleSheet, View, ViewStyle } from 'react-native';

import { prepareImageSource } from 'utils/helpers';

type Props = {
  source: string;
  size?: number;
  style?: ViewStyle;
  imageStyle?: ImageStyle;
};

export const AssetLogo: React.FC<Props> = ({
  source,
  size = 24,
  style = {},
  imageStyle = {},
}) => {
  const imageSource = prepareImageSource(source);

  return (
    <View
      style={[
        styles.container,
        !imageSource && styles.containerEmpty,
        { width: size, height: size },
        style,
      ]}>
      {imageSource && (
        <Image
          source={imageSource}
          style={[styles.image, { width: size, height: size }, imageStyle]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 99999,
    width: 24,
    height: 24,
  },
  containerEmpty: {
    backgroundColor: 'gray',
  },
  image: {
    width: 24,
    height: 24,
  },
});
