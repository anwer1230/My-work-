/**
 * ============================================================================
 * Telegram Cloud Synchronization Engine (src/lib/sync.ts)
 * ============================================================================
 * Periodically requests /api/chats and /api/dialogs to keep the local state
 * updated with Telegram servers, manages network re-connections, foreground
 * synchronization, and informs subscribers of updated chat & dialog states.
 */

import { saveCachedChats } from './storageCache';

export interface SyncOptions {
  intervalMs?: number; // Polling interval in ms (default: 15000ms / 15s)
  onChatsUpdated?: (chats: any[]) => void;
  onDialogsUpdated?: (dialogs: any[]) => void;
  onError?: (error: any) => void;
  onSyncStateChange?: (state: SyncState) => void;
}

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

export interface SyncState {
  status: SyncStatus;
  lastSyncTime: number | null;
  error: string | null;
  syncCount: number;
}

class TelegramSyncEngine {
  private timerId: any = null;
  private intervalMs: number = 15000;
  private isRunning: boolean = false;
  private isSyncing: boolean = false;
  private options: SyncOptions = {};
  private syncState: SyncState = {
    status: 'idle',
    lastSyncTime: null,
    error: null,
    syncCount: 0,
  };
  private listeners: Set<(state: SyncState) => void> = new Set();
  private chatListeners: Set<(chats: any[]) => void> = new Set();
  private dialogListeners: Set<(dialogs: any[]) => void> = new Set();

  constructor() {
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleOnline = this.handleOnline.bind(this);
    this.handleWindowFocus = this.handleWindowFocus.bind(this);
  }

  /**
   * Initialize and start the synchronization loop
   */
  public start(options: SyncOptions = {}): void {
    this.options = { ...this.options, ...options };
    if (options.intervalMs && options.intervalMs >= 3000) {
      this.intervalMs = options.intervalMs;
    }

    if (options.onChatsUpdated) this.chatListeners.add(options.onChatsUpdated);
    if (options.onDialogsUpdated) this.dialogListeners.add(options.onDialogsUpdated);
    if (options.onSyncStateChange) this.listeners.add(options.onSyncStateChange);

    if (this.isRunning) {
      // If already running, perform an immediate trigger
      this.syncNow();
      return;
    }

    this.isRunning = true;
    this.setupEventListeners();

    // Trigger initial synchronization immediately
    this.syncNow();

    // Start recurring polling interval
    this.scheduleNextSync();
  }

  /**
   * Stop the synchronization engine and cleanup timers/listeners
   */
  public stop(): void {
    this.isRunning = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.removeEventListeners();
    this.updateState({ status: 'idle' });
  }

  /**
   * Force an immediate synchronization cycle with Telegram backend (/api/chats & /api/dialogs)
   */
  public async syncNow(): Promise<{ success: boolean; chats?: any[]; dialogs?: any[] }> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.updateState({ status: 'offline', error: 'Network is offline' });
      return { success: false };
    }

    if (this.isSyncing) {
      return { success: false };
    }

    this.isSyncing = true;
    this.updateState({ status: 'syncing', error: null });

    try {
      // Execute /api/chats and /api/dialogs requests in parallel
      const [chatsRes, dialogsRes] = await Promise.allSettled([
        fetch('/api/chats', { headers: { 'Cache-Control': 'no-cache' } }),
        fetch('/api/dialogs', { headers: { 'Cache-Control': 'no-cache' } }),
      ]);

      let fetchedChats: any[] = [];
      let fetchedDialogs: any[] = [];
      let anySuccess = false;

      // Handle /api/chats response
      if (chatsRes.status === 'fulfilled' && chatsRes.value.ok) {
        try {
          const chatsData = await chatsRes.value.json();
          if (chatsData.success && Array.isArray(chatsData.chats)) {
            fetchedChats = chatsData.chats;
            anySuccess = true;
            saveCachedChats(fetchedChats);
            this.notifyChats(fetchedChats);
          }
        } catch (err) {
          console.warn('[SyncEngine] Error parsing /api/chats response:', err);
        }
      }

      // Handle /api/dialogs response
      if (dialogsRes.status === 'fulfilled' && dialogsRes.value.ok) {
        try {
          const dialogsData = await dialogsRes.value.json();
          if (dialogsData.success && Array.isArray(dialogsData.chats)) {
            fetchedDialogs = dialogsData.chats;
            anySuccess = true;
            this.notifyDialogs(fetchedDialogs);
          }
        } catch (err) {
          console.warn('[SyncEngine] Error parsing /api/dialogs response:', err);
        }
      }

      if (anySuccess) {
        const now = Date.now();
        this.updateState({
          status: 'synced',
          lastSyncTime: now,
          error: null,
          syncCount: this.syncState.syncCount + 1,
        });
        return { success: true, chats: fetchedChats, dialogs: fetchedDialogs };
      } else {
        throw new Error('Both /api/chats and /api/dialogs failed to respond');
      }
    } catch (error: any) {
      const errMsg = error?.message || 'Sync failed';
      this.updateState({ status: 'error', error: errMsg });
      if (this.options.onError) {
        this.options.onError(error);
      }
      return { success: false };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Subscribe to sync state updates
   */
  public onStateChange(callback: (state: SyncState) => void): () => void {
    this.listeners.add(callback);
    callback(this.syncState);
    return () => this.listeners.delete(callback);
  }

  /**
   * Subscribe to chats updates
   */
  public onChats(callback: (chats: any[]) => void): () => void {
    this.chatListeners.add(callback);
    return () => this.chatListeners.delete(callback);
  }

  /**
   * Subscribe to dialogs updates
   */
  public onDialogs(callback: (dialogs: any[]) => void): () => void {
    this.dialogListeners.add(callback);
    return () => this.dialogListeners.delete(callback);
  }

  /**
   * Returns current sync state
   */
  public getState(): SyncState {
    return { ...this.syncState };
  }

  private retryCount: number = 0;
  private maxRetries: number = 8;
  private baseDelayMs: number = 2000;
  private maxDelayMs: number = 60000;

  // ── Internal Helpers ───────────────────────────────────────────────────────

  private scheduleNextSync(overrideDelayMs?: number): void {
    if (!this.isRunning) return;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }

    let delay = overrideDelayMs !== undefined ? overrideDelayMs : this.intervalMs;

    // Apply exponential backoff if in error or offline state
    if (this.syncState.status === 'error' || this.syncState.status === 'offline') {
      const exponential = Math.min(this.maxDelayMs, this.baseDelayMs * Math.pow(1.8, Math.min(this.retryCount, this.maxRetries)));
      // Add jitter
      delay = exponential + (Math.random() * 1500);
    }

    this.timerId = setTimeout(async () => {
      if (this.isRunning) {
        const res = await this.syncNow();
        if (res.success) {
          this.retryCount = 0;
          this.scheduleNextSync(this.intervalMs);
        } else {
          this.retryCount++;
          this.scheduleNextSync();
        }
      }
    }, delay);
  }

  private updateState(partial: Partial<SyncState>): void {
    this.syncState = { ...this.syncState, ...partial };
    this.listeners.forEach((cb) => {
      try {
        cb(this.syncState);
      } catch (e) {
        console.error('[SyncEngine] State subscriber callback error:', e);
      }
    });
  }

  private notifyChats(chats: any[]): void {
    this.chatListeners.forEach((cb) => {
      try {
        cb(chats);
      } catch (e) {
        console.error('[SyncEngine] Chats subscriber callback error:', e);
      }
    });
  }

  private notifyDialogs(dialogs: any[]): void {
    this.dialogListeners.forEach((cb) => {
      try {
        cb(dialogs);
      } catch (e) {
        console.error('[SyncEngine] Dialogs subscriber callback error:', e);
      }
    });
  }

  // ── Event Handlers ─────────────────────────────────────────────────────────

  private setupEventListeners(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('focus', this.handleWindowFocus);
    window.addEventListener('online', this.handleOnline);
  }

  private removeEventListeners(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('focus', this.handleWindowFocus);
    window.removeEventListener('online', this.handleOnline);
  }

  private handleVisibilityChange(): void {
    if (document.visibilityState === 'visible' && this.isRunning) {
      // When tab/app comes back into the foreground, sync immediately
      this.syncNow();
      this.scheduleNextSync();
    }
  }

  private handleWindowFocus(): void {
    if (this.isRunning) {
      this.syncNow();
      this.scheduleNextSync();
    }
  }

  private handleOnline(): void {
    if (this.isRunning) {
      this.syncNow();
      this.scheduleNextSync();
    }
  }
}

// Global Singleton Instance
export const syncEngine = new TelegramSyncEngine();

/**
 * Convenient helper function to trigger sync on startup / foreground
 */
export function triggerTelegramSync(): Promise<{ success: boolean; chats?: any[]; dialogs?: any[] }> {
  return syncEngine.syncNow();
}
