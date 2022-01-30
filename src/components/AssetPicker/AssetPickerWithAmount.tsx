import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import debounce from 'lodash/debounce';
import { TokenId } from 'types/token';
import { AmountField } from 'components/AmountField';
import { AssetPicker } from '.';
import { tokenUtils } from 'utils/token-utils';
import { currentChainId } from 'utils/helpers';
import { InputField } from 'components/InputField';
import { commify } from 'ethers/lib/utils';
import { Text } from 'components/Text';
import { AssetPickerModal } from 'components/AssetPickerModal';
import DownIcon from 'assets/chevron-down.svg';
import { DefaultTheme } from '@react-navigation/native';
import { useIsDarkTheme } from 'hooks/useIsDarkTheme';
import { AssetLogo } from 'components/AssetLogo';

type AssetPickerWithAmountProps = {
  amount: string;
  onAmountChanged: (amount: string) => void;
  tokenId: TokenId;
  onTokenChanged: (tokenId: TokenId) => void;
  tokenIdList?: TokenId[];
  readOnlyAmount?: boolean;
  pickerTitle?: string;
  inputProps?: TextInputProps;
  debounceDelay?: number;
};

export const AssetPickerWithAmount: React.FC<AssetPickerWithAmountProps> = ({
  amount,
  onAmountChanged,
  tokenId,
  onTokenChanged,
  tokenIdList,
  readOnlyAmount,
  pickerTitle,
  inputProps,
  debounceDelay = 300,
}) => {
  const dark = useIsDarkTheme();

  const items = useMemo(
    () =>
      tokenIdList
        ? tokenIdList
        : tokenUtils
            .listTokensForChainId(currentChainId())
            .map(item => item.id as TokenId),
    [tokenIdList],
  );

  const editable = useMemo(
    () => (readOnlyAmount ? false : true),
    [readOnlyAmount],
  );

  const [_amount, setAmount] = useState<string | undefined>(amount);
  const [_tokenId, setTokenId] = useState<TokenId | undefined>(tokenId);

  // debounce must be wrapped in useCallback, otherwise it calls onAmountChanged
  //   for each keystroke after delay instead of when user finishes typing.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedOnChangeAmount = useCallback(
    debounce(value => onAmountChanged(value), debounceDelay),
    [debounceDelay],
  );

  const onChangeAmount = useCallback(
    (value: string) => {
      value = value.match(/(\d|.)+/g)?.pop() || '';
      value = value.replace(',', '.');
      setAmount(value);
      if (!isNaN(Number(value))) {
        debouncedOnChangeAmount(value);
      }
    },
    [debouncedOnChangeAmount],
  );

  // amount was changed from outside
  useEffect(() => {
    setAmount(amount);
  }, [amount]);

  const onSelectToken = useCallback(
    (item: TokenId) => {
      setTokenId(item);
      setOpen(false);
      if (onTokenChanged) {
        onTokenChanged(item);
      }
    },
    [onTokenChanged],
  );

  // token was changed from outside
  useEffect(() => {
    setTokenId(tokenId);
  }, [tokenId]);

  const token = useMemo(() => tokenUtils.getTokenById(_tokenId!), [_tokenId]);

  const [open, setOpen] = useState(false);

  return (
    <>
      <View style={[styles.container, !editable && styles.container_disabled]}>
        <View style={styles.inputWrapper}>
          {/* <Text style={styles.inputBalanceText}>≈ $US{commify('0.00')}</Text> */}
          <TextInput
            value={_amount}
            onChangeText={onChangeAmount}
            keyboardType="numeric"
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect={false}
            editable={editable}
            style={[styles.input, dark && styles.inputDark, inputProps?.style]}
            placeholderTextColor={'gray'}
            placeholder={`0.00 ${token ? token.symbol : ''}`}
            {...inputProps}
          />
        </View>
        <View style={styles.pickerWrapper}>
          <Pressable
            onPress={() => setOpen(prev => !prev)}
            style={styles.picker}>
            <View style={styles.assetPlaceholderWrapper}>
              {token !== undefined ? (
                <>
                  <View style={styles.assetIconWrapper}>
                    <AssetLogo source={token.icon} size={24} />
                  </View>
                  <Text>{token.symbol}</Text>
                </>
              ) : (
                <Text>Select item...</Text>
              )}
            </View>
            <View>
              <DownIcon fill={dark ? 'white' : 'black'} />
            </View>
          </Pressable>
        </View>
      </View>
      <AssetPickerModal
        open={open}
        value={_tokenId}
        items={items}
        onChange={onSelectToken}
        onClose={() => setOpen(false)}
        title={pickerTitle}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
    flex: 1,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#2b2626',
    height: 62,
  },
  container_disabled: {
    backgroundColor: 'transparent',
  },
  inputWrapper: {
    flex: 3,
  },
  inputBalanceText: {
    fontSize: 14,
    fontWeight: '300',
    color: 'gray',
  },
  input: {
    margin: 0,
    marginTop: 0,
    fontSize: 18,
    color: 'black',
    paddingVertical: 4,
  },
  inputDark: {
    color: 'white',
  },
  pickerWrapper: {
    width: 110,
    marginLeft: 12,
  },

  // picker button
  picker: {
    width: '100%',
    fontSize: 16,
    height: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  assetPlaceholderWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  assetIconWrapper: {
    marginRight: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: 28,
    height: 28,
    backgroundColor: DefaultTheme.colors.card,
    borderRadius: 14,
  },
});
