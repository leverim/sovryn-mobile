import { DarkTheme } from '@react-navigation/native';
import { useIsDarkTheme } from 'hooks/useIsDarkTheme';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Modal, Pressable } from 'react-native';
import { ChainId } from 'types/network';
import { currentChainId } from 'utils/helpers';
import { getProvider } from 'utils/RpcEngine';
import { Text } from './Text';
import { TransactionBadge } from './TransactionBadge';

type SendAssetModalProps = {
  txHash?: string;
  chainId?: ChainId;
  onClose: () => void;
};

export const TransactionModal: React.FC<SendAssetModalProps> = ({
  txHash,
  chainId = currentChainId(),
  onClose,
}) => {
  const [status, setStatus] = useState('pending');

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

  const dark = useIsDarkTheme();

  return (
    <Modal animationType="slide" transparent={true} visible={!!txHash}>
      <View style={styles.centeredView}>
        <View style={[styles.modalView, dark && styles.modalViewDark]}>
          <Text style={styles.titleText}>Transaction {status}</Text>

          <View style={styles.walletContainer}>
            <TransactionBadge txHash={txHash || '0x'} chainId={chainId} />
          </View>

          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.button, styles.buttonOpen]}
              onPress={onClose}>
              <Text style={styles.textStyle}>Close</Text>
            </Pressable>
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
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
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
