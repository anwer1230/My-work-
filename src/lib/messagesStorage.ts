// ============================================================================
// DrKLO/Telegram TMessagesProj: MessagesStorage.java Architecture
// Source: TMessagesProj/src/main/java/org/telegram/messenger/MessagesStorage.java
// ============================================================================

export class MessagesStorage {
  private static instances: MessagesStorage[] = [];
  private currentAccount: number;

  constructor(instance: number) {
    this.currentAccount = instance;
  }

  public static getInstance(num: number = 0): MessagesStorage {
    if (!MessagesStorage.instances[num]) {
      MessagesStorage.instances[num] = new MessagesStorage(num);
    }
    return MessagesStorage.instances[num];
  }

  /**
   * Deeply cleans all local tables, caches, and mock records for this account
   */
  public cleanup(isLogout: boolean = true) {
    try {
      const prefix = `tg_acc_${this.currentAccount}_`;
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith(prefix) || (this.currentAccount === 0 && (
          key.startsWith('tg_cached_') ||
          key.startsWith('tg_messages_') ||
          key === 'tg_chats' ||
          key === 'tg_dialogs' ||
          key === 'tg_demo_seeded' ||
          key === 'tg_pinned_msgs'
        )))) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch (e) {
      console.warn(`MessagesStorage[${this.currentAccount}] cleanup error:`, e);
    }
  }

  /**
   * Put dialogs in isolated storage
   */
  public putDialogs(dialogs: any[]) {
    try {
      const key = `tg_acc_${this.currentAccount}_dialogs`;
      localStorage.setItem(key, JSON.stringify(dialogs));
    } catch (e) {
      console.warn('Failed to save dialogs to storage:', e);
    }
  }

  /**
   * Get dialogs from isolated storage
   */
  public getDialogs(): any[] {
    try {
      const key = `tg_acc_${this.currentAccount}_dialogs`;
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to read dialogs from storage:', e);
    }
    return [];
  }
}
