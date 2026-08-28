import React, { useState } from 'react';
import {
  Check,
  CheckCheck,
  Play,
  Pause,
  Download,
  FileText,
  Pin,
  Share2,
  VolumeX,
  Flame,
  Heart,
  PartyPopper,
  CornerUpLeft,
  ChevronDown,
  ChevronUp,
  Copy,
  Clock,
  ExternalLink,
  ShieldCheck,
  Bot,
  Crown,
} from 'lucide-react';
import { Message, Chat, InlineKeyboardButton } from '../types';
import { ChatAvatar } from './ChatAvatar';
import { MemberTagBadge } from './MemberTagBadge';

// Telegram Android 7-color name palette
export const TELEGRAM_NAME_COLORS = [
  'text-sky-400',
  'text-emerald-400',
  'text-amber-400',
  'text-orange-400',
  'text-rose-400',
  'text-purple-400',
  'text-cyan-400',
];

export function getTelegramSenderColor(idOrName: string | number): string {
  const str = String(idOrName || 'user');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % TELEGRAM_NAME_COLORS.length;
  return TELEGRAM_NAME_COLORS[idx];
}

export interface ChatMessageCellProps {
  message: Message;
  currentUserId: string | number;
  activeChat?: Chat | null;
  showAvatar: boolean;
  showSenderName: boolean;
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
  isMiddleInGroup?: boolean;
  onReaction?: (chatId: string | number, messageId: string | number, reaction: string) => void;
  onEdit?: (message: Message) => void;
  onDelete?: (chatId: string | number, messageId: string | number) => void;
  onPinMessage?: (chatId: string | number, messageId: string | number, pinned: boolean) => void;
  onReply?: (message: Message) => void;
  onForward?: (message: Message, targetChatId: string | number) => void;
  onOpenSenderProfile?: (senderName: string, avatar?: string, senderId?: string | number) => void;
  onAnswerCallback?: (callbackId: string, text: string) => void;
  onDownloadFile?: (fileId: string | number) => void;
  downloadProgress?: Record<string, number>;
  onOpenLinkModal?: (url: string) => void;
  onOpenMarkdownDoc?: (title: string, content: string) => void;
  onContextMenu?: (msg: Message, e: React.MouseEvent) => void;
}

export const ChatMessageCell: React.FC<ChatMessageCellProps> = ({
  message,
  currentUserId,
  activeChat,
  showAvatar,
  showSenderName,
  isFirstInGroup = true,
  isLastInGroup = true,
  isMiddleInGroup = false,
  onReaction,
  onEdit,
  onDelete,
  onPinMessage,
  onReply,
  onForward,
  onOpenSenderProfile,
  onAnswerCallback,
  onDownloadFile,
  downloadProgress = {},
  onOpenLinkModal,
  onOpenMarkdownDoc,
  onContextMenu,
}) => {
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [collapsedQuotes, setCollapsedQuotes] = useState<Record<string, boolean>>({});
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<string | null>(null);
  const [revealedSpoilers, setRevealedSpoilers] = useState<Record<string, boolean>>({});

  const isOut = Boolean(
    message.is_outgoing ||
    message.from_me ||
    message.out ||
    String(message.sender_id) === String(currentUserId) ||
    String(message.sender_id) === 'me'
  );

  const senderColor = getTelegramSenderColor(message.sender_id || message.sender_name || 'user');
  const senderDisplayName = message.sender_name || (isOut ? 'أنت' : 'مستخدم');
  const senderRole =
    message.sender_name?.toLowerCase().includes('admin') || message.sender_name?.toLowerCase().includes('مشرف')
      ? 'admin'
      : message.sender_name?.toLowerCase().includes('bot') || message.sender_name?.toLowerCase().includes('بوت')
      ? 'bot'
      : message.sender_name?.toLowerCase().includes('مالك') || message.sender_name?.toLowerCase().includes('owner')
      ? 'owner'
      : undefined;

  // Format message time (e.g. 10:45 AM)
  const formatTime = (rawDate: string | number) => {
    try {
      const d = typeof rawDate === 'number' && rawDate < 10000000000 ? new Date(rawDate * 1000) : new Date(rawDate);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  // Telegram advanced formatted text parser: Spoilers, Collapsible Quotes, Code blocks, Links
  const renderAdvancedFormattedText = (rawText: string, messageId: string | number) => {
    const lines = rawText.split('\n');
    const result: React.ReactNode[] = [];

    let inCodeBlock = false;
    let codeBuffer: string[] = [];
    let codeLanguage = '';
    let quoteBuffer: string[] = [];

    const flushQuote = (keyIdx: number) => {
      if (quoteBuffer.length === 0) return;
      const quoteKey = `${messageId}_q_${keyIdx}`;
      const isCollapsed = collapsedQuotes[quoteKey] || false;
      const contentText = quoteBuffer.join('\n');

      result.push(
        <div
          key={quoteKey}
          className="my-1.5 rounded-lg border-r-4 border-sky-400 bg-sky-950/40 p-2 text-xs transition-all"
        >
          <div
            onClick={() => setCollapsedQuotes((prev) => ({ ...prev, [quoteKey]: !isCollapsed }))}
            className="flex cursor-pointer items-center justify-between font-bold text-sky-300 select-none hover:text-sky-200"
          >
            <span className="flex items-center gap-1.5">
              <span className="text-sky-400">❝</span> اقتباس قابل للطي
            </span>
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </div>
          {!isCollapsed && (
            <div className="mt-1.5 whitespace-pre-wrap text-slate-200 opacity-90 italic">
              {contentText}
            </div>
          )}
        </div>
      );
      quoteBuffer = [];
    };

    lines.forEach((line, idx) => {
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          const codeKey = `${messageId}_code_${idx}`;
          const codeString = codeBuffer.join('\n');
          result.push(
            <div
              key={codeKey}
              className="my-2 overflow-hidden rounded-xl border border-white/10 bg-slate-950 p-2.5 font-mono text-[11px] shadow-md dir-ltr text-left"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-1.5 text-[10px] text-slate-400">
                <span className="uppercase text-sky-400 font-bold">{codeLanguage || 'CODE'}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(codeString);
                    setCopiedCodeIndex(codeKey);
                    setTimeout(() => setCopiedCodeIndex(null), 1800);
                  }}
                  className="flex items-center gap-1 hover:text-emerald-300 text-slate-400 font-sans"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedCodeIndex === codeKey ? 'تم النسخ!' : 'نسخ الكود'}</span>
                </button>
              </div>
              <pre className="overflow-x-auto whitespace-pre text-emerald-300 py-1">{codeString}</pre>
            </div>
          );
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          flushQuote(idx);
          inCodeBlock = true;
          codeLanguage = line.replace('```', '').trim();
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      if (line.startsWith('>')) {
        quoteBuffer.push(line.replace(/^>\s?/, ''));
        return;
      } else {
        flushQuote(idx);
      }

      // Check for inline markdown (links, bold, code)
      const urlRegex = /(https?:\/\/[^\s]+|t\.me\/[^\s]+|telegram\.me\/[^\s]+)/gi;
      const parts = line.split(urlRegex);

      result.push(
        <div key={`line_${idx}`} className="leading-relaxed whitespace-pre-wrap break-words">
          {parts.map((part, pIdx) => {
            if (part && (part.startsWith('http://') || part.startsWith('https://') || part.startsWith('t.me/') || part.startsWith('telegram.me/'))) {
              const fullUrl = part.startsWith('http') ? part : `https://${part}`;
              return (
                <button
                  key={`url_${pIdx}`}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOpenLinkModal) onOpenLinkModal(fullUrl);
                    else window.open(fullUrl, '_blank');
                  }}
                  className="text-sky-300 hover:text-sky-200 underline font-medium inline-flex items-center gap-0.5 mx-0.5"
                >
                  <span>{part}</span>
                  <ExternalLink className="w-2.5 h-2.5 inline opacity-70" />
                </button>
              );
            }
            return <span key={`txt_${pIdx}`}>{part}</span>;
          })}
        </div>
      );
    });

    flushQuote(lines.length);
    return result;
  };

  // Telegram bubble border-radius math based on sequence position
  const getBubbleRadiusClasses = () => {
    if (isOut) {
      if (isFirstInGroup && isLastInGroup) return 'rounded-2xl rounded-br-sm';
      if (isFirstInGroup) return 'rounded-2xl rounded-br-md';
      if (isLastInGroup) return 'rounded-2xl rounded-tr-md rounded-br-sm';
      return 'rounded-2xl rounded-r-md';
    } else {
      if (isFirstInGroup && isLastInGroup) return 'rounded-2xl rounded-bl-sm';
      if (isFirstInGroup) return 'rounded-2xl rounded-bl-md';
      if (isLastInGroup) return 'rounded-2xl rounded-tl-md rounded-bl-sm';
      return 'rounded-2xl rounded-l-md';
    }
  };

  return (
    <div
      id={`msg_${message.id}`}
      className={`flex items-end gap-2 group w-full ${isOut ? 'justify-end' : 'justify-start'} ${
        isFirstInGroup ? 'mt-2.5' : 'mt-1'
      }`}
    >
      {/* 1. Left Avatar (DrKLO/Telegram pattern: shown on bottom-left for incoming messages in group/supergroup/channel) */}
      {!isOut && (
        <div className="w-8 shrink-0 flex flex-col items-center justify-end">
          {showAvatar ? (
            <div
              onClick={() => onOpenSenderProfile?.(senderDisplayName, message.sender_avatar, message.sender_id)}
              className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
              title={`عرض ملف ${senderDisplayName}`}
            >
              <ChatAvatar title={senderDisplayName} avatar={message.sender_avatar} size="xs" />
            </div>
          ) : (
            <div className="w-8 h-8" />
          )}
        </div>
      )}

      {/* 2. Message Bubble Container */}
      <div className={`flex flex-col max-w-[85%] md:max-w-[72%] ${isOut ? 'items-end' : 'items-start'}`}>
        <div
          onContextMenu={(e) => {
            e.preventDefault();
            if (onContextMenu) onContextMenu(message, e);
          }}
          className={`relative p-3 shadow-md text-xs transition-all select-text ${getBubbleRadiusClasses()} ${
            isOut
              ? 'bg-gradient-to-br from-sky-600 to-blue-700 text-slate-50 border border-sky-400/25'
              : 'bg-slate-800/95 text-slate-100 border border-slate-700/80 backdrop-blur-md'
          }`}
        >
          {/* Swipe To Reply Hint Indicator */}
          <button
            type="button"
            onClick={() => onReply?.(message)}
            className={`absolute top-1/2 -translate-y-1/2 p-1.5 bg-slate-900/80 text-sky-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-lg ${
              isOut ? '-left-8' : '-right-8'
            }`}
            title="الرد على الرسالة"
          >
            <CornerUpLeft className="w-3.5 h-3.5" />
          </button>

          {/* 3. Sender Name Header (Telegram Group/Channel incoming messages) */}
          {!isOut && showSenderName && (
            <div
              onClick={() => onOpenSenderProfile?.(senderDisplayName, message.sender_avatar, message.sender_id)}
              className="flex items-center gap-1.5 mb-1 pb-0.5 cursor-pointer hover:opacity-90 transition-opacity select-none"
            >
              <span className={`font-bold text-[11px] ${senderColor} hover:underline`}>
                {senderDisplayName}
              </span>
              {senderRole && <MemberTagBadge role={senderRole} />}
            </div>
          )}

          {/* Special Effects (Party, Heart, Flame) */}
          {message.effect === 'party' && (
            <div className="text-amber-300 font-bold text-[10px] flex items-center gap-1 mb-1 bg-amber-500/20 px-2 py-0.5 rounded-full w-max animate-bounce">
              <PartyPopper className="w-3 h-3 text-amber-400" />
              <span>تأثير الاحتفال 🎉</span>
            </div>
          )}
          {message.effect === 'heart' && (
            <div className="text-rose-300 font-bold text-[10px] flex items-center gap-1 mb-1 bg-rose-500/20 px-2 py-0.5 rounded-full w-max animate-pulse">
              <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
              <span>تأثير القلوب ❤️</span>
            </div>
          )}
          {message.effect === 'fire' && (
            <div className="text-orange-300 font-bold text-[10px] flex items-center gap-1 mb-1 bg-orange-500/20 px-2 py-0.5 rounded-full w-max">
              <Flame className="w-3 h-3 text-orange-400 fill-orange-400" />
              <span>تأثير الحماس 🔥</span>
            </div>
          )}

          {/* Silent Message Indicator */}
          {message.is_silent && (
            <div className="flex items-center gap-1 text-[10px] text-slate-300/80 mb-1 font-mono">
              <VolumeX className="w-3 h-3 text-slate-400" />
              <span>تم الإرسال بصمت</span>
            </div>
          )}

          {/* Forwarded Header */}
          {message.forward_from && (
            <div className="flex items-center gap-1.5 text-[10px] text-sky-300 font-semibold mb-1.5 pb-1 border-b border-white/10">
              <Share2 className="w-3 h-3 text-sky-300" />
              <span>تم التوجيه من {message.forward_from.sender_name}</span>
            </div>
          )}

          {/* Pinned Tag */}
          {message.is_pinned && (
            <div className="flex items-center gap-1 text-[10px] text-amber-300 font-medium mb-1.5 pb-1 border-b border-white/10">
              <Pin className="w-3 h-3 text-amber-400 fill-amber-400 rotate-45" />
              <span>رسالة مثبتة في أعلى القناة</span>
            </div>
          )}

          {/* Reply Quote Banner */}
          {message.reply_to && (
            <div className="mb-2 p-2 rounded-lg bg-black/25 border-r-2 border-sky-400 text-[11px]">
              <div className="font-bold text-sky-300">{message.reply_to.sender_name}</div>
              <div className="text-slate-300 line-clamp-1 opacity-90">{message.reply_to.text}</div>
            </div>
          )}

          {/* Content: TEXT */}
          {(message.content?.type === 'text' || (!message.content?.type && (message.text || message.content?.text))) && (
            <div className="space-y-1">
              {renderAdvancedFormattedText(message.content?.text || message.text || '', message.id)}
            </div>
          )}

          {/* Content: PHOTO */}
          {message.content?.type === 'photo' && (
            <div className="space-y-2">
              <img
                src={
                  message.content.filePath ||
                  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=600&q=80'
                }
                alt="Photo"
                className="rounded-xl max-h-72 object-cover w-full border border-black/20"
                loading="lazy"
              />
              {message.content.caption && (
                <p className="text-xs opacity-90 leading-relaxed">{message.content.caption}</p>
              )}
            </div>
          )}

          {/* Content: DOCUMENT */}
          {message.content?.type === 'document' && (
            <div className="flex items-center gap-3 p-2 bg-black/20 rounded-xl border border-white/10 min-w-[220px]">
              <div className="p-2.5 bg-sky-500/20 text-sky-300 rounded-lg shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-xs truncate">
                  {message.content.fileName || 'مستند_مرفق.pdf'}
                </div>
                <div className="text-[10px] opacity-70 font-mono">
                  {message.content.fileSize || '3.2 MB'}
                </div>

                {downloadProgress[message.id] !== undefined && (
                  <div className="w-full bg-slate-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-400 h-full transition-all duration-300"
                      style={{ width: `${downloadProgress[message.id]}%` }}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {message.content.fileName?.endsWith('.md') && (
                  <button
                    type="button"
                    onClick={() =>
                      onOpenMarkdownDoc?.(
                        message.content?.fileName || 'document.md',
                        message.content?.caption || message.content?.text || '# دليل التوثيق والتعليمات\n- يدعم تليجرام عارض Markdown المدمج'
                      )
                    }
                    className="p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors text-xs font-bold"
                    title="فتح وقراءة المستند في تليجرام"
                  >
                    قراءة
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onDownloadFile?.(message.id)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sky-300"
                  title="تحميل الملف"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Content: VOICE / AUDIO */}
          {(message.content?.type === 'voice' || message.content?.type === 'audio') && (
            <div className="flex items-center gap-3 py-1 min-w-[220px]">
              <button
                type="button"
                onClick={() => setIsPlayingVoice(!isPlayingVoice)}
                className="w-9 h-9 rounded-full bg-sky-500 hover:bg-sky-400 text-white flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-md"
              >
                {isPlayingVoice ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
              </button>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-1 h-5">
                  {[40, 70, 30, 90, 50, 80, 20, 60, 100, 45, 75, 35, 85, 55, 95].map((val, i) => (
                    <div
                      key={i}
                      className={`w-1 rounded-full transition-all duration-300 ${
                        isPlayingVoice && i % 3 === 0
                          ? 'bg-emerald-400 animate-pulse'
                          : isOut
                          ? 'bg-sky-200/60'
                          : 'bg-slate-400/60'
                      }`}
                      style={{ height: `${val}%` }}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-[10px] opacity-70 font-mono">
                  <span>{message.content.duration ? `${message.content.duration}s` : '0:14'}</span>
                  <span>{isPlayingVoice ? 'جاري التشغيل...' : 'صوتية مشفرة'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Message Info: Time, Edited status, Read receipts */}
          <div className="flex items-center justify-end gap-1 text-[10px] opacity-70 mt-1 select-none font-mono">
            {message.is_edited && <span className="text-[9px] opacity-80">معدلة</span>}
            <span>{formatTime(message.date)}</span>
            {isOut && (
              <span className="flex items-center">
                {message.status === 'sending' || message.status === 'pending' ? (
                  <Clock className="w-3 h-3 animate-spin opacity-70" />
                ) : message.status === 'read' ? (
                  <CheckCheck className="w-3.5 h-3.5 text-sky-200" />
                ) : (
                  <Check className="w-3.5 h-3.5 opacity-80" />
                )}
              </span>
            )}
          </div>

          {/* Reactions Bar */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5 pt-1 border-t border-white/10">
              {message.reactions.map((r, rIdx) => (
                <button
                  key={rIdx}
                  type="button"
                  onClick={() => onReaction?.(message.chat_id, message.id, r.emoji)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold transition-transform active:scale-95 ${
                    r.mine
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'bg-black/30 text-slate-200 hover:bg-black/40 border border-white/10'
                  }`}
                >
                  <span>{r.emoji}</span>
                  <span className="text-[10px] font-mono">{r.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
