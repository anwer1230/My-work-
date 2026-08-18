import React, { useState, useRef } from 'react';
import {
  Check,
  CheckCheck,
  Play,
  Pause,
  Download,
  FileText,
  Smile,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
  Sparkles,
  BarChart2,
  Clock,
  Pin,
  Reply,
  Share2,
  Languages,
  X,
  Volume2,
  VolumeX,
  Flame,
  Zap,
  Heart,
  PartyPopper,
  CornerUpLeft,
} from 'lucide-react';
import { Message, Chat, InlineKeyboardButton } from '../types';
import { ChatAvatar } from './ChatAvatar';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  allChats?: Chat[];
  onReaction: (chatId: number, messageId: string, reaction: string) => void;
  onEdit: (message: Message) => void;
  onDelete: (chatId: number, messageId: string) => void;
  onPinMessage?: (chatId: number, messageId: string, pinned: boolean) => void;
  onReply?: (message: Message) => void;
  onForward?: (message: Message, targetChatId: number) => void;
  onOpenSenderProfile?: (senderName: string, avatar?: string) => void;
  onAnswerCallback: (callbackId: string, text: string) => void;
  onDownloadFile: (fileId: string) => void;
  downloadProgress: Record<string, number>;
  chatWallpaper?: string;
  onOpenLinkModal?: (url: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  allChats = [],
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
}) => {
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [activeContextMenuMsg, setActiveContextMenuMsg] = useState<Message | null>(null);
  const [forwardModalMsg, setForwardModalMsg] = useState<Message | null>(null);
  const [translatedMsgs, setTranslatedMsgs] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const showToast = (text: string) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const toggleVoice = (id: string) => {
    if (playingVoiceId === id) setPlayingVoiceId(null);
    else setPlayingVoiceId(id);
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('📋 تم نسخ النص للحافظة بنجاح');
    setActiveContextMenuMsg(null);
  };

  const handleTranslate = (msg: Message) => {
    const text = msg.content.text || msg.content.caption || '';
    if (!text) return;

    // Simulate instant AI Translation to Arabic with indicator
    const arabicTranslation = `[مترجم آلياً]: ${text.replace(/hello/gi, 'أهلاً بك').replace(/telegram/gi, 'تليجرام').replace(/welcome/gi, 'مرحباً')}`;
    setTranslatedMsgs((prev) => ({ ...prev, [msg.id]: arabicTranslation }));
    showToast('🌐 تمت ترجمة النص بنجاح');
    setActiveContextMenuMsg(null);
  };

  const reactionList = ['👍', '❤️', '🔥', '🎉', '👏', '😮', '😢', '💩', '⚡', '⭐'];

  // Helper to format text with links detection and basic markdown
  const renderFormattedText = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+|t\.me\/[^\s]+|telegram\.me\/[^\s]+)/gi;

    return text.split('\n').map((line, lineIdx) => {
      const parts = line.split(urlRegex);
      return (
        <React.Fragment key={lineIdx}>
          {lineIdx > 0 && <br />}
          {parts.map((part, pIdx) => {
            if (part && part.match(urlRegex)) {
              const fullUrl = part.startsWith('http') ? part : `https://${part}`;
              return (
                <button
                  key={pIdx}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOpenLinkModal) {
                      onOpenLinkModal(fullUrl);
                    } else {
                      window.open(fullUrl, '_blank');
                    }
                  }}
                  className="text-amber-300 hover:text-amber-200 underline font-semibold dir-ltr inline-flex items-center gap-1 px-1.5 py-0.5 my-0.5 rounded-md bg-black/20 hover:bg-black/40 transition-colors"
                  title="انقر لعرض خيارات وتفاصيل الرابط"
                >
                  <ExternalLink className="w-3 h-3 text-amber-400 inline shrink-0" />
                  <span>{part}</span>
                </button>
              );
            }
            return <span key={pIdx}>{part}</span>;
          })}
        </React.Fragment>
      );
    });
  };

  return (
    <div
      className="flex-1 overflow-y-auto p-4 space-y-3 relative transition-all duration-300"
      style={{
        backgroundImage: chatWallpaper
          ? `url('${chatWallpaper}')`
          : 'radial-gradient(ellipse at top, #0f172a, #020617, #020617)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      onClick={() => setActiveContextMenuMsg(null)}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-sky-300 border border-sky-500/40 px-4 py-2 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 animate-bounce">
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
        messages.map((msg) => {
          const isOut = msg.is_outgoing;
          const translated = translatedMsgs[msg.id];

          return (
            <div
              key={msg.id}
              id={`msg_${msg.id}`}
              className={`flex flex-col group ${isOut ? 'items-end' : 'items-start'}`}
            >
              {/* Sender Avatar & Name Header */}
              {!isOut && (
                <div
                  onClick={() => onOpenSenderProfile?.(msg.sender_name, msg.sender_avatar)}
                  className="flex items-center gap-1.5 mb-1 mr-1 cursor-pointer group-hover:opacity-100 opacity-90 transition-opacity"
                  title="عرض الملف الشخصي"
                >
                  <ChatAvatar title={msg.sender_name} avatar={msg.sender_avatar} size="xs" />
                  <span className="text-[11px] font-bold text-sky-400 hover:underline">
                    {msg.sender_name}
                  </span>
                </div>
              )}

              {/* Message Bubble Container */}
              <div
                onContextMenu={(e) => {
                  e.preventDefault();
                  setActiveContextMenuMsg(msg);
                }}
                className={`relative max-w-[85%] md:max-w-[70%] p-3 rounded-2xl shadow-lg text-xs transition-all select-text ${
                  isOut
                    ? 'bg-gradient-to-br from-sky-600 to-blue-700 text-slate-50 rounded-bl-2xl rounded-br-sm border border-sky-400/20'
                    : 'bg-slate-800/90 text-slate-100 border border-slate-700/80 rounded-br-2xl rounded-bl-sm backdrop-blur-md'
                }`}
              >
                {/* Swipe To Reply Hint Indicator */}
                <button
                  onClick={() => onReply?.(msg)}
                  className="absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 bg-slate-900/80 text-sky-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                  title="المسح أو النقر للرد"
                >
                  <CornerUpLeft className="w-4 h-4" />
                </button>

                {/* Effect Screen Visuals */}
                {msg.effect === 'party' && (
                  <div className="text-amber-300 font-bold text-[10px] flex items-center gap-1 mb-1 bg-amber-500/20 px-2 py-0.5 rounded-full w-max animate-bounce">
                    <PartyPopper className="w-3 h-3 text-amber-400" />
                    <span>تأثير الاحتفال 🎉</span>
                  </div>
                )}
                {msg.effect === 'heart' && (
                  <div className="text-rose-300 font-bold text-[10px] flex items-center gap-1 mb-1 bg-rose-500/20 px-2 py-0.5 rounded-full w-max animate-pulse">
                    <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
                    <span>تأثير القلوب ❤️</span>
                  </div>
                )}
                {msg.effect === 'fire' && (
                  <div className="text-orange-300 font-bold text-[10px] flex items-center gap-1 mb-1 bg-orange-500/20 px-2 py-0.5 rounded-full w-max">
                    <Flame className="w-3 h-3 text-orange-400 fill-orange-400" />
                    <span>تأثير الحماس 🔥</span>
                  </div>
                )}

                {/* Silent Message Badge */}
                {msg.is_silent && (
                  <div className="flex items-center gap-1 text-[10px] text-slate-300/80 mb-1 font-mono">
                    <VolumeX className="w-3 h-3 text-slate-400" />
                    <span>تم الإرسال بصمت</span>
                  </div>
                )}

                {/* Forwarded Banner */}
                {msg.forward_from && (
                  <div className="flex items-center gap-1.5 text-[10px] text-sky-300 font-semibold mb-1.5 pb-1 border-b border-white/10">
                    <Share2 className="w-3 h-3 text-sky-300" />
                    <span>تم التوجيه من {msg.forward_from.sender_name}</span>
                  </div>
                )}

                {/* Pinned Badge */}
                {msg.is_pinned && (
                  <div className="flex items-center gap-1 text-[10px] text-amber-300 font-medium mb-1.5 pb-1 border-b border-white/10">
                    <Pin className="w-3 h-3 text-amber-400 fill-amber-400 rotate-45" />
                    <span>رسالة مثبتة في أعلى القناة</span>
                  </div>
                )}

                {/* Quoted Reply Block */}
                {msg.reply_to && (
                  <div className="mb-2 p-2 rounded-lg bg-black/25 border-r-2 border-sky-400 text-[11px]">
                    <div className="font-bold text-sky-300">{msg.reply_to.sender_name}</div>
                    <div className="text-slate-300 line-clamp-1 opacity-90">{msg.reply_to.text}</div>
                  </div>
                )}

                {/* Content type: TEXT */}
                {msg.content.type === 'text' && (
                  <div className="whitespace-pre-wrap leading-relaxed text-sm font-sans dir-auto">
                    {renderFormattedText(msg.content.text || '')}
                  </div>
                )}

                {/* Translated Text Box */}
                {translated && (
                  <div className="mt-2 p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs leading-relaxed dir-auto">
                    {translated}
                  </div>
                )}

                {/* Content type: PHOTO */}
                {msg.content.type === 'photo' && (
                  <div className="space-y-2">
                    <img
                      src={
                        msg.content.filePath ||
                        'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=600&q=80'
                      }
                      alt="Photo"
                      className="rounded-xl max-h-72 object-cover w-full border border-black/20"
                    />
                    {msg.content.caption && (
                      <p className="text-xs opacity-90 leading-relaxed">{msg.content.caption}</p>
                    )}
                  </div>
                )}

                {/* Content type: DOCUMENT */}
                {msg.content.type === 'document' && (
                  <div className="flex items-center gap-3 p-2 bg-black/20 rounded-xl border border-white/10 min-w-[220px]">
                    <div className="p-2.5 bg-sky-500/20 text-sky-300 rounded-lg shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-xs truncate">
                        {msg.content.fileName || 'مستند_مرفق.pdf'}
                      </div>
                      <div className="text-[10px] opacity-70 font-mono">
                        {msg.content.fileSize || '3.2 MB'}
                      </div>

                      {/* Download progress */}
                      {downloadProgress[msg.id] !== undefined && (
                        <div className="w-full bg-slate-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-400 h-full transition-all duration-300"
                            style={{ width: `${downloadProgress[msg.id]}%` }}
                          />
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => onDownloadFile(msg.id)}
                      className="p-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg shrink-0 transition-colors"
                      title="تحميل الملف"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Content type: VOICE */}
                {msg.content.type === 'voice' && (
                  <div className="flex items-center gap-3 p-1.5 min-w-[210px]">
                    <button
                      onClick={() => toggleVoice(msg.id)}
                      className="p-2.5 bg-sky-400 text-slate-950 rounded-full shrink-0 shadow hover:scale-105 transition-transform"
                    >
                      {playingVoiceId === msg.id ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-0.5 h-6">
                        {[40, 70, 30, 90, 100, 50, 80, 40, 60, 90, 30, 80, 60, 100, 40].map((h, i) => (
                          <div
                            key={i}
                            className={`w-1 rounded-full transition-all ${
                              playingVoiceId === msg.id
                                ? 'bg-emerald-300 animate-pulse'
                                : 'bg-slate-300/40'
                            }`}
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                      <div className="text-[10px] opacity-70 font-mono mt-0.5">
                        0:{msg.content.duration || '12'} رسالة صوتية
                      </div>
                    </div>
                  </div>
                )}

                {/* Content type: CIRCULAR VIDEO NOTE (مقطع فيديو دائرِي) */}
                {msg.content.type === 'video_note' && (
                  <div className="relative my-1 flex flex-col items-center">
                    <div className="relative w-44 h-44 rounded-full overflow-hidden border-4 border-sky-400 shadow-2xl bg-slate-950 flex items-center justify-center group/vid">
                      <video
                        src={
                          msg.content.filePath ||
                          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
                        }
                        autoPlay={playingVoiceId === msg.id}
                        loop
                        muted={playingVoiceId !== msg.id}
                        playsInline
                        className="w-full h-full object-cover rounded-full"
                      />
                      <button
                        onClick={() => toggleVoice(msg.id)}
                        className="absolute p-3 bg-black/60 hover:bg-sky-500 hover:text-slate-950 text-white rounded-full transition-transform hover:scale-110 shadow-xl border border-white/20"
                      >
                        {playingVoiceId === msg.id ? (
                          <Pause className="w-6 h-6 fill-current" />
                        ) : (
                          <Play className="w-6 h-6 fill-current" />
                        )}
                      </button>
                    </div>
                    <div className="mt-1 font-mono text-[10px] text-sky-300 font-bold bg-slate-950/80 px-2 py-0.5 rounded-full border border-sky-500/30">
                      📹 فيديو دائرِي (0:{msg.content.duration || '08'})
                    </div>
                  </div>
                )}

                {/* Content type: POLL */}
                {msg.content.type === 'poll' && msg.content.poll && (
                  <div className="space-y-2 min-w-[240px]">
                    <div className="font-bold text-xs flex items-center gap-1.5">
                      <BarChart2 className="w-4 h-4 text-amber-400" />
                      <span>{msg.content.poll.question}</span>
                    </div>

                    <div className="space-y-1.5">
                      {msg.content.poll.options.map((opt) => {
                        const pct = msg.content.poll!.totalVotes
                          ? Math.round((opt.votes / msg.content.poll!.totalVotes) * 100)
                          : 0;
                        return (
                          <div
                            key={opt.id}
                            className="p-2 bg-black/20 hover:bg-black/30 rounded-xl cursor-pointer transition-colors border border-white/5"
                          >
                            <div className="flex justify-between text-xs mb-1 font-medium">
                              <span>{opt.text}</span>
                              <span className="font-mono text-[10px] font-bold">{pct}%</span>
                            </div>
                            <div className="w-full bg-slate-700/60 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-sky-400 h-full transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Inline Keyboard Rows */}
                {msg.reply_markup && msg.reply_markup.rows.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-white/10 space-y-1.5">
                    {msg.reply_markup.rows.map((row, rIdx) => (
                      <div key={rIdx} className="flex gap-1.5">
                        {row.map((btn, bIdx) => (
                          <button
                            key={bIdx}
                            onClick={() => {
                              if (btn.url) window.open(btn.url, '_blank');
                              else if (btn.callback_data)
                                onAnswerCallback(btn.callback_data, btn.text);
                            }}
                            className="flex-1 py-1.5 px-2 bg-slate-900/80 hover:bg-slate-950 text-sky-300 font-semibold rounded-lg text-[11px] flex items-center justify-center gap-1 border border-slate-700/50 shadow-sm transition-all"
                          >
                            <span>{btn.text}</span>
                            {btn.url && <ExternalLink className="w-3 h-3 text-slate-400" />}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {/* Reactions */}
                {msg.reactions && msg.reactions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2 pt-1 border-t border-white/10">
                    {msg.reactions.map((r, i) => (
                      <button
                        key={i}
                        onClick={() => onReaction(msg.chat_id, msg.id, r.emoji)}
                        className={`text-[11px] px-2 py-0.5 rounded-full border flex items-center gap-1 transition-colors ${
                          r.users.includes('me')
                            ? 'bg-sky-500/30 border-sky-400 text-sky-200'
                            : 'bg-black/20 border-white/10 text-slate-300'
                        }`}
                      >
                        <span>{r.emoji}</span>
                        <span className="font-mono text-[10px] font-bold">{r.count}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Message Footer: Time, Edited, Read Status Icons */}
                <div className="flex items-center justify-end gap-1.5 mt-1 text-[10px] opacity-75 font-mono select-none">
                  {msg.is_edited && <span className="text-amber-300">معدلة</span>}
                  <span>
                    {new Date(msg.date).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {/* Status Checkmarks (pending 🕒, sent ✓, delivered ✓✓, read ✓✓ blue) */}
                  {isOut && (
                    <div className="flex items-center">
                      {msg.status === 'pending' ? (
                        <div className="flex items-center gap-1 text-slate-300/80" title="جاري الإرسال (قيد الانتظار)">
                          <Clock className="w-3 h-3 text-sky-200 animate-spin shrink-0" />
                        </div>
                      ) : msg.status === 'sent' ? (
                        <div className="flex items-center" title="تم الإرسال (✓)">
                          <Check className="w-3.5 h-3.5 text-slate-200/90" />
                        </div>
                      ) : msg.status === 'delivered' ? (
                        <div className="flex items-center" title="تم التسليم (✓✓)">
                          <CheckCheck className="w-3.5 h-3.5 text-slate-300/90" />
                        </div>
                      ) : (
                        <div className="flex items-center" title="تمت القراءة (✓✓)">
                          <CheckCheck className="w-3.5 h-3.5 text-sky-200 fill-sky-300/20" />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Quick Action Button Bar on Hover */}
                <div
                  className={`absolute top-1 ${
                    isOut ? '-left-28' : '-right-28'
                  } opacity-0 group-hover:opacity-100 flex items-center bg-slate-900/90 border border-slate-700/80 rounded-xl p-1 space-x-1 shadow-2xl transition-opacity z-10`}
                >
                  <button
                    onClick={() => onReply?.(msg)}
                    className="p-1 hover:text-sky-400 text-slate-400"
                    title="الرد على الرسالة"
                  >
                    <Reply className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setForwardModalMsg(msg)}
                    className="p-1 hover:text-purple-400 text-slate-400"
                    title="إعادة التوجيه"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>

                  {msg.content.type === 'text' && (
                    <button
                      onClick={() => copyText(msg.content.text || '', msg.id)}
                      className="p-1 hover:text-emerald-400 text-slate-400"
                      title="نسخ النص"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {isOut && msg.content.type === 'text' && (
                    <button
                      onClick={() => onEdit(msg)}
                      className="p-1 hover:text-amber-400 text-slate-400"
                      title="تعديل الرسالة"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => onDelete(msg.chat_id, msg.id)}
                    className="p-1 hover:text-rose-400 text-slate-400"
                    title="حذف الرسالة"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* Floating Context Menu Modal (1. الضغط على أي رسالة - قائمة الخيارات) */}
      {activeContextMenuMsg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs select-none"
          onClick={() => setActiveContextMenuMsg(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-2 w-72 space-y-1 text-xs text-slate-100 animate-in fade-in zoom-in-95 dir-rtl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Reactions Bar at top */}
            <div className="flex items-center justify-around p-2 bg-slate-950/60 rounded-xl border border-slate-800">
              {reactionList.slice(0, 6).map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onReaction(activeContextMenuMsg.chat_id, activeContextMenuMsg.id, emoji);
                    setActiveContextMenuMsg(null);
                  }}
                  className="text-lg hover:scale-130 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                onReply?.(activeContextMenuMsg);
                setActiveContextMenuMsg(null);
              }}
              className="w-full text-right p-2.5 hover:bg-slate-800 rounded-xl flex items-center gap-2.5 text-slate-200 hover:text-sky-400 transition-colors"
            >
              <Reply className="w-4 h-4 text-sky-400" />
              <span>الرد (Reply)</span>
            </button>

            <button
              onClick={() => {
                setForwardModalMsg(activeContextMenuMsg);
                setActiveContextMenuMsg(null);
              }}
              className="w-full text-right p-2.5 hover:bg-slate-800 rounded-xl flex items-center gap-2.5 text-slate-200 hover:text-purple-400 transition-colors"
            >
              <Share2 className="w-4 h-4 text-purple-400" />
              <span>إعادة التوجيه (Forward)</span>
            </button>

            {activeContextMenuMsg.content.type === 'text' && (
              <button
                onClick={() => copyText(activeContextMenuMsg.content.text || '', activeContextMenuMsg.id)}
                className="w-full text-right p-2.5 hover:bg-slate-800 rounded-xl flex items-center gap-2.5 text-slate-200 hover:text-emerald-400 transition-colors"
              >
                <Copy className="w-4 h-4 text-emerald-400" />
                <span>نسخ النص (Copy)</span>
              </button>
            )}

            <button
              onClick={() => {
                onPinMessage?.(
                  activeContextMenuMsg.chat_id,
                  activeContextMenuMsg.id,
                  !activeContextMenuMsg.is_pinned
                );
                setActiveContextMenuMsg(null);
                showToast(
                  activeContextMenuMsg.is_pinned
                    ? 'تم إلغاء تثبيت الرسالة'
                    : '📌 تم تثبيت الرسالة أعلى المحادثة'
                );
              }}
              className="w-full text-right p-2.5 hover:bg-slate-800 rounded-xl flex items-center gap-2.5 text-slate-200 hover:text-amber-400 transition-colors"
            >
              <Pin className="w-4 h-4 text-amber-400" />
              <span>
                {activeContextMenuMsg.is_pinned ? 'إلغاء التثبيت' : 'تثبيت الرسالة (Pin)'}
              </span>
            </button>

            {activeContextMenuMsg.is_outgoing && activeContextMenuMsg.content.type === 'text' && (
              <button
                onClick={() => {
                  onEdit(activeContextMenuMsg);
                  setActiveContextMenuMsg(null);
                }}
                className="w-full text-right p-2.5 hover:bg-slate-800 rounded-xl flex items-center gap-2.5 text-slate-200 hover:text-amber-300 transition-colors"
              >
                <Edit2 className="w-4 h-4 text-amber-300" />
                <span>تعديل الرسالة (Edit)</span>
              </button>
            )}

            <button
              onClick={() => handleTranslate(activeContextMenuMsg)}
              className="w-full text-right p-2.5 hover:bg-slate-800 rounded-xl flex items-center gap-2.5 text-slate-200 hover:text-teal-400 transition-colors"
            >
              <Languages className="w-4 h-4 text-teal-400" />
              <span>ترجمة النص (Translate)</span>
            </button>

            <button
              onClick={() => {
                onDelete(activeContextMenuMsg.chat_id, activeContextMenuMsg.id);
                setActiveContextMenuMsg(null);
                showToast('🗑️ تم حذف الرسالة بنجاح');
              }}
              className="w-full text-right p-2.5 hover:bg-rose-500/20 rounded-xl flex items-center gap-2.5 text-rose-400 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>حذف الرسالة (Delete)</span>
            </button>
          </div>
        </div>
      )}

      {/* Forward Modal Picker */}
      {forwardModalMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none dir-rtl">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-purple-400" />
                <span>اختر المحادثة لتوحيه الرسالة إليها:</span>
              </div>
              <button onClick={() => setForwardModalMsg(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1">
              {allChats.length === 0 ? (
                <div className="text-center py-4 text-slate-500 text-xs">لا توجد محادثات أخرى متوفرة</div>
              ) : (
                allChats.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onForward?.(forwardModalMsg, c.id);
                      setForwardModalMsg(null);
                      showToast(`🔄 تم إعادة توجيه الرسالة إلى ${c.title}`);
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-slate-800 flex items-center gap-3 transition-colors text-right text-xs"
                  >
                    <ChatAvatar title={c.title} avatar={c.avatar} size="sm" />
                    <span className="font-bold text-slate-200">{c.title}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};
