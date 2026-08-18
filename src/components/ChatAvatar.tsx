import React, { useState } from 'react';
import { Users, Bot, Radio, Lock, User, Sparkles } from 'lucide-react';

interface ChatAvatarProps {
  title: string;
  avatar?: string;
  type?: 'private' | 'group' | 'supergroup' | 'channel' | 'bot' | 'secret';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isOnline?: boolean;
  className?: string;
}

// Deterministic Telegram color gradients based on title hash
const GRADIENTS = [
  'from-sky-500 to-blue-600',
  'from-emerald-500 to-teal-700',
  'from-violet-500 to-purple-700',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-indigo-500 to-cyan-600',
  'from-teal-500 to-emerald-700',
];

function getGradient(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENTS.length;
  return GRADIENTS[index];
}

function getInitials(str: string): string {
  if (!str) return 'T';
  const cleanStr = str.replace(/[^\p{L}\p{N}\s]/gu, '').trim();
  if (!cleanStr) return str.charAt(0).toUpperCase();
  const parts = cleanStr.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }
  return cleanStr.charAt(0).toUpperCase();
}

export const ChatAvatar: React.FC<ChatAvatarProps> = ({
  title,
  avatar,
  type = 'private',
  size = 'md',
  isOnline = false,
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  // Size mapping
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  }[size];

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  }[size];

  const initials = getInitials(title);
  const gradient = getGradient(title || 'Telegram');

  // Render type-specific badge icon overlay
  const renderTypeOverlay = () => {
    if (type === 'secret') {
      return (
        <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-600 text-white p-0.5 rounded-full border border-slate-900 shadow-sm">
          <Lock className="w-2.5 h-2.5" />
        </div>
      );
    }
    if (type === 'bot') {
      return (
        <div className="absolute -bottom-0.5 -right-0.5 bg-purple-600 text-white p-0.5 rounded-full border border-slate-900 shadow-sm">
          <Bot className="w-2.5 h-2.5" />
        </div>
      );
    }
    if (type === 'channel') {
      return (
        <div className="absolute -bottom-0.5 -right-0.5 bg-sky-600 text-white p-0.5 rounded-full border border-slate-900 shadow-sm">
          <Radio className="w-2.5 h-2.5" />
        </div>
      );
    }
    if (type === 'group' || type === 'supergroup') {
      return (
        <div className="absolute -bottom-0.5 -right-0.5 bg-indigo-600 text-white p-0.5 rounded-full border border-slate-900 shadow-sm">
          <Users className="w-2.5 h-2.5" />
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`relative shrink-0 ${className}`}>
      {avatar && !imageError ? (
        <img
          src={avatar}
          alt={title}
          onError={() => setImageError(true)}
          className={`${sizeClasses} rounded-full object-cover border border-slate-700/80 shadow-sm`}
        />
      ) : (
        /* Dynamic Telegram Gradient Icon/Initials Avatar */
        <div
          className={`${sizeClasses} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center font-bold text-white shadow-md border border-white/10 select-none`}
        >
          {type === 'bot' ? (
            <Sparkles className={iconSizes} />
          ) : type === 'channel' ? (
            <Radio className={iconSizes} />
          ) : type === 'group' || type === 'supergroup' ? (
            <Users className={iconSizes} />
          ) : type === 'secret' ? (
            <Lock className={iconSizes} />
          ) : (
            <span>{initials}</span>
          )}
        </div>
      )}

      {/* Online indicator */}
      {isOnline && (
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900 shadow-sm" />
      )}

      {/* Type overlay badge if image is shown */}
      {avatar && !imageError && renderTypeOverlay()}
    </div>
  );
};
