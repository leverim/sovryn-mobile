import React, { memo } from 'react';
import Tooltip from 'rn-tooltip';
import { Text } from './Text';
import RedeemIcon from 'assets/redeem-icon.svg';
import { StyleSheet, View } from 'react-native';
import { DarkTheme } from '@react-navigation/native';

export const HasRewardsBadge: React.FC = memo(() => {
  return (
    <Tooltip
      popover={
        <Text>
          This pool gives vested SOV rewards in addition to base earnings.
        </Text>
      }
      height={80}
      width={200}
      withOverlay={false}
      actionType="press">
      <View style={styles.container}>
        <RedeemIcon fill="white" width={16} />
      </View>
    </Tooltip>
  );
});

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
});
