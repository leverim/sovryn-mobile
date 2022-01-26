import { Wallet as EthersWallet, utils } from 'ethers';
import { TransactionRequest } from '@ethersproject/abstract-provider';
import { addHexPrefix, stripHexPrefix } from 'ethereumjs-util';
import { Buffer } from 'buffer';
import hdkey from 'hdkey';
import { Account, accounts, AccountType } from './accounts';
import { RSK_DERIVATION_PATH } from './constants';
import { Setting, settings } from './settings';

interface UserWallet {
  address: string;
}

export class Wallet {
  protected account: Account;
  constructor(
    _account: number,
    private _index: number = 0,
    private _dPath: string = RSK_DERIVATION_PATH,
  ) {
    this.account = accounts.get(_account);
  }
  public derive(): UserWallet | EthersWallet | undefined {
    if (!this.account) {
      return undefined;
    }
    try {
      switch (this.account.type) {
        case AccountType.MNEMONIC:
          const node = hdkey.fromMasterSeed(
            Buffer.from(stripHexPrefix(this.account.secret), 'hex'),
          );
          const dkey = node.derive(`${this._dPath}/${this._index}`);
          return new EthersWallet(dkey.privateKey);
        case AccountType.PRIVATE_KEY:
          return new EthersWallet(addHexPrefix(this.account.secret));
        case AccountType.PUBLIC_ADDRESS:
          return { address: this.account.secret } as UserWallet;
        default:
          return undefined;
      }
    } catch (e) {
      console.error('unable to generate wallet', e);
      return undefined;
    }
  }
}

class WalletManager {
  private _cache: Record<string, UserWallet> = {};

  constructor() {}

  public get address() {
    return this.derive()?.address.toLowerCase();
  }

  public get readOnly() {
    return [AccountType.PUBLIC_ADDRESS].includes(accounts.current.type);
  }

  public signTransaction(transaction: TransactionRequest): Promise<string> {
    delete transaction.customData;
    return (this.derive() as EthersWallet).signTransaction(transaction);
  }

  public signMessage(message: string): Promise<string> {
    return (this.derive() as EthersWallet).signMessage(message);
  }

  protected derive() {
    const key = utils.hashMessage(
      `${accounts.current?.type}/${accounts.current?.secret}`,
    );

    if (this._cache.hasOwnProperty(key)) {
      return this._cache[key];
    }
    const wallet = new Wallet(
      accounts.selected,
      Number(settings.get(Setting.SELECTED_ACCOUNT, '0')),
      settings.get(Setting.SELECTED_DPATH),
    ).derive();
    if (wallet) {
      this._cache[key] = wallet;
      return wallet;
    }
    return undefined;
  }
}

export const wallet = new WalletManager();
