import { EvmNetwork, getEvmNetworks } from 'utils/networks';

type JsonRpcRequest = {
  jsonrpc: string;
  id: string;
  method: string;
  params?: Array<any>;
};

type JsonRpcResponse = {
  jsonrpc: string;
  id: string;
  result: any;
};

type JsonRpcErrorResponse = {
  jsonrpc: string;
  id: string;
  error: {
    code: string;
    message: string;
  };
};

export class JsonRpcProvider {
  public readonly network: EvmNetwork;
  private _nextId: number = 0;
  constructor(chainId: number) {
    this.network = getEvmNetworks().find(item => item.chainId === chainId)!;
  }

  public send(input: JsonRpcRequest | JsonRpcRequest[]) {
    return fetch(this.network.rpc[0], {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      method: 'post',
      body: JSON.stringify(input),
    }).then<
      JsonRpcResponse | JsonRpcResponse[],
      JsonRpcErrorResponse | JsonRpcErrorResponse[]
    >(response => response.json());
  }

  public request(method: string, params: Array<string>) {
    return this.send({
      jsonrpc: '2.0',
      id: (this._nextId++).toString(),
      method,
      params,
    });
  }

  prepareRequest(method: string, params: any): [string, Array<any>] {
    switch (method) {
      case 'getBlockNumber':
        return ['eth_blockNumber', []];

      case 'getGasPrice':
        return ['eth_gasPrice', []];

      case 'getBalance':
        return [
          'eth_getBalance',
          [getLowerCase(params.address), params.blockTag],
        ];

      case 'getTransactionCount':
        return [
          'eth_getTransactionCount',
          [getLowerCase(params.address), params.blockTag],
        ];

      case 'getCode':
        return ['eth_getCode', [getLowerCase(params.address), params.blockTag]];

      case 'getStorageAt':
        return [
          'eth_getStorageAt',
          [getLowerCase(params.address), params.position, params.blockTag],
        ];

      case 'sendTransaction':
        return ['eth_sendRawTransaction', [params.signedTransaction]];

      case 'getBlock':
        if (params.blockTag) {
          return [
            'eth_getBlockByNumber',
            [params.blockTag, !!params.includeTransactions],
          ];
        } else if (params.blockHash) {
          return [
            'eth_getBlockByHash',
            [params.blockHash, !!params.includeTransactions],
          ];
        }
        return null;

      case 'getTransaction':
        return ['eth_getTransactionByHash', [params.transactionHash]];

      case 'getTransactionReceipt':
        return ['eth_getTransactionReceipt', [params.transactionHash]];

      case 'call': {
        const hexlifyTransaction = getStatic<
          (
            t: TransactionRequest,
            a?: { [key: string]: boolean },
          ) => { [key: string]: string }
        >(this.constructor, 'hexlifyTransaction');
        return [
          'eth_call',
          [
            hexlifyTransaction(params.transaction, { from: true }),
            params.blockTag,
          ],
        ];
      }

      case 'estimateGas': {
        const hexlifyTransaction = getStatic<
          (
            t: TransactionRequest,
            a?: { [key: string]: boolean },
          ) => { [key: string]: string }
        >(this.constructor, 'hexlifyTransaction');
        return [
          'eth_estimateGas',
          [hexlifyTransaction(params.transaction, { from: true })],
        ];
      }

      case 'getLogs':
        if (params.filter && params.filter.address != null) {
          params.filter.address = getLowerCase(params.filter.address);
        }
        return ['eth_getLogs', [params.filter]];

      default:
        break;
    }

    return null;
  }
}
