import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';

export const NavGroup: React.FC = ({ children }) => {
  const mapped = useMemo(() => {
    const items = React.Children.toArray(children);
    return items.filter(Boolean).map((child, index) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, {
          ...child.props,
          isFirst: index === 0,
          isLast: !Array.isArray(children) || index === items.length - 1,
        });
      }
      return null;
    });
  }, [children]);

  return <View style={styles.container}>{mapped}</View>;
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 24,
  },
});
