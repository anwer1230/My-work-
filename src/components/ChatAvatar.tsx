import React, { useState } from 'react';
import { Users, Bot, Radio, Lock, Sparkles } from 'lucide-react';

interface ChatAvatarProps {
  title?: string;
  avatar?: string;
  photo?: string;
  type?: 'private' | 'group' | 'supergroup' | 'channel' | 'bot' | 'secret' | 'saved';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isOnline?: boolean;
  className?: string;
  [key: string]: any;
}

// Telegram Android Standard Gradients
const TELEGRAM_GRADIENTS = [
  'linear-gradient(135deg, #2AABEE 0%, #229ED9 100%)', // Blue
  'linear-gradient(135deg, #FF885E 0%, #FF516A 100%)', // Red/Orange
  'linear-gradient(135deg, #6AC358 0%, #54AB42 100%)', // Green
  'linear-gradient(135deg, #A667EC 0%, #8544D6 100%)', // Violet
  'linear-gradient(135deg, #FFA938 0%, #F57C00 100%)', // Amber
  'linear-gradient(135deg, #28C9B9 0%, #00A896 100%)', // Cyan/Teal
  'linear-gradient(135deg, #FF6699 0%, #E91E63 100%)', // Pink
];

function getTelegramGradient(str: string): string {
  if (!str) return TELEGRAM_GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % TELEGRAM_GRADIENTS.length;
  return TELEGRAM_GRADIENTS[index];
}

function getInitials(str?: string): string {
  if (!str) return 'T';
  const cleanStr = str.replace(/[^\p{L}\p{N}\s]/gu, '').trim();
  if (!cleanStr) return str.charAt(0).toUpperCase();
  const parts = cleanStr.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }
  return cleanStr.slice(0, 2).toUpperCase();
}

export const ChatAvatar: React.FC<ChatAvatarProps> = ({
  title = 'Telegram',
  avatar,
  photo,
  type = 'private',
  size = 'md',
  isOnline = false,
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);
  const activeImage = avatar || photo;

  // Size mapping in pixels/Tailwind
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
  const gradient = getTelegramGradient(title);

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
      {activeImage && !imageError ? (
        <img
          src={activeImage}
          alt={title}
          onError={() => setImageError(true)}
          className={`${sizeClasses} rounded-full object-cover border border-black/10 shadow-sm`}
        />
      ) : (
        /* Dynamic Telegram Gradient Icon/Initials Avatar */
        <div
          className={`${sizeClasses} rounded-full flex items-center justify-center font-bold text-white shadow-sm border border-white/20 select-none`}
          style={{ background: gradient }}
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
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm" />
      )}

      {/* Type overlay badge if image is shown */}
      {activeImage && !imageError && renderTypeOverlay()}
    </div>
  );
};

