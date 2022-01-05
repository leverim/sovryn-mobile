import { getItem, storeItem } from './storage';

export enum Setting {
  SELECTED_ACCOUNT = 'selected_account',
  SELECTED_DPATH = 'selected_dpath',
  IS_TESTNET = 'is_testnet',
}

const defaultSettings: Partial<Record<Setting, any>> = {
  [Setting.SELECTED_ACCOUNT]: 0,
  [Setting.SELECTED_DPATH]: "m/44'/60'/0'/0",
  [Setting.IS_TESTNET]: false,
};

class SettingsManager {
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
  }

  public async save() {
    await storeItem('settings', JSON.stringify(this._items));
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
}

export const settings = new SettingsManager();
