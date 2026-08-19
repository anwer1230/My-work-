import React, { useState, useEffect } from 'react';
import {
  X,
  Repeat,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  Clock,
  Layers,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { ChatItem } from '../types';

interface RotatingBroadcasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  chats?: Array<{ id: string | number; title?: string; name?: string; type?: string; [key: string]: any }>;
}

const STORAGE_KEY = 'tg_rotating_settings_v2';

export const RotatingBroadcasterModal: React.FC<RotatingBroadcasterModalProps> = ({
  isOpen,
  onClose,
  chats,
}) => {
  const [messages, setMessages] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.messages) && parsed.messages.length > 0) return parsed.messages;
      }
    } catch (_) {}
    return [
      '🎓 خدمات بحوث الماجستير والدكتوراه بأعلى معايير الجودة الأكاديمية.',
      '📊 التحليل الإحصائي المتقدم ومناقشة النتائج عبر SPSS و R و Python.',
      '✨ صياغة وتنسيق رسائل الماجستير ومشاريع التخرج باحترافية وسرعة إنجاز.',
    ];
  });

  const [newMsgInput, setNewMsgInput] = useState('');
  const [intervalMinutes, setIntervalMinutes] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.intervalMinutes) return Number(parsed.intervalMinutes);
      }
    } catch (_) {}
    return 30;
  });

  const [status, setStatus] = useState<'idle' | 'running' | 'paused'>('idle');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, intervalMinutes, status }));
    } catch (_) {}
  }, [messages, intervalMinutes, status]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddMessage = () => {
    const trimmed = newMsgInput.trim();
    if (!trimmed) return;
    setMessages((prev) => [...prev, trimmed]);
    setNewMsgInput('');
    showToast('✅ تمت إضافة رسالة للنشر المتسلسل');
  };

  const handleRemoveMessage = (idx: number) => {
    setMessages((prev) => prev.filter((_, i) => i !== idx));
    showToast('🗑️ تم حذف الرسالة');
  };

  const handleToggleStartPause = async () => {
    if (status === 'running') {
      setStatus('paused');
      await fetch('/api/rotating/pause', { method: 'POST' }).catch(() => {});
      showToast('⏸️ تم إيقاف النشر المتسلسل مؤقتاً');
    } else if (status === 'paused') {
      setStatus('running');
      await fetch('/api/rotating/resume', { method: 'POST' }).catch(() => {});
      showToast('▶️ تم استئناف النشر المتسلسل');
    } else {
      if (messages.length === 0) {
        showToast('⚠️ أضف رسالة واحدة على الأقل');
        return;
      }
      setStatus('running');
      await fetch('/api/rotating/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, interval_minutes: intervalMinutes }),
      }).catch(() => {});
      showToast('🚀 تم بدء النشر التناوبي المتسلسل');
    }
  };

  const handleStop = async () => {
    setStatus('idle');
    await fetch('/api/rotating/stop', { method: 'POST' }).catch(() => {});
    showToast('⏹️ تم إيقاف النشر المتسلسل');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2600] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md select-none font-['Cairo',sans-serif]">
      <div
        className="w-full max-w-3xl max-h-[92vh] bg-zinc-950 border border-zinc-800 text-zinc-100 flex flex-col rounded-2xl shadow-2xl overflow-hidden transition-all duration-300"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-zinc-900/90 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-inner ${
                status === 'running'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40 animate-pulse'
                  : status === 'paused'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
              }`}
            >
              <Repeat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-zinc-100">
                  النشر المتسلسل التناوبي (Rotating Broadcaster)
                </span>
                <span
                  className={`px-2 py-0.5 text-[11px] rounded-full font-black flex items-center gap-1 ${
                    status === 'running'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : status === 'paused'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      status === 'running'
                        ? 'bg-emerald-400 animate-ping'
                        : status === 'paused'
                        ? 'bg-amber-400'
                        : 'bg-zinc-500'
                    }`}
                  />
                  {status === 'running' ? 'نشر نشط' : status === 'paused' ? 'متوقف مؤقتاً' : 'خامل'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                تبديل الرسائل دورياً ونشرها على فترات متباعدة لمنع التكرار وحظر الحساب
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls */}
        <div className="px-5 py-3 bg-zinc-900/50 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleStartPause}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
                status === 'running'
                  ? 'bg-amber-500 text-zinc-950 hover:bg-amber-400 font-black'
                  : 'bg-purple-600 text-white hover:bg-purple-500'
              }`}
            >
              {status === 'running' ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>إيقاف مؤقت للنشر (Pause)</span>
                </>
              ) : status === 'paused' ? (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>استئناف النشر (Resume)</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>بدء النشر المتسلسل</span>
                </>
              )}
            </button>

            {status !== 'idle' && (
              <button
                onClick={handleStop}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-rose-500/20 hover:text-rose-300 border border-zinc-700 text-xs font-semibold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إيقاف كامل</span>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Add Message */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 space-y-3">
            <span className="font-bold text-sm text-zinc-200">إضافة رسالة جديدة للتناوب</span>
            <div className="flex gap-2">
              <textarea
                rows={2}
                placeholder="اكتب صيغة رسالة جديدة للنشر الدوري..."
                value={newMsgInput}
                onChange={(e) => setNewMsgInput(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs placeholder:text-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button
                onClick={handleAddMessage}
                className="flex items-center gap-1.5 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة</span>
              </button>
            </div>
          </div>

          {/* Messages Sequence List */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 space-y-3">
            <span className="font-bold text-sm text-zinc-200">
              قائمة الرسائل التناوبية ({messages.length} رسائل)
            </span>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center shrink-0 border border-purple-500/30">
                      {idx + 1}
                    </span>
                    <span className="text-zinc-200 truncate">{msg}</span>
                  </div>

                  <button
                    onClick={() => handleRemoveMessage(idx)}
                    className="text-zinc-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-zinc-900 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Interval */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300">
              الفاصل الزمني بين كل رسالة والأخرى (بالدقائق):
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={720}
                value={intervalMinutes}
                onChange={(e) => setIntervalMinutes(Math.max(1, Number(e.target.value)))}
                className="w-20 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-center font-bold text-purple-300"
              />
              <span className="text-xs text-zinc-400">دقيقة</span>
            </div>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-zinc-800 text-zinc-100 border border-zinc-700 text-xs font-bold rounded-xl shadow-xl z-50 animate-fade-in">
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
};
