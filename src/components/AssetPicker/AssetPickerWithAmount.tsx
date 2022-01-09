import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { TokenId } from 'types/token';
import { AmountField } from 'components/AmountField';
import { AssetPicker } from '.';
import { tokenUtils } from 'utils/token-utils';
import { currentChainId } from 'utils/helpers';

type AssetPickerWithAmountProps = {
  amount: string;
  onAmountChanged: (amount: string) => void;
  tokenId: TokenId;
  onTokenChanged: (tokenId: TokenId) => void;
  tokenIdList?: TokenId[];
  readOnlyAmount?: boolean;
};

export const AssetPickerWithAmount: React.FC<AssetPickerWithAmountProps> = ({
  amount,
  onAmountChanged,
  tokenId,
  onTokenChanged,
  tokenIdList,
  readOnlyAmount,
}) => {
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

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <AmountField
          value={amount}
          onChangeText={onAmountChanged}
          editable={editable}
        />
      </View>
      <View style={styles.pickerWrapper}>
        <AssetPicker value={tokenId} items={items} onChange={onTokenChanged} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 16,
    flex: 1,
  },
  inputWrapper: {
    flex: 3,
  },
  pickerWrapper: {
    width: 110,
    marginLeft: 12,
  },
});
