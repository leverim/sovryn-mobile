import { EventEmitter } from 'events';
import { RSK_DERIVATION_PATH } from './constants';
import { getItem, storeItem } from './storage';

export enum Setting {
  SELECTED_ACCOUNT = 'selected_account',
  SELECTED_DPATH = 'selected_dpath',
  IS_TESTNET = 'is_testnet',
  DEFAULT_CHAIN_ID = 'default_chain_id',
}

const defaultSettings: Partial<Record<Setting, any>> = {
  [Setting.SELECTED_ACCOUNT]: 0,
  [Setting.SELECTED_DPATH]: RSK_DERIVATION_PATH,
  [Setting.IS_TESTNET]: false,
  [Setting.DEFAULT_CHAIN_ID]: 30,
};

class SettingsManager extends EventEmitter {
  private _items: Partial<Record<Setting, any>> = defaultSettings;

  public get items() {
    return { ...defaultSettings, ...this._items };
  }

  public async load() {
    this._items = await getItem('settings').then(response => {
      try {
        return JSON.parse(response || '{}');
      } catch (error) {
        return {};
      }
    });
    this.onUpdated();
  }

  public async save() {
    await storeItem('settings', JSON.stringify(this._items));
    this.onUpdated();
  }

  public get<T = string>(key: Setting, _default?: T): T {
    if (this._items.hasOwnProperty(key)) {
      return this._items[key];
    }
    if (defaultSettings.hasOwnProperty(key)) {
      return defaultSettings[key];
    }
    return _default as T;
  }

  public async set<T = string>(key: Setting, value: T) {
    this._items[key] = value;
    await this.save();
  }

  protected onUpdated() {
    this.emit('updated', this._items);
  }
}

export const settings = new SettingsManager();
