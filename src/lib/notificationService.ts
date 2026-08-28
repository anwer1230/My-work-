// ============================================================
// WEB & PUSH NOTIFICATIONS SERVICE FOR TELEGRAM WEB
// ============================================================

import { SystemMessageData } from '../types';

export type NotificationPermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermissionStatus(): NotificationPermissionState {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission as NotificationPermissionState;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    console.warn('⚠️ متصفحك لا يدعم واجهة الإشعارات Web Notifications API');
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      localStorage.setItem('tg_notifications_enabled', 'true');
      console.log('✅ تم تفعيل إشعارات تليجرام بنجاح');
    } else {
      localStorage.setItem('tg_notifications_enabled', 'false');
      console.warn('❌ تم رفض إذن الإشعارات من قبل المستخدم');
    }
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
}

export interface PushNotificationOptions {
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  chat_id?: string | number;
  silent?: boolean;
  data?: any;
  onClick?: () => void;
}

export function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch (e) {
    // AudioContext blocked or not allowed yet
  }
}

export async function showPushNotification(
  title: string,
  options: PushNotificationOptions = {}
) {
  if (!isNotificationSupported()) return;

  const isEnabled = localStorage.getItem('tg_notifications_enabled') !== 'false';
  if (Notification.permission !== 'granted' || !isEnabled) return;

  const notifTitle = title || 'تليجرام';
  const notifBody = options.body || 'لديك رسالة أو تحديث جديد';
  const icon = options.icon || 'https://telegram.org/img/t_logo.png';
  const badge = options.badge || 'https://telegram.org/img/t_logo.png';
  const tag = options.tag || (options.chat_id ? `chat_${options.chat_id}` : 'tg_notif');

  if (!options.silent) {
    playNotificationSound();
  }

  // 1. First try Service Worker registration for rich PWA notifications
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && 'showNotification' in reg) {
        const swOptions: any = {
          body: notifBody,
          icon,
          badge,
          tag,
          renotify: true,
          vibrate: [200, 100, 200],
          data: {
            chat_id: options.chat_id,
            url: options.chat_id ? `/?chat_id=${options.chat_id}` : '/',
            ...options.data,
          },
        };
        await reg.showNotification(notifTitle, swOptions);
        return;
      }
    } catch (swErr) {
      console.log('SW Notification fallback to window Notification:', swErr);
    }
  }

  // 2. Standard Browser Window Notification fallback
  try {
    const notifOptions: any = {
      body: notifBody,
      icon,
      badge,
      tag,
      renotify: true,
    };
    const notif = new Notification(notifTitle, notifOptions);

    notif.onclick = () => {
      window.focus();
      if (options.onClick) {
        options.onClick();
      }
      notif.close();
    };

    setTimeout(() => {
      try {
        notif.close();
      } catch (_) {}
    }, 6000);
  } catch (err) {
    console.warn('Could not display push notification:', err);
  }
}

export function handleIncomingSystemEvent(
  eventData: SystemMessageData,
  activeChatId?: string | number,
  onNavigateToChat?: (chatId: string | number) => void
) {
  const isCurrentChat = String(activeChatId) === String(eventData.chat_id);

  // If chat is not open, or window is hidden, show system notification
  if (!isCurrentChat || document.hidden) {
    showPushNotification('📢 رسالة نظام (تليجرام)', {
      body: eventData.message,
      chat_id: eventData.chat_id,
      tag: `sys_${eventData.chat_id}_${Date.now()}`,
      onClick: () => {
        if (onNavigateToChat && eventData.chat_id) {
          onNavigateToChat(eventData.chat_id);
        }
      },
    });
  }
}
