/**
 * Enhanced Telegram Chat Sorting Logic with 'last-active' priority for group chats.
 *
 * Ensures:
 * 1. Pinned conversations pinned to top.
 * 2. Active group chats with recent system activity (admin events, member updates, radar alerts)
 *    receive priority ranking and sort by their most recent active timestamp.
 * 3. Most recent active conversations sorted descending by effective last-active timestamp.
 */

export interface SortableChat {
  id: string | number;
  type?: string;
  pinned?: boolean;
  is_pinned?: boolean;
  lastMsgDate?: number;
  date?: number;
  last_system_activity?: number;
  has_system_activity?: boolean;
  lastSystemActivity?: number;
  hasRecentSystemActivity?: boolean;
  [key: string]: any;
}

export interface ActivityTimestampResult {
  effectiveTime: number;
  latestSysDate: number;
  hasSystemActivity: boolean;
}

/**
 * Calculates the effective sorting timestamp for a chat.
 * Considers:
 * 1. Base last message timestamp
 * 2. Latest system activity timestamp (admin actions, member events, radar alerts)
 * 3. Recent messages from the messages map if provided
 */
export function getChatEffectiveActivityTimestamp(
  chat: SortableChat,
  chatMessages?: Array<{ date?: string | number; is_system?: boolean; type?: string; system_type?: string }>
): ActivityTimestampResult {
  let baseMsgDate = 0;
  if (typeof chat.lastMsgDate === 'number') {
    baseMsgDate = chat.lastMsgDate;
  } else if (typeof chat.date === 'number') {
    baseMsgDate = chat.date;
  }

  let sysActivityDate = chat.last_system_activity || chat.lastSystemActivity || 0;
  let hasSysActivity = Boolean(chat.has_system_activity || chat.hasRecentSystemActivity || sysActivityDate > 0);

  if (chatMessages && chatMessages.length > 0) {
    for (const msg of chatMessages) {
      const msgDate = typeof msg.date === 'number'
        ? msg.date
        : typeof msg.date === 'string'
        ? Math.floor(new Date(msg.date).getTime() / 1000) || 0
        : 0;

      if (msgDate > baseMsgDate) {
        baseMsgDate = msgDate;
      }

      const isSysMsg = msg.is_system || msg.type === 'system' || Boolean(msg.system_type);
      if (isSysMsg) {
        hasSysActivity = true;
        if (msgDate > sysActivityDate) {
          sysActivityDate = msgDate;
        }
      }
    }
  }

  const effectiveTime = Math.max(baseMsgDate, sysActivityDate);
  return { effectiveTime, latestSysDate: sysActivityDate, hasSystemActivity: hasSysActivity };
}

/**
 * Checks whether a chat is a group or supergroup
 */
export function isGroupChat(chat: SortableChat): boolean {
  const t = String(chat.type || '').toLowerCase();
  return t === 'group' || t === 'supergroup' || Boolean(chat.is_group);
}

/**
 * Enhanced Telegram Chat Sorting Logic with 'last-active' priority for group chats:
 * 1. Pinned conversations ALWAYS pinned to top.
 * 2. Active group chats with recent system activity take priority ranking.
 * 3. Most recent active conversations sorted descending by effective last-active timestamp.
 */
export function sortChatsWithLastActivePriority<T extends SortableChat>(
  chatList: T[],
  messagesMap?: Record<string, any[]>
): T[] {
  return [...chatList].sort((a, b) => {
    // 1. Pinned conversations ALWAYS pinned to top
    const pinnedA = Boolean(a.pinned || a.is_pinned);
    const pinnedB = Boolean(b.pinned || b.is_pinned);
    if (pinnedA && !pinnedB) return -1;
    if (!pinnedA && pinnedB) return 1;

    // Resolve chat message history for accurate real-time timestamp calculation
    const rawIdA = String(a.id);
    const cleanIdA = rawIdA.replace('-100', '').replace('-', '');
    const msgsA = messagesMap ? (messagesMap[cleanIdA] || messagesMap[rawIdA] || []) : undefined;

    const rawIdB = String(b.id);
    const cleanIdB = rawIdB.replace('-100', '').replace('-', '');
    const msgsB = messagesMap ? (messagesMap[cleanIdB] || messagesMap[rawIdB] || []) : undefined;

    const actA = getChatEffectiveActivityTimestamp(a, msgsA);
    const actB = getChatEffectiveActivityTimestamp(b, msgsB);

    const isGroupA = isGroupChat(a);
    const isGroupB = isGroupChat(b);

    // Group chat with active recent system activity status:
    const hasRecentSysA = isGroupA && (actA.hasSystemActivity || actA.latestSysDate > 0);
    const hasRecentSysB = isGroupB && (actB.hasSystemActivity || actB.latestSysDate > 0);

    // Primary activity comparison: Sort descending by effective activity timestamp
    if (actA.effectiveTime !== actB.effectiveTime) {
      return actB.effectiveTime - actA.effectiveTime;
    }

    // In case of equal effective timestamps or ties, group chats with recent system activity take priority
    if (hasRecentSysA && !hasRecentSysB) return -1;
    if (!hasRecentSysA && hasRecentSysB) return 1;

    // Fallback comparison for group chats over non-group chats when timestamps tie
    if (isGroupA && !isGroupB) return -1;
    if (!isGroupA && isGroupB) return 1;

    return 0;
  });
}
