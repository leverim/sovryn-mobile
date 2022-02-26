import React from 'react';
import {
  Animated,
  Platform,
  StyleProp,
  StyleSheet,
  TextProps,
  TextStyle,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { WINDOW_WIDTH } from 'utils/constants';

type HeaderTitleComponentProps = Omit<TextProps, 'style'> & {
  tintColor?: string;
  children?: string;
  style?: Animated.WithAnimatedValue<StyleProp<TextStyle>>;
};

export const HeaderTitleComponent: React.FC<HeaderTitleComponentProps> = ({
  style,
  ...rest
}) => {
  const { colors } = useTheme();
  return (
    <Animated.View style={styles.container}>
      <Animated.View style={styles.indicator} />
      <Animated.Text
        accessibilityRole="header"
        aria-level="1"
        numberOfLines={1}
        {...rest}
        style={[
          styles.title,
          { color: colors.text },
          // { color: tintColor === undefined ? colors.text : tintColor },
          style,
        ]}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  title: Platform.select({
    ios: {
      fontSize: 17,
      fontWeight: '600',
    },
    android: {
      fontSize: 20,
      fontFamily: 'sans-serif-medium',
      fontWeight: 'normal',
    },
    default: {
      fontSize: 18,
      fontWeight: '500',
    },
  }),
  container: {
    flexDirection: 'column',
  },
  indicator: {
    alignSelf: 'center',
    width: (7.5 * WINDOW_WIDTH) / 100,
    height: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    marginBottom: 8,
  },
});
