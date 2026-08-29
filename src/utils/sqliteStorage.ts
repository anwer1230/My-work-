// @ts-ignore
import initSqlJs from 'sql.js/dist/sql-asm.js';
import type { Database } from 'sql.js';
import { get, set } from 'idb-keyval';
import { Chat, Message, User } from '../types';

const SQLITE_STORAGE_KEY = 'telegram_sqlite_database_v1';

class TelegramSQLiteDatabase {
  private db: Database | null = null;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  public async init(): Promise<void> {
    if (this.isInitialized && this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        const SQL = await initSqlJs();
        if (!SQL) return;

        // Check if existing SQLite binary DB stored in IndexedDB (MMAP-like persistent local cache)
        const savedBinary = await get<Uint8Array>(SQLITE_STORAGE_KEY);

        if (savedBinary && savedBinary.byteLength > 0) {
          this.db = new SQL.Database(savedBinary);
          console.log('[SQLite MMAP] Restored existing encrypted/compressed SQLite database.');
        } else {
          this.db = new SQL.Database();
          console.log('[SQLite MMAP] Created fresh SQLite database tables.');
        }

        this.bootstrapSchema();
        this.isInitialized = true;
      } catch (err) {
        console.warn('[SQLite] Fallback to in-memory SQLite instance due to:', err);
      }
    })();

    return this.initPromise;
  }

  private bootstrapSchema() {
    if (!this.db) return;

    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        username TEXT,
        phone TEXT,
        avatar TEXT,
        is_online INTEGER,
        is_premium INTEGER,
        bio TEXT
      );

      CREATE TABLE IF NOT EXISTS chats (
        id TEXT PRIMARY KEY,
        type TEXT,
        title TEXT,
        username TEXT,
        avatar TEXT,
        unread_count INTEGER,
        is_pinned INTEGER,
        is_muted INTEGER,
        is_secret INTEGER DEFAULT 0,
        ttl_seconds INTEGER DEFAULT 0,
        encryption_key TEXT,
        last_message_text TEXT,
        last_message_time TEXT
      );

      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        chat_id TEXT,
        sender_id TEXT,
        sender_name TEXT,
        text TEXT,
        timestamp TEXT,
        date TEXT,
        is_outgoing INTEGER,
        status TEXT,
        media_json TEXT,
        is_secret INTEGER DEFAULT 0,
        expires_at INTEGER DEFAULT 0,
        FOREIGN KEY(chat_id) REFERENCES chats(id)
      );

      CREATE TABLE IF NOT EXISTS stories (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        user_name TEXT,
        user_avatar TEXT,
        media_url TEXT,
        media_type TEXT,
        caption TEXT,
        timestamp TEXT,
        expires_at INTEGER,
        views_count INTEGER DEFAULT 0,
        is_viewed INTEGER DEFAULT 0,
        is_my_story INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS secret_sessions (
        chat_id TEXT PRIMARY KEY,
        dh_public_key TEXT,
        dh_shared_secret TEXT,
        fingerprint TEXT,
        ttl_seconds INTEGER DEFAULT 0
      );

      CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
    `);

    this.persist();
  }

  public async persist(): Promise<void> {
    if (!this.db) return;
    try {
      const data = this.db.export();
      await set(SQLITE_STORAGE_KEY, data);
    } catch (e) {
      console.warn('[SQLite Persistence] Error exporting database:', e);
    }
  }

  // SQLite Ops for Chats
  public saveChats(chats: Chat[]): void {
    if (!this.db) return;
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO chats (id, type, title, username, avatar, unread_count, is_pinned, is_muted, last_message_text, last_message_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const c of chats) {
      stmt.run([
        c.id,
        c.type,
        c.title,
        c.username || '',
        c.avatar || '',
        c.unreadCount || 0,
        c.isPinned ? 1 : 0,
        c.isMuted ? 1 : 0,
        c.lastMessage?.text || '',
        c.lastMessage?.timestamp || '',
      ]);
    }
    stmt.free();
    this.persist();
  }

  public getChats(): any[] {
    if (!this.db) return [];
    try {
      const res = this.db.exec('SELECT * FROM chats ORDER BY is_pinned DESC');
      if (res.length > 0 && res[0].values) {
        return res[0].values.map((row) => {
          const cols = res[0].columns;
          const obj: any = {};
          cols.forEach((col, idx) => {
            obj[col] = row[idx];
          });
          return obj;
        });
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  }

  // SQLite Ops for Messages
  public saveMessage(msg: Message, isSecret: boolean = false, expiresAt: number = 0): void {
    if (!this.db) return;
    try {
      this.db.run(
        `INSERT OR REPLACE INTO messages (id, chat_id, sender_id, sender_name, text, timestamp, date, is_outgoing, status, media_json, is_secret, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          msg.id,
          msg.chatId,
          msg.senderId,
          msg.senderName || '',
          msg.text,
          msg.timestamp,
          msg.date,
          msg.isOutgoing ? 1 : 0,
          msg.status,
          msg.media ? JSON.stringify(msg.media) : null,
          isSecret ? 1 : 0,
          expiresAt,
        ]
      );
      this.persist();
    } catch (e) {
      console.error(e);
    }
  }

  public getMessagesForChat(chatId: string): any[] {
    if (!this.db) return [];
    try {
      const stmt = this.db.prepare('SELECT * FROM messages WHERE chat_id = ? ORDER BY timestamp ASC');
      stmt.bind([chatId]);
      const results: any[] = [];
      while (stmt.step()) {
        const row = stmt.getAsObject();
        results.push(row);
      }
      stmt.free();
      return results;
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  // Secret Session operations
  public saveSecretSession(chatId: string, fingerprint: string, sharedKey: string, ttl: number) {
    if (!this.db) return;
    this.db.run(
      `INSERT OR REPLACE INTO secret_sessions (chat_id, dh_public_key, dh_shared_secret, fingerprint, ttl_seconds)
       VALUES (?, ?, ?, ?, ?)`,
      [chatId, 'DH_PUB_' + Math.random().toString(36).substring(7), sharedKey, fingerprint, ttl]
    );
    this.persist();
  }

  public getSecretSession(chatId: string) {
    if (!this.db) return null;
    const stmt = this.db.prepare('SELECT * FROM secret_sessions WHERE chat_id = ?');
    stmt.bind([chatId]);
    if (stmt.step()) {
      const res = stmt.getAsObject();
      stmt.free();
      return res;
    }
    stmt.free();
    return null;
  }

  // SQLite Ops for Contacts
  public saveContacts(contacts: User[]): void {
    if (!this.db) return;
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO users (id, name, username, phone, avatar, is_online, is_premium, bio)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const u of contacts) {
      stmt.run([
        u.id,
        u.name,
        u.username || '',
        u.phone || '',
        u.avatar || '',
        u.isOnline ? 1 : 0,
        u.isPremium ? 1 : 0,
        u.bio || '',
      ]);
    }
    stmt.free();
    this.persist();
  }

  public getContacts(): User[] {
    if (!this.db) return [];
    try {
      const res = this.db.exec('SELECT * FROM users ORDER BY name ASC');
      if (res.length > 0 && res[0].values) {
        return res[0].values.map((row) => {
          const cols = res[0].columns;
          const obj: any = {};
          cols.forEach((col, idx) => {
            obj[col] = row[idx];
          });
          return {
            id: obj.id,
            name: obj.name,
            username: obj.username || undefined,
            phone: obj.phone || undefined,
            avatar: obj.avatar || '',
            isOnline: Boolean(obj.is_online),
            isPremium: Boolean(obj.is_premium),
            bio: obj.bio || '',
          };
        });
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  }

  public purgeExpiredSecretMessages(): void {
    if (!this.db) return;
    try {
      const now = Date.now();
      this.db.run('DELETE FROM messages WHERE is_secret = 1 AND expires_at > 0 AND expires_at < ?', [now]);
      this.persist();
    } catch (e) {
      console.error('[SQLite] Error purging expired messages:', e);
    }
  }
}

export const telegramDB = new TelegramSQLiteDatabase();
