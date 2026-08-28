import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Clock,
  CornerUpLeft,
  Share2,
  Trash2,
  Edit2,
  Copy,
  Languages,
  Pin,
  X,
  Smile,
} from 'lucide-react';
import { Message, Chat } from '../types';
import { SystemMessageItem } from './SystemMessageItem';
import { ChatMessageCell } from './ChatMessageCell';

interface MessageListProps {
  messages: Message[];
  currentUserId: string | number;
  allChats?: Chat[];
  activeChat?: Chat | null;
  onReaction: (chatId: string | number, messageId: string | number, reaction: string) => void;
  onEdit: (message: Message) => void;
  onDelete: (chatId: string | number, messageId: string | number) => void;
  onPinMessage?: (chatId: string | number, messageId: string | number, pinned: boolean) => void;
  onReply?: (message: Message) => void;
  onForward?: (message: Message, targetChatId: string | number) => void;
  onOpenSenderProfile?: (senderName: string, avatar?: string, senderId?: string | number) => void;
  onAnswerCallback: (callbackId: string, text: string) => void;
  onDownloadFile: (fileId: string | number) => void;
  downloadProgress: Record<string, number>;
  chatWallpaper?: string;
  onOpenLinkModal?: (url: string) => void;
  onOpenMarkdownDoc?: (title: string, content: string) => void;
  onLazyLoadOlderMessages?: () => void;
  isLoadingMore?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  allChats = [],
  activeChat,
  onReaction,
  onEdit,
  onDelete,
  onPinMessage,
  onReply,
  onForward,
  onOpenSenderProfile,
  onAnswerCallback,
  onDownloadFile,
  downloadProgress,
  chatWallpaper,
  onOpenLinkModal,
  onOpenMarkdownDoc,
  onLazyLoadOlderMessages,
  isLoadingMore = false,
}) => {
  const [activeContextMenuMsg, setActiveContextMenuMsg] = useState<Message | null>(null);
  const [forwardModalMsg, setForwardModalMsg] = useState<Message | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!onLazyLoadOlderMessages || !topSentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isLoadingMore) {
          onLazyLoadOlderMessages();
        }
      },
      { root: listContainerRef.current, rootMargin: '100px 0px 0px 0px', threshold: 0.1 }
    );
    observer.observe(topSentinelRef.current);
    return () => observer.disconnect();
  }, [onLazyLoadOlderMessages, isLoadingMore]);

  React.useEffect(() => {
    if (!isLoadingMore) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  const showToast = (text: string) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('📋 تم نسخ النص للحافظة بنجاح');
    setActiveContextMenuMsg(null);
  };

  const reactionList = ['👍', '❤️', '🔥', '🎉', '👏', '😮', '😢', '💩', '⚡', '⭐'];

  // DrKLO/Telegram Date Formatter (Today, Yesterday, Full Date)
  const formatDateHeader = (timestamp: string | number) => {
    const rawVal = typeof timestamp === 'number' && timestamp < 10000000000 ? timestamp * 1000 : timestamp;
    const d = new Date(rawVal);
    if (isNaN(d.getTime())) return '';
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();

    if (isToday) return 'اليوم';
    if (isYesterday) return 'أمس';
    return d.toLocaleDateString('ar-EG', {
      day: 'numeric',
      month: 'long',
      year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const isDifferentDay = (d1: string | number, d2: string | number) => {
    const raw1 = typeof d1 === 'number' && d1 < 10000000000 ? d1 * 1000 : d1;
    const raw2 = typeof d2 === 'number' && d2 < 10000000000 ? d2 * 1000 : d2;
    const date1 = new Date(raw1);
    const date2 = new Date(raw2);
    if (isNaN(date1.getTime()) || isNaN(date2.getTime())) return false;
    return date1.toDateString() !== date2.toDateString();
  };

  const isGroupOrChannel = activeChat?.type === 'group' || activeChat?.type === 'supergroup' || activeChat?.type === 'channel';

  return (
    <div
      ref={listContainerRef}
      className="flex-1 overflow-y-auto p-4 space-y-1 relative"
      style={{
        backgroundImage: chatWallpaper
          ? `url('${chatWallpaper}')`
          : 'radial-gradient(ellipse at top, #0f172a, #020617, #020617)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      onClick={() => setActiveContextMenuMsg(null)}
    >
      {/* Intersection Observer Sentinel for lazy loading older messages */}
      <div ref={topSentinelRef} style={{ height: 1, width: '100%', pointerEvents: 'none' }} />

      {/* Loading Indicator for Older Messages */}
      {isLoadingMore && (
        <div className="flex items-center justify-center py-2 gap-2 text-xs text-sky-400 font-semibold animate-pulse">
          <Clock className="w-3.5 h-3.5 animate-spin" />
          <span>جاري تحميل الرسائل الأقدم...</span>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-sky-300 border border-sky-500/40 px-4 py-2 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs select-none">
          <div className="p-4 bg-slate-900/80 rounded-3xl border border-slate-800 shadow-xl flex flex-col items-center gap-2">
            <Sparkles className="w-8 h-8 text-sky-400 animate-pulse" />
            <span className="font-bold text-slate-200">محادثة مشفرة آمنة (End-to-End Encryption)</span>
            <span className="text-[11px] text-slate-400">لا توجد رسائل سابقة. أرسل أول رسالة لبدء المحادثة!</span>
          </div>
        </div>
      ) : (
        messages.map((msg, index) => {
          const prevMsg = index > 0 ? messages[index - 1] : null;
          const nextMsg = index < messages.length - 1 ? messages[index + 1] : null;

          const showDateHeader = !prevMsg || isDifferentDay(msg.date, prevMsg.date);
          const dateHeaderText = showDateHeader ? formatDateHeader(msg.date) : '';

          // If this is a System Message
          if (msg.is_system || (msg.content?.type as any) === 'system' || msg.sender_id === 'system') {
            const systemText = msg.text || msg.content?.text || 'إشعار نظام';
            return (
              <React.Fragment key={msg.id}>
                {showDateHeader && (
                  <div className="sticky top-2 z-10 self-center my-2 select-none flex justify-center w-full">
                    <span className="bg-slate-900/80 backdrop-blur-md px-3.5 py-1 rounded-full text-[11px] font-bold text-slate-200 shadow-md border border-slate-700/60 font-mono">
                      {dateHeaderText}
                    </span>
                  </div>
                )}
                <SystemMessageItem
                  text={systemText}
                  type={msg.system_type}
                  date={msg.date}
                  isMe={msg.is_outgoing || msg.from_me}
                />
              </React.Fragment>
            );
          }

          // Consecutive message grouping logic (DrKLO/Telegram MessagesAdapter & MessageObject)
          const isSameSenderAsPrev =
            Boolean(prevMsg) &&
            !prevMsg?.is_system &&
            !showDateHeader &&
            (prevMsg?.sender_id === msg.sender_id || (Boolean(prevMsg?.is_outgoing) && Boolean(msg.is_outgoing)));

          const isSameSenderAsNext =
            Boolean(nextMsg) &&
            !nextMsg?.is_system &&
            !isDifferentDay(msg.date, nextMsg.date) &&
            (nextMsg?.sender_id === msg.sender_id || (Boolean(nextMsg?.is_outgoing) && Boolean(msg.is_outgoing)));

          const isFirstInGroup = !isSameSenderAsPrev;
          const isLastInGroup = !isSameSenderAsNext;
          const isMiddleInGroup = isSameSenderAsPrev && isSameSenderAsNext;

          // In DrKLO/Telegram:
          // 1. Sender name is shown on the FIRST message of a group (if in group/channel and not outgoing)
          // 2. Avatar is shown on the LAST message of a group (bottom-left alignment)
          const showSenderName = isGroupOrChannel && !msg.is_outgoing && isFirstInGroup;
          const showAvatar = isGroupOrChannel && !msg.is_outgoing && isLastInGroup;

          return (
            <React.Fragment key={msg.id}>
              {/* DrKLO/Telegram Floating Date Header */}
              {showDateHeader && (
                <div className="sticky top-2 z-10 self-center my-2 select-none flex justify-center w-full">
                  <span className="bg-slate-900/85 backdrop-blur-md px-3.5 py-1 rounded-full text-[11px] font-bold text-slate-200 shadow-md border border-slate-700/60 font-mono">
                    {dateHeaderText}
                  </span>
                </div>
              )}

              {/* Chat Message Cell */}
              <ChatMessageCell
                message={msg}
                currentUserId={currentUserId}
                activeChat={activeChat}
                showAvatar={showAvatar}
                showSenderName={showSenderName}
                isFirstInGroup={isFirstInGroup}
                isLastInGroup={isLastInGroup}
                isMiddleInGroup={isMiddleInGroup}
                onReaction={onReaction}
                onEdit={onEdit}
                onDelete={onDelete}
                onPinMessage={onPinMessage}
                onReply={onReply}
                onForward={(message, targetChatId) => setForwardModalMsg(message)}
                onOpenSenderProfile={onOpenSenderProfile}
                onAnswerCallback={onAnswerCallback}
                onDownloadFile={onDownloadFile}
                downloadProgress={downloadProgress}
                onOpenLinkModal={onOpenLinkModal}
                onOpenMarkdownDoc={onOpenMarkdownDoc}
                onContextMenu={(m, e) => setActiveContextMenuMsg(m)}
              />
            </React.Fragment>
          );
        })
      )}

      {/* Context Menu Modal (Telegram Android Long Press Menu) */}
      {activeContextMenuMsg && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setActiveContextMenuMsg(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900/95 border border-slate-700/80 rounded-2xl p-2 w-72 shadow-2xl text-xs space-y-1 animate-in fade-in zoom-in-95"
          >
            {/* Quick Reactions Bar */}
            <div className="flex items-center justify-between gap-1 p-2 bg-slate-800/80 rounded-xl mb-2 overflow-x-auto">
              {reactionList.slice(0, 7).map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    onReaction(activeContextMenuMsg.chat_id, activeContextMenuMsg.id, emoji);
                    setActiveContextMenuMsg(null);
                  }}
                  className="p-1 hover:scale-125 transition-transform text-base"
                >
                  {emoji}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                onReply?.(activeContextMenuMsg);
                setActiveContextMenuMsg(null);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-800 rounded-xl text-slate-200 text-right transition-colors"
            >
              <CornerUpLeft className="w-4 h-4 text-sky-400" />
              <span>الرد على الرسالة (Reply)</span>
            </button>

            <button
              type="button"
              onClick={() => copyText(activeContextMenuMsg.content?.text || activeContextMenuMsg.text || '')}
              className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-800 rounded-xl text-slate-200 text-right transition-colors"
            >
              <Copy className="w-4 h-4 text-emerald-400" />
              <span>نسخ النص للحافظة (Copy)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setForwardModalMsg(activeContextMenuMsg);
                setActiveContextMenuMsg(null);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-800 rounded-xl text-slate-200 text-right transition-colors"
            >
              <Share2 className="w-4 h-4 text-purple-400" />
              <span>توجيه الرسالة (Forward)</span>
            </button>

            {onPinMessage && (
              <button
                type="button"
                onClick={() => {
                  onPinMessage(activeContextMenuMsg.chat_id, activeContextMenuMsg.id, !activeContextMenuMsg.is_pinned);
                  setActiveContextMenuMsg(null);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-800 rounded-xl text-amber-300 text-right transition-colors"
              >
                <Pin className="w-4 h-4 text-amber-400" />
                <span>{activeContextMenuMsg.is_pinned ? 'إلغاء التثبيت' : 'تثبيت الرسالة (Pin)'}</span>
              </button>
            )}

            {activeContextMenuMsg.is_outgoing && onEdit && (
              <button
                type="button"
                onClick={() => {
                  onEdit(activeContextMenuMsg);
                  setActiveContextMenuMsg(null);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-800 rounded-xl text-blue-300 text-right transition-colors"
              >
                <Edit2 className="w-4 h-4 text-blue-400" />
                <span>تعديل الرسالة (Edit)</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onDelete(activeContextMenuMsg.chat_id, activeContextMenuMsg.id);
                setActiveContextMenuMsg(null);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-rose-500/20 text-rose-400 rounded-xl text-right transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>حذف الرسالة (Delete)</span>
            </button>
          </div>
        </div>
      )}

      {/* Forward Modal */}
      {forwardModalMsg && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <Share2 className="w-4 h-4 text-sky-400" />
                <span>توجيه إلى محادثة</span>
              </h3>
              <button
                type="button"
                onClick={() => setForwardModalMsg(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1">
              {allChats.map((chat) => (
                <button
                  key={chat.id}
                  type="button"
                  onClick={() => {
                    onForward?.(forwardModalMsg, chat.id);
                    setForwardModalMsg(null);
                    showToast(`🚀 تم توجيه الرسالة إلى ${chat.title}`);
                  }}
                  className="w-full flex items-center gap-3 p-2.5 hover:bg-slate-800/80 rounded-xl text-right transition-colors"
                >
                  <img
                    src={chat.avatar || 'https://telegram.org/img/t_logo.png'}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                  <div className="flex-1 truncate font-semibold text-xs text-slate-200">
                    {chat.title}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};
