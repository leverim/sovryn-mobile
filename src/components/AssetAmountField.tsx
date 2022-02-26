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
import { useRoute } from '@react-navigation/native';
import { useModalNavigation } from 'hooks/useModalNavigation';

type AssetAmountFieldProps = {
  token: Asset;
  onTokenChanged: (asset: Asset) => void;
  price?: string;
  balance?: string;
  tokens: Asset[];
  fee?: string;
  pickerKey?: string;
  pickerTitle?: string;
} & AmountFieldBaseProps;

export const AssetAmountField: React.FC<AssetAmountFieldProps> = React.memo(
  ({
    amount,
    onAmountChanged,
    token,
    onTokenChanged,
    price,
    balance,
    tokens: items,
    fee,
    pickerKey = '_asset',
    pickerTitle,
    ...props
  }) => {
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

    const route = useRoute<any>();
    useEffect(() => {
      if (route.params?.[pickerKey]) {
        onTokenChange(route.params[pickerKey]);
      }
    }, [route.params, pickerKey, onTokenChange]);

    const navigation = useModalNavigation();

    const openAssetPicker = useCallback(() => {
      navigation.navigate('modal.asset-picker', {
        parentRoute: route.name,
        pickerKey,
        title: pickerTitle,
        value: token,
        items: items,
      });
    }, [items, navigation, pickerKey, pickerTitle, route.name, token]);

    return (
      <AmountFieldBase
        {...props}
        amount={amount}
        onAmountChanged={onAmountChanged}
        rightElement={
          <TokenPickerButton token={token} onPress={openAssetPicker} />
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
  priceText: {
    fontSize: px(12),
  },
});
