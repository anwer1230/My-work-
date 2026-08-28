// ============================================================================
// DrKLO/Telegram TMessagesProj: MessagesController.java Architecture
// Source: TMessagesProj/src/main/java/org/telegram/messenger/MessagesController.java
// ============================================================================

import { UserConfig, TLRPCUser } from './userConfig';
import { MessagesStorage } from './messagesStorage';
import { ConnectionsManager } from './connectionsManager';

export interface TLRPCMessage {
  id: string | number;
  chat_id: string | number;
  sender_id: string | number;
  sender_name?: string;
  text?: string;
  date: number;
  is_outgoing?: boolean;
  [key: string]: any;
}

export interface TLRPCDialog {
  id: string | number;
  name?: string;
  title?: string;
  unread?: number;
  pinned?: boolean;
  type?: string;
  photo?: string | null;
  lastMsg?: string;
  lastMsgDate?: number;
  [key: string]: any;
}

export class MessagesController {
  private static instances: MessagesController[] = [];
  private currentAccount: number;

  public chats: Map<string | number, any> = new Map();
  public users: Map<string | number, TLRPCUser> = new Map();
  public dialogs: TLRPCDialog[] = [];
  public dialogs_dict: Map<string | number, TLRPCDialog> = new Map();

  private listeners: Set<(event: string, data?: any) => void> = new Set();

  constructor(instance: number) {
    this.currentAccount = instance;
  }

  public static getInstance(num: number = 0): MessagesController {
    if (!MessagesController.instances[num]) {
      MessagesController.instances[num] = new MessagesController(num);
    }
    return MessagesController.instances[num];
  }

  public addListener(listener: (event: string, data?: any) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(event: string, data?: any) {
    this.listeners.forEach((cb) => {
      try {
        cb(event, data);
      } catch (e) {
        console.error('MessagesController listener error:', e);
      }
    });
  }

  /**
   * Complete in-memory and storage cleanup when logging out or switching to a real account
   */
  public cleanup() {
    this.chats.clear();
    this.users.clear();
    this.dialogs = [];
    this.dialogs_dict.clear();

    // Clean isolated account storage
    MessagesStorage.getInstance(this.currentAccount).cleanup(true);
    this.notify('dialogsNeedReload', []);
  }

  public putUser(user: TLRPCUser, override: boolean = false) {
    if (!user || user.id === undefined) return;
    if (override || !this.users.has(user.id)) {
      this.users.set(user.id, user);
    }
  }

  public putUsers(users: TLRPCUser[], override: boolean = false) {
    if (!Array.isArray(users)) return;
    users.forEach((u) => this.putUser(u, override));
  }

  public putChat(chat: any, override: boolean = false) {
    if (!chat || chat.id === undefined) return;
    if (override || !this.chats.has(chat.id)) {
      this.chats.set(chat.id, chat);
    }
  }

  public putChats(chats: any[], override: boolean = false) {
    if (!Array.isArray(chats)) return;
    chats.forEach((c) => this.putChat(c, override));
  }

  public getUser(userId: string | number): TLRPCUser | null {
    return this.users.get(userId) || null;
  }

  public getChat(chatId: string | number): any | null {
    return this.chats.get(chatId) || null;
  }

  /**
   * Called immediately on real Telegram authorization (TL_auth_authorization)
   * Purges all mock data and syncs real dialogs directly from the cloud DC
   */
  public async onAuthSuccess(authResult: { user?: TLRPCUser; session?: string; dialogs?: TLRPCDialog[] }) {
    // 1. Purge all prior demo/mock cache and RAM structures
    this.cleanup();

    // 2. Register active real user
    if (authResult.user) {
      UserConfig.getInstance(this.currentAccount).setCurrentUser(authResult.user, true);
      this.putUser(authResult.user, true);
    }

    // 3. Purge server-side demo mock data
    try {
      await fetch('/api/telegram/account/purgeDemo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (e) {
      console.warn('Server demo purge notice:', e);
    }

    // 4. Load real cloud dialogs
    if (authResult.dialogs && authResult.dialogs.length > 0) {
      this.dialogs = authResult.dialogs;
      this.dialogs.forEach((d) => this.dialogs_dict.set(d.id, d));
      MessagesStorage.getInstance(this.currentAccount).putDialogs(this.dialogs);
      this.notify('dialogsNeedReload', this.dialogs);
    } else {
      await this.loadDialogs(0, 100, true);
    }
  }

  /**
   * Loads real telegram dialogs with offset and limit
   */
  public async loadDialogs(offset: number = 0, limit: number = 100, reset: boolean = false): Promise<TLRPCDialog[]> {
    try {
      const res = await fetch(`/api/chats?offset=${offset}&limit=${limit}&account_id=${this.currentAccount}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.chats)) {
        if (reset) {
          this.dialogs = data.chats;
          this.dialogs_dict.clear();
        } else {
          const existingIds = new Set(this.dialogs.map((d) => d.id));
          data.chats.forEach((c: TLRPCDialog) => {
            if (!existingIds.has(c.id)) {
              this.dialogs.push(c);
            }
          });
        }

        data.chats.forEach((d: TLRPCDialog) => this.dialogs_dict.set(d.id, d));
        MessagesStorage.getInstance(this.currentAccount).putDialogs(this.dialogs);
        this.notify('dialogsNeedReload', this.dialogs);
        return this.dialogs;
      }
    } catch (e) {
      console.error('MessagesController loadDialogs error:', e);
    }
    return this.dialogs;
  }
}
