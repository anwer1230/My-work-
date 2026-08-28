// ============================================================================
// LocalStorage Caching Mechanism for Telegram Web App
// Enables instant offline rendering of chat lists & message history before
// synchronizing with live Telegram MTProto cloud servers.
// ============================================================================

const CACHE_KEYS = {
  CHATS: 'tg_cache_chats',
  MESSAGES_PREFIX: 'tg_cache_msgs_',
  CACHED_CHAT_IDS: 'tg_cache_chat_ids',
  PINNED_MSGS: 'tg_cache_pinned_msgs',
  LAST_SYNC: 'tg_cache_last_sync',
  USER_PROFILE: 'tg_cache_user_profile',
};

// Maximum messages to preserve per chat in localStorage to respect quota limits
const MAX_MESSAGES_PER_CHAT = 100;

/**
 * Safely parse JSON from localStorage with a fallback default.
 */
function safeGetJson<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined' || !window.localStorage) {
    return defaultValue;
  }
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`[StorageCache] Failed to parse key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Safely writes a JSON string to localStorage, evicting older caches if quota is exceeded.
 */
function safeSetJson(key: string, data: any): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error: any) {
    if (error && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
      console.warn('[StorageCache] LocalStorage quota exceeded. Pruning old message caches...');
      pruneOldestMessageCaches();
      try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
      } catch (retryError) {
        console.error('[StorageCache] Failed to write after prune:', retryError);
        return false;
      }
    }
    console.error(`[StorageCache] Failed to write key "${key}":`, error);
    return false;
  }
}

/**
 * Evicts the oldest message caches if localStorage runs low on space.
 */
function pruneOldestMessageCaches(): void {
  try {
    const chatIds = safeGetJson<string[]>(CACHE_KEYS.CACHED_CHAT_IDS, []);
    if (chatIds.length > 5) {
      // Remove the oldest 3 cached chats' message history
      const toRemove = chatIds.slice(0, 3);
      toRemove.forEach((cid) => {
        localStorage.removeItem(`${CACHE_KEYS.MESSAGES_PREFIX}${cid}`);
      });
      const remaining = chatIds.slice(3);
      localStorage.setItem(CACHE_KEYS.CACHED_CHAT_IDS, JSON.stringify(remaining));
    }
  } catch (e) {
    console.error('[StorageCache] Pruning error:', e);
  }
}

// ── CHAT LIST CACHE ─────────────────────────────────────────────────────────

/**
 * Persists the entire chat list to localStorage.
 */
export function saveCachedChats(chats: any[]): void {
  if (!Array.isArray(chats) || chats.length === 0) return;
  // Store lightweight version of chats
  const sanitizedChats = chats.map((c) => ({
    id: c.id,
    name: c.name || c.title || 'محادثة',
    title: c.title || c.name,
    lastMsg: c.lastMsg || '',
    lastMsgDate: c.lastMsgDate || Math.floor(Date.now() / 1000),
    unread: c.unread || 0,
    pinned: !!c.pinned,
    muted: !!c.muted,
    archived: !!c.archived,
    type: c.type || 'private',
    photo: c.photo || null,
    isOut: !!c.isOut,
    username: c.username || undefined,
    bio: c.bio || undefined,
    phone: c.phone || undefined,
  }));

  safeSetJson(CACHE_KEYS.CHATS, sanitizedChats);
  setLastSyncTimestamp();
}

/**
 * Retrieves the cached chat list from localStorage.
 */
export function getCachedChats(): any[] {
  return safeGetJson<any[]>(CACHE_KEYS.CHATS, []);
}

// ── MESSAGE HISTORY CACHE ───────────────────────────────────────────────────

/**
 * Persists message history for a specific chat ID to localStorage.
 */
export function saveCachedMessages(chatId: string | number, messages: any[]): void {
  if (!chatId || !Array.isArray(messages)) return;
  const cidStr = String(chatId).replace('-100', '').replace('-', '');

  // Truncate to the most recent N messages to avoid excessive storage use
  const recentMsgs = messages.slice(-MAX_MESSAGES_PER_CHAT).map((m) => ({
    id: m.id,
    chat_id: cidStr,
    sender_id: m.sender_id,
    sender_name: m.sender_name,
    out: !!m.out || !!m.from_me,
    from_me: !!m.from_me || !!m.out,
    text: m.text,
    media: m.media,
    type: m.type || (m.media ? 'photo' : 'text'),
    is_system: !!m.is_system,
    system_type: m.system_type,
    duration: m.duration,
    date: m.date,
    reactions: m.reactions || [],
    reply_to: m.reply_to,
    fwd_from: m.fwd_from,
    edited: m.edited,
  }));

  const key = `${CACHE_KEYS.MESSAGES_PREFIX}${cidStr}`;
  safeSetJson(key, recentMsgs);

  // Track cached chat IDs for LRU eviction
  try {
    const list = safeGetJson<string[]>(CACHE_KEYS.CACHED_CHAT_IDS, []);
    const filtered = list.filter((id) => id !== cidStr);
    filtered.push(cidStr);
    safeSetJson(CACHE_KEYS.CACHED_CHAT_IDS, filtered);
  } catch (_) {}
}

/**
 * Retrieves cached messages for a specific chat ID from localStorage.
 */
export function getCachedMessages(chatId: string | number): any[] {
  if (!chatId) return [];
  const cidStr = String(chatId).replace('-100', '').replace('-', '');
  const key = `${CACHE_KEYS.MESSAGES_PREFIX}${cidStr}`;
  return safeGetJson<any[]>(key, []);
}

/**
 * Loads all cached messages across all chats stored in localStorage into a map.
 */
export function getAllCachedMessages(): Record<string, any[]> {
  const result: Record<string, any[]> = {};
  const chatIds = safeGetJson<string[]>(CACHE_KEYS.CACHED_CHAT_IDS, []);

  for (const cid of chatIds) {
    const msgs = getCachedMessages(cid);
    if (msgs && msgs.length > 0) {
      result[cid] = msgs;
    }
  }
  return result;
}

// ── PINNED MESSAGES CACHE ───────────────────────────────────────────────────

export function saveCachedPinnedMessages(pinned: Record<string, any>): void {
  safeSetJson(CACHE_KEYS.PINNED_MSGS, pinned);
}

export function getCachedPinnedMessages(): Record<string, any> {
  return safeGetJson<Record<string, any>>(CACHE_KEYS.PINNED_MSGS, {});
}

// ── USER PROFILE CACHE ──────────────────────────────────────────────────────

export function saveCachedUserProfile(user: any): void {
  if (!user) return;
  safeSetJson(CACHE_KEYS.USER_PROFILE, user);
}

export function getCachedUserProfile(): any | null {
  return safeGetJson<any | null>(CACHE_KEYS.USER_PROFILE, null);
}

// ── SYNC METADATA & UTILITIES ───────────────────────────────────────────────

export function setLastSyncTimestamp(timestamp = Date.now()): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(CACHE_KEYS.LAST_SYNC, String(timestamp));
  }
}

export function getLastSyncTimestamp(): number | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  const raw = localStorage.getItem(CACHE_KEYS.LAST_SYNC);
  return raw ? parseInt(raw, 10) : null;
}

/**
 * Returns human readable status of cached data for offline UI indicators.
 */
export function getStorageCacheSummary(): {
  chatsCount: number;
  cachedChatsWithMessages: number;
  lastSyncFormatted: string;
  isAvailableOffline: boolean;
} {
  const chats = getCachedChats();
  const chatIds = safeGetJson<string[]>(CACHE_KEYS.CACHED_CHAT_IDS, []);
  const lastSync = getLastSyncTimestamp();

  let lastSyncFormatted = 'غير محدد';
  if (lastSync) {
    const diffSec = Math.floor((Date.now() - lastSync) / 1000);
    if (diffSec < 60) lastSyncFormatted = 'منذ لحظات';
    else if (diffSec < 3600) lastSyncFormatted = `منذ ${Math.floor(diffSec / 60)} دقيقة`;
    else lastSyncFormatted = new Date(lastSync).toLocaleTimeString();
  }

  return {
    chatsCount: chats.length,
    cachedChatsWithMessages: chatIds.length,
    lastSyncFormatted,
    isAvailableOffline: chats.length > 0,
  };
}

/**
 * Clear all localStorage cache data.
 */
export function clearStorageCache(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const chatIds = safeGetJson<string[]>(CACHE_KEYS.CACHED_CHAT_IDS, []);
    chatIds.forEach((cid) => {
      localStorage.removeItem(`${CACHE_KEYS.MESSAGES_PREFIX}${cid}`);
    });
    localStorage.removeItem(CACHE_KEYS.CHATS);
    localStorage.removeItem(CACHE_KEYS.CACHED_CHAT_IDS);
    localStorage.removeItem(CACHE_KEYS.PINNED_MSGS);
    localStorage.removeItem(CACHE_KEYS.LAST_SYNC);
    localStorage.removeItem(CACHE_KEYS.USER_PROFILE);
    console.log('[StorageCache] LocalStorage cache cleared successfully');
  } catch (e) {
    console.error('[StorageCache] Error clearing cache:', e);
  }
}
