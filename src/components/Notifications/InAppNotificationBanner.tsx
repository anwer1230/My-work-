import React from 'react';
import {
  MessageSquare,
  Megaphone,
  AtSign,
  PhoneCall,
  ShieldAlert,
  Heart,
  Pin,
  X,
  Reply,
  VolumeX,
  CornerDownLeft,
  UserCheck,
  ExternalLink,
  Flame,
  Radio,
} from 'lucide-react';
import { InAppNotification } from '../../types';
import { useTelegram } from '../../context/TelegramContext';

interface InAppNotificationBannerProps {
  notifications: InAppNotification[];
  onDismiss: (id: string) => void;
}

/**
 * InAppNotificationBanner - Official Telegram Android (DrKLO) Notification Layout
 *
 * Implements:
 * 1. 🚨 Title: 🚨 كلمة مراقبة: [الكلمة] (with highlighted warning amber/rose accents)
 * 2. 💬 Body Line 1: 💬 الرسالة: [Message text snippet]
 * 3. 📍 Body Line 2: 📍 المصدر: [Group / Channel / Chat Name] (with Live link if public)
 * 4. 🔘 Action 1: "الانتقال إلى الرسالة" (Scroll to exact messageId in ChatView)
 * 5. 🔘 Action 2: "متابعة المرسل / مراسلة المرسل" (Open 1-on-1 private chat with senderId = userId)
 */
export const InAppNotificationBanner: React.FC<InAppNotificationBannerProps> = ({
  notifications,
  onDismiss,
}) => {
  const {
    setActiveChatId,
    jumpToMessage,
    openPrivateChat,
    toggleMuteChat,
    setReplyingTo,
    resolveTelegramLink,
    settings,
  } = useTelegram();

  const isArabic = settings.language === 'ar';

  if (!notifications.length) return null;

  const current = notifications[notifications.length - 1];
  const isKeywordAlert = current.category === 'keyword_alert';

  const getCategoryIcon = () => {
    switch (current.category) {
      case 'keyword_alert':
        return <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />;
      case 'channel_post':
        return <Megaphone className="w-3.5 h-3.5 text-sky-400" />;
      case 'mention':
        return <AtSign className="w-3.5 h-3.5 text-amber-400" />;
      case 'call':
        return <PhoneCall className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />;
      case 'system_security':
        return <ShieldAlert className="w-3.5 h-3.5 text-red-400" />;
      case 'reaction':
        return <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />;
      case 'pinned':
        return <Pin className="w-3.5 h-3.5 text-yellow-400" />;
      default:
        return <MessageSquare className="w-3.5 h-3.5 text-sky-400" />;
    }
  };

  // 1. General Banner Click Intent -> Jumps directly to the message if available, else opens chat
  const handleClickBanner = () => {
    if (current.chatId && current.messageId) {
      jumpToMessage(current.chatId, current.messageId);
    } else if (current.chatId) {
      setActiveChatId(current.chatId);
    }
    onDismiss(current.id);
  };

  // 2. Action Button 1: Jump to Message (Scrolls directly over messageId)
  const handleJumpToMessage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (current.chatId && current.messageId) {
      jumpToMessage(current.chatId, current.messageId);
    } else if (current.chatId) {
      setActiveChatId(current.chatId);
    }
    onDismiss(current.id);
  };

  // 3. Action Button 2: Message / Follow Sender (Opens 1-on-1 private chat with senderId)
  const handleMessageSender = (e: React.MouseEvent) => {
    e.stopPropagation();
    const senderId = current.senderId || (current.senderName ? `user_${current.senderName.replace(/\s+/g, '_')}` : 'user_unknown');
    const senderName = current.senderName || 'مستخدم تيليجرام';
    openPrivateChat(senderId, senderName, current.avatar, current.senderUsername);
    onDismiss(current.id);
  };

  // 4. Live Link click for public group or username
  const handleOpenLiveLink = (e: React.MouseEvent, link: string) => {
    e.stopPropagation();
    resolveTelegramLink(link);
  };

  const handleReply = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (current.chatId) {
      setActiveChatId(current.chatId);
      setReplyingTo({
        messageId: current.messageId || current.id,
        senderName: current.senderName || current.title,
        textSnippet: current.messageText || current.body,
      });
    }
    onDismiss(current.id);
  };

  const handleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (current.chatId) {
      toggleMuteChat(current.chatId);
    }
    onDismiss(current.id);
  };

  return (
    <div
      id={`tg-notification-banner-${current.id}`}
      className="fixed top-3 left-1/2 -translate-x-1/2 z-[9999] w-[95%] max-w-lg animate-in slide-in-from-top-4 duration-300 pointer-events-auto select-none"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div
        onClick={handleClickBanner}
        className={`group relative overflow-hidden rounded-3xl p-4 shadow-2xl backdrop-blur-2xl border cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] ${
          isKeywordAlert
            ? 'border-amber-500/50 bg-[#16130b]/95 shadow-amber-950/40'
            : 'border-white/15 bg-[#1c2834]/95 shadow-black/60'
        }`}
        style={{
          boxShadow: isKeywordAlert
            ? '0 16px 40px -6px rgba(245, 158, 11, 0.25), 0 0 0 1px rgba(245, 158, 11, 0.3)'
            : '0 16px 40px -6px rgba(0, 0, 0, 0.65)',
        }}
      >
        {/* Glow Accent Bar */}
        <div
          className={`absolute top-0 left-0 right-0 h-1 ${
            isKeywordAlert
              ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-yellow-400 animate-pulse'
              : 'bg-gradient-to-r from-sky-400 via-[#2481cc] to-indigo-500'
          }`}
        />

        <div className="flex items-start gap-3.5">
          {/* Avatar / Category Badge */}
          <div
            className={`relative shrink-0 w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center font-bold text-white shadow-lg ${
              isKeywordAlert
                ? 'bg-gradient-to-br from-amber-500 to-rose-600 ring-2 ring-amber-400/40'
                : 'bg-gradient-to-tr from-sky-600 to-cyan-500'
            }`}
          >
            {current.avatar ? (
              <img
                src={current.avatar}
                alt={current.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="text-base">{current.title.charAt(0).toUpperCase()}</span>
            )}

            <div
              className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-gray-900 shadow-md ${
                isKeywordAlert ? 'bg-amber-500 text-black' : 'bg-gray-900'
              }`}
            >
              {getCategoryIcon()}
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 min-w-0 pr-1">
            {/* Header: Title + Timestamp */}
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className={`font-black text-xs sm:text-[13px] truncate ${
                    isKeywordAlert ? 'text-amber-300 flex items-center gap-1' : 'text-white'
                  }`}
                >
                  {isKeywordAlert ? (
                    <>
                      <span className="text-rose-400">🚨</span>
                      <span>{isArabic ? 'كلمة مراقبة:' : 'Keyword Alert:'}</span>
                      <span className="px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-200 border border-amber-400/30 text-[11px] font-mono">
                        {current.keyword || current.title.replace(/.*\[(.*)\].*/, '$1')}
                      </span>
                    </>
                  ) : (
                    current.title
                  )}
                </span>
              </div>
              <span className="text-[10px] text-gray-400 shrink-0 font-mono">
                {current.timestamp}
              </span>
            </div>

            {/* Notification Layout - DrKLO Style (Two lines) */}
            {isKeywordAlert ? (
              <div className="space-y-1 my-1.5 text-xs text-gray-200">
                {/* Line 1: Message Text */}
                <div className="flex items-start gap-1.5 line-clamp-2 leading-relaxed bg-black/30 p-2 rounded-xl border border-white/5">
                  <span className="shrink-0 text-amber-400 font-bold">💬 {isArabic ? 'الرسالة:' : 'Message:'}</span>
                  <span className="text-gray-100 font-medium break-words">
                    {current.messageText || current.body.replace(/.*💬 الرسالة:\s*/, '').replace(/\n📍.*/, '')}
                  </span>
                </div>

                {/* Line 2: Source Chat + Live Link */}
                <div className="flex items-center justify-between gap-2 text-[11px] text-gray-400 pt-0.5">
                  <div className="flex items-center gap-1 truncate">
                    <span className="text-rose-400 font-bold">📍 {isArabic ? 'المصدر:' : 'Source:'}</span>
                    <span className="text-gray-300 font-semibold truncate">
                      {current.chatTitle || current.senderName || 'المجموعة'}
                    </span>
                  </div>

                  {/* Public Live Link Button if username exists */}
                  {current.chatUsername && (
                    <button
                      onClick={(e) => handleOpenLiveLink(e, current.chatUsername!)}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-mono text-[10px] shrink-0 border border-sky-400/30 transition-colors"
                      title="رابط تيليجرام الحي"
                    >
                      <span>t.me/{current.chatUsername.replace('@', '')}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-300 line-clamp-2 leading-snug break-words mb-2">
                {current.body}
              </p>
            )}

            {/* Action Buttons (Expanded Layout matching DrKLO PendingIntents) */}
            <div className="mt-2.5 flex items-center flex-wrap gap-2 pt-1 border-t border-white/10">
              {/* Button 1: Jump to Message (Scrolls directly over message) */}
              <button
                id="tg-notif-action-jump-to-message"
                onClick={handleJumpToMessage}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#2481cc] hover:bg-[#1f70b3] text-white shadow-md shadow-sky-950/40 active:scale-95 transition-all"
              >
                <CornerDownLeft className="w-3.5 h-3.5" />
                <span>{isArabic ? 'الانتقال إلى الرسالة' : 'Jump to Message'}</span>
              </button>

              {/* Button 2: Message / Follow Sender (Opens 1-on-1 private chat) */}
              <button
                id="tg-notif-action-message-sender"
                onClick={handleMessageSender}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md ${
                  isKeywordAlert
                    ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-950/30'
                    : 'bg-white/15 hover:bg-white/25 text-white'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{isArabic ? 'متابعة المرسل' : 'Message Sender'}</span>
              </button>

              {/* Quick Reply for standard messages */}
              {!isKeywordAlert && current.replyAction && (
                <button
                  onClick={handleReply}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-white/10 hover:bg-white/20 text-gray-200 transition-colors"
                >
                  <Reply className="w-3 h-3" />
                  <span>{isArabic ? 'رد' : 'Reply'}</span>
                </button>
              )}

              {/* Mute Chat */}
              {current.chatId && (
                <button
                  onClick={handleMute}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200 transition-colors mr-auto rtl:mr-0 rtl:ml-auto"
                >
                  <VolumeX className="w-3 h-3" />
                  <span>{isArabic ? 'كتم' : 'Mute'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Dismiss button */}
          <button
            id="tg-notif-banner-dismiss"
            onClick={(e) => {
              e.stopPropagation();
              onDismiss(current.id);
            }}
            className="shrink-0 p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            title={isArabic ? 'إغلاق' : 'Dismiss'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
