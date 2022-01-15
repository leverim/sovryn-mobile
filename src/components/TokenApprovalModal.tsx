import { DarkTheme } from '@react-navigation/native';
import { commify, formatUnits, hexlify, parseUnits } from 'ethers/lib/utils';
import { useIsDarkTheme } from 'hooks/useIsDarkTheme';
import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { ChainId } from 'types/network';
import { Token } from 'types/token';
import { encodeFunctionData } from 'utils/contract-utils';
import { getProvider } from 'utils/RpcEngine';
import { wallet } from 'utils/wallet';
import { AddressBadge } from './AddressBadge';
import { Text } from './Text';
import { TransactionBadge } from './TransactionBadge';

type TokenApprovalModalProps = {
  open: boolean;
  onClose: () => void;
  onCompleted: (newAllowance: string) => void;
  chainId: ChainId;
  amount: string;
  token: Token;
  tokenAddress: string;
  spender: string;
  owner: string;
  gasPrice?: string;
  description?: string;
};

export const TokenApprovalModal: React.FC<TokenApprovalModalProps> = ({
  open,
  onClose,
  onCompleted,
  chainId,
  amount,
  token,
  tokenAddress,
  spender,
  owner,
  description,
  gasPrice,
}) => {
  const dark = useIsDarkTheme();

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('none');
  const [txHash, setTxHash] = useState<string>();

  useEffect(() => {
    if (txHash && chainId) {
      let timer: NodeJS.Timeout;
      const check = () => {
        timer = setTimeout(() => {
          getProvider(chainId)
            .getTransactionReceipt(txHash)
            .then(receipt => {
              console.log(receipt);
              if (receipt === null) {
                setStatus('pending');
                check();
              } else if (receipt.status) {
                setStatus('confirmed');
              } else if (!receipt.status) {
                setStatus('failed');
              } else {
                setStatus('unknown');
              }
            })
            .catch(error => console.warn(error));
        }, 15000);
      };

      check();
      return () => {
        if (timer) {
          clearTimeout(timer);
        }
      };
    }
  }, [txHash, chainId]);

  const handleClosePress = useCallback(() => {
    setTxHash(undefined);
    setStatus('none');
    onClose();
  }, [onClose]);

  const handleContinuePress = useCallback(() => {
    if (onCompleted) {
      onCompleted(parseUnits(amount, token.decimals).toString());
    }
    handleClosePress();
  }, [amount, token, onCompleted, handleClosePress]);

  const handleSubmitPress = useCallback(async () => {
    setLoading(true);
    try {
      const nonce = await getProvider(chainId)
        .getTransactionCount(owner)
        .then(response => response.toString());

      let _gasPrice = gasPrice;

      if (!gasPrice) {
        _gasPrice = await getProvider(chainId)
          .getGasPrice()
          .then(response => formatUnits(response, 9).toString());
      }

      const data = encodeFunctionData('approve(address,uint256)', [
        spender,
        parseUnits(amount, token.decimals),
      ]);

      const gas = await getProvider(chainId)
        .estimateGas({
          to: tokenAddress,
          value: 0,
          nonce: hexlify(Number(nonce || 0)),
          data,
          gasPrice: hexlify(Number(_gasPrice || 0) * 1e9),
        })
        .then(response => response.toString());

      const signedTransaction = await wallet.signTransaction({
        to: tokenAddress,
        value: 0,
        nonce: hexlify(Number(nonce || 0)),
        data: data,
        gasPrice: hexlify(Number(_gasPrice || 0) * 1e9),
        gasLimit: hexlify(Number(gas || 0) * 3),
      });

      const tx = await getProvider(chainId).sendTransaction(signedTransaction);

      setTxHash(tx.hash);
      setStatus('pending');
      setLoading(false);
    } catch (e) {
      console.warn('Sending asset failed: ', e);
      setLoading(false);
      setStatus('none');
    }
  }, [chainId, token, amount, gasPrice, owner, spender, tokenAddress]);

  return (
    <Modal animationType="slide" transparent={true} visible={open}>
      <View style={styles.centeredView}>
        <View style={[styles.modalView, dark && styles.modalViewDark]}>
          <Text style={styles.titleText}>
            {status === 'none' && `Approve ${token.symbol}`}
            {status === 'pending' && `Approving ${token.symbol}`}
            {status === 'failed' && 'Approval failed'}
            {status === 'confirmed' && 'Approval confirmed'}
          </Text>

          <Text style={styles.description}>
            {description ||
              `Allow swap network contract to transfer ${token.symbol} in your name.`}
          </Text>

          <View style={styles.walletContainer}>
            <Text>
              Amount: {commify(amount)} {token.symbol}
            </Text>
            <View style={styles.walletContainerSpender}>
              <Text style={{ marginRight: 4 }}>Spender:</Text>
              <AddressBadge address={spender} />
            </View>
            {txHash && (
              <View style={styles.walletContainerSpender}>
                <Text style={{ marginRight: 4 }}>Tx Hash:</Text>
                <TransactionBadge txHash={txHash || '0x'} chainId={chainId} />
              </View>
            )}
          </View>

          <View style={styles.buttonContainer}>
            {status === 'none' && (
              <>
                <Pressable
                  style={[styles.button, styles.buttonOpen]}
                  onPress={handleClosePress}>
                  <Text style={styles.textStyle}>Cancel</Text>
                </Pressable>

                <Pressable
                  style={[styles.button, styles.buttonOpen]}
                  onPress={handleSubmitPress}
                  disabled={loading}>
                  <Text style={styles.textStyle}>Confirm</Text>
                </Pressable>
              </>
            )}
            {status === 'pending' && (
              <>
                <ActivityIndicator size={80} />
              </>
            )}
            {status === 'confirmed' && (
              <>
                <Text>Transaction successfull.</Text>
                <Pressable
                  style={[styles.button, styles.buttonOpen]}
                  onPress={handleContinuePress}>
                  <Text style={styles.textStyle}>Continue</Text>
                </Pressable>
              </>
            )}
            {(status === 'failed' || status === 'unknown') && (
              <>
                <Text>Transaction failed???</Text>
                <Pressable
                  style={[styles.button, styles.buttonOpen]}
                  onPress={handleClosePress}>
                  <Text style={styles.textStyle}>Continue</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 0,
    width: '100%',
    backgroundColor: 'white',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingHorizontal: 35,
    paddingVertical: 50,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalViewDark: {
    backgroundColor: DarkTheme.colors.card,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    marginHorizontal: 15,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  description: {
    marginTop: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dappInfoContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  dappInfoHostname: {
    marginTop: 6,
    fontSize: 12,
  },
  walletContainer: {
    marginVertical: 30,
    padding: 15,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    flexGrow: 1,
    flexShrink: 0,
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  walletContainerSpender: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginTop: 12,
  },
  walletImageContainer: {
    marginRight: 15,
  },
  walletText: {
    fontWeight: '400',
    marginBottom: 4,
  },
  titleText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
});
function parseUtils(amount: string): string {
  throw new Error('Function not implemented.');
}
