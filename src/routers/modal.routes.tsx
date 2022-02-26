import type { Asset } from 'models/asset';
import type {
  TransactionRequest,
  TransactionResponse,
} from '@ethersproject/abstract-provider';

export type ModalStackRoutes = {
  'modal.send-asset': { asset: Asset };
  'modal.receive-asset': { asset: Asset };
  'modal.transactions': undefined;
  'modal.transaction': { hash: string };
  'modal.tx-confirm': {
    request: TransactionRequest;
    onConfirm: (tx: TransactionResponse) => void;
    onReject: (error: Error) => void;
  };
  'modal.passcode-confirm': {
    title?: string;
    onConfirm: (code: string) => void;
    onReject: (error: Error) => void;
  };
  'modal.tx-sign': { request: TransactionRequest };
  'modal.sign-message': { request: TransactionRequest };
  'modal.asset-picker': {
    parentRoute: string;
    pickerKey: string;
    title?: string;
    value?: Asset;
    items: Asset[];
  };
  'modal.scan-qr': { onScanned: (text: string) => void };
};
