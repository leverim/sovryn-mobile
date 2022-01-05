import { EventEmitter } from 'events';
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
    this._items = await getItem('cache').then(response => {
      try {
        return JSON.parse(response || '{}');
      } catch (error) {
        return [];
      }
    });
    this.onUpdated();
  }
  protected async save() {
    await storeItem('cache', JSON.stringify(this._items));
  }
  protected async onUpdated() {
    this.emit('updated', this._items);
  }
}

export const cache = new CacheManager();
