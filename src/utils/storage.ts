import { v4 as uuidv4 } from 'uuid';

/**
 * Creates a queue item with a unique ID and timestamp
 */
const createQueueItem = <T>(data: T, action: 'create' | 'update' | 'delete'): QueueItem<T> => ({
  id: uuidv4(),
  timestamp: new Date().toISOString(),
  data,
  action,
  synced: false,
});

/**
 * Queue interface for tracking offline changes that need to be synced
 */
interface QueueItem<T> {
  id: string;
  timestamp: string;
  data: T;
  action: 'create' | 'update' | 'delete';
  synced: boolean;
}

/**
 * A generic local storage manager for offline data
 */
export class LocalStorageManager<T extends { id: string }> {
  private storageKey: string;
  private queueKey: string;

  constructor(entityName: string) {
    this.storageKey = `offline_${entityName}`;
    this.queueKey = `sync_queue_${entityName}`;
    this.initStorage();
  }

  private initStorage(): void {
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.queueKey)) {
      localStorage.setItem(this.queueKey, JSON.stringify([]));
    }
  }

  /**
   * Get all items from local storage
   */
  getAll(): T[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Get a single item by ID
   */
  getById(id: string): T | undefined {
    const items = this.getAll();
    return items.find(item => item.id === id);
  }

  /**
   * Add a new item to local storage and queue for sync
   */
  create(item: T): T {
    const items = this.getAll();
    const newItem = { ...item, id: item.id || uuidv4() };
    
    localStorage.setItem(this.storageKey, JSON.stringify([...items, newItem]));
    this.addToSyncQueue(newItem, 'create');
    
    return newItem;
  }

  /**
   * Update an existing item and queue for sync
   */
  update(item: T): T | undefined {
    const items = this.getAll();
    const index = items.findIndex(i => i.id === item.id);
    
    if (index === -1) return undefined;
    
    items[index] = item;
    localStorage.setItem(this.storageKey, JSON.stringify(items));
    this.addToSyncQueue(item, 'update');
    
    return item;
  }

  /**
   * Delete an item and queue for sync
   */
  delete(id: string): boolean {
    const items = this.getAll();
    const item = items.find(i => i.id === id);
    
    if (!item) return false;
    
    localStorage.setItem(
      this.storageKey,
      JSON.stringify(items.filter(i => i.id !== id))
    );
    this.addToSyncQueue(item, 'delete');
    
    return true;
  }

  /**
   * Add an item to the sync queue
   */
  private addToSyncQueue(data: T, action: 'create' | 'update' | 'delete'): void {
    const queue = this.getSyncQueue();
    const queueItem = createQueueItem(data, action);
    
    localStorage.setItem(this.queueKey, JSON.stringify([...queue, queueItem]));
  }

  /**
   * Get all items in the sync queue
   */
  getSyncQueue(): QueueItem<T>[] {
    const data = localStorage.getItem(this.queueKey);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Mark items in the sync queue as synced
   */
  markAsSynced(ids: string[]): void {
    const queue = this.getSyncQueue();
    const updatedQueue = queue.map(item => 
      ids.includes(item.id) ? { ...item, synced: true } : item
    );
    
    localStorage.setItem(this.queueKey, JSON.stringify(updatedQueue));
  }

  /**
   * Remove synced items from the queue
   */
  cleanSyncQueue(): void {
    const queue = this.getSyncQueue();
    const updatedQueue = queue.filter(item => !item.synced);
    
    localStorage.setItem(this.queueKey, JSON.stringify(updatedQueue));
  }

  /**
   * Replace all local data with server data
   */
  replaceAllData(items: T[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }
}

/**
 * Check if the application is online
 */
export const isOnline = (): boolean => navigator.onLine;

/**
 * NetworkStatus class to monitor network status changes
 */
export class NetworkStatus {
  private listeners: ((online: boolean) => void)[] = [];

  constructor() {
    this.initEventListeners();
  }

  private initEventListeners(): void {
    window.addEventListener('online', () => this.notifyListeners(true));
    window.addEventListener('offline', () => this.notifyListeners(false));
  }

  private notifyListeners(online: boolean): void {
    this.listeners.forEach(listener => listener(online));
  }

  /**
   * Add a listener for network status changes
   */
  addListener(listener: (online: boolean) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Remove a listener
   */
  removeListener(listener: (online: boolean) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  /**
   * Get the current online status
   */
  isOnline(): boolean {
    return navigator.onLine;
  }
}