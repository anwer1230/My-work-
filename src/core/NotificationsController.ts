/**
 * NotificationsController.ts - Central Push & In-App Notification Manager
 * 
 * Replicated directly from DrKLO/Telegram Android:
 * org.telegram.messenger.NotificationsController.java
 * 
 * Manages push notification parsing, sound/vibration alerts, badge updates,
 * grouped notifications, snoozing, quiet hours, and in-app banner dispatches.
 */

import { InAppNotification, NotificationCategory } from '../types';

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  vibrate: boolean;
  previewText: boolean;
  inAppSounds: boolean;
  inAppVibrate: boolean;
  inAppPreview: boolean;
  priorityAlerts: boolean;
  repeatAlerts: number; // 0 = off, 1 = 5 min, 2 = 10 min
  quietHours: {
    enabled: boolean;
    startHour: number; // 23:00
    endHour: number;   // 07:00
  };
  customKeywords: string[];
}

export interface NotificationBadgeInfo {
  totalUnreadCount: number;
  unreadChatsCount: number;
  mentionCount: number;
  reactionCount: number;
}

export class NotificationsController {
  private static instances = new Map<number, NotificationsController>();
  private currentAccount: number = 0;

  private listeners = new Set<(notif: InAppNotification) => void>();
  private badgeListeners = new Set<(badge: NotificationBadgeInfo) => void>();

  private audioContext: AudioContext | null = null;
  private activeNotifications: Map<string, InAppNotification> = new Map();
  private mutedDialogs: Set<string> = new Set();
  
  private settings: NotificationSettings = {
    enabled: true,
    sound: true,
    vibrate: true,
    previewText: true,
    inAppSounds: true,
    inAppVibrate: true,
    inAppPreview: true,
    priorityAlerts: true,
    repeatAlerts: 0,
    quietHours: {
      enabled: false,
      startHour: 23,
      endHour: 7,
    },
    customKeywords: ['urgent', 'مهم', 'تنبيه', 'alert', 'help'],
  };

  private badgeInfo: NotificationBadgeInfo = {
    totalUnreadCount: 0,
    unreadChatsCount: 0,
    mentionCount: 0,
    reactionCount: 0,
  };

  public static getInstance(account: number = 0): NotificationsController {
    if (!NotificationsController.instances.has(account)) {
      NotificationsController.instances.set(account, new NotificationsController(account));
    }
    return NotificationsController.instances.get(account)!;
  }

  private constructor(account: number) {
    this.currentAccount = account;
    this.loadSettings();
  }

  private loadSettings() {
    try {
      const saved = localStorage.getItem(`tg_notif_settings_${this.currentAccount}`);
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      }
    } catch {}
  }

  public saveSettings(newSettings: Partial<NotificationSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    try {
      localStorage.setItem(`tg_notif_settings_${this.currentAccount}`, JSON.stringify(this.settings));
    } catch {}
  }

  public getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  public subscribe(listener: (notif: InAppNotification) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public subscribeBadge(listener: (badge: NotificationBadgeInfo) => void): () => void {
    this.badgeListeners.add(listener);
    listener(this.badgeInfo);
    return () => this.badgeListeners.delete(listener);
  }

  public isDialogMuted(dialogId: string): boolean {
    return this.mutedDialogs.has(dialogId);
  }

  public muteDialog(dialogId: string, durationSeconds: number = -1) {
    this.mutedDialogs.add(dialogId);
    if (durationSeconds > 0) {
      setTimeout(() => {
        this.mutedDialogs.delete(dialogId);
      }, durationSeconds * 1000);
    }
  }

  public unmuteDialog(dialogId: string) {
    this.mutedDialogs.delete(dialogId);
  }

  /**
   * Checks if current time is within quiet hours
   */
  private isInQuietHours(): boolean {
    if (!this.settings.quietHours.enabled) return false;
    const hour = new Date().getHours();
    const { startHour, endHour } = this.settings.quietHours;
    if (startHour > endHour) {
      return hour >= startHour || hour < endHour;
    }
    return hour >= startHour && hour < endHour;
  }

  /**
   * Replicates processNewMessages() from NotificationsController.java
   */
  public processNewMessage(params: {
    chatId: string;
    chatTitle: string;
    chatUsername?: string;
    messageId: string;
    senderId: string;
    senderName: string;
    senderUsername?: string;
    avatar?: string;
    text: string;
    isMention?: boolean;
    isReply?: boolean;
    isChannel?: boolean;
    isSilent?: boolean;
  }) {
    if (!this.settings.enabled) return;
    if (params.chatId && this.isDialogMuted(params.chatId)) return;

    // Check for custom keyword triggers
    const lowerText = params.text.toLowerCase();
    const hasKeyword = this.settings.customKeywords.some(kw => lowerText.includes(kw.toLowerCase()));

    let category: NotificationCategory = 'message';
    if (hasKeyword) {
      category = 'keyword_alert';
    } else if (params.isMention) {
      category = 'mention';
    } else if (params.isReply) {
      category = 'reply';
    } else if (params.isChannel) {
      category = 'channel_post';
    }

    const title = params.chatTitle || params.senderName || 'Telegram';
    const body = this.settings.previewText
      ? (params.chatTitle && params.chatTitle !== params.senderName ? `${params.senderName}: ${params.text}` : params.text)
      : 'New message';

    this.postNotification({
      category,
      title,
      body,
      avatar: params.avatar,
      chatId: params.chatId,
      chatTitle: params.chatTitle,
      chatUsername: params.chatUsername,
      messageId: params.messageId,
      senderId: params.senderId,
      senderName: params.senderName,
      senderUsername: params.senderUsername,
      messageText: params.text,
      keyword: hasKeyword ? this.settings.customKeywords.find(kw => lowerText.includes(kw.toLowerCase())) : undefined,
      replyAction: true,
      isSilent: params.isSilent || this.isInQuietHours(),
    });
  }

  /**
   * Dispatches an in-app notification and triggers audio/vibration feedback
   */
  public postNotification(notification: {
    category: NotificationCategory;
    title: string;
    body: string;
    avatar?: string;
    chatId?: string;
    chatTitle?: string;
    chatUsername?: string;
    messageId?: string;
    senderId?: string;
    senderName?: string;
    senderUsername?: string;
    keyword?: string;
    messageText?: string;
    replyAction?: boolean;
    isSilent?: boolean;
  }) {
    const notifId = `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const fullNotif: InAppNotification = {
      id: notifId,
      category: notification.category,
      title: notification.title,
      body: notification.body,
      avatar: notification.avatar,
      chatId: notification.chatId,
      chatTitle: notification.chatTitle,
      chatUsername: notification.chatUsername,
      messageId: notification.messageId,
      senderId: notification.senderId,
      senderName: notification.senderName,
      senderUsername: notification.senderUsername,
      keyword: notification.keyword,
      messageText: notification.messageText,
      replyAction: notification.replyAction,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSilent: notification.isSilent,
    };

    this.activeNotifications.set(notifId, fullNotif);

    // Audio & Haptic Feedback
    if (!notification.isSilent && this.settings.inAppSounds) {
      if (notification.category === 'keyword_alert') {
        this.playNotificationSound('alert');
      } else if (notification.category === 'mention') {
        this.playNotificationSound('mention');
      } else {
        this.playNotificationSound('incoming');
      }

      if (this.settings.inAppVibrate && 'vibrate' in navigator) {
        try {
          if (notification.category === 'keyword_alert') {
            navigator.vibrate([120, 80, 120, 80, 150]);
          } else if (notification.category === 'mention') {
            navigator.vibrate([100, 50, 100]);
          } else {
            navigator.vibrate(80);
          }
        } catch {}
      }
    }

    if (this.settings.inAppPreview) {
      this.listeners.forEach((l) => l(fullNotif));
    }
  }

  /**
   * Updates global badge counts (unread messages, mentions, reactions)
   */
  public updateBadge(badge: Partial<NotificationBadgeInfo>) {
    this.badgeInfo = { ...this.badgeInfo, ...badge };
    this.badgeListeners.forEach(l => l(this.badgeInfo));

    // Update document title with unread badge if > 0
    if (this.badgeInfo.totalUnreadCount > 0) {
      document.title = `(${this.badgeInfo.totalUnreadCount}) Telegram Web`;
    } else {
      document.title = 'Telegram Web';
    }

    if ('setAppBadge' in navigator) {
      try {
        if (this.badgeInfo.totalUnreadCount > 0) {
          (navigator as any).setAppBadge(this.badgeInfo.totalUnreadCount);
        } else {
          (navigator as any).clearAppBadge();
        }
      } catch {}
    }
  }

  public dismissNotification(id: string) {
    this.activeNotifications.delete(id);
  }

  public clearAll() {
    this.activeNotifications.clear();
  }

  /**
   * WebAudio Sound Synthesizer replicating Telegram Android audio assets
   */
  public playNotificationSound(type: 'incoming' | 'sent' | 'alert' | 'mention' = 'incoming') {
    if (!this.settings.sound) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioContext || this.audioContext.state === 'closed') {
        this.audioContext = new AudioCtx();
      }

      const now = this.audioContext.currentTime;
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = 'sine';

      if (type === 'sent') {
        // Sent sound: ascending chime
        osc.frequency.setValueAtTime(1046, now); // C6
        osc.frequency.exponentialRampToValueAtTime(1318, now + 0.06); // E6
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'alert') {
        // High-priority triple-beep
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.setValueAtTime(1600, now + 0.08);
        osc.frequency.setValueAtTime(1200, now + 0.16);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.start(now);
        osc.stop(now + 0.28);
      } else if (type === 'mention') {
        // Mention chime: two quick harmonious tones
        osc.frequency.setValueAtTime(880, now); // A5
        osc.frequency.setValueAtTime(1174, now + 0.05); // D6
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.start(now);
        osc.stop(now + 0.18);
      } else {
        // Incoming message sound: Telegram pop chime
        osc.frequency.setValueAtTime(830, now);
        osc.frequency.exponentialRampToValueAtTime(1046, now + 0.08);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.start(now);
        osc.stop(now + 0.16);
      }
    } catch (e) {
      console.warn('[NotificationsController] Audio playback note:', e);
    }
  }
}

export const notificationsController = NotificationsController.getInstance(0);
