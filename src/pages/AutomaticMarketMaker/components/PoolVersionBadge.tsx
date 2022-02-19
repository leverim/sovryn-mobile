import React, { memo, useMemo } from 'react';
import Tooltip from 'rn-tooltip';
import { StyleSheet, View } from 'react-native';
import { DarkTheme } from '@react-navigation/native';
import { Text } from 'components/Text';
import { AmmPoolVersion } from 'models/amm-pool';

type PoolVersionBadgeProps = {
  version: AmmPoolVersion;
};

export const PoolVersionBadge: React.FC<PoolVersionBadgeProps> = memo(
  ({ version }) => {
    const renderText = useMemo(() => {
      if (version === 1) {
        return 'You would need to provide assets for both sides to mine in this pool.';
      }
      return 'You can provide asset only to one side to mine in this pool.';
    }, [version]);

    return (
      <Tooltip
        popover={<Text>{renderText}</Text>}
        height={80}
        width={200}
        withOverlay={false}
        actionType="press">
        <View style={styles.container}>
          <Text style={styles.text}>v{version}</Text>
        </View>
      </Tooltip>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: DarkTheme.colors.border,
    padding: 4,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: 24,
    height: 24,
  },
  text: {
    fontSize: 12,
  },
});
