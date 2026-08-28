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
  SlidersHorizontal,
} from 'lucide-react';
import { Message } from '../types';
import { RichFormattingToolbar } from './RichFormattingToolbar';

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
      replyTo?: { id: string | number; sender_name?: string; text?: string };
    }
  ) => void;
  onSendPhoto: (filePath: string, caption: string) => void;
  onSendDocument: (filePath: string, caption: string) => void;
  onSendVoice: (duration: number) => void;
  onSendVideoNote?: (duration: number) => void;
  onOpenPollModal: () => void;
  onOpenKeyboardModal: () => void;
  onTyping: () => void;
  lang?: 'ar' | 'en';
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
  lang = 'ar',
}) => {
  const [text, setText] = useState('');
  const [showFormattingBar, setShowFormattingBar] = useState(true);
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
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
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
          text: replyingMessage.content?.text || replyingMessage.content?.caption || replyingMessage.text || 'وسائط مرفقة',
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

  const handleAIAssist = (promptType: 'polish' | 'translate' | 'formal' | 'summarize') => {
    if (!text.trim()) {
      setText(lang === 'ar' ? 'مرحباً، أود الاستفسار عن تفاصيل المشروع الجديد.' : 'Hello, I would like to inquire about project details.');
      return;
    }

    if (promptType === 'polish') {
      setText((prev) => `✨ ${prev.trim()}`);
    } else if (promptType === 'translate') {
      // Toggle basic translation
      setText((prev) => (prev.startsWith('[EN]') ? prev.replace('[EN] ', '') : `[EN] ${prev}`));
    } else if (promptType === 'formal') {
      setText((prev) => `تحية طيبة،\n${prev.trim()}\nوتفضلوا بقبول فائق الاحترام والتقدير.`);
    } else if (promptType === 'summarize') {
      setText((prev) => `📌 ملخص: ${prev.trim().split('\n')[0]}`);
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
    <div className="bg-slate-900 border-t border-slate-800 p-2 relative z-10 select-none dir-rtl">
      
      {/* Modern Telegram 12.x Rich Formatting Toolbar */}
      {showFormattingBar && (
        <div className="mb-1 rounded-t-xl overflow-hidden">
          <RichFormattingToolbar
            inputText={text}
            setInputText={setText}
            textareaRef={textareaRef}
            lang={lang}
            onAIAssist={handleAIAssist}
          />
        </div>
      )}

      {/* Quoted Reply Banner */}
      {replyingMessage && (
        <div className="mb-2 p-2 bg-slate-800/90 border-r-4 border-sky-400 rounded-xl flex items-center justify-between text-xs animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <Reply className="w-4 h-4 text-sky-400 shrink-0" />
            <div className="min-w-0">
              <div className="font-bold text-sky-300">الرد على {replyingMessage.sender_name}</div>
              <div className="text-slate-300 truncate text-[11px]">
                {replyingMessage.content?.text || replyingMessage.content?.caption || replyingMessage.text || 'رسالة مرفقة'}
              </div>
            </div>
          </div>
          <button
            onClick={onClearReply}
            className="p-1 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors"
            title="إلغاء الرد"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Emoji Picker Modal */}
      {showEmojiPicker && (
        <div className="absolute bottom-16 right-12 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 w-64 grid grid-cols-6 gap-1 z-50 animate-in zoom-in-95">
          {emojisList.map((e) => (
            <button
              key={e}
              onClick={() => {
                setText((prev) => prev + e);
                setShowEmojiPicker(false);
              }}
              className="text-xl p-2 hover:bg-slate-800 rounded-xl transition-transform hover:scale-125"
            >
              {e}
            </button>
          ))}
        </div>
      )}

      {/* Advanced Send Options Popup Menu */}
      {showSendOptions && (
        <div className="absolute bottom-16 left-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 w-64 space-y-1 z-50 text-xs font-semibold text-slate-200 animate-in fade-in zoom-in-95">
          <div className="px-3 py-1 text-[10px] text-slate-500 uppercase font-bold tracking-wider">
            خيارات الإرسال المتقدمة
          </div>

          <button
            onClick={() => handleSend({ isSilent: true })}
            className="w-full text-right p-2 rounded-xl hover:bg-slate-800 flex items-center justify-between text-slate-200 hover:text-amber-300 transition-colors"
          >
            <div className="flex items-center gap-2">
              <VolumeX className="w-4 h-4 text-amber-400" />
              <span>إرسال صامت (بدون إشعار)</span>
            </div>
          </button>

          <button
            onClick={() => {
              setShowSendOptions(false);
              setShowScheduleModal(true);
            }}
            className="w-full text-right p-2 rounded-xl hover:bg-slate-800 flex items-center justify-between text-slate-200 hover:text-sky-300 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-400" />
              <span>جدولة الرسالة بوقت لاحق</span>
            </div>
          </button>

          <div className="pt-1 border-t border-slate-800">
            <div className="px-3 py-1 text-[10px] text-slate-500 uppercase font-bold tracking-wider">
              إرسال مع تأثير بصري
            </div>
            <div className="grid grid-cols-4 gap-1 p-1">
              <button
                onClick={() => handleSend({ effect: 'party' })}
                className="p-2 hover:bg-slate-800 rounded-xl flex flex-col items-center gap-1 text-[10px] text-amber-300"
                title="تأثير احتفال"
              >
                <PartyPopper className="w-4 h-4 text-amber-400" />
                <span>احتفال</span>
              </button>

              <button
                onClick={() => handleSend({ effect: 'heart' })}
                className="p-2 hover:bg-slate-800 rounded-xl flex flex-col items-center gap-1 text-[10px] text-rose-300"
                title="تأثير القلوب"
              >
                <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
                <span>قلوب</span>
              </button>

              <button
                onClick={() => handleSend({ effect: 'fire' })}
                className="p-2 hover:bg-slate-800 rounded-xl flex flex-col items-center gap-1 text-[10px] text-orange-300"
                title="تأثير حماس"
              >
                <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
                <span>نار</span>
              </button>

              <button
                onClick={() => handleSend({ effect: 'zap' })}
                className="p-2 hover:bg-slate-800 rounded-xl flex flex-col items-center gap-1 text-[10px] text-yellow-300"
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
        <div className="absolute bottom-16 right-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 w-60 space-y-1 z-50 text-xs font-semibold text-slate-200 animate-in zoom-in-95">
          <button
            onClick={() => {
              setShowAttachMenu(false);
              const path = prompt(
                'أدخل رابط الصورة أو مسارها:',
                'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=600&q=80'
              );
              if (path) {
                const caption = prompt('أدخل تعليق توضيحي للصورة (Caption):', 'صورة مرفقة 📷');
                onSendPhoto(path, caption || '');
              }
            }}
            className="w-full text-right p-2.5 hover:bg-slate-800 rounded-xl flex items-center gap-2.5 transition-colors"
          >
            <Image className="w-4 h-4 text-sky-400" />
            <span>إرسال صورة / GIF مع تعليق</span>
          </button>

          <button
            onClick={() => {
              setShowAttachMenu(false);
              const name = prompt('أدخل اسم المستند أو مساره:', 'دليل_التعليمات.md');
              if (name) {
                const caption = prompt('أدخل نص توثيق المستند (Markdown):', '# دليل التوثيق\n- مرحباً بك في تليجرام ويب الموحد!');
                onSendDocument(name, caption || 'مستند مرفق 📁');
              }
            }}
            className="w-full text-right p-2.5 hover:bg-slate-800 rounded-xl flex items-center gap-2.5 transition-colors"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>إرسال مستند / ملف .md</span>
          </button>

          <button
            onClick={() => {
              setShowAttachMenu(false);
              onOpenPollModal();
            }}
            className="w-full text-right p-2.5 hover:bg-slate-800 rounded-xl flex items-center gap-2.5 transition-colors"
          >
            <BarChart2 className="w-4 h-4 text-amber-400" />
            <span>إنشاء استطلاع رأي متقدم (Poll)</span>
          </button>

          <button
            onClick={() => {
              setShowAttachMenu(false);
              onOpenKeyboardModal();
            }}
            className="w-full text-right p-2.5 hover:bg-slate-800 rounded-xl flex items-center gap-2.5 transition-colors"
          >
            <Keyboard className="w-4 h-4 text-purple-400" />
            <span>إرسال أزرار تفاعلية (Inline Keyboard)</span>
          </button>
        </div>
      )}

      {/* Recording active state */}
      {isRecording ? (
        <div className="flex flex-col items-center gap-3 bg-slate-800/95 rounded-3xl p-3 px-4 border border-rose-500/40 relative overflow-hidden shadow-2xl">
          {recordMode === 'video' && (
            <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-sky-400 shadow-2xl shadow-sky-500/30 my-1 bg-slate-950 flex items-center justify-center">
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
                {recordMode === 'video' ? '📹 تسجيل مقطع دائرِي:' : '🎙️ تسجيل صوتِي:'} 0:
                {recordingTime < 10 ? `0${recordingTime}` : recordingTime}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={cancelRecording}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 rounded-xl transition-colors text-xs font-semibold"
              >
                إلغاء
              </button>

              <button
                onClick={stopAndSendRecording}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-1.5 rounded-xl text-xs flex items-center gap-1 transition-colors shadow-lg"
              >
                <span>إرسال</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Regular Input Bar */
        <div className="flex items-end gap-2">
          <button
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className={`p-2.5 rounded-xl transition-colors ${
              showAttachMenu
                ? 'bg-sky-500 text-slate-950'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
            }`}
            title="إرفاق ملفات أو وسائط"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <div className="flex-1 bg-slate-800/80 rounded-2xl border border-slate-700/60 flex items-center pr-3 pl-2 py-1 focus-within:border-sky-500 transition-colors relative">
            <textarea
              ref={textareaRef}
              rows={1}
              placeholder={lang === 'ar' ? 'اكتب رسالتك هنا (يدعم التنسيق الغني و Markdown)...' : 'Write a message...'}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent text-xs text-slate-100 resize-none focus:outline-none placeholder:text-slate-500 max-h-24 leading-relaxed pl-8"
            />
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute left-2 text-slate-400 hover:text-amber-400 transition-colors p-1"
              title="إيموجي"
            >
              <Smile className="w-4 h-4" />
            </button>
          </div>

          {text.trim() ? (
            <div className="flex items-center gap-1 relative">
              <button
                onClick={() => handleSend()}
                className="p-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl transition-all scale-100 active:scale-95 shadow-md flex items-center gap-1"
                title="إرسال الرسالة"
              >
                <Send className="w-5 h-5" />
              </button>

              <button
                onClick={() => setShowSendOptions(!showSendOptions)}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
                title="خيارات إرسال إضافية (صامت، جدولة، تأثيرات)"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              {/* Record Button */}
              <button
                onClick={startRecording}
                className="p-2.5 bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-slate-950 rounded-xl transition-all shadow-sm"
                title={recordMode === 'video' ? 'بدء تسجيل فيديو دائرِي' : 'بدء تسجيل صوتِي'}
              >
                {recordMode === 'video' ? (
                  <Sparkles className="w-5 h-5 text-amber-300" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>

              {/* Toggle Record Mode Button */}
              <button
                onClick={() => setRecordMode((prev) => (prev === 'audio' ? 'video' : 'audio'))}
                className={`p-2 rounded-xl text-xs font-mono font-bold transition-colors ${
                  recordMode === 'video'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
                title="تبديل النمط بين تسجيل صوتي وتسجيل فيديو دائرِي"
              >
                {recordMode === 'video' ? '📹 دائرِي' : '🎙️ صوت'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Schedule Time Picker Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none dir-rtl">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 w-full max-w-xs shadow-2xl space-y-4">
            <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-400" />
              <span>جدولة موعد إرسال الرسالة</span>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">حدد الوقت والتاريخ:</label>
              <input
                type="datetime-local"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  handleSend({ scheduledAt: scheduleTime || new Date().toISOString() });
                  setShowScheduleModal(false);
                }}
                className="flex-1 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold p-2 rounded-xl text-xs transition-colors"
              >
                جدولة الآن
              </button>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
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
