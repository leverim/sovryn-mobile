import React, { useCallback, useState } from 'react';
import { BottomModal, ModalContent } from 'react-native-modals';
import { TransactionRequest } from '@ethersproject/abstract-provider';
import { StyleSheet, View } from 'react-native';
import { Text } from 'components/Text';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useIsDarkTheme } from 'hooks/useIsDarkTheme';
import { Button, ButtonIntent } from 'components/Buttons/Button';
import { VestingConfig } from 'models/vesting-config';
import { VestingData } from 'hooks/useVestedAssets';
import { useUnlockedVestingBalance } from 'pages/WalletScreen/hooks/useUnlockedVestingBalance';
import { commifyDecimals, formatUnits } from 'utils/helpers';
import { WarningBadge } from 'components/WarningBadge';
import { useCurrentAccount } from 'hooks/useCurrentAccount';
import { ReadWalletAwareWrapper } from 'components/ReadWalletAwareWapper';
import { transactionController } from 'controllers/TransactionController';
import { encodeFunctionData, functionSignature } from 'utils/contract-utils';
import { useWalletAddress } from 'hooks/useWalletAddress';

export type DataModalProps = {
  loading: boolean;
  request: TransactionRequest;
  fee: string;
  onEditRequested: () => void;
  onLoaderFunction: (value: Promise<any>) => void;
};

type WithdrawVestingModalProps = {
  config: VestingConfig;
  data: VestingData;
  onClose: () => void;
};

export const WithdrawVestingModal: React.FC<WithdrawVestingModalProps> = ({
  config,
  data,
  onClose,
}) => {
  const dark = useIsDarkTheme();

  const owner = useWalletAddress();

  const [submitting, setSubmitting] = useState(false);
  const { loading, value } = useUnlockedVestingBalance(
    config.chainId,
    data.vestingAddress,
  );

  const handleWithdrawPress = useCallback(async () => {
    setSubmitting(true);
    try {
      const txData = encodeFunctionData('withdrawTokens(address)()', [
        owner.toLowerCase(),
      ]);
      await transactionController.request({
        to: data.vestingAddress.toLowerCase(),
        from: owner.toLowerCase(),
        data: txData,
        value: 0,
        customData: {
          type: 'withdraw_vesting',
          amount: value,
          tokenId: config.tokenId,
        },
      });
      onClose();
    } catch (e) {
      console.warn(e);
    } finally {
      setSubmitting(false);
    }
  }, [owner, data.vestingAddress, value, config.tokenId, onClose]);

  return (
    <BottomModal visible={!!data} onSwipeOut={onClose}>
      <ModalContent style={[styles.modal, dark && styles.modalDark]}>
        <View style={styles.title}>
          <Text style={styles.titleText}>Withdraw</Text>
        </View>
        <View style={[styles.modalView, dark && styles.modalViewDark]}>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Available to withdraw:</Text>
            <Text style={styles.balanceValue}>
              {loading ? (
                'Calculating, please wait...'
              ) : (
                <>
                  {commifyDecimals(formatUnits(value, config.token.decimals))}{' '}
                  {config.token.symbol}
                </>
              )}
            </Text>
          </View>

          <View style={[styles.footer, dark && styles.footerDark]}>
            <ReadWalletAwareWrapper>
              <Button
                loading={loading || submitting}
                disabled={loading || submitting || value === '0'}
                title="Withdraw"
                onPress={handleWithdrawPress}
                intent={ButtonIntent.PRIMARY}
              />
            </ReadWalletAwareWrapper>

            <Button title="Close" onPress={onClose} />
          </View>
        </View>
      </ModalContent>
    </BottomModal>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: DefaultTheme.colors.card,
  },
  modalDark: {
    backgroundColor: DarkTheme.colors.card,
  },
  title: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  titleText: {
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  modalView: {
    width: '100%',
  },
  modalViewDark: {
    // backgroundColor: DarkTheme.colors.card,
  },

  balanceContainer: {
    backgroundColor: DarkTheme.colors.background,
    padding: 12,
    borderRadius: 8,
  },
  balanceLabel: {},
  balanceValue: {
    fontSize: 24,
    marginTop: 8,
  },

  footer: {
    width: '100%',
    marginTop: 36,
  },
  footerDark: {},
});
