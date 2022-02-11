import React, { useCallback } from 'react';
import {
  AmountFieldBase,
  AmountFieldBaseProps,
} from 'components/AmountFieldBase';
import { Pressable, StyleSheet, View } from 'react-native';
import { commifyDecimals, floorDecimals, px } from 'utils/helpers';
import { Text } from 'components/Text';
import { Asset } from 'models/asset';

type LendingAmountFieldProps = {
  token: Asset;
  price?: string;
  balance?: string;
} & AmountFieldBaseProps;

export const LendingAmountField: React.FC<LendingAmountFieldProps> = ({
  amount,
  onAmountChanged,
  price,
  balance,
  ...props
}) => {
  const handleBalancePress = useCallback(
    () => onAmountChanged(floorDecimals(balance || '0', 8)),
    [onAmountChanged, balance],
  );

  return (
    <>
      <AmountFieldBase
        {...props}
        amount={amount}
        onAmountChanged={onAmountChanged}
        bottomElement={
          <View style={styles.footerContainer}>
            <View style={styles.priceView}>
              {price !== undefined && (
                <Text style={styles.priceText}>
                  ${commifyDecimals(price, 2)}
                </Text>
              )}
            </View>
            <Pressable
              onPress={handleBalancePress}
              style={styles.balancePressable}>
              <Text style={styles.balanceText}>
                Balance: {commifyDecimals(balance)}
              </Text>
            </Pressable>
          </View>
        }
      />
    </>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'center',
  },
  balancePressable: {
    marginLeft: 12,
  },
  balanceText: {
    opacity: 0.7,
    fontSize: px(12),
  },
  priceView: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  priceText: {
    fontSize: px(12),
  },
});
