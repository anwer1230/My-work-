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
  image?: string;
  badge?: string;
  tag?: string;
  chat_id?: string | number;
  silent?: boolean;
  vibrate?: number[];
  actions?: Array<{ action: string; title: string; icon?: string }>;
  ttl?: number;
  data?: any;
  onClick?: () => void;
  onAction?: (action: string) => void;
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

/**
 * Arabic Text-to-Speech (TTS) Voice Announcer for urgent monitoring & administrative alerts
 */
export function speakAlertTTS(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  
  // Check user preference
  const isSpeechEnabled = localStorage.getItem('speech_notifications_enabled') !== 'false';
  if (!isSpeechEnabled) return;

  try {
    window.speechSynthesis.cancel(); // Stop any pending speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Pick best Arabic voice if available
    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find(v => v.lang.startsWith('ar') || v.name.includes('Arabic') || v.name.includes('Maged') || v.name.includes('Laila'));
    if (arabicVoice) {
      utterance.voice = arabicVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('TTS Speech synthesis not available:', err);
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
  const vibrate = options.vibrate || [200, 100, 200];
  const actions = options.actions || [
    { action: 'reply', title: 'رد سريع ✍️' },
    { action: 'open', title: 'فتح التطبيق 🚀' },
  ];

  if (!options.silent) {
    playNotificationSound();
  }

  // 1. First try Service Worker registration for rich PWA notifications with Actions & Vibrate
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && 'showNotification' in reg) {
        const swOptions: any = {
          body: notifBody,
          icon,
          image: options.image || undefined,
          badge,
          tag,
          renotify: true,
          vibrate,
          actions,
          data: {
            chat_id: options.chat_id,
            url: options.chat_id ? `/?chat_id=${options.chat_id}` : '/',
            ttl: options.ttl || 86400,
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
    }, 8000);
  } catch (err) {
    console.warn('Could not display push notification:', err);
  }
}

export function handleIncomingSystemEvent(
  eventData: SystemMessageData,
  activeChatId?: string | number,
  onNavigateToChat?: (chatId: string | number) => void
) {
  const targetChatId = eventData.chat_id || 1001;
  const isCurrentChat = String(activeChatId) === String(targetChatId);

  // If chat is not open, or window is hidden, show system notification
  if (!isCurrentChat || document.hidden) {
    showPushNotification('📢 رسالة نظام (تليجرام)', {
      body: eventData.message,
      chat_id: targetChatId,
      tag: `sys_${targetChatId}_${Date.now()}`,
      vibrate: [150, 80, 150],
      actions: [
        { action: 'open', title: 'فتح المحفوظات 📥' },
      ],
      onClick: () => {
        if (onNavigateToChat) {
          onNavigateToChat(targetChatId);
        }
      },
    });
  }
}
