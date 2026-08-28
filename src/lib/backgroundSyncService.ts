// ============================================================================
// TELEGRAM BACKGROUND SYNC & DATA PARITY SERVICE (DrKLO/Telegram Architecture)
// ============================================================================
// Handles Service Worker background sync, online event re-connections,
// offline outgoing message queue flushing, and chat list / message history sync
// from Telegram MTProto API.

import { indexedDbService, OfflineMessage } from './indexedDbService';
import { saveCachedChats, saveCachedMessages } from './storageCache';
import { ChatItem, MessageItem } from '../types';

export type SyncState = 'idle' | 'syncing' | 'offline' | 'error';

export interface SyncStats {
  pendingFlushed: number;
  chatsCount: number;
  activeChatUpdated: boolean;
  timestamp: number;
}

export type SyncCallback = (status: SyncState, stats?: SyncStats) => void;

class BackgroundSyncService {
  private syncState: SyncState = 'idle';
  private subscribers: Set<SyncCallback> = new Set();
  private swRegistration: ServiceWorkerRegistration | null = null;
  private isProcessingQueue = false;
  private activeChatId: string | number | null = null;
  private isInitialized = false;

  constructor() {
    this.syncState = typeof navigator !== 'undefined' && navigator.onLine ? 'idle' : 'offline';
  }

  /**
   * Initializes Service Worker registration, Background Sync API, and window online/offline listeners.
   */
  public async init(options?: {
    onChatsUpdated?: (chats: any[]) => void;
    onMessagesUpdated?: (chatId: string | number, messages: any[]) => void;
    onMessageStatusUpdated?: (tempId: string, serverMsg: any) => void;
    onSyncStatus?: SyncCallback;
  }): Promise<void> {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    if (options?.onSyncStatus) {
      this.subscribe(options.onSyncStatus);
    }

    // 1. Register Service Worker & Background Sync
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        this.swRegistration = reg;
        console.log('[Telegram Sync] Service Worker registered with scope:', reg.scope);

        // Listen for messages from Service Worker (e.g. background sync triggers)
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'TG_BACKGROUND_SYNC_TRIGGER') {
            console.log('[Telegram Sync] Received SW background sync trigger:', event.data.tag);
            this.performFullSync(options);
          }
        });
      } catch (err) {
        console.warn('[Telegram Sync] Service Worker registration failed:', err);
      }
    }

    // 2. Listen to browser Online / Offline events
    window.addEventListener('online', () => {
      console.log('[Telegram Sync] 🟢 Network restored (online event). Initiating MTProto parity sync...');
      this.setSyncState('syncing');
      this.performFullSync(options);
    });

    window.addEventListener('offline', () => {
      console.log('[Telegram Sync] 📡 Network disconnected (offline event).');
      this.setSyncState('offline');
    });

    // Initial check on boot: If online, check for pending offline queue
    if (navigator.onLine) {
      this.flushOfflineQueue(options?.onMessageStatusUpdated);
    }
  }

  public setActiveChat(chatId: string | number | null) {
    this.activeChatId = chatId;
  }

  public subscribe(cb: SyncCallback): () => void {
    this.subscribers.add(cb);
    cb(this.syncState);
    return () => {
      this.subscribers.delete(cb);
    };
  }

  private setSyncState(state: SyncState, stats?: SyncStats) {
    this.syncState = state;
    this.subscribers.forEach((cb) => {
      try {
        cb(state, stats);
      } catch (e) {
        console.error('[Telegram Sync] Error in subscriber callback:', e);
      }
    });
  }

  /**
   * Request Service Worker Background Sync if supported
   */
  public async requestBackgroundSync(tag: string = 'tg-outgoing-sync'): Promise<void> {
    try {
      if ('serviceWorker' in navigator && 'SyncManager' in window && this.swRegistration) {
        const reg = this.swRegistration as any;
        if (reg.sync && typeof reg.sync.register === 'function') {
          await reg.sync.register(tag);
          console.log(`[Telegram Sync] Background Sync registered tag: ${tag}`);
        }
      }
    } catch (err) {
      // Background Sync API might not be supported in all browsers (e.g. Safari / Firefox)
      console.log('[Telegram Sync] Background Sync registration bypassed:', err);
    }
  }

  /**
   * Enqueues an outgoing message when offline or on network failure
   */
  public async enqueueOutgoingMessage(msg: {
    id: string;
    chatId: string | number;
    text: string;
    replyTo?: any;
    media?: any;
    type?: string;
  }): Promise<void> {
    const offlineItem: OfflineMessage = {
      id: msg.id,
      chatId: msg.chatId,
      text: msg.text,
      timestamp: Math.floor(Date.now() / 1000),
      status: 'queued',
      replyTo: msg.replyTo,
      media: msg.media,
      type: msg.type || 'text',
      retryCount: 0,
    };

    await indexedDbService.enqueueOfflineMessage(offlineItem);
    console.log(`[Telegram Sync] Enqueued offline message: ${msg.id} for chat ${msg.chatId}`);

    // Request SW background sync
    await this.requestBackgroundSync('tg-outgoing-sync');
  }

  /**
   * Flushes all pending outgoing messages from IndexedDB queue to MTProto API
   */
  public async flushOfflineQueue(
    onMessageStatusUpdated?: (tempId: string, serverMsg: any) => void
  ): Promise<number> {
    if (this.isProcessingQueue || !navigator.onLine) return 0;
    this.isProcessingQueue = true;

    let flushedCount = 0;
    try {
      const queue = await indexedDbService.getOfflineQueue();
      if (!queue || queue.length === 0) {
        this.isProcessingQueue = false;
        return 0;
      }

      console.log(`[Telegram Sync] Flushing ${queue.length} pending outgoing messages...`);

      for (const item of queue) {
        if (!navigator.onLine) break;

        try {
          await indexedDbService.updateOfflineMessage(item.id, { status: 'sending' });

          const response = await fetch('/api/messages/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: item.chatId,
              text: item.text,
              reply_to_msg_id: item.replyTo?.id,
            }),
          });

          const data = await response.json();
          if (data.success) {
            // Remove from offline queue
            await indexedDbService.removeOfflineMessage(item.id);
            flushedCount++;

            if (onMessageStatusUpdated) {
              onMessageStatusUpdated(item.id, data.message || data);
            }
          } else {
            const nextRetry = (item.retryCount || 0) + 1;
            await indexedDbService.updateOfflineMessage(item.id, {
              status: nextRetry > 5 ? 'failed' : 'queued',
              retryCount: nextRetry,
              error: data.error || 'Server error',
            });
          }
        } catch (msgErr: any) {
          console.warn(`[Telegram Sync] Failed to send queued message ${item.id}:`, msgErr);
          const nextRetry = (item.retryCount || 0) + 1;
          await indexedDbService.updateOfflineMessage(item.id, {
            status: nextRetry > 5 ? 'failed' : 'queued',
            retryCount: nextRetry,
            error: msgErr?.message || 'Network error',
          });
        }
      }
    } catch (err) {
      console.error('[Telegram Sync] Error processing offline message queue:', err);
    } finally {
      this.isProcessingQueue = false;
    }

    return flushedCount;
  }

  /**
   * Performs full synchronization with Telegram MTProto Cloud:
   * 1. Flushes pending outgoing messages.
   * 2. Re-fetches chat list & dialogs.
   * 3. Re-fetches active chat message history if a chat is currently open.
   */
  public async performFullSync(options?: {
    onChatsUpdated?: (chats: any[]) => void;
    onMessagesUpdated?: (chatId: string | number, messages: any[]) => void;
    onMessageStatusUpdated?: (tempId: string, serverMsg: any) => void;
  }): Promise<SyncStats> {
    if (!navigator.onLine) {
      this.setSyncState('offline');
      return { pendingFlushed: 0, chatsCount: 0, activeChatUpdated: false, timestamp: Date.now() };
    }

    this.setSyncState('syncing');

    let flushed = 0;
    let chatsCount = 0;
    let activeChatUpdated = false;

    try {
      // 1. Flush pending offline outgoing messages
      flushed = await this.flushOfflineQueue(options?.onMessageStatusUpdated);

      // 2. Fetch fresh chat list from MTProto
      try {
        const chatsRes = await fetch('/api/chats');
        const chatsData = await chatsRes.json();
        if (chatsData.success && chatsData.chats) {
          chatsCount = chatsData.chats.length;
          const mapped: ChatItem[] = chatsData.chats.map((c: any) => {
            const chatType = c.is_channel ? 'channel' : c.is_group ? 'group' : c.type || 'private';
            return {
              id: c.id,
              name: c.title || c.name || 'محادثة',
              title: c.title || c.name || 'محادثة',
              lastMsg: c.last_message?.text || c.last_msg || '',
              lastMsgDate: c.last_message?.date || c.date || Math.floor(Date.now() / 1000),
              unread: c.unread_count || c.unread || 0,
              pinned: c.pinned || c.is_pinned || false,
              muted: c.is_muted || false,
              archived: c.is_archived || false,
              type: chatType,
              photo: c.photo || c.avatar || null,
              isOut: c.last_message?.out || c.last_message?.from_me || false,
              username: c.username,
              bio: c.description,
            };
          });

          // Save to local persistence & trigger callback
          saveCachedChats(mapped);
          await indexedDbService.saveChats(mapped).catch(() => {});
          if (options?.onChatsUpdated) {
            options.onChatsUpdated(mapped);
          }
        }
      } catch (chatFetchErr) {
        console.warn('[Telegram Sync] Error fetching fresh chats during sync:', chatFetchErr);
      }

      // 3. Fetch active chat messages if a chat is currently open
      if (this.activeChatId) {
        try {
          const cid = this.activeChatId;
          const msgsRes = await fetch(`/api/chats/${cid}/messages`);
          const msgsData = await msgsRes.json();
          if (msgsData.success && msgsData.messages) {
            activeChatUpdated = true;
            const fetchedMsgs: MessageItem[] = msgsData.messages.map((m: any) => ({
              ...m,
              type: m.type || (m.media ? (m.media.includes('blob:') || m.media.includes('.mp3') ? 'voice' : 'photo') : 'text'),
            }));

            saveCachedMessages(cid, fetchedMsgs);
            await indexedDbService.saveMessages(Number(cid) || cid as any, fetchedMsgs).catch(() => {});
            if (options?.onMessagesUpdated) {
              options.onMessagesUpdated(cid, fetchedMsgs);
            }
          }
        } catch (msgFetchErr) {
          console.warn(`[Telegram Sync] Error syncing active chat ${this.activeChatId} messages:`, msgFetchErr);
        }
      }

      const stats: SyncStats = {
        pendingFlushed: flushed,
        chatsCount,
        activeChatUpdated,
        timestamp: Date.now(),
      };

      this.setSyncState('idle', stats);
      return stats;
    } catch (error) {
      console.error('[Telegram Sync] Full sync error:', error);
      this.setSyncState('error');
      return { pendingFlushed: flushed, chatsCount, activeChatUpdated, timestamp: Date.now() };
    }
  }
}

export const backgroundSyncService = new BackgroundSyncService();
