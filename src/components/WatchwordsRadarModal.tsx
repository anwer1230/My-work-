import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Radio,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Bell,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Plus,
  Trash2,
  Bookmark,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { playTelegramIncomingSound } from '../utils/telegramPeerUtils';

interface WatchwordsRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToMessage?: (chatId: number | string, msgId?: number | string) => void;
}

interface DetectionItem {
  id: string;
  keyword: string;
  groupTitle: string;
  groupLink?: string;
  senderName: string;
  text: string;
  timestamp: string;
  chatId: number | string;
  msgId?: number | string;
}

const STORAGE_KEY = 'tg_radar_settings_v2';
const DETECTIONS_KEY = 'tg_radar_detections_v2';

export const WatchwordsRadarModal: React.FC<WatchwordsRadarModalProps> = ({
  isOpen,
  onClose,
  onJumpToMessage,
}) => {
  // State initialization with localStorage persistence
  const [keywords, setKeywords] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.keywords) && parsed.keywords.length > 0) return parsed.keywords;
      }
    } catch (_) {}
    return ['دكتوراه', 'ماجستير', 'بحوث', 'تحليل احصائي', 'مشروع تخرج', 'سعر', 'طلب خدمة'];
  });

  const [newKeywordInput, setNewKeywordInput] = useState('');
  const [status, setStatus] = useState<'running' | 'paused' | 'idle'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.status) return parsed.status;
      }
    } catch (_) {}
    return 'running';
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.soundEnabled !== undefined) return parsed.soundEnabled;
      }
    } catch (_) {}
    return true;
  });

  const [ttsEnabled, setTtsEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.ttsEnabled !== undefined) return parsed.ttsEnabled;
      }
    } catch (_) {}
    return true;
  });

  const [saveToSavedMessages, setSaveToSavedMessages] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.saveToSavedMessages !== undefined) return parsed.saveToSavedMessages;
      }
    } catch (_) {}
    return true;
  });

  const [targetScope, setTargetScope] = useState<'all' | 'custom'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.targetScope) return parsed.targetScope;
      }
    } catch (_) {}
    return 'all';
  });

  const [customGroupsText, setCustomGroupsText] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.customGroupsText !== undefined) return parsed.customGroupsText;
      }
    } catch (_) {}
    return '';
  });

  const [detections, setDetections] = useState<DetectionItem[]>(() => {
    try {
      const saved = localStorage.getItem(DETECTIONS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (_) {}
    return [];
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to localStorage whenever critical settings change
  useEffect(() => {
    try {
      const config = {
        keywords,
        status,
        soundEnabled,
        ttsEnabled,
        saveToSavedMessages,
        targetScope,
        customGroupsText,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.warn('Failed to save radar settings to localStorage', e);
    }
  }, [keywords, status, soundEnabled, ttsEnabled, saveToSavedMessages, targetScope, customGroupsText]);

  // Sync detections to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(DETECTIONS_KEY, JSON.stringify(detections.slice(0, 50)));
    } catch (_) {}
  }, [detections]);

  // Sync with backend on mount or open
  useEffect(() => {
    if (isOpen) {
      fetch('/api/settings')
        .then((r) => r.json())
        .then((data) => {
          if (data?.settings?.watch_words && data.settings.watch_words.length > 0) {
            // merge with existing
            const combined = Array.from(new Set([...keywords, ...data.settings.watch_words]));
            setKeywords(combined);
          }
          if (data?.monitoring_active !== undefined) {
            if (data.monitoring_active && status === 'idle') {
              setStatus('running');
            }
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  // Listen to SSE live watchword events
  useEffect(() => {
    const es = new EventSource('/api/events');
    es.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload.type === 'watchword_alert' && payload.data) {
          const item = payload.data;
          const newDetection: DetectionItem = {
            id: `det_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
            keyword: item.word || item.keyword || 'كلمة مراقبة',
            groupTitle: item.chatTitle || item.group || 'مجموعة تليجرام',
            groupLink: item.alert_data?.group_link || item.groupLink,
            senderName: item.senderName || item.sender || 'عضو',
            text: item.text || '',
            timestamp: new Date().toLocaleTimeString('ar-SA', { hour12: true }),
            chatId: item.chatId || item.chat_id,
            msgId: item.targetMsgId || item.msg_id,
          };

          setDetections((prev) => [newDetection, ...prev.slice(0, 49)]);

          if (soundEnabled && status === 'running') {
            playTelegramIncomingSound();
          }

          if (ttsEnabled && status === 'running' && 'speechSynthesis' in window) {
            try {
              window.speechSynthesis.cancel();
              const utterance = new SpeechSynthesisUtterance(`تم رصد كلمة ${item.word} في مجموعة ${item.chatTitle}`);
              utterance.lang = 'ar-SA';
              utterance.rate = 1.05;
              window.speechSynthesis.speak(utterance);
            } catch (_) {}
          }
        }
      } catch (_) {}
    };

    return () => {
      es.close();
    };
  }, [soundEnabled, ttsEnabled, status]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddKeyword = () => {
    const trimmed = newKeywordInput.trim();
    if (!trimmed) return;
    if (keywords.includes(trimmed)) {
      showToast('⚠️ الكلمة موجودة بالفعل في قائمة الرادار');
      return;
    }
    const updated = [...keywords, trimmed];
    setKeywords(updated);
    setNewKeywordInput('');
    syncToBackend(updated, status === 'running');
    showToast(`✅ تمت إضافة: "${trimmed}"`);
  };

  const handleRemoveKeyword = (wordToRemove: string) => {
    const updated = keywords.filter((w) => w !== wordToRemove);
    setKeywords(updated);
    syncToBackend(updated, status === 'running');
    showToast(`🗑️ تم حذف: "${wordToRemove}"`);
  };

  const syncToBackend = (watchWordsList: string[], isRunning: boolean) => {
    fetch('/api/save_settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        watch_words: watchWordsList,
        enabled: isRunning,
      }),
    }).catch(() => {});
  };

  const handleTogglePauseResume = () => {
    if (status === 'running') {
      // Pause
      setStatus('paused');
      fetch('/api/monitoring/pause', { method: 'POST' }).catch(() => {});
      syncToBackend(keywords, false);
      showToast('⏸️ تم إيقاف رادار المراقبة مؤقتاً');
    } else {
      // Resume / Start
      setStatus('running');
      fetch('/api/start_monitoring', { method: 'POST' }).catch(() => {});
      syncToBackend(keywords, true);
      showToast('▶️ تم استئناف رادار المراقبة الحية بنجاح');
    }
  };

  const handleStopFull = () => {
    setStatus('idle');
    fetch('/api/stop_monitoring', { method: 'POST' }).catch(() => {});
    syncToBackend(keywords, false);
    showToast('⏹️ تم إيقاف الرادار بالكامل');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2600] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md select-none font-['Cairo',sans-serif]">
      <div
        className="w-full max-w-4xl max-h-[92vh] bg-zinc-950 border border-zinc-800 text-zinc-100 flex flex-col rounded-2xl shadow-2xl overflow-hidden transition-all duration-300"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-zinc-900/90 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-inner transition-colors ${
                status === 'running'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
                  : status === 'paused'
                  ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
              }`}
            >
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-zinc-100">
                  رادار المراقبة التلقائية الحية للكلمات المفتاحية
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
                  {status === 'running' ? 'يرصد في الخلفية' : status === 'paused' ? 'متوقف مؤقتاً' : 'خامل'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                فحص الرسائل الواردة فورياً وتنبيهك فور رصد أي كلمة مراقبة مع توجيه مباشر لموقع الرسالة
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

        {/* Action Controls Bar (Pause / Resume & Status) */}
        <div className="px-5 py-3 bg-zinc-900/50 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {/* Main Pause / Resume Button */}
            <button
              onClick={handleTogglePauseResume}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-md active:scale-95 ${
                status === 'running'
                  ? 'bg-amber-500 text-zinc-950 hover:bg-amber-400 shadow-amber-950/40 font-black'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-950/40'
              }`}
            >
              {status === 'running' ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>إيقاف مؤقت للرادار (Pause)</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>استئناف الرادار (Resume)</span>
                </>
              )}
            </button>

            {status !== 'idle' && (
              <button
                onClick={handleStopFull}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-rose-500/20 hover:text-rose-300 border border-zinc-700 text-xs font-semibold transition-colors"
                title="إيقاف نهائي"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إيقاف كامل</span>
              </button>
            )}
          </div>

          {/* Quick Notification Toggles */}
          <div className="flex items-center gap-3 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer bg-zinc-800/80 px-2.5 py-1.5 rounded-lg border border-zinc-700/60 hover:border-zinc-600">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="rounded accent-amber-500"
              />
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5 text-zinc-500" />}
              <span className="text-zinc-300">صوت التنبيه</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer bg-zinc-800/80 px-2.5 py-1.5 rounded-lg border border-zinc-700/60 hover:border-zinc-600">
              <input
                type="checkbox"
                checked={ttsEnabled}
                onChange={(e) => setTtsEnabled(e.target.checked)}
                className="rounded accent-sky-500"
              />
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-zinc-300">نطق صوتي عربي (TTS)</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer bg-zinc-800/80 px-2.5 py-1.5 rounded-lg border border-zinc-700/60 hover:border-zinc-600">
              <input
                type="checkbox"
                checked={saveToSavedMessages}
                onChange={(e) => setSaveToSavedMessages(e.target.checked)}
                className="rounded accent-blue-500"
              />
              <Bookmark className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-zinc-300">إرسال للرسائل المحفوظة</span>
            </label>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* 1. Keyword Manager */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-sm text-zinc-200">
                  قائمة الكلمات والعبارات المراقبة ({keywords.length} كلمة نشطة)
                </span>
              </div>
              <span className="text-[11px] text-zinc-400">
                يتم حفظ الإعدادات تلقائياً وتظل نشطة حتى بعد الخروج
              </span>
            </div>

            {/* Keyword Input & Add */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="أدخل كلمة أو عبارة جديدة (مثال: دكتوراه، تسويق، برمجة، وظيفة)..."
                value={newKeywordInput}
                onChange={(e) => setNewKeywordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddKeyword();
                }}
                className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
              <button
                onClick={handleAddKeyword}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl text-xs font-bold transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة للرادار</span>
              </button>
            </div>

            {/* Keyword Chips */}
            <div className="flex flex-wrap gap-2 pt-1 max-h-36 overflow-y-auto pr-1">
              {keywords.map((word) => (
                <div
                  key={word}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-950 border border-amber-500/30 text-amber-300 text-xs font-semibold shadow-sm group hover:border-amber-500/60 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span>{word}</span>
                  <button
                    onClick={() => handleRemoveKeyword(word)}
                    className="text-zinc-500 hover:text-rose-400 p-0.5 rounded transition-colors"
                    title="حذف الكلمة"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Target Scope */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-zinc-200">نطاق المراقبة والرصد</span>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="targetScope"
                    checked={targetScope === 'all'}
                    onChange={() => setTargetScope('all')}
                    className="accent-amber-500"
                  />
                  <span>كافة المجموعات والقنوات المشترك بها (شامل)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="targetScope"
                    checked={targetScope === 'custom'}
                    onChange={() => setTargetScope('custom')}
                    className="accent-amber-500"
                  />
                  <span>مجموعات محددة بالاسم أو الرابط</span>
                </label>
              </div>
            </div>

            {targetScope === 'custom' && (
              <textarea
                placeholder="أدخل أسماء المجموعات أو روابطها (مجموعة في كل سطر)..."
                value={customGroupsText}
                onChange={(e) => setCustomGroupsText(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            )}
          </div>

          {/* 3. Live Detections Feed */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-sm text-zinc-200">
                  سجل الرصد الحي الأخير ({detections.length} عملية رصد)
                </span>
              </div>
              {detections.length > 0 && (
                <button
                  onClick={() => setDetections([])}
                  className="text-xs text-zinc-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>مسح السجل</span>
                </button>
              )}
            </div>

            {detections.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-zinc-800 rounded-xl">
                <Radio className="w-8 h-8 text-zinc-600 mx-auto mb-2 opacity-50" />
                <p className="text-xs text-zinc-400 font-semibold">
                  الرادار قيد المراقبة الآن. ستظهر هنا فورياً كافة الرسائل المكتشفة مع اسم المجموعة والمرسل.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {detections.map((det) => (
                  <div
                    key={det.id}
                    className="p-3 bg-zinc-950 border border-zinc-800/90 rounded-xl flex flex-col gap-2 hover:border-amber-500/40 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                          {det.keyword}
                        </span>
                        <span className="font-bold text-zinc-200 truncate max-w-[200px]">
                          {det.groupTitle}
                        </span>
                        <span className="text-zinc-500">• {det.senderName}</span>
                      </div>
                      <span className="text-[11px] text-zinc-500">{det.timestamp}</span>
                    </div>

                    <p className="text-xs text-zinc-300 bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/60 line-clamp-2">
                      {det.text}
                    </p>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      {onJumpToMessage && (
                        <button
                          onClick={() => onJumpToMessage(det.chatId, det.msgId)}
                          className="flex items-center gap-1 px-3 py-1 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 rounded-lg text-xs font-bold transition-colors border border-amber-500/30"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>الانتقال لموقع الرسالة بالمجموعة</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
