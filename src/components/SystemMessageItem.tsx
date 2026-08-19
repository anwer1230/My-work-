import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Ban,
  Crown,
  UserPlus,
  UserMinus,
  Link,
  Edit3,
  Image,
  Pin,
  ArrowUpCircle,
  Megaphone,
  Copy,
  Check,
  AlertOctagon,
  Info
} from 'lucide-react';
import { SystemActionType } from '../types';

interface SystemMessageItemProps {
  text: string;
  type?: SystemActionType;
  date?: number | string;
  isMe?: boolean;
  onSelectAction?: () => void;
}

export const getSystemEmojiAndStyle = (type?: SystemActionType) => {
  const t = (type || 'info').toLowerCase();

  if (t.includes('ban') && !t.includes('unban')) {
    return {
      emoji: '🚫',
      icon: Ban,
      bgColor: 'bg-rose-500/15 dark:bg-rose-950/50',
      borderColor: 'border-rose-500/40',
      textColor: 'text-rose-600 dark:text-rose-300',
      glowColor: 'shadow-rose-950/20',
      tag: 'حظر',
    };
  }

  if (t.includes('unban')) {
    return {
      emoji: '✅',
      icon: ShieldCheck,
      bgColor: 'bg-emerald-500/15 dark:bg-emerald-950/50',
      borderColor: 'border-emerald-500/40',
      textColor: 'text-emerald-600 dark:text-emerald-300',
      glowColor: 'shadow-emerald-950/20',
      tag: 'إلغاء حظر',
    };
  }

  if (t.includes('restrict')) {
    return {
      emoji: '⛔',
      icon: AlertOctagon,
      bgColor: 'bg-amber-500/15 dark:bg-amber-950/50',
      borderColor: 'border-amber-500/40',
      textColor: 'text-amber-600 dark:text-amber-300',
      glowColor: 'shadow-amber-950/20',
      tag: 'تقييد',
    };
  }

  if (t.includes('admin')) {
    return {
      emoji: '👑',
      icon: Crown,
      bgColor: 'bg-yellow-500/15 dark:bg-yellow-950/50',
      borderColor: 'border-yellow-500/40',
      textColor: 'text-yellow-600 dark:text-yellow-300',
      glowColor: 'shadow-yellow-950/20',
      tag: 'إشراف',
    };
  }

  if (t.includes('join') || t.includes('link')) {
    return {
      emoji: t.includes('link') ? '🔗' : '👤',
      icon: t.includes('link') ? Link : UserPlus,
      bgColor: 'bg-emerald-500/10 dark:bg-emerald-950/40',
      borderColor: 'border-emerald-500/30',
      textColor: 'text-emerald-600 dark:text-emerald-300',
      glowColor: 'shadow-emerald-950/10',
      tag: 'انضمام',
    };
  }

  if (t.includes('left') || t.includes('leave')) {
    return {
      emoji: '🚪',
      icon: UserMinus,
      bgColor: 'bg-slate-500/15 dark:bg-slate-800/60',
      borderColor: 'border-slate-400/30 dark:border-slate-700',
      textColor: 'text-slate-600 dark:text-slate-300',
      glowColor: 'shadow-slate-900/10',
      tag: 'مغادرة',
    };
  }

  if (t.includes('title') || t.includes('chat_created')) {
    return {
      emoji: '📝',
      icon: Edit3,
      bgColor: 'bg-sky-500/15 dark:bg-sky-950/50',
      borderColor: 'border-sky-500/30',
      textColor: 'text-sky-600 dark:text-sky-300',
      glowColor: 'shadow-sky-950/20',
      tag: 'مجموعة',
    };
  }

  if (t.includes('photo')) {
    return {
      emoji: '🖼️',
      icon: Image,
      bgColor: 'bg-indigo-500/15 dark:bg-indigo-950/50',
      borderColor: 'border-indigo-500/30',
      textColor: 'text-indigo-600 dark:text-indigo-300',
      glowColor: 'shadow-indigo-950/20',
      tag: 'وسائط',
    };
  }

  if (t.includes('pin')) {
    return {
      emoji: '📌',
      icon: Pin,
      bgColor: 'bg-cyan-500/15 dark:bg-cyan-950/50',
      borderColor: 'border-cyan-500/30',
      textColor: 'text-cyan-600 dark:text-cyan-300',
      glowColor: 'shadow-cyan-950/20',
      tag: 'تثبيت',
    };
  }

  if (t.includes('migrate')) {
    return {
      emoji: '⬆️',
      icon: ArrowUpCircle,
      bgColor: 'bg-purple-500/15 dark:bg-purple-950/50',
      borderColor: 'border-purple-500/30',
      textColor: 'text-purple-600 dark:text-purple-300',
      glowColor: 'shadow-purple-950/20',
      tag: 'ترقية',
    };
  }

  if (t.includes('channel')) {
    return {
      emoji: '📢',
      icon: Megaphone,
      bgColor: 'bg-sky-500/15 dark:bg-sky-950/50',
      borderColor: 'border-sky-500/30',
      textColor: 'text-sky-600 dark:text-sky-300',
      glowColor: 'shadow-sky-950/20',
      tag: 'قناة',
    };
  }

  return {
    emoji: 'ℹ️',
    icon: Info,
    bgColor: 'bg-slate-500/10 dark:bg-slate-800/50',
    borderColor: 'border-slate-400/20 dark:border-slate-700/50',
    textColor: 'text-slate-600 dark:text-slate-300',
    glowColor: 'shadow-slate-900/10',
    tag: 'نظام',
  };
};

export const SystemMessageItem: React.FC<SystemMessageItemProps> = ({
  text,
  type,
  date,
  isMe,
  onSelectAction,
}) => {
  const [copied, setCopied] = useState(false);
  const style = getSystemEmojiAndStyle(type);
  const IconComp = style.icon;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedTime = (() => {
    if (!date) return '';
    try {
      const d = typeof date === 'number' ? new Date(date * (date < 1e11 ? 1000 : 1)) : new Date(date);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  })();

  return (
    <div
      className="w-full flex justify-center my-2.5 px-3 select-text group transition-all"
      onClick={onSelectAction}
    >
      <div
        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border backdrop-blur-md shadow-sm transition-all duration-200 hover:scale-[1.01] hover:shadow-md ${style.bgColor} ${style.borderColor} ${style.glowColor} max-w-[90%] md:max-w-[75%]`}
      >
        <span className="text-sm shrink-0 select-none animate-pulse">
          {style.emoji}
        </span>

        <span className={`text-[12px] font-medium leading-relaxed ${style.textColor}`}>
          {text}
        </span>

        {isMe && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30 shrink-0">
            أنت
          </span>
        )}

        {formattedTime && (
          <span className="text-[10px] opacity-60 font-mono text-slate-400 shrink-0 select-none mr-1">
            {formattedTime}
          </span>
        )}

        <button
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-slate-400 hover:text-slate-200 shrink-0"
          title="نسخ نص الإجراء"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
};
