import { EventEmitter } from 'events';
import EncryptedStorage from 'react-native-encrypted-storage';
import { getItem, storeItem } from './storage';

export enum AccountType {
  MNEMONIC,
  PRIVATE_KEY,
}

export type BaseAccount = {
  name: string;
  type: AccountType;
};

export type Account = BaseAccount & { secret: string };

class AccountManager extends EventEmitter {
  private _accounts: Account[] = [];
  private _selected: number = -1;
  constructor() {
    super();
  }
  public get list(): BaseAccount[] {
    return this._accounts.map(({ name, type }) => ({ name, type }));
  }
  public get current(): Account {
    return this._accounts[this.selected];
  }
  public get selected(): number {
    return this._selected;
  }
  public async create(name: string, type: AccountType, secret: string) {
    this._accounts.push({
      name,
      type,
      secret,
    });
    this._selected = this._accounts.length - 1;
    await this.save();
    this.onLoaded();
    this.onSelected();
  }
  public async select(index: number) {
    this._selected = index;
    await this.save();
    this.onSelected();
  }
  public get(index: number) {
    return this._accounts[index];
  }
  public async load() {
    this._accounts = await EncryptedStorage.getItem('account_list').then(
      response => {
        try {
          return JSON.parse(response || '[]');
        } catch (error) {
          return [];
        }
      },
    );
    this._selected = await getItem('account_selected')
      .then(response => response || '0')
      .then(response => Number(response) || 0);

    if (!this._accounts.length) {
      this._selected = -1;
    }
    this.onLoaded();
    this.onSelected();
  }
  protected async save() {
    await EncryptedStorage.setItem(
      'account_list',
      JSON.stringify(this._accounts),
    );
    await storeItem('account_selected', this._selected.toString());
  }
  protected async onLoaded() {
    this.emit('loaded', this.list);
  }
  protected async onSelected() {
    this.emit('selected', this._selected);
  }
}

export const accounts = new AccountManager();
