import React, { useCallback, useEffect, useState } from 'react';
import {
  AmountFieldBase,
  AmountFieldBaseProps,
} from 'components/AmountFieldBase';
import { Pressable, StyleSheet, View } from 'react-native';
import { commifyDecimals, floorDecimals, px } from 'utils/helpers';
import { Text } from 'components/Text';
import { TokenPickerButton } from './TokenPickerButton';
import { useDebouncedEffect } from 'hooks/useDebounceEffect';
import { ChainId } from 'types/network';
import { Asset } from 'models/asset';
import { AssetPickerDialog } from 'components/AssetPickerDialog';

type SwapAmountFieldProps = {
  token: Asset;
  onTokenChanged: (token: Asset) => void;
  price?: string;
  difference?: number;
  chainId?: ChainId;
  balance?: string;
  tokens: Asset[];
} & AmountFieldBaseProps;

export const SwapAmountField: React.FC<SwapAmountFieldProps> = React.memo(
  ({
    amount,
    onAmountChanged,
    token,
    onTokenChanged,
    price,
    difference,
    balance,
    tokens: items,
    ...props
  }) => {
    const [open, setOpen] = useState(false);
    const [_token, setToken] = useState<Asset | undefined>(token);

    const handleBalancePress = useCallback(
      () => onAmountChanged(floorDecimals(balance || '0', 8)),
      [onAmountChanged, balance],
    );

    const editable =
      props?.inputProps?.editable === undefined ||
      props?.inputProps?.editable === true;

    useDebouncedEffect(
      () => {
        onTokenChanged(_token!);
      },
      300,
      [_token, onTokenChanged],
    );

    // token was changed from outside
    useEffect(() => {
      setToken(token);
    }, [token]);

    const onTokenChange = useCallback((asset: Asset) => setToken(asset), []);

    return (
      <>
        <AmountFieldBase
          {...props}
          amount={amount}
          onAmountChanged={onAmountChanged}
          rightElement={
            <TokenPickerButton
              token={token}
              onPress={() => setOpen(prev => !prev)}
            />
          }
          bottomElement={
            <View style={styles.footerContainer}>
              <View style={styles.priceView}>
                {price !== undefined && (
                  <>
                    <Text style={styles.priceText}>
                      ${commifyDecimals(price, 2)}
                    </Text>
                    {difference !== undefined && !isNaN(difference) && (
                      <Text style={styles.differenceText}>
                        ({commifyDecimals(difference, 2)}%)
                      </Text>
                    )}
                  </>
                )}
              </View>
              <Pressable
                onPress={handleBalancePress}
                disabled={!editable}
                style={styles.balancePressable}>
                <Text style={styles.balanceText}>
                  Balance: {commifyDecimals(balance)}
                </Text>
              </Pressable>
            </View>
          }
        />
        <AssetPickerDialog
          open={open}
          value={_token}
          items={items}
          onChange={onTokenChange}
          onClose={() => setOpen(false)}
        />
      </>
    );
  },
);

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
  differenceText: {
    marginLeft: 4,
    fontSize: px(12),
  },
  priceText: {
    fontSize: px(12),
  },
});
