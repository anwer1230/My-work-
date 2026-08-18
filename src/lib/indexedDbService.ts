// IndexedDB persistence service for Telegram Web App
// Handles persistent storage for offline chats, messages, session keys, and offline message queue.

const DB_NAME = 'TelegramWebAppDB';
const DB_VERSION = 2;

export interface OfflineQueueItem {
  id: string; // tmp_...
  chat_id: string | number;
  text: string;
  date: number; // Unix timestamp in seconds
  status: 'queued' | 'sending' | 'failed' | 'delivered';
  reply_to?: {
    id: string | number;
    sender_name?: string;
    text?: string;
  };
  retryCount: number;
  lastAttempt?: number;
  error?: string;
  media?: string | null;
  type?: 'text' | 'photo' | 'document' | 'voice' | 'audio';
  duration?: number;
}

class IndexedDbService {
  private db: IDBDatabase | null = null;

  private async openDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result as IDBDatabase;

        // Session Store (MTProto Session Keys & DC endpoints)
        if (!db.objectStoreNames.contains('sessions')) {
          db.createObjectStore('sessions', { keyPath: 'key' });
        }

        // Chats Store
        if (!db.objectStoreNames.contains('chats')) {
          db.createObjectStore('chats', { keyPath: 'id' });
        }

        // Messages Store
        if (!db.objectStoreNames.contains('messages')) {
          const msgStore = db.createObjectStore('messages', { keyPath: 'id' });
          msgStore.createIndex('chat_id', 'chat_id', { unique: false });
        }

        // Offline Outgoing Message Queue
        if (!db.objectStoreNames.contains('offline_queue')) {
          const queueStore = db.createObjectStore('offline_queue', { keyPath: 'id' });
          queueStore.createIndex('chat_id', 'chat_id', { unique: false });
          queueStore.createIndex('status', 'status', { unique: false });
        }
      };

      request.onsuccess = (event: any) => {
        this.db = event.target.result;
        resolve(this.db!);
      };

      request.onerror = (event) => {
        console.error('IndexedDB open failed:', event);
        reject(event);
      };
    });
  }

  // --- SESSION PERSISTENCE (MTProto & Auth Keys) ---
  async saveSessionKey(key: string, value: any): Promise<void> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('sessions', 'readwrite');
        const store = tx.objectStore('sessions');
        store.put({ key, value, updatedAt: Date.now() });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.warn('IndexedDB saveSessionKey error:', e);
    }
  }

  async getSessionKey(key: string): Promise<any> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('sessions', 'readonly');
        const store = tx.objectStore('sessions');
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result ? req.result.value : null);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      return null;
    }
  }

  // --- CHATS PERSISTENCE ---
  async saveChats(chats: any[]): Promise<void> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('chats', 'readwrite');
        const store = tx.objectStore('chats');
        chats.forEach((chat) => store.put(chat));
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.warn('IndexedDB saveChats error:', e);
    }
  }

  async getCachedChats(): Promise<any[]> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('chats', 'readonly');
        const store = tx.objectStore('chats');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      return [];
    }
  }

  // --- MESSAGES PERSISTENCE ---
  async saveMessages(chatId: string | number, messages: any[]): Promise<void> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('messages', 'readwrite');
        const store = tx.objectStore('messages');
        messages.forEach((msg) => {
          store.put({ ...msg, chat_id: String(chatId) });
        });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.warn('IndexedDB saveMessages error:', e);
    }
  }

  async getCachedMessages(chatId: string | number): Promise<any[]> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('messages', 'readonly');
        const store = tx.objectStore('messages');
        const index = store.index('chat_id');
        const req = index.getAll(String(chatId));
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      return [];
    }
  }

  // --- OFFLINE MESSAGE QUEUE & SYNC ---
  async enqueueOfflineMessage(msg: OfflineQueueItem): Promise<void> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('offline_queue', 'readwrite');
        const store = tx.objectStore('offline_queue');
        store.put(msg);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.warn('IndexedDB enqueue error:', e);
    }
  }

  async getOfflineQueue(): Promise<OfflineQueueItem[]> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('offline_queue', 'readonly');
        const store = tx.objectStore('offline_queue');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      return [];
    }
  }

  async updateOfflineMessage(id: string, updates: Partial<OfflineQueueItem>): Promise<void> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('offline_queue', 'readwrite');
        const store = tx.objectStore('offline_queue');
        const getReq = store.get(id);
        getReq.onsuccess = () => {
          if (getReq.result) {
            const updated = { ...getReq.result, ...updates };
            store.put(updated);
          }
        };
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.warn('IndexedDB updateOfflineMessage error:', e);
    }
  }

  async removeOfflineMessage(id: string): Promise<void> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('offline_queue', 'readwrite');
        const store = tx.objectStore('offline_queue');
        store.delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.warn('IndexedDB removeOfflineMessage error:', e);
    }
  }

  async clearOfflineQueue(): Promise<void> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('offline_queue', 'readwrite');
        const store = tx.objectStore('offline_queue');
        store.clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.warn('IndexedDB clearOfflineQueue error:', e);
    }
  }
}

export const indexedDbService = new IndexedDbService();
