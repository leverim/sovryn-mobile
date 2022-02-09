import React, { useCallback, useContext, useMemo, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import {
  DarkTheme,
  NavigationProp,
  useNavigation,
} from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import { AccountType, BaseAccount } from 'utils/accounts';
import {
  currentChainId,
  formatAndCommify,
  prettifyTx,
  px,
} from 'utils/helpers';
import { Text } from './Text';
import { WalletStackProps } from 'pages/MainScreen/WalletPage';

import CopyIcon from 'assets/copy-icon.svg';
import SendIcon from 'assets/send-icon.svg';
import ReceiveIcon from 'assets/receive-icon.svg';
import { toChecksumAddress } from 'utils/rsk';
import { BigNumber } from 'ethers';
import { TokenId } from 'types/asset';
import { parseUnits } from 'ethers/lib/utils';
import { getSwappableToken } from 'config/swapables';
import { USD_TOKEN } from 'utils/constants';
import { BalanceContext } from 'context/BalanceContext';
import { findAsset, getNativeAsset } from 'utils/asset-utils';
import { UsdPriceContext } from 'context/UsdPriceContext';

type AccountBannerProps = {
  account: BaseAccount;
  showActions?: boolean;
};

export const AccountBanner: React.FC<AccountBannerProps> = ({
  account,
  showActions,
}) => {
  const navigation =
    useNavigation<NavigationProp<WalletStackProps, 'wallet.details'>>();
  const chainId = currentChainId();
  const coin = getNativeAsset(chainId);
  const usd = findAsset(chainId, USD_TOKEN);
  const { prices } = useContext(UsdPriceContext);
  const { balances } = useContext(BalanceContext);

  const [pressed, setPressed] = useState(false);

  const handlePress = useCallback(
    (status: boolean) => () => setPressed(status),
    [],
  );

  const handleAddressCopy = useCallback(
    () => Clipboard.setString(account.address.toLowerCase()),
    [account.address],
  );

  const oneUsd = parseUnits('1', usd.decimals);

  const getUsdPrice = useCallback(
    (tokenId: TokenId) => {
      const token = getSwappableToken(tokenId, chainId);
      if (token === USD_TOKEN) {
        return parseUnits('1', usd.decimals);
      }
      return (
        prices[chainId]?.find(item => item.tokenId === token)?.price || '0'
      );
    },
    [chainId, prices, usd.decimals],
  );

  const balance = useMemo(() => {
    const _balances = Object.entries(
      balances[chainId]?.[account.address.toLowerCase()] || {},
    ).map(([tokenId, amount]) => ({ tokenId, amount }));

    return _balances
      .reduce(
        (p, c) =>
          p.add(
            BigNumber.from(c.amount)
              .mul(getUsdPrice(c.tokenId as TokenId))
              .div(oneUsd),
          ),
        BigNumber.from('0'),
      )
      .toString();
  }, [balances, chainId, account.address, getUsdPrice, oneUsd]);

  return (
    <View style={styles.container}>
      <View style={styles.nameView}>
        <Text style={styles.nameText}>{account.name}</Text>
        <Pressable
          style={[styles.addressHolder, pressed && styles.addressHolderPressed]}
          onPress={handleAddressCopy}
          onPressIn={handlePress(true)}
          onPressOut={handlePress(false)}>
          <Text style={styles.addressText}>
            {prettifyTx(
              toChecksumAddress(account.address || '', chainId),
              14,
              14,
            )}
          </Text>
          <View style={styles.copyIconHolder}>
            <CopyIcon fill="white" width={22} height={22} />
          </View>
        </Pressable>
      </View>
      <View>
        <Text style={styles.balanceText}>
          ${formatAndCommify(balance, usd.decimals, 4)}
        </Text>
      </View>
      <View>
        {showActions && (
          <View style={styles.actions}>
            {account.type !== AccountType.PUBLIC_ADDRESS ? (
              <Pressable
                style={styles.action}
                onPress={() =>
                  navigation.navigate('wallet.send', { token: coin, chainId })
                }>
                <View style={styles.actionIcon}>
                  <SendIcon fill="white" />
                </View>
                <Text style={styles.actionLabel}>Send</Text>
              </Pressable>
            ) : (
              <View />
            )}

            <Pressable
              style={styles.action}
              onPress={() =>
                navigation.navigate('wallet.receive', {
                  token: coin,
                  chainId,
                })
              }>
              <View style={styles.actionIcon}>
                <ReceiveIcon fill="white" />
              </View>
              <Text style={styles.actionLabel}>Receive</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: DarkTheme.colors.card,
    marginBottom: 24,
    borderRadius: 12,
    padding: 16,
  },
  nameView: {
    marginBottom: 24,
  },
  nameText: {
    opacity: 0.5,
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 16,
  },
  addressHolder: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  addressHolderPressed: {
    transform: [{ scaleX: 1.05 }, { scaleY: 1.05 }],
  },
  addressText: {
    fontWeight: '300',
    fontSize: px(16),
  },
  copyIconHolder: {
    opacity: 0.5,
    marginLeft: 12,
  },
  balanceText: {
    fontSize: px(30),
  },
  actions: {
    marginTop: 24,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  action: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    marginBottom: 12,
  },
  actionLabel: {},
});
