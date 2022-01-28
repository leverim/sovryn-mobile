import { EventEmitter } from 'events';
import EncryptedStorage from 'react-native-encrypted-storage';
import RNRestart from 'react-native-restart';
import { Wallet } from 'ethers';
import { addHexPrefix } from 'ethereumjs-util';
import { mnemonicToSeedSync } from 'bip39';
import { getItem, storeItem } from './storage';
import { Encryptor } from './encryptor';
import { makeWalletPrivateKey } from './wallet';

export enum AccountType {
  MNEMONIC,
  PRIVATE_KEY,
  PUBLIC_ADDRESS,
}

export type BaseAccount = {
  name: string;
  address: string;
  type: AccountType;
};

export type SecureAccount = {
  // privateKey: string;
  // mnemonic: string;
  // masterSeed: string;
  secret: string; // encoded
  dPath: string;
  index: number;
};

export type DecryptedAccountSecret = {
  privateKey: string;
  mnemonic: string;
  masterSeed: string;
};

type AccountUpdate = {
  name: string;
  address: string;
  dPath: string;
  index: number;
};

export type Account = BaseAccount & Partial<SecureAccount>;

class AccountManager extends EventEmitter {
  private _accounts: Account[] = [];
  private _selected: number = -1;
  private _encryptor = new Encryptor();
  constructor() {
    super();
  }
  public get list(): BaseAccount[] {
    return this._accounts.map(({ name, address, type }) => ({
      name,
      address,
      type,
    }));
  }
  public get current(): Account {
    return this._accounts[this.selected];
  }
  public get selected(): number {
    return this._selected;
  }
  public async create(
    name: string,
    type: AccountType,
    password: string,
    { secret, dPath, index }: Partial<SecureAccount>,
  ) {
    const secrets: Partial<DecryptedAccountSecret> = {};

    let pk: string = secret!;

    switch (type) {
      case AccountType.MNEMONIC:
        secrets.mnemonic = secret;
        secrets.masterSeed = addHexPrefix(
          mnemonicToSeedSync(secret!).toString('hex'),
        );
        pk = secrets.masterSeed;
        break;
      case AccountType.PRIVATE_KEY:
        secrets.privateKey = secret;
        pk = secrets.privateKey!;
        break;
    }

    let address: string;

    if (type === AccountType.PUBLIC_ADDRESS) {
      address = secret!;
    } else {
      address = new Wallet(makeWalletPrivateKey(type, pk, dPath, index))
        .address;
    }

    const encryptedSecret = await this._encryptor.encrypt(password, secrets);

    const account: Account = {
      name,
      address,
      type,
      index,
      dPath,
      secret: encryptedSecret,
    };

    this._accounts.push(account);
    this._selected = this._accounts.length - 1;
    await this.save();
    this.onLoaded();
    this.onSelected();
  }
  public async select(index: number) {
    this._selected = index;
    if (this._accounts.length - 1 < index) {
      this._selected = this._accounts.length - 1;
    }
    await this.save();
    this.onSelected();
    RNRestart.Restart();
  }
  public async update(index: number, config: Partial<AccountUpdate>) {
    const account = this._accounts[index];
    account.name = config.name || account.name;
    account.dPath = config.dPath || account.dPath;
    account.index = config.index || account.index;
    account.address = config.address || account.address;
    this._accounts[index] = account;
    await this.save();
    this.onSelected();
    RNRestart.Restart();
  }
  public async remove(index: number) {
    let nextSelectionIndex = this._selected;
    if (this._selected > index) {
      nextSelectionIndex = this._selected - 1;
    }
    this._accounts.splice(index, 1);
    await this.select(nextSelectionIndex);
  }
  public async delete() {
    this._accounts = [];
    await this.select(0);
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
