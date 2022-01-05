import { Wallet as EthersWallet, utils } from 'ethers';
import { Account, accounts, AccountType } from './accounts';
import { Setting, settings } from './settings';

export class Wallet {
  protected account: Account;
  constructor(
    _account: number,
    private _index: number = 0,
    private _dPath: string = "m/44'/137'/0'/0",
  ) {
    this.account = accounts.get(_account);
  }
  public derive() {
    if (!this.account) {
      return undefined;
    }
    try {
      switch (this.account.type) {
        case AccountType.MNEMONIC:
          return EthersWallet.fromMnemonic(
            this.account.secret,
            `${this._dPath}/${this._index}`,
          );
        case AccountType.PRIVATE_KEY:
          return new EthersWallet(this.account.secret);
        default:
          return undefined;
      }
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }
}

class WalletManager {
  private _cache: Record<string, EthersWallet> = {};

  constructor() {}

  public get address() {
    return this.derive()?.address;
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
