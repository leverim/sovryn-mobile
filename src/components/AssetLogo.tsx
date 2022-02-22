import React, { useMemo } from 'react';
import { Image, ImageStyle, StyleSheet, View, ViewStyle } from 'react-native';
import { SvgUri } from 'react-native-svg';

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
  const renderImage = useMemo(() => {
    // local image retrieved by require()
    if (typeof source === 'number') {
      return (
        <Image
          source={source}
          style={[styles.image, { width: size, height: size }, imageStyle]}
        />
      );
    }

    if (!source) {
      return null;
    }

    if (source.toLowerCase().endsWith('.svg')) {
      return (
        <SvgUri
          width={size}
          height={size}
          uri={source}
          style={[styles.image, { width: size, height: size }, imageStyle]}
        />
      );
    }

    return (
      <Image
        source={{ uri: source }}
        style={[styles.image, { width: size, height: size }, imageStyle]}
      />
    );
  }, [imageStyle, size, source]);

  return (
    <View
      style={[
        styles.container,
        !source && styles.containerEmpty,
        { width: size, height: size },
        style,
      ]}>
      {renderImage}
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
