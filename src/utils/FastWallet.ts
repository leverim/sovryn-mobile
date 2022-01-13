import { addHexPrefix, publicToAddress, stripHexPrefix } from 'ethereumjs-util';
import { Buffer } from 'buffer';
import { Account, accounts, AccountType } from './accounts';
import { RSK_DERIVATION_PATH } from './constants';
import hdkey from 'hdkey';
// You must wrap a tiny-secp256k1 compatible implementation

export class FastWallet {
  protected account: Account;
  constructor(
    private _account: number,
    private _index: number = 0,
    private _dPath: string = RSK_DERIVATION_PATH,
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
          const node = hdkey.fromMasterSeed(
            Buffer.from(stripHexPrefix(this.account.secret), 'hex'),
          );
          const dkey = node.derive(`${this._dPath}/${this._index}`);
          console.log(dkey);
          return {
            address: addHexPrefix(
              publicToAddress(dkey.publicKey, true).toString('hex'),
            ),
          };
        case AccountType.PRIVATE_KEY:
          return { address: '0x' };
        //   return new EthersWallet(this.account.secret);
        case AccountType.PUBLIC_ADDRESS:
          return { address: this.account.secret };
        default:
          return undefined;
      }
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }
}
