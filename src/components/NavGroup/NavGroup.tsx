import React from 'react';
import { View, StyleSheet } from 'react-native';

export const NavGroup: React.FC = ({ children }) => {
  const mapped = React.Children.map(children, (child, index) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        ...child.props,
        isFirst: index === 0,
        isLast: !Array.isArray(children) || index === children.length - 1,
      });
    }
    return null;
  });

  return <View style={styles.container}>{mapped}</View>;
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 24,
  },
});
