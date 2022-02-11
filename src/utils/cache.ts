import { EventEmitter } from 'events';
import { STORAGE_CACHE } from './constants';
import { getItem, storeItem } from './storage';

class CacheManager extends EventEmitter {
  private _items: Record<string, any> = {};
  constructor() {
    super();
  }
  public get items() {
    return this._items;
  }
  public async set(key: string, value: any) {
    this._items[key] = value;
    await this.save();
    this.onUpdated();
  }
  public get<T = any>(key: string, _default?: T): T {
    if (this._items.hasOwnProperty(key)) {
      return this._items[key];
    }
    return _default as T;
  }
  public async load() {
    this._items = await getItem(STORAGE_CACHE).then(response => {
      try {
        return JSON.parse(response || '{}');
      } catch (error) {
        return {};
      }
    });
    this.onUpdated();
  }
  protected async save() {
    await storeItem(STORAGE_CACHE, JSON.stringify(this._items));
  }
  protected async onUpdated() {
    this.emit('updated', this._items);
  }
}

export const cache = new CacheManager();
