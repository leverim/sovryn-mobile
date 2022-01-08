import React from 'react';
import { StyleSheet, Text, View, Modal, Pressable } from 'react-native';
import { utils } from 'ethers/lib.esm';
import { Token } from 'types/token';
import { currentChainId, prettifyTx } from 'utils/helpers';
import { tokenUtils } from 'utils/token-utils';

type SendAssetModalProps = {
  isOpen: boolean;
  receiver: string;
  amount: string;
  fee: string;
  token: Token;
  onReject: () => void;
  onConfirm: () => void;
};

export const SendAssetModal: React.FC<SendAssetModalProps> = ({
  isOpen,
  receiver,
  amount,
  fee,
  token,
  onConfirm,
  onReject,
}) => {
  return (
    <Modal animationType="slide" transparent={true} visible={isOpen}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.titleText}>Confirm {token.symbol} transfer</Text>

          <View style={styles.walletContainer}>
            <View>
              <Text style={styles.walletText}>
                Receiver: {prettifyTx(receiver || '0x', 12, 10)}
              </Text>
              <Text style={styles.walletText}>
                Amount: {utils.commify(Number(amount).toFixed(8))}{' '}
                {token.symbol}
              </Text>
              <Text style={styles.walletText}>
                Fee: {utils.commify(fee)}{' '}
                {tokenUtils.getNativeToken(currentChainId()).symbol}
              </Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={onReject}>
              <Text style={styles.textStyle}>Reject</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.buttonOpen]}
              onPress={onConfirm}>
              <Text style={styles.textStyle}>Transfer</Text>
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
