import React, { useState, useRef } from 'react';
import {
  Send,
  Paperclip,
  Image,
  FileText,
  Mic,
  MicOff,
  BarChart2,
  Keyboard,
  Smile,
  X,
  Sparkles,
  VolumeX,
  Clock,
  Flame,
  Zap,
  Heart,
  PartyPopper,
  ChevronUp,
  Reply,
} from 'lucide-react';
import { Message } from '../types';

interface MessageInputProps {
  replyingMessage?: Message | null;
  onClearReply?: () => void;
  onSendMessage: (text: string) => void;
  onSendAdvancedMessage?: (
    text: string,
    options: {
      isSilent?: boolean;
      scheduledAt?: string;
      effect?: 'party' | 'heart' | 'fire' | 'zap' | 'star';
      replyTo?: { id: string; sender_name: string; text: string };
    }
  ) => void;
  onSendPhoto: (filePath: string, caption: string) => void;
  onSendDocument: (filePath: string, caption: string) => void;
  onSendVoice: (duration: number) => void;
  onSendVideoNote?: (duration: number) => void;
  onOpenPollModal: () => void;
  onOpenKeyboardModal: () => void;
  onTyping: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  replyingMessage,
  onClearReply,
  onSendMessage,
  onSendAdvancedMessage,
  onSendPhoto,
  onSendDocument,
  onSendVoice,
  onSendVideoNote,
  onOpenPollModal,
  onOpenKeyboardModal,
  onTyping,
}) => {
  const [text, setText] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showSendOptions, setShowSendOptions] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Recording states (Voice OR Circular Video Note)
  const [recordMode, setRecordMode] = useState<'audio' | 'video'>('audio');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);

  const emojisList = ['😀', '😂', '😍', '🔥', '👍', '❤️', '🎉', '👏', '⚡', '🙌', '🚀', '💯'];

  const handleSend = (
    options: {
      isSilent?: boolean;
      scheduledAt?: string;
      effect?: 'party' | 'heart' | 'fire' | 'zap' | 'star';
    } = {}
  ) => {
    if (!text.trim()) return;

    const replyToData = replyingMessage
      ? {
          id: replyingMessage.id,
          sender_name: replyingMessage.sender_name,
          text: replyingMessage.content.text || replyingMessage.content.caption || 'وسائط مرفقة',
        }
      : undefined;

    if (onSendAdvancedMessage && (options.isSilent || options.scheduledAt || options.effect || replyToData)) {
      onSendAdvancedMessage(text.trim(), { ...options, replyTo: replyToData });
    } else {
      onSendMessage(text.trim());
    }

    setText('');
    setShowSendOptions(false);
    if (onClearReply) onClearReply();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    onTyping();
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);

    if (recordMode === 'video') {
      navigator.mediaDevices
        ?.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          videoStreamRef.current = stream;
          if (videoPreviewRef.current) {
            videoPreviewRef.current.srcObject = stream;
          }
        })
        .catch(() => {
          console.log('Camera access fallback');
        });
    }
  };

  const stopAndSendRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach((t) => t.stop());
      videoStreamRef.current = null;
    }
    setIsRecording(false);

    if (recordMode === 'video') {
      if (onSendVideoNote) onSendVideoNote(recordingTime || 8);
      else onSendVoice(recordingTime || 8);
    } else {
      onSendVoice(recordingTime || 5);
    }
    setRecordingTime(0);
  };

  const cancelRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach((t) => t.stop());
      videoStreamRef.current = null;
    }
    setIsRecording(false);
    setRecordingTime(0);
  };

  return (
    <div className="bg-[#17212b] border-t border-white/[0.06] p-2.5 relative z-10 select-none dir-rtl font-['Cairo',sans-serif]">
      
      {/* Quoted Reply Banner */}
      {replyingMessage && (
        <div className="mb-2 p-2 px-3 bg-[#242f3d] border-r-[3px] border-[#50a2e9] rounded-xl flex items-center justify-between text-xs animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <Reply className="w-4 h-4 text-[#50a2e9] shrink-0" />
            <div className="min-w-0">
              <div className="font-bold text-[#50a2e9]">{replyingMessage.sender_name}</div>
              <div className="text-zinc-300 truncate text-[11px]">
                {replyingMessage.content.text || replyingMessage.content.caption || 'رسالة مرفقة'}
              </div>
            </div>
          </div>
          <button
            onClick={onClearReply}
            className="p-1 hover:bg-white/10 text-zinc-400 hover:text-white rounded-full transition-colors"
            title="إلغاء الرد"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Emoji Picker Modal */}
      {showEmojiPicker && (
        <div className="absolute bottom-16 right-12 bg-[#17212b] border border-white/[0.08] rounded-2xl shadow-2xl p-2.5 w-64 grid grid-cols-6 gap-1.5 z-50 animate-in zoom-in-95">
          {emojisList.map((e) => (
            <button
              key={e}
              onClick={() => {
                setText((prev) => prev + e);
                setShowEmojiPicker(false);
              }}
              className="text-xl p-1.5 hover:bg-[#242f3d] rounded-xl transition-transform hover:scale-125"
            >
              {e}
            </button>
          ))}
        </div>
      )}

      {/* Advanced Send Options Popup Menu (Telegram Android Style) */}
      {showSendOptions && (
        <div className="absolute bottom-16 left-4 bg-[#17212b] border border-white/[0.08] rounded-2xl shadow-2xl p-2 w-64 space-y-1 z-50 text-xs font-semibold text-zinc-200 animate-in fade-in zoom-in-95">
          <div className="px-3 py-1 text-[10px] text-zinc-400 font-bold">
            خيارات الإرسال المتقدمة
          </div>

          <button
            onClick={() => handleSend({ isSilent: true })}
            className="w-full text-right p-2.5 rounded-xl hover:bg-[#242f3d] flex items-center justify-between text-zinc-200 hover:text-amber-300 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <VolumeX className="w-4 h-4 text-amber-400" />
              <span>إرسال صامت (بدون صوت)</span>
            </div>
          </button>

          <button
            onClick={() => {
              setShowSendOptions(false);
              setShowScheduleModal(true);
            }}
            className="w-full text-right p-2.5 rounded-xl hover:bg-[#242f3d] flex items-center justify-between text-zinc-200 hover:text-[#50a2e9] transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-[#50a2e9]" />
              <span>جدولة الرسالة بوقت محدد</span>
            </div>
          </button>

          <div className="pt-1 border-t border-white/[0.06]">
            <div className="px-3 py-1 text-[10px] text-zinc-400 font-bold">
              إرسال مع تأثير بصري
            </div>
            <div className="grid grid-cols-4 gap-1 p-1">
              <button
                onClick={() => handleSend({ effect: 'party' })}
                className="p-2 hover:bg-[#242f3d] rounded-xl flex flex-col items-center gap-1 text-[10px] text-amber-300"
                title="تأثير احتفال"
              >
                <PartyPopper className="w-4 h-4 text-amber-400" />
                <span>احتفال</span>
              </button>

              <button
                onClick={() => handleSend({ effect: 'heart' })}
                className="p-2 hover:bg-[#242f3d] rounded-xl flex flex-col items-center gap-1 text-[10px] text-rose-300"
                title="تأثير القلوب"
              >
                <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
                <span>قلوب</span>
              </button>

              <button
                onClick={() => handleSend({ effect: 'fire' })}
                className="p-2 hover:bg-[#242f3d] rounded-xl flex flex-col items-center gap-1 text-[10px] text-orange-300"
                title="تأثير حماس"
              >
                <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
                <span>نار</span>
              </button>

              <button
                onClick={() => handleSend({ effect: 'zap' })}
                className="p-2 hover:bg-[#242f3d] rounded-xl flex flex-col items-center gap-1 text-[10px] text-yellow-300"
                title="تأثير طاقة"
              >
                <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span>طاقة</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attachments Popup Menu */}
      {showAttachMenu && (
        <div className="absolute bottom-16 right-4 bg-[#17212b] border border-white/[0.08] rounded-2xl shadow-2xl p-2 w-60 space-y-1 z-50 text-xs font-semibold text-zinc-200 animate-in zoom-in-95">
          <button
            onClick={() => {
              setShowAttachMenu(false);
              const path = prompt(
                'أدخل رابط الصورة أو مسارها:',
                'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=600&q=80'
              );
              if (path) onSendPhoto(path, 'صورة مرفقة 📷');
            }}
            className="w-full text-right p-2.5 hover:bg-[#242f3d] rounded-xl flex items-center gap-3 transition-colors"
          >
            <Image className="w-4 h-4 text-[#50a2e9]" />
            <span>إرسال صورة / معرض</span>
          </button>

          <button
            onClick={() => {
              setShowAttachMenu(false);
              const name = prompt('أدخل اسم المستند أو مساره:', 'ملف_تليجرام.pdf');
              if (name) onSendDocument(name, 'مستند مرفق 📁');
            }}
            className="w-full text-right p-2.5 hover:bg-[#242f3d] rounded-xl flex items-center gap-3 transition-colors"
          >
            <FileText className="w-4 h-4 text-[#4fae4e]" />
            <span>إرسال ملف / مستند</span>
          </button>

          <button
            onClick={() => {
              setShowAttachMenu(false);
              onOpenPollModal();
            }}
            className="w-full text-right p-2.5 hover:bg-[#242f3d] rounded-xl flex items-center gap-3 transition-colors"
          >
            <BarChart2 className="w-4 h-4 text-amber-400" />
            <span>إنشاء استطلاع رأي (Poll)</span>
          </button>

          <button
            onClick={() => {
              setShowAttachMenu(false);
              onOpenKeyboardModal();
            }}
            className="w-full text-right p-2.5 hover:bg-[#242f3d] rounded-xl flex items-center gap-3 transition-colors"
          >
            <Keyboard className="w-4 h-4 text-purple-400" />
            <span>أزرار تفاعلية (Inline Bot)</span>
          </button>
        </div>
      )}

      {/* Recording active state (Voice or Circular Video Note) */}
      {isRecording ? (
        <div className="flex flex-col items-center gap-3 bg-[#242f3d] rounded-2xl p-3 px-4 border border-rose-500/40 relative overflow-hidden shadow-2xl">
          {/* Circular Video Viewfinder Preview if Video Note */}
          {recordMode === 'video' && (
            <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-[#50a2e9] shadow-2xl shadow-[#50a2e9]/30 my-1 bg-zinc-950 flex items-center justify-center">
              <video
                ref={videoPreviewRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-105"
              />
              <div className="absolute inset-0 border-2 border-dashed border-sky-300 rounded-full animate-spin pointer-events-none" />
            </div>
          )}

          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-rose-500 rounded-full animate-ping" />
              <span className="text-xs font-mono font-bold text-rose-400">
                {recordMode === 'video' ? '📹 تسجيل فيديو دائرِي:' : '🎙️ تسجيل صوتِي:'} 0:
                {recordingTime < 10 ? `0${recordingTime}` : recordingTime}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={cancelRecording}
                className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-white/10 rounded-xl transition-colors text-xs font-semibold"
              >
                إلغاء
              </button>

              <button
                onClick={stopAndSendRecording}
                className="bg-[#4fae4e] hover:bg-emerald-400 text-white font-bold px-4 py-2 rounded-full text-xs flex items-center gap-1.5 transition-colors shadow-lg active:scale-95"
              >
                <span>إرسال</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Regular Input Bar - Telegram Android Rounded Style */
        <div className="flex items-end gap-2">
          {/* Input Capsule */}
          <div className="flex-1 bg-[#242f3d] rounded-3xl border border-transparent focus-within:border-[#50a2e9]/50 flex items-center px-3 py-1.5 transition-all shadow-inner relative">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-zinc-400 hover:text-amber-400 transition-colors p-1 shrink-0"
              title="إيموجي"
            >
              <Smile className="w-5 h-5" />
            </button>

            <textarea
              rows={1}
              placeholder="اكتب رسالتك..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent text-sm text-zinc-100 resize-none focus:outline-none placeholder:text-zinc-500 max-h-28 leading-relaxed px-2 font-['Cairo',sans-serif]"
            />

            <button
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className={`p-1.5 rounded-full transition-colors shrink-0 ${
                showAttachMenu
                  ? 'text-[#50a2e9]'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="إرفاق ملف أو صورة"
            >
              <Paperclip className="w-5 h-5 -rotate-45" />
            </button>
          </div>

          {/* Action FAB button (Send or Mic) */}
          {text.trim() ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleSend()}
                className="w-11 h-11 bg-[#50a2e9] hover:bg-[#64b5f6] text-white rounded-full transition-all active:scale-95 shadow-md flex items-center justify-center shrink-0"
                title="إرسال الرسالة"
              >
                <Send className="w-5 h-5" />
              </button>

              <button
                onClick={() => setShowSendOptions(!showSendOptions)}
                className="p-2 text-zinc-400 hover:text-white rounded-full transition-colors"
                title="خيارات إرسال إضافية"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              {/* Record Button (Mic or Video Note) */}
              <button
                onClick={startRecording}
                className="w-11 h-11 bg-[#50a2e9] hover:bg-[#64b5f6] text-white rounded-full transition-all active:scale-95 shadow-md flex items-center justify-center shrink-0"
                title={recordMode === 'video' ? 'بدء تسجيل فيديو دائرِي' : 'بدء تسجيل صوتِي'}
              >
                {recordMode === 'video' ? (
                  <Sparkles className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>

              {/* Mode Toggle Button */}
              <button
                onClick={() => setRecordMode((prev) => (prev === 'audio' ? 'video' : 'audio'))}
                className="text-[10px] text-zinc-400 hover:text-[#50a2e9] p-1 font-mono font-bold"
                title="تبديل صوت / فيديو دائرِي"
              >
                {recordMode === 'video' ? '📹' : '🎙️'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Schedule Time Picker Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none dir-rtl">
          <div className="bg-[#17212b] border border-white/[0.08] rounded-3xl p-5 w-full max-w-xs shadow-2xl space-y-4">
            <div className="font-bold text-sm text-zinc-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#50a2e9]" />
              <span>جدولة موعد إرسال الرسالة</span>
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">حدد الوقت والتاريخ:</label>
              <input
                type="datetime-local"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="w-full bg-[#242f3d] border border-transparent focus:border-[#50a2e9] rounded-xl p-2.5 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  handleSend({ scheduledAt: scheduleTime || new Date().toISOString() });
                  setShowScheduleModal(false);
                }}
                className="flex-1 bg-[#50a2e9] hover:bg-[#64b5f6] text-white font-bold p-2.5 rounded-xl text-xs transition-colors shadow"
              >
                جدولة الآن
              </button>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="p-2.5 bg-[#242f3d] text-zinc-300 rounded-xl text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
