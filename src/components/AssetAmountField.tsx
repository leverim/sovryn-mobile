import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  AmountFieldBase,
  AmountFieldBaseProps,
} from 'components/AmountFieldBase';
import {
  commifyDecimals,
  floorDecimals,
  formatUnits,
  parseUnits,
  px,
} from 'utils/helpers';
import { Text } from 'components/Text';
import { useDebouncedEffect } from 'hooks/useDebounceEffect';
import { Asset } from 'models/asset';
import { TokenPickerButton } from './TokenPickerButton';
import { AssetPickerDialog } from './AssetPickerDialog';

type AssetAmountFieldProps = {
  token: Asset;
  onTokenChanged: (asset: Asset) => void;
  price?: string;
  balance?: string;
  tokens: Asset[];
  fee?: string;
} & AmountFieldBaseProps;

export const AssetAmountField: React.FC<AssetAmountFieldProps> = ({
  amount,
  onAmountChanged,
  token,
  onTokenChanged,
  price,
  balance,
  tokens: items,
  fee,
  ...props
}) => {
  const [open, setOpen] = useState(false);
  const [_token, setToken] = useState<Asset | undefined>(token);

  const handleBalancePress = useCallback(() => {
    let _amount = balance || '0';
    if (token.native) {
      _amount = formatUnits(
        parseUnits(balance, token.decimals).sub(
          parseUnits(fee, token.decimals),
        ),
        token.decimals,
      );
    }

    if (Number(_amount) < 0) {
      _amount = '0';
    }

    onAmountChanged(floorDecimals(_amount || '0', 8));
  }, [token.native, token.decimals, onAmountChanged, balance, fee]);

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
