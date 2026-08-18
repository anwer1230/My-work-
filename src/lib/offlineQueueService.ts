// ══════════════════════════════════════════════════════════════════════════════
// OFFLINE MESSAGE QUEUE SERVICE (LOCALSTORAGE & INDEXEDDB UNIFIED ENGINE)
// ══════════════════════════════════════════════════════════════════════════════

import { indexedDbService, OfflineQueueItem } from './indexedDbService';

export const STORAGE_OFFLINE_QUEUE_KEY = 'tg_offline_message_queue';
export const STORAGE_LAST_ONLINE_KEY = 'tg_last_online_timestamp';

export interface QueuedMessagePayload {
  id: string; // e.g. tmp_1700000000_abc
  chat_id: string | number;
  text: string;
  date: number;
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

type QueueChangeCallback = (queue: QueuedMessagePayload[]) => void;
type QueueItemStatusCallback = (item: QueuedMessagePayload, status: 'sending' | 'delivered' | 'failed') => void;

class OfflineQueueService {
  private queue: QueuedMessagePayload[] = [];
  private listeners: Set<QueueChangeCallback> = new Set();
  private itemListeners: Set<QueueItemStatusCallback> = new Set();
  private isProcessing = false;

  constructor() {
    this.loadInitialQueue();
  }

  /**
   * Load the initial queue from localStorage & IndexedDB
   */
  private async loadInitialQueue() {
    try {
      const raw = localStorage.getItem(STORAGE_OFFLINE_QUEUE_KEY);
      if (raw) {
        this.queue = JSON.parse(raw);
      }
    } catch (e) {
      console.warn('[OfflineQueue] Failed to parse localStorage queue:', e);
      this.queue = [];
    }

    // Also sync with IndexedDB in background
    try {
      const idbQueue = await indexedDbService.getOfflineQueue();
      if (idbQueue && idbQueue.length > 0) {
        // Merge without duplicates
        const existingIds = new Set(this.queue.map((m) => m.id));
        let changed = false;
        idbQueue.forEach((m) => {
          if (!existingIds.has(m.id)) {
            this.queue.push(m as QueuedMessagePayload);
            changed = true;
          }
        });
        if (changed) {
          this.persistQueue();
        }
      }
    } catch (e) {
      console.warn('[OfflineQueue] IDB sync error:', e);
    }
  }

  /**
   * Persist the current queue to both localStorage and IndexedDB
   */
  private persistQueue() {
    try {
      localStorage.setItem(STORAGE_OFFLINE_QUEUE_KEY, JSON.stringify(this.queue));
    } catch (e) {
      console.warn('[OfflineQueue] Failed to save queue to localStorage:', e);
    }

    this.notifyListeners();
  }

  /**
   * Subscribe to queue changes
   */
  public subscribe(cb: QueueChangeCallback): () => void {
    this.listeners.add(cb);
    // Trigger immediate call with current state
    cb(this.getQueue());
    return () => {
      this.listeners.delete(cb);
    };
  }

  /**
   * Subscribe to single message delivery status changes
   */
  public onItemStatusChange(cb: QueueItemStatusCallback): () => void {
    this.itemListeners.add(cb);
    return () => {
      this.itemListeners.delete(cb);
    };
  }

  private notifyListeners() {
    const copy = [...this.queue];
    this.listeners.forEach((cb) => {
      try {
        cb(copy);
      } catch (e) {
        console.error(e);
      }
    });
  }

  private notifyItemStatus(item: QueuedMessagePayload, status: 'sending' | 'delivered' | 'failed') {
    this.itemListeners.forEach((cb) => {
      try {
        cb(item, status);
      } catch (e) {
        console.error(e);
      }
    });
  }

  /**
   * Get all messages currently in the offline queue
   */
  public getQueue(): QueuedMessagePayload[] {
    return [...this.queue];
  }

  /**
   * Get queued messages for a specific chat
   */
  public getQueuedForChat(chatId: string | number): QueuedMessagePayload[] {
    const targetStr = String(chatId).replace('-100', '').replace('-', '');
    return this.queue.filter((m) => {
      const msgChatStr = String(m.chat_id).replace('-100', '').replace('-', '');
      return msgChatStr === targetStr;
    });
  }

  /**
   * Get total count of pending messages
   */
  public getPendingCount(): number {
    return this.queue.filter((m) => m.status === 'queued' || m.status === 'sending').length;
  }

  /**
   * Enqueue a new message when offline or on network failure
   */
  public enqueue(msg: Omit<QueuedMessagePayload, 'retryCount' | 'status'> & { status?: 'queued' | 'sending' }): QueuedMessagePayload {
    const item: QueuedMessagePayload = {
      ...msg,
      retryCount: 0,
      status: msg.status || 'queued',
    };

    // Remove any existing with same id
    this.queue = this.queue.filter((m) => m.id !== item.id);
    this.queue.push(item);
    this.persistQueue();

    // Store in IndexedDB
    indexedDbService.enqueueOfflineMessage(item).catch(() => {});

    // Try registering background sync via Service Worker if supported
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready
        .then((reg: any) => {
          return reg.sync.register('sync-messages');
        })
        .catch(() => {});
    }

    return item;
  }

  /**
   * Remove a message from the queue after successful transmission
   */
  public dequeue(id: string) {
    this.queue = this.queue.filter((m) => m.id !== id);
    this.persistQueue();
    indexedDbService.removeOfflineMessage(id).catch(() => {});
  }

  /**
   * Update a specific queued message's state (e.g. error, retry count)
   */
  public updateStatus(id: string, updates: Partial<QueuedMessagePayload>) {
    const item = this.queue.find((m) => m.id === id);
    if (item) {
      Object.assign(item, updates);
      this.persistQueue();
      indexedDbService.updateOfflineMessage(id, updates).catch(() => {});
    }
  }

  /**
   * Clear all queued messages
   */
  public clearAll() {
    this.queue = [];
    this.persistQueue();
    indexedDbService.clearOfflineQueue().catch(() => {});
  }

  /**
   * Process and flush all queued messages sequentially
   * @param sendFn Custom async function that performs the actual network send request
   */
  public async flush(
    sendFn: (item: QueuedMessagePayload) => Promise<{ success: boolean; realId?: string | number; error?: string }>
  ): Promise<{ sent: number; failed: number; total: number }> {
    if (this.isProcessing) {
      return { sent: 0, failed: 0, total: this.queue.length };
    }

    if (!navigator.onLine) {
      return { sent: 0, failed: 0, total: this.queue.length };
    }

    this.isProcessing = true;
    let sentCount = 0;
    let failedCount = 0;

    // Process a snapshot copy in FIFO order
    const pendingItems = [...this.queue];

    for (const item of pendingItems) {
      if (!navigator.onLine) {
        // Lost connection mid-flush: stop further processing
        break;
      }

      // Mark as sending
      this.updateStatus(item.id, { status: 'sending', lastAttempt: Date.now() });
      this.notifyItemStatus(item, 'sending');

      try {
        const result = await sendFn(item);

        if (result.success) {
          sentCount++;
          this.notifyItemStatus({ ...item, status: 'delivered' }, 'delivered');
          this.dequeue(item.id);
        } else {
          failedCount++;
          const nextRetry = (item.retryCount || 0) + 1;
          this.updateStatus(item.id, {
            status: nextRetry >= 5 ? 'failed' : 'queued',
            retryCount: nextRetry,
            error: result.error || 'فشل الإرسال',
          });
          this.notifyItemStatus(item, 'failed');
        }
      } catch (err: any) {
        failedCount++;
        const nextRetry = (item.retryCount || 0) + 1;
        this.updateStatus(item.id, {
          status: 'queued',
          retryCount: nextRetry,
          error: err?.message || 'خطأ في الشبكة',
        });
        this.notifyItemStatus(item, 'failed');
      }

      // Small delay between sends to respect rate limits and order
      await new Promise((r) => setTimeout(r, 200));
    }

    this.isProcessing = false;
    return {
      sent: sentCount,
      failed: failedCount,
      total: pendingItems.length,
    };
  }
}

export const offlineQueueService = new OfflineQueueService();
