import { TransactionType } from 'components/TransactionConfirmation/ConfirmationModal/transaction-types';
import { BytesLike } from 'ethers';
import { TransactionResponse } from '@ethersproject/providers';
import { ChainId } from 'types/network';
import { findAssetByAddress, getNativeAsset } from './asset-utils';

export const getSignatureFromData = (data: BytesLike | string) =>
  data?.toString().substring(0, 10) || '0x';

export const getTxType = (
  signature: string | TransactionType,
): TransactionType =>
  Object.values(TransactionType).includes(signature as TransactionType)
    ? (signature as TransactionType)
    : TransactionType.UNKNOWN;

export const getTxTitle = (type: TransactionType, tx: TransactionResponse) => {
  switch (type) {
    default:
      return 'Contract Execution';
    case TransactionType.SEND_COIN:
      return `Send ${getNativeAsset(tx.chainId as ChainId)?.symbol || 'Coin'}`;
    case TransactionType.APPROVE_TOKEN:
      return `Approve ${
        findAssetByAddress(tx?.chainId as ChainId, tx?.to!)?.symbol || 'Token'
      }`;
    case TransactionType.TRANSFER_TOKEN:
      return `Transfer ${
        findAssetByAddress(tx?.chainId as ChainId, tx?.to!)?.symbol || 'Token'
      }`;
    case TransactionType.VESTING_WITHDRAW_TOKENS:
      return 'Withdraw Tokens';
    case TransactionType.SWAP_NETWORK_SWAP:
    case TransactionType.WRBTC_PROXY_SWAP:
      return 'Swap Tokens';
    case TransactionType.LENDING_DEPOSIT:
    case TransactionType.LENDING_DEPOSIT_NATIVE:
      return 'Deposit to Lending Pool';
    case TransactionType.LENDING_WITHDRAW:
    case TransactionType.LENDING_WITHDRAW_NATIVE:
      return 'Withdraw from Lending Pool';
    case TransactionType.ADD_LIQUIDITY_TO_V1:
    case TransactionType.ADD_LIQUIDITY_TO_V2:
      return 'Deposit to AMM Pool';
  }
};
