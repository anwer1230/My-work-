/**
 * MessagesController.ts - Telegram Core Message, Dialog & Moderation Engine
 * 
 * Replicated directly from DrKLO/Telegram Android:
 * org.telegram.messenger.MessagesController.java
 * org.telegram.messenger.MessagesStorage.java
 */

import { Chat, Message } from '../types';
import { TLRPC } from './TLRPC';
import { NotificationCenter } from './NotificationCenter';
import { MessagesStorage } from './MessagesStorage';
import { DialogsController } from './messenger/DialogsController';
import { UserConfig } from './messenger/UserConfig';

export interface ChatParticipantInfo {
  userId: string;
  name: string;
  username?: string;
  avatar?: string;
  role: 'creator' | 'admin' | 'member' | 'restricted' | 'banned';
  adminRights?: TLRPC.TL_chatAdminRights;
  bannedRights?: TLRPC.TL_chatBannedRights;
  canSendMessages?: boolean;
  canSendMedia?: boolean;
  canPinMessages?: boolean;
  canInviteUsers?: boolean;
  untilDate?: number;
}

export interface SlowmodeState {
  chatId: string;
  cooldownSeconds: number;
  lastSentTimestamp: number;
}

export interface GroupedMessageItem {
  type: 'message' | 'date_divider' | 'unread_divider';
  id: string;
  message?: Message;
  dateText?: string;
  isGroupStart?: boolean;
  isGroupMiddle?: boolean;
  isGroupEnd?: boolean;
  isSingle?: boolean;
}

export class MessagesController {
  private static instances = new Map<number, MessagesController>();
  private currentAccount: number = 0;

  // In-memory caching structures mimicking Android TL caches
  public dialogs: Chat[] = [];
  public users: Map<string, any> = new Map();
  public chats: Map<string, Chat> = new Map();
  public loadingDialogs: boolean = false;
  public dialogsEndReached: boolean = false;

  private participantsMap: Map<string, Map<string, ChatParticipantInfo>> = new Map();
  private slowmodeMap: Map<string, SlowmodeState> = new Map();
  private draftsMap: Map<string, { text: string; date: number }> = new Map();
  private adminOnlyPostingMap: Set<string> = new Set();
  private bannedUsersMap: Map<string, Set<string>> = new Map();

  public static getInstance(accountNum: number = 0): MessagesController {
    if (!MessagesController.instances.has(accountNum)) {
      MessagesController.instances.set(accountNum, new MessagesController(accountNum));
    }
    return MessagesController.instances.get(accountNum)!;
  }

  private constructor(accountNum: number = 0) {
    this.currentAccount = accountNum;
  }

  /**
   * Cleans up all in-memory dialogs, caches and user states (called on real auth or switch)
   */
  public cleanup(): void {
    this.dialogs = [];
    this.users.clear();
    this.chats.clear();
    this.participantsMap.clear();
    this.slowmodeMap.clear();
    this.draftsMap.clear();
    this.adminOnlyPostingMap.clear();
    this.bannedUsersMap.clear();
    this.loadingDialogs = false;
    this.dialogsEndReached = false;
  }

  /**
   * Loads dialogs either from persistent storage or cloud MTProto service
   */
  public loadDialogs(offset: number = 0, count: number = 100, fromCache: boolean = true): void {
    const userConfig = UserConfig.getInstance(this.currentAccount);
    if (!userConfig.isClientAuthorized()) {
      return;
    }

    if (fromCache) {
      const storage = MessagesStorage.getInstance(this.currentAccount);
      const stored = storage.getDialogs(offset, count);
      this.dialogs = stored;
      stored.forEach((c) => this.chats.set(c.id, c));
    }

    NotificationCenter.getInstance(this.currentAccount).postNotificationName(
      NotificationCenter.dialogsNeedReload
    );
  }

  public getParticipants(chatId: string): ChatParticipantInfo[] {
    let map = this.participantsMap.get(chatId);
    if (!map) {
      map = new Map();
      this.participantsMap.set(chatId, map);
    }
    return Array.from(map.values());
  }

  public isAdminOnlyPosting(chatId: string): boolean {
    return this.adminOnlyPostingMap.has(chatId);
  }

  public setAdminOnlyPosting(chatId: string, enabled: boolean) {
    if (enabled) {
      this.adminOnlyPostingMap.add(chatId);
    } else {
      this.adminOnlyPostingMap.delete(chatId);
    }
  }

  public setSlowMode(chatId: string, seconds: number) {
    this.slowmodeMap.set(chatId, {
      chatId,
      cooldownSeconds: seconds,
      lastSentTimestamp: 0,
    });
  }

  public async editAdminRights(chatId: string, userId: string, rights: TLRPC.TL_chatAdminRights) {
    let map = this.participantsMap.get(chatId);
    if (!map) {
      this.getParticipants(chatId);
      map = this.participantsMap.get(chatId)!;
    }
    const existing = map.get(userId);
    if (existing) {
      map.set(userId, {
        ...existing,
        role: 'admin',
        adminRights: rights,
        bannedRights: undefined,
        canSendMessages: true,
        canSendMedia: true,
        canPinMessages: rights.pin_messages,
        canInviteUsers: rights.invite_users,
      });
    }
  }

  public async editBannedRights(chatId: string, userId: string, rights: TLRPC.TL_chatBannedRights) {
    let map = this.participantsMap.get(chatId);
    if (!map) {
      this.getParticipants(chatId);
      map = this.participantsMap.get(chatId)!;
    }

    if (!this.bannedUsersMap.has(chatId)) {
      this.bannedUsersMap.set(chatId, new Set());
    }

    if (rights.view_messages === true || rights.send_messages === false) {
      this.bannedUsersMap.get(chatId)!.add(userId);
    }

    const existing = map.get(userId);
    if (existing) {
      map.set(userId, {
        ...existing,
        role: rights.view_messages === true ? 'banned' : 'restricted',
        bannedRights: rights,
        adminRights: undefined,
        canSendMessages: !rights.send_messages,
        canSendMedia: !rights.send_media,
      });
    }
  }

  public async unbanUser(chatId: string, userId: string) {
    const bannedSet = this.bannedUsersMap.get(chatId);
    if (bannedSet) {
      bannedSet.delete(userId);
    }

    const map = this.participantsMap.get(chatId);
    if (map) {
      const existing = map.get(userId);
      if (existing) {
        map.set(userId, {
          ...existing,
          role: 'member',
          bannedRights: undefined,
          canSendMessages: true,
          canSendMedia: true,
          canPinMessages: false,
          canInviteUsers: true,
        });
      }
    }
  }

  private getMessageEpoch(msg: Message | { date?: string; timestamp?: string; epoch?: number; rawDate?: number }): number {
    if (!msg) return 0;
    if (typeof (msg as any).epoch === 'number' && (msg as any).epoch > 0) {
      return (msg as any).epoch;
    }
    if (typeof (msg as any).rawDate === 'number' && (msg as any).rawDate > 0) {
      const rd = (msg as any).rawDate;
      return rd < 1e11 ? rd * 1000 : rd;
    }
    if (typeof (msg as any).timestamp === 'number') {
      const n = (msg as any).timestamp;
      return n < 1e11 ? n * 1000 : n;
    }
    if (msg.date) {
      const parsedFull = Date.parse(`${msg.date} ${msg.timestamp || '00:00'}`);
      if (!isNaN(parsedFull)) return parsedFull;
      const parsedDateOnly = Date.parse(msg.date);
      if (!isNaN(parsedDateOnly)) return parsedDateOnly;
    }
    if (msg.timestamp && typeof msg.timestamp === 'string') {
      const parsedDirect = Date.parse(msg.timestamp);
      if (!isNaN(parsedDirect)) return parsedDirect;
      // Handle "10:30 AM" or "22:15" format relative to today
      const timeMatch = msg.timestamp.match(/(\d{1,2}):(\d{2})(?:\s*(AM|PM|ص|م))?/i);
      if (timeMatch) {
        let hours = parseInt(timeMatch[1], 10);
        const minutes = parseInt(timeMatch[2], 10);
        const modifier = (timeMatch[3] || '').toUpperCase();
        if ((modifier === 'PM' || modifier === 'م') && hours < 12) hours += 12;
        if ((modifier === 'AM' || modifier === 'ص') && hours === 12) hours = 0;
        const d = new Date();
        d.setHours(hours, minutes, 0, 0);
        return d.getTime();
      }
    }
    return 0;
  }

  public canSendMessages(
    chat: Chat,
    currentUserId: string = 'user_me'
  ): {
    canSend: boolean;
    reason?: string;
    errorCode?: 'CHAT_WRITE_FORBIDDEN' | 'USER_BANNED_IN_CHANNEL' | 'SLOWMODE_WAIT_X' | 'CAPTCHA_REQUIRED' | 'ADMIN_ONLY';
    waitSeconds?: number;
  } {
    if (!chat) {
      return { canSend: false, reason: 'Chat is null', errorCode: 'CHAT_WRITE_FORBIDDEN' };
    }

    if (chat.requiresCaptcha && !chat.isCaptchaSolved) {
      return {
        canSend: false,
        reason: 'يرجى حل اختبار التحقق (Captcha) قبل الكتابة',
        errorCode: 'CAPTCHA_REQUIRED',
      };
    }

    if (chat.isReadOnly) {
      return {
        canSend: false,
        reason: 'هذه القناة للقراءة فقط، النشر مقتصر على المشرفين',
        errorCode: 'CHAT_WRITE_FORBIDDEN',
      };
    }

    if (chat.type === 'channel') {
      const chatRoles = this.participantsMap.get(chat.id);
      const userRole = chatRoles?.get(currentUserId);

      if (!userRole || (userRole.role !== 'creator' && userRole.role !== 'admin')) {
        return {
          canSend: false,
          reason: 'القنوات مخصصة لبث الرسائل بواسطة المشرفين فقط',
          errorCode: 'CHAT_WRITE_FORBIDDEN',
        };
      }
    }

    const bannedSet = this.bannedUsersMap.get(chat.id);
    if (bannedSet && bannedSet.has(currentUserId)) {
      return {
        canSend: false,
        reason: 'تم حظرك من إرسال الرسائل في هذه المجموعة',
        errorCode: 'USER_BANNED_IN_CHANNEL',
      };
    }

    if (this.adminOnlyPostingMap.has(chat.id) || chat.adminOnly) {
      const chatRoles = this.participantsMap.get(chat.id);
      const userRole = chatRoles?.get(currentUserId);
      if (!userRole || (userRole.role !== 'creator' && userRole.role !== 'admin')) {
        return {
          canSend: false,
          reason: 'تم تفعيل وضع المشرفين فقط بواسطة الإدارة',
          errorCode: 'ADMIN_ONLY',
        };
      }
    }

    const slowmode = this.slowmodeMap.get(chat.id);
    const cooldown = chat.slowModeSeconds || slowmode?.cooldownSeconds || 0;
    if (cooldown > 0 && slowmode?.lastSentTimestamp) {
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - slowmode.lastSentTimestamp) / 1000);
      const remaining = cooldown - elapsedSeconds;

      if (remaining > 0) {
        return {
          canSend: false,
          reason: `الوضع البطيء مفعّل. يرجى الانتظار ${remaining} ثانية`,
          errorCode: 'SLOWMODE_WAIT_X',
          waitSeconds: remaining,
        };
      }
    }

    return { canSend: true };
  }

  public recordMessageSent(chatId: string, cooldownSeconds: number = 0) {
    if (cooldownSeconds > 0) {
      this.slowmodeMap.set(chatId, {
        chatId,
        cooldownSeconds,
        lastSentTimestamp: Date.now(),
      });
    }
  }

  public sortDialogs(
    chats: Chat[],
    activeFolder: string = 'all',
    searchQuery: string = ''
  ): Chat[] {
    let list = [...chats];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.username?.toLowerCase().includes(q) ||
          c.lastMessage?.text?.toLowerCase().includes(q)
      );
    }

    if (activeFolder && activeFolder !== 'all') {
      list = list.filter((c) => {
        switch (activeFolder) {
          case 'unread':
            return c.unreadCount > 0;
          case 'personal':
          case 'direct':
            return c.type === 'private' || c.type === 'saved';
          case 'groups':
            return c.type === 'group';
          case 'channels':
            return c.type === 'channel';
          case 'bots':
            return c.type === 'bot';
          case 'archived':
            return !!c.isArchived;
          default:
            return true;
        }
      });
    } else {
      if (!searchQuery.trim()) {
        list = list.filter((c) => !c.isArchived);
      }
    }

    return list.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      if (a.isPinned && b.isPinned) {
        return (a.pinnedIndex ?? 0) - (b.pinnedIndex ?? 0);
      }

      const draftA = this.draftsMap.get(a.id)?.date || 0;
      const draftB = this.draftsMap.get(b.id)?.date || 0;

      const timeA = Math.max(this.getMessageEpoch(a.lastMessage as any), draftA);
      const timeB = Math.max(this.getMessageEpoch(b.lastMessage as any), draftB);

      return timeB - timeA;
    });
  }

  public sortAndGroupMessages(
    messages: Message[],
    readInboxMaxId?: string
  ): GroupedMessageItem[] {
    if (!messages || messages.length === 0) return [];

    const sorted = [...messages].sort((a, b) => {
      const epochA = this.getMessageEpoch(a);
      const epochB = this.getMessageEpoch(b);
      if (epochA !== epochB) return epochA - epochB;
      return (a.id || '').localeCompare(b.id || '');
    });

    const result: GroupedMessageItem[] = [];
    let lastDateStr = '';
    let hasInsertedUnread = false;

    for (let i = 0; i < sorted.length; i++) {
      const msg = sorted[i];
      const prevMsg = i > 0 ? sorted[i - 1] : null;
      const nextMsg = i < sorted.length - 1 ? sorted[i + 1] : null;

      const dateStr = msg.date || this.formatDateDivider(new Date(this.getMessageEpoch(msg) || Date.now()));
      if (dateStr !== lastDateStr) {
        result.push({
          type: 'date_divider',
          id: `divider_date_${dateStr}_${msg.id}`,
          dateText: dateStr,
        });
        lastDateStr = dateStr;
      }

      if (
        readInboxMaxId &&
        !hasInsertedUnread &&
        !msg.isOutgoing &&
        msg.id > readInboxMaxId
      ) {
        result.push({
          type: 'unread_divider',
          id: `divider_unread_${msg.id}`,
          dateText: 'رسائل غير مقروءة',
        });
        hasInsertedUnread = true;
      }

      const epochMsg = this.getMessageEpoch(msg);
      const epochPrev = prevMsg ? this.getMessageEpoch(prevMsg) : 0;
      const epochNext = nextMsg ? this.getMessageEpoch(nextMsg) : 0;

      const samePrev =
        prevMsg &&
        prevMsg.senderId === msg.senderId &&
        prevMsg.isOutgoing === msg.isOutgoing &&
        Math.abs(epochMsg - epochPrev) < 300000 &&
        (prevMsg.date || dateStr) === dateStr;

      const sameNext =
        nextMsg &&
        nextMsg.senderId === msg.senderId &&
        nextMsg.isOutgoing === msg.isOutgoing &&
        Math.abs(epochNext - epochMsg) < 300000 &&
        (nextMsg.date || dateStr) === dateStr;

      let isGroupStart = false;
      let isGroupMiddle = false;
      let isGroupEnd = false;
      let isSingle = false;

      if (!samePrev && !sameNext) {
        isSingle = true;
      } else if (!samePrev && sameNext) {
        isGroupStart = true;
      } else if (samePrev && sameNext) {
        isGroupMiddle = true;
      } else if (samePrev && !sameNext) {
        isGroupEnd = true;
      }

      result.push({
        type: 'message',
        id: msg.id,
        message: msg,
        isGroupStart,
        isGroupMiddle,
        isGroupEnd,
        isSingle,
      });
    }

    return result;
  }

  private formatDateDivider(date: Date): string {
    const today = new Date();
    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return 'اليوم';
    }

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    ) {
      return 'أمس';
    }

    return date.toLocaleDateString('ar-EG', {
      month: 'long',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  }

  public setChatDraft(chatId: string, draftText: string) {
    if (!draftText.trim()) {
      this.draftsMap.delete(chatId);
    } else {
      this.draftsMap.set(chatId, { text: draftText, date: Date.now() });
    }
    MessagesStorage.getInstance().saveDraft(chatId, draftText);
  }

  public getChatDraft(chatId: string): string | undefined {
    return this.draftsMap.get(chatId)?.text;
  }

  /**
   * DrKLO MessagesController.markDialogAsRead
   * Marks dialog unread count as 0, updates max read message, triggers NotificationCenter events
   */
  public markDialogAsRead(
    dialogId: string | number,
    maxId: string | number,
    account: number = 0
  ): void {
    const id = String(dialogId);
    const storage = MessagesStorage.getInstance(account);
    storage.markMessagesAsRead(id, maxId);

    // Sync in-memory DialogsController state
    DialogsController.getInstance(account).markDialogAsRead(id, typeof maxId === 'number' ? maxId : parseInt(maxId, 10) || 0);

    // Dispatch reload and UI update notifications
    const center = NotificationCenter.getInstance(account);
    center.postNotificationName(NotificationCenter.messagesRead, id, maxId);
    center.postNotificationName(NotificationCenter.dialogsNeedReload);
    center.postNotificationName(NotificationCenter.updateInterfaces, NotificationCenter.UPDATE_MASK_READ_DIALOG_MESSAGE);
  }

  /**
   * DrKLO MessagesController pin / unpin dialog
   */
  public setDialogPinned(dialogId: string | number, isPinned: boolean, account: number = 0): void {
    const id = String(dialogId);
    const storage = MessagesStorage.getInstance(account);
    storage.setDialogFlags(id, isPinned ? 1 : 0);

    // Sync in-memory DialogsController state
    DialogsController.getInstance(account).setDialogPinned(id, isPinned);

    const center = NotificationCenter.getInstance(account);
    center.postNotificationName(NotificationCenter.dialogsNeedReload);
    center.postNotificationName(NotificationCenter.updateInterfaces, NotificationCenter.UPDATE_MASK_SELECT_DIALOG);
  }

  /**
   * DrKLO MessagesController mute / unmute dialog
   */
  public muteDialog(dialogId: string | number, isMuted: boolean, account: number = 0): void {
    const id = String(dialogId);
    const storage = MessagesStorage.getInstance(account);
    storage.setDialogFlags(id, isMuted ? 2 : 0);

    const center = NotificationCenter.getInstance(account);
    center.postNotificationName(NotificationCenter.dialogsNeedReload);
    center.postNotificationName(NotificationCenter.updateInterfaces, 2);
  }

  /**
   * DrKLO MessagesController deleteDialog
   */
  public deleteDialog(dialogId: string | number, messagesOnly: boolean = false, account: number = 0): void {
    const id = String(dialogId);
    const storage = MessagesStorage.getInstance(account);
    storage.deleteDialog(id, messagesOnly ? 1 : 0);

    const center = NotificationCenter.getInstance(account);
    center.postNotificationName(NotificationCenter.dialogsNeedReload);
    center.postNotificationName(NotificationCenter.updateInterfaces, 1);
  }
}

export const messagesController = MessagesController.getInstance();
