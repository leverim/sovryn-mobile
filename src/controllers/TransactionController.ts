import { EventEmitter } from 'events';
import {
  TransactionRequest,
  TransactionResponse,
} from '@ethersproject/abstract-provider';

class TransactionController {
  public readonly hub = new EventEmitter({ captureRejections: true });
  public request(tx: TransactionRequest): Promise<TransactionResponse> {
    return new Promise((resolve, reject) => {
      this.hub.emit('request', tx, { resolve, reject });
    });
  }
}

export const transactionController = new TransactionController();
