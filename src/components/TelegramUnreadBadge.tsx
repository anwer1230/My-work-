import React from 'react';
import { Pin, BellOff, AtSign } from 'lucide-react';

export interface TelegramUnreadBadgeProps {
  unread?: number;
  unreadCount?: number;
  isMuted?: boolean;
  isPinned?: boolean;
  hasUnreadMark?: boolean;
  unreadMentions?: number;
  unreadReactions?: number | string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Formats unread count exactly according to Telegram Android's LocaleController.formatShortNumber()
 * in DrKLO/Telegram (DialogCell.java)
 */
export function formatTelegramUnreadCount(count: number): string {
  if (count <= 0) return '';
  if (count < 1000) return String(count);
  if (count < 10000) {
    const kVal = count / 1000;
    return (count % 1000 < 100 ? kVal.toFixed(0) : kVal.toFixed(1)) + 'K';
  }
  if (count < 100000) {
    return Math.floor(count / 1000) + 'K';
  }
  return '99K+';
}

/**
 * Authentic Telegram Android Unread Badges & Indicators Component
 * Replicated directly from DrKLO/Telegram (DialogCell.java / Theme.java)
 */
export const TelegramUnreadBadge: React.FC<TelegramUnreadBadgeProps> = ({
  unread,
  unreadCount,
  isMuted = false,
  isPinned = false,
  hasUnreadMark = false,
  unreadMentions = 0,
  unreadReactions,
  className = '',
  size = 'md',
}) => {
  const count = unread !== undefined ? unread : unreadCount || 0;
  const hasCount = count > 0;
  const showMark = !hasCount && hasUnreadMark;

  const sizeClasses = {
    sm: 'text-[10px] min-w-[16px] h-4 px-1',
    md: 'text-[11.5px] min-w-[20px] h-5 px-1.5',
    lg: 'text-[13px] min-w-[24px] h-6 px-2',
  }[size];

  return (
    <div className={`flex items-center gap-1.5 shrink-0 ${className}`}>
      {/* 📌 Pinned Chat Indicator (Rotated 45deg) */}
      {isPinned && (
        <span
          className="text-slate-400/80 hover:text-slate-200 transition-colors inline-flex items-center justify-center"
          title="محادثة مثبتة"
        >
          <Pin className="w-3.5 h-3.5 rotate-45 text-slate-400" />
        </span>
      )}

      {/* 🔕 Muted Notification Indicator */}
      {isMuted && !hasCount && !showMark && (
        <span
          className="text-slate-400/70 inline-flex items-center justify-center"
          title="المحادثة مكتومة الصوت"
        >
          <BellOff className="w-3.5 h-3.5" />
        </span>
      )}

      {/* ❤️ Unread Reaction Capsule */}
      {unreadReactions && (
        <span
          className="bg-white/10 dark:bg-zinc-800/80 border border-white/20 dark:border-zinc-700/50 text-[11px] rounded-full px-1.5 py-0.5 inline-flex items-center gap-0.5 shadow-xs"
          title="تفاعل جديد"
        >
          <span>{typeof unreadReactions === 'string' ? unreadReactions : '❤️'}</span>
        </span>
      )}

      {/* ＠ Unread Mentions Badge (Theme.key_chats_mention - #24a1de) */}
      {unreadMentions > 0 && (
        <span
          className="bg-[#24a1de] hover:bg-[#2092c9] text-white font-bold text-[11px] rounded-full w-5 h-5 inline-flex items-center justify-center shadow-xs transition-transform active:scale-95"
          title={`تمت الإشارة إليك (@) ${unreadMentions > 1 ? `(${unreadMentions})` : ''}`}
        >
          <AtSign className="w-3 h-3 stroke-[2.5]" />
        </span>
      )}

      {/* 🔵 Unread Counter Pill Badge (Theme.key_chats_unreadCounter & key_chats_unreadCounterMuted) */}
      {hasCount && (
        <span
          className={`font-bold font-sans rounded-full inline-flex items-center justify-center tracking-tight shadow-xs transition-all ${sizeClasses} ${
            isMuted
              ? 'bg-[#708499] dark:bg-[#5a6e85] text-white shadow-inner'
              : 'bg-[#3390ec] dark:bg-[#24a1de] text-white shadow-md'
          }`}
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "Roboto", "Segoe UI", sans-serif',
          }}
          title={isMuted ? `رسائل غير مقروءة (مكتومة): ${count}` : `رسائل غير مقروءة: ${count}`}
        >
          {formatTelegramUnreadCount(count)}
        </span>
      )}

      {/* ● Unread Mark Solid Dot (when marked unread without count) */}
      {showMark && (
        <span
          className={`w-2.5 h-2.5 rounded-full inline-block shadow-xs ${
            isMuted ? 'bg-[#708499]' : 'bg-[#3390ec]'
          }`}
          title="محددة كغير مقروءة"
        />
      )}
    </div>
  );
};
