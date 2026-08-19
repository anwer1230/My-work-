import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  UserPlus,
  Play,
  Pause,
  RotateCcw,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Link,
  Layers,
  Sparkles,
  Search,
} from 'lucide-react';
import { TelegramLinkEngine, InviteLinkParseResult } from '../lib/telegramNativeEngine';

interface AutoJoinerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY = 'tg_autojoin_settings_v2';

export const AutoJoinerModal: React.FC<AutoJoinerModalProps> = ({ isOpen, onClose }) => {
  const [linksText, setLinksText] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.linksText !== undefined) return parsed.linksText;
      }
    } catch (_) {}
    return 'https://t.me/joinchat/AAAAAF...\nhttps://t.me/group_example_1\nhttps://t.me/channel_example_2';
  });

  const [joinDelay, setJoinDelay] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.joinDelay) return Number(parsed.joinDelay);
      }
    } catch (_) {}
    return 12;
  });

  const [maxRetries, setMaxRetries] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.maxRetries) return Number(parsed.maxRetries);
      }
    } catch (_) {}
    return 3;
  });

  const [status, setStatus] = useState<'idle' | 'running' | 'paused' | 'completed'>('idle');
  const [progress, setProgress] = useState({ current: 0, total: 0, success: 0, failed: 0, already: 0 });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ linksText, joinDelay, maxRetries }));
    } catch (_) {}
  }, [linksText, joinDelay, maxRetries]);

  // Listen to SSE progress
  useEffect(() => {
    const es = new EventSource('/api/events');
    es.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload.type === 'autojoin_progress' && payload.data) {
          const d = payload.data;
          if (d.counts) {
            setProgress({
              current: d.counts.done || d.idx || 0,
              total: d.counts.total || d.total || 0,
              success: d.counts.success || 0,
              failed: d.counts.fail || 0,
              already: d.counts.already || 0,
            });
          }
        }
      } catch (_) {}
    };
    return () => es.close();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const parsedLinks = useMemo(() => {
    return TelegramLinkEngine.extractAllLinks(linksText);
  }, [linksText]);

  const handleStartJoin = async () => {
    const validLinks = parsedLinks.map((p) => p.cleanUrl);

    if (validLinks.length === 0) {
      showToast('⚠️ يرجى إدخال روابط أو معرفات تليجرام صالحة');
      return;
    }

    setStatus('running');
    setProgress({ current: 0, total: validLinks.length, success: 0, failed: 0, already: 0 });

    try {
      const res = await fetch('/api/autojoin/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          links: validLinks,
          delay: joinDelay,
          max_retries: maxRetries,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`🚀 بدأ الانضمام التلقائي لـ ${validLinks.length} رابط بنجاح`);
      }
    } catch (_) {
      setStatus('idle');
      showToast('❌ تعذر بدء عملية الانضمام');
    }
  };

  const handleTogglePauseResume = async () => {
    if (status === 'running') {
      setStatus('paused');
      await fetch('/api/autojoin/pause', { method: 'POST' }).catch(() => {});
      showToast('⏸️ تم إيقاف الانضمام مؤقتاً');
    } else if (status === 'paused') {
      setStatus('running');
      await fetch('/api/autojoin/pause', { method: 'POST' }).catch(() => {});
      showToast('▶️ تم استئناف الانضمام التلقائي');
    }
  };

  const handleStop = async () => {
    setStatus('idle');
    await fetch('/api/autojoin/stop', { method: 'POST' }).catch(() => {});
    showToast('⏹️ تم إيقاف عملية الانضمام');
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
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 animate-pulse'
                  : status === 'paused'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
              }`}
            >
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-zinc-100">
                  الانضمام التلقائي للمجموعات والقنوات
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
                  {status === 'running'
                    ? 'جاري الانضمام'
                    : status === 'paused'
                    ? 'متوقف مؤقتاً'
                    : 'جاهز'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                انضمام ذكي متسلسل للروابط مع احترام حدود التيليجرام وفترات الانتظار
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
            {status === 'idle' || status === 'completed' ? (
              <button
                onClick={handleStartJoin}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 shadow-sky-950/50"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>بدء الانضمام التلقائي</span>
              </button>
            ) : (
              <button
                onClick={handleTogglePauseResume}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
                  status === 'running'
                    ? 'bg-amber-500 text-zinc-950 hover:bg-amber-400 font-black shadow-amber-950/50'
                    : 'bg-sky-600 text-white hover:bg-sky-500 shadow-sky-950/50'
                }`}
              >
                {status === 'running' ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>إيقاف مؤقت (Pause)</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>استئناف الانضمام (Resume)</span>
                  </>
                )}
              </button>
            )}

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
          {/* Links Textarea */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-zinc-200">
                روابط المجموعات والقنوات المستهدفة
              </span>
              <span className="text-xs text-zinc-400">رابط في كل سطر</span>
            </div>
            <textarea
              rows={6}
              placeholder="https://t.me/example_group&#10;https://t.me/joinchat/AAAAAF..."
              value={linksText}
              onChange={(e) => setLinksText(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs placeholder:text-zinc-500 focus:outline-none focus:border-sky-500 transition-colors font-mono"
            />
          </div>

          {/* Delay Settings */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-zinc-300">
                الفاصل الزمني بين كل انضمام والآخر (بالثواني):
              </span>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={5}
                  max={60}
                  value={joinDelay}
                  onChange={(e) => setJoinDelay(Number(e.target.value))}
                  className="flex-1 accent-sky-500"
                />
                <span className="px-3 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-bold text-sky-400">
                  {joinDelay} ثانية
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold text-zinc-300">أقصى محاولات إعادة عند الفشل:</span>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={maxRetries}
                  onChange={(e) => setMaxRetries(Number(e.target.value))}
                  className="w-20 px-3 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-bold text-center text-sky-400"
                />
                <span className="text-xs text-zinc-400">محاولات</span>
              </div>
            </div>
          </div>

          {/* Progress */}
          {status !== 'idle' && (
            <div className="bg-zinc-900/80 border border-sky-500/30 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-sky-400">تقدم الانضمام التلقائي</span>
                <span className="text-zinc-300">
                  {progress.current} من {progress.total}
                </span>
              </div>
              <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                <div
                  className="h-full bg-sky-500 transition-all duration-300"
                  style={{
                    width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          )}
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
