import React, { useState } from 'react';
import { Users, Bot, Radio, Lock, Bookmark, CheckCircle2 } from 'lucide-react';
import { ChatType } from '../types';
import { getPeerColor, getPeerInitials } from '../utils/telegramPeerUtils';

interface ChatAvatarProps {
  id?: string | number;
  title: string;
  avatar?: string | null;
  photo?: string | null;
  username?: string | null;
  type?: ChatType | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  isOnline?: boolean;
  isVerified?: boolean;
  isSaved?: boolean;
  className?: string;
}

export const ChatAvatar: React.FC<ChatAvatarProps> = ({
  id,
  title,
  avatar,
  photo,
  username,
  type = 'private',
  size = 'md',
  isOnline = false,
  isVerified = false,
  isSaved = false,
  className = '',
}) => {
  const [errorCount, setErrorCount] = useState(0);

  const cleanUsername = username ? username.replace('@', '').trim() : '';
  const isSavedMessages = isSaved || type === 'saved' || id === 1001 || title === 'الرسائل المحفوظة' || title === 'Saved Messages';

  // Primary image source, with fallback to real Telegram CDN userpic if username is present, or /api/avatar/:id
  let activeSrc: string | null = null;
  if (!isSavedMessages) {
    if (errorCount === 0) {
      if (avatar || photo) {
        activeSrc = avatar || photo || null;
      } else if (cleanUsername) {
        activeSrc = `https://t.me/i/userpic/320/${encodeURIComponent(cleanUsername)}.jpg`;
      } else if (id !== undefined && id !== null && String(id).length > 0) {
        activeSrc = `/api/avatar/${encodeURIComponent(String(id))}`;
      }
    } else if (errorCount === 1) {
      // First fallback attempt
      if (cleanUsername && (!activeSrc || !activeSrc.includes('t.me'))) {
        activeSrc = `https://t.me/i/userpic/320/${encodeURIComponent(cleanUsername)}.jpg`;
      } else if (id !== undefined && id !== null) {
        activeSrc = `/api/avatar/${encodeURIComponent(String(id))}`;
      }
    }
  }

  // Size mapping
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-14 h-14 text-lg',
    '2xl': 'w-20 h-20 text-2xl',
  }[size];

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-7 h-7',
    '2xl': 'w-10 h-10',
  }[size];

  const peerColor = getPeerColor(id !== undefined ? id : title);
  const initials = getPeerInitials(title);

  // Type badge overlay icon
  const renderTypeOverlay = () => {
    if (isSavedMessages) {
      return (
        <div className="absolute -bottom-0.5 -right-0.5 bg-blue-600 text-white p-0.5 rounded-full border border-slate-900 shadow-sm" title="Saved Messages">
          <Bookmark className="w-2.5 h-2.5" />
        </div>
      );
    }
    if (type === 'secret') {
      return (
        <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-600 text-white p-0.5 rounded-full border border-slate-900 shadow-sm" title="Secret Chat">
          <Lock className="w-2.5 h-2.5" />
        </div>
      );
    }
    if (type === 'bot') {
      return (
        <div className="absolute -bottom-0.5 -right-0.5 bg-purple-600 text-white p-0.5 rounded-full border border-slate-900 shadow-sm" title="Bot">
          <Bot className="w-2.5 h-2.5" />
        </div>
      );
    }
    if (type === 'channel') {
      return (
        <div className="absolute -bottom-0.5 -right-0.5 bg-sky-500 text-white p-0.5 rounded-full border border-slate-900 shadow-sm" title="Channel">
          <Radio className="w-2.5 h-2.5" />
        </div>
      );
    }
    if (type === 'group' || type === 'supergroup') {
      return (
        <div className="absolute -bottom-0.5 -right-0.5 bg-indigo-600 text-white p-0.5 rounded-full border border-slate-900 shadow-sm" title="Group">
          <Users className="w-2.5 h-2.5" />
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`relative shrink-0 select-none ${className}`}>
      {isSavedMessages && !activeSrc ? (
        /* Saved Messages Telegram Official Icon */
        <div
          className={`${sizeClasses} rounded-full flex items-center justify-center text-white shadow-md border border-white/10`}
          style={{ background: 'linear-gradient(135deg, #2AABEE 0%, #229ED9 100%)' }}
        >
          <Bookmark className={iconSizes} fill="currentColor" />
        </div>
      ) : activeSrc && errorCount < 2 ? (
        <img
          src={activeSrc}
          alt={title}
          referrerPolicy="no-referrer"
          onError={() => setErrorCount((c) => c + 1)}
          className={`${sizeClasses} rounded-full object-cover border border-slate-700/80 shadow-sm`}
          loading="lazy"
        />
      ) : (
        /* Authentic Telegram 7-Peer-Color Gradient with Initials or Type Icon */
        <div
          className={`${sizeClasses} rounded-full flex items-center justify-center font-bold text-white shadow-md border border-white/10`}
          style={{ background: peerColor.gradient }}
        >
          {type === 'bot' ? (
            <Bot className={iconSizes} />
          ) : type === 'channel' ? (
            <Radio className={iconSizes} />
          ) : type === 'group' || type === 'supergroup' ? (
            <Users className={iconSizes} />
          ) : type === 'secret' ? (
            <Lock className={iconSizes} />
          ) : (
            <span className="font-semibold tracking-wide">{initials}</span>
          )}
        </div>
      )}

      {/* Online indicator */}
      {isOnline && type === 'private' && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900 shadow-sm" />
      )}

      {/* Verified star badge */}
      {isVerified && (
        <div className="absolute -top-0.5 -right-0.5 text-sky-400 bg-slate-900 rounded-full p-0.5">
          <CheckCircle2 className="w-3 h-3" fill="currentColor" stroke="none" />
        </div>
      )}

      {/* Type overlay badge */}
      {renderTypeOverlay()}
    </div>
  );
};
