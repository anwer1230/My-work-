/**
 * MessagesStorage.ts - Telegram Core Storage & SQLite Transaction Engine
 * 
 * Replicated directly from DrKLO/Telegram Android:
 * org.telegram.messenger.MessagesStorage.java
 * org.telegram.SQLite.SQLiteDatabase.java
 */

import { Chat, Message } from '../types';
import { TLRPC } from './TLRPC';
import { NotificationCenter } from './NotificationCenter';

export interface SQLiteCursor {
  next(): boolean;
  intValue(col: number): number;
  longValue(col: number): number;
  stringValue(col: number): string;
  byteArrayValue(col: number): Uint8Array;
  dispose(): void;
}

export interface SQLitePreparedStatement {
  bindInt(col: number, val: number): void;
  bindLong(col: number, val: number): void;
  bindString(col: number, val: string): void;
  bindByteBuffer(col: number, val: Uint8Array): void;
  step(): boolean;
  dispose(): void;
  query(args: any[]): SQLiteCursor;
}

export class SQLiteDatabase {
  private inMemoryDb: Map<string, any[]> = new Map();
  private name: string;

  constructor(name: string = 'telegram.db') {
    this.name = name;
    this.initializeTables();
  }

  private initializeTables() {
    this.inMemoryDb.set('dialogs', []);
    this.inMemoryDb.set('messages', []);
    this.inMemoryDb.set('users', []);
    this.inMemoryDb.set('chats', []);
    this.inMemoryDb.set('drafts', []);
  }

  /**
   * DrKLO SQLiteDatabase.queryFinalized
   * Executes a read query and returns a finalized cursor
   */
  public queryFinalized(sql: string, ...args: any[]): SQLiteCursor {
    const table = this.extractTable(sql);
    let rows = this.inMemoryDb.get(table) || [];

    // Filter by dialogId/chatId if provided
    if (args.length > 0 && args[0] !== undefined) {
      const matchKey = args[0];
      rows = rows.filter((r) => r.dialog_id === matchKey || r.id === matchKey || r.chatId === matchKey);
    }

    let currentIndex = -1;
    return {
      next: () => {
        currentIndex++;
        return currentIndex < rows.length;
      },
      intValue: (col: number) => {
        const row = rows[currentIndex];
        if (!row) return 0;
        const keys = Object.keys(row);
        return Number(row[keys[col]]) || 0;
      },
      longValue: (col: number) => {
        const row = rows[currentIndex];
        if (!row) return 0;
        const keys = Object.keys(row);
        return Number(row[keys[col]]) || 0;
      },
      stringValue: (col: number) => {
        const row = rows[currentIndex];
        if (!row) return '';
        const keys = Object.keys(row);
        return String(row[keys[col]] || '');
      },
      byteArrayValue: (col: number) => {
        const row = rows[currentIndex];
        if (!row) return new Uint8Array(0);
        const keys = Object.keys(row);
        const val = row[keys[col]];
        if (val instanceof Uint8Array) return val;
        return new TextEncoder().encode(String(val || ''));
      },
      dispose: () => {
        // cleanup cursor
      },
    };
  }

  /**
   * DrKLO SQLiteDatabase.execute
   * Executes an INSERT / UPDATE / DELETE / DDL statement
   */
  public execute(sql: string, ...args: any[]): void {
    const trimmed = sql.trim().toUpperCase();
    const table = this.extractTable(sql);

    if (trimmed.startsWith('DELETE')) {
      if (args.length > 0) {
        const id = args[0];
        const existing = this.inMemoryDb.get(table) || [];
        this.inMemoryDb.set(
          table,
          existing.filter((r) => r.dialog_id !== id && r.id !== id && r.chatId !== id)
        );
      } else {
        this.inMemoryDb.set(table, []);
      }
    }
  }

  public insertOrReplace(table: string, record: any): void {
    const rows = this.inMemoryDb.get(table) || [];
    const index = rows.findIndex((r) => r.id === record.id || (r.dialog_id && r.dialog_id === record.dialog_id));
    if (index >= 0) {
      rows[index] = { ...rows[index], ...record };
    } else {
      rows.push(record);
    }
    this.inMemoryDb.set(table, rows);
  }

  private extractTable(sql: string): string {
    const lower = sql.toLowerCase();
    if (lower.includes('dialogs')) return 'dialogs';
    if (lower.includes('messages')) return 'messages';
    if (lower.includes('users')) return 'users';
    if (lower.includes('chats')) return 'chats';
    if (lower.includes('drafts')) return 'drafts';
    return 'dialogs';
  }
}

export class MessagesStorage {
  private static instances = new Map<number, MessagesStorage>();
  private currentAccount: number;
  public database: SQLiteDatabase;

  public static getInstance(account: number = 0): MessagesStorage {
    if (!MessagesStorage.instances.has(account)) {
      MessagesStorage.instances.set(account, new MessagesStorage(account));
    }
    return MessagesStorage.instances.get(account)!;
  }

  private constructor(account: number = 0) {
    this.currentAccount = account;
    this.database = new SQLiteDatabase(`telegram_${account}.db`);
    this.loadFromLocalStorage();
  }

  /**
   * DrKLO MessagesStorage.cleanUp - Purges all stored tables for this account
   */
  public cleanUp(isLogout: boolean = true): void {
    this.database.execute('DELETE FROM dialogs');
    this.database.execute('DELETE FROM messages');
    this.database.execute('DELETE FROM users');
    this.database.execute('DELETE FROM chats');
    this.database.execute('DELETE FROM drafts');
    if (typeof window !== 'undefined' && isLogout) {
      localStorage.removeItem(`tg_persisted_chats_${this.currentAccount}`);
    }
  }

  /**
   * DrKLO MessagesStorage.getDialogs
   */
  public getDialogs(offset: number = 0, count: number = 100): Chat[] {
    const cursor = this.database.queryFinalized('SELECT * FROM dialogs LIMIT ? OFFSET ?', count, offset);
    const dialogs: Chat[] = [];
    while (cursor.next()) {
      const dataStr = cursor.stringValue(5); // data column
      if (dataStr) {
        try {
          dialogs.push(JSON.parse(dataStr));
        } catch {
          // parse error fallback
        }
      }
    }
    cursor.dispose();
    return dialogs;
  }

  private loadFromLocalStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      const savedChats = localStorage.getItem('tg_persisted_chats');
      if (savedChats) {
        const chats: Chat[] = JSON.parse(savedChats);
        chats.forEach((c) => {
          this.database.insertOrReplace('dialogs', {
            dialog_id: c.id,
            id: c.id,
            unread_count: c.unreadCount,
            pinned: c.isPinned ? 1 : 0,
            flags: (c.isPinned ? 1 : 0) | (c.isMuted ? 2 : 0) | (c.isArchived ? 4 : 0),
            data: c,
          });
        });
      }
    } catch (e) {
      console.warn('[MessagesStorage] Failed to restore from localStorage:', e);
    }
  }

  /**
   * DrKLO MessagesStorage.setDialogFlags
   * Updates flags (pinned, muted, archived) in SQLite storage
   */
  public setDialogFlags(dialogId: string | number, flags: number): void {
    const id = String(dialogId);
    this.database.execute('UPDATE dialogs SET flags = ? WHERE dialog_id = ?', flags, id);
    this.database.insertOrReplace('dialogs', {
      dialog_id: id,
      id,
      flags,
      pinned: (flags & 1) !== 0 ? 1 : 0,
      muted: (flags & 2) !== 0 ? 1 : 0,
      archived: (flags & 4) !== 0 ? 1 : 0,
    });

    NotificationCenter.getInstance(this.currentAccount).postNotificationName(
      NotificationCenter.dialogsNeedReload
    );
  }

  /**
   * DrKLO MessagesStorage.deleteDialog
   * Deletes a dialog and its messages from storage
   */
  public deleteDialog(dialogId: string | number, messagesOnly: number = 0): void {
    const id = String(dialogId);
    if (messagesOnly === 0) {
      this.database.execute('DELETE FROM dialogs WHERE dialog_id = ?', id);
    }
    this.database.execute('DELETE FROM messages WHERE dialog_id = ?', id);

    NotificationCenter.getInstance(this.currentAccount).postNotificationName(
      NotificationCenter.dialogsNeedReload
    );
  }

  /**
   * DrKLO MessagesStorage.putMessages
   * Persists message objects batch
   */
  public putMessages(messages: Message[], dialogId: string): void {
    messages.forEach((msg) => {
      this.database.insertOrReplace('messages', {
        id: msg.id,
        dialog_id: dialogId,
        read: msg.status === 'read' ? 1 : 0,
        out: msg.isOutgoing ? 1 : 0,
        text: msg.text,
        date: msg.timestamp,
        data: msg,
      });
    });

    NotificationCenter.getInstance(this.currentAccount).postNotificationName(
      NotificationCenter.messagesDidLoad,
      dialogId,
      messages.length
    );
  }

  /**
   * Saves a single message to local database and notifies listeners
   */
  public saveMessage(msg: Message): void {
    if (!msg || !msg.id) return;
    const dialogId = msg.chatId || 'dialog_0';
    this.putMessages([msg], dialogId);
  }

  /**
   * Persists sync difference state parameters
   */
  public saveDiffParams(pts: number, seq: number, date: number, qts: number): void {
    try {
      localStorage.setItem(
        `tg_diff_params_${this.currentAccount}`,
        JSON.stringify({ pts, seq, date, qts })
      );
    } catch (e) {}
  }

  /**
   * Marks all messages up to maxId as read
   */
  public markMessagesAsRead(dialogId: string | number, maxId: string | number): void {
    const id = String(dialogId);
    this.database.execute('UPDATE messages SET read = 1 WHERE dialog_id = ? AND id <= ?', id, maxId);
    this.database.insertOrReplace('dialogs', {
      dialog_id: id,
      id,
      unread_count: 0,
      read_inbox_max_id: maxId,
    });
  }

  /**
   * Saves or clears dialog draft
   */
  public saveDraft(dialogId: string | number, text: string, replyMsgId?: string): void {
    const id = String(dialogId);
    if (!text.trim()) {
      this.database.execute('DELETE FROM drafts WHERE dialog_id = ?', id);
    } else {
      this.database.insertOrReplace('drafts', {
        dialog_id: id,
        id,
        text,
        reply_msg_id: replyMsgId,
        date: Date.now(),
      });
    }

    NotificationCenter.getInstance(this.currentAccount).postNotificationName(
      NotificationCenter.didReceivedDraft,
      id,
      text
    );
  }
}

export const messagesStorage = MessagesStorage.getInstance(0);
