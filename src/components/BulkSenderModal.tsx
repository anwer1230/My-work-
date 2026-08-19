import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  Pause,
  Play,
  RotateCcw,
  Clock,
  Users,
  Shield,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  Calendar,
  Zap,
} from 'lucide-react';
import { ChatItem } from '../types';

interface BulkSenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  chats?: Array<{ id: string | number; title?: string; name?: string; type?: string; [key: string]: any }>;
}

const STORAGE_KEY = 'tg_bulk_sender_settings_v2';

export const BulkSenderModal: React.FC<BulkSenderModalProps> = ({
  isOpen,
  onClose,
  chats,
}) => {
  // State with localStorage persistence
  const [messageText, setMessageText] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.messageText !== undefined) return parsed.messageText;
      }
    } catch (_) {}
    return 'السلام عليكم ورحمة الله وبركاته، نتشرف بخدمتكم في مركز سرعة إنجاز الأكاديمي للخدمات الطلابية والبحوث العلمية 🎓✨';
  });

  const [targetMode, setTargetMode] = useState<'all_groups' | 'specific_groups'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.targetMode) return parsed.targetMode;
      }
    } catch (_) {}
    return 'all_groups';
  });

  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.selectedGroupIds)) return parsed.selectedGroupIds;
      }
    } catch (_) {}
    return [];
  });

  const [isScheduled, setIsScheduled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.isScheduled !== undefined) return parsed.isScheduled;
      }
    } catch (_) {}
    return false;
  });

  const [intervalMinutes, setIntervalMinutes] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.intervalMinutes) return Number(parsed.intervalMinutes);
      }
    } catch (_) {}
    return 15;
  });

  const [durationHours, setDurationHours] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.durationHours) return Number(parsed.durationHours);
      }
    } catch (_) {}
    return 24;
  });

  const [sanitizeGreeting, setSanitizeGreeting] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.sanitizeGreeting !== undefined) return parsed.sanitizeGreeting;
      }
    } catch (_) {}
    return true;
  });

  const [smartDelay, setSmartDelay] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.smartDelay !== undefined) return parsed.smartDelay;
      }
    } catch (_) {}
    return true;
  });

  // Sending status
  const [jobStatus, setJobStatus] = useState<'idle' | 'running' | 'paused' | 'completed'>('idle');
  const [progress, setProgress] = useState({ current: 0, total: 0, success: 0, failed: 0 });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Group list
  const availableGroups = chats.filter(
    (c) => c.type === 'group' || c.type === 'supergroup' || c.type === 'channel'
  );

  // Sync to localStorage
  useEffect(() => {
    try {
      const payload = {
        messageText,
        targetMode,
        selectedGroupIds,
        isScheduled,
        intervalMinutes,
        durationHours,
        sanitizeGreeting,
        smartDelay,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (_) {}
  }, [
    messageText,
    targetMode,
    selectedGroupIds,
    isScheduled,
    intervalMinutes,
    durationHours,
    sanitizeGreeting,
    smartDelay,
  ]);

  // Sync with backend on open
  useEffect(() => {
    if (isOpen) {
      fetch('/api/settings')
        .then((r) => r.json())
        .then((data) => {
          if (data?.settings?.message && !messageText) {
            setMessageText(data.settings.message);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleStartSend = async () => {
    if (!messageText.trim()) {
      showToast('⚠️ يرجى كتابة نص الرسالة أولاً');
      return;
    }

    const targetGroups =
      targetMode === 'all_groups'
        ? availableGroups.map((g) => g.id)
        : selectedGroupIds;

    if (targetGroups.length === 0) {
      showToast('⚠️ لم يتم العثور على مجموعات مستهدفة');
      return;
    }

    setJobStatus('running');
    setProgress({ current: 0, total: targetGroups.length, success: 0, failed: 0 });

    try {
      const res = await fetch('/api/send_now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          groups: targetGroups,
          send_to_all: targetMode === 'all_groups',
          smart_send: smartDelay ? 'smart' : 'normal',
          sanitize_mode: sanitizeGreeting ? 'formal' : 'raw',
          is_scheduled: isScheduled,
          interval_minutes: intervalMinutes,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setProgress({
          current: targetGroups.length,
          total: targetGroups.length,
          success: json.sent_count || targetGroups.length,
          failed: 0,
        });
        setJobStatus('completed');
        showToast(`✅ تم الإرسال بنجاح إلى ${json.sent_count || targetGroups.length} مجموعة!`);
      } else {
        setJobStatus('idle');
        showToast(`⚠️ خطأ أثناء الإرسال: ${json.message || 'حدث خطأ غير متوقع'}`);
      }
    } catch (e) {
      setJobStatus('idle');
      showToast('❌ تعذر الاتصال بالخادم');
    }
  };

  const handleTogglePauseResume = () => {
    if (jobStatus === 'running') {
      setJobStatus('paused');
      fetch('/api/automation/send_monitor/pause', { method: 'POST' }).catch(() => {});
      showToast('⏸️ تم إيقاف الإرسال مؤقتاً');
    } else if (jobStatus === 'paused') {
      setJobStatus('running');
      fetch('/api/automation/send_monitor/resume', { method: 'POST' }).catch(() => {});
      showToast('▶️ تم استئناف الإرسال');
    }
  };

  const handleResetJob = () => {
    setJobStatus('idle');
    setProgress({ current: 0, total: 0, success: 0, failed: 0 });
    showToast('🔄 تمت إعادة ضبط مهمة الإرسال');
  };

  const insertVariable = (varName: string) => {
    setMessageText((prev) => `${prev} ${varName} `);
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
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-inner ${
                jobStatus === 'running'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse'
                  : jobStatus === 'paused'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
              }`}
            >
              <Send className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-zinc-100">
                  الإرسال التلقائي والدفعات المجدولة للمجموعات
                </span>
                <span
                  className={`px-2 py-0.5 text-[11px] rounded-full font-black flex items-center gap-1 ${
                    jobStatus === 'running'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : jobStatus === 'paused'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      jobStatus === 'running'
                        ? 'bg-emerald-400 animate-ping'
                        : jobStatus === 'paused'
                        ? 'bg-amber-400'
                        : 'bg-zinc-500'
                    }`}
                  />
                  {jobStatus === 'running'
                    ? 'جاري الإرسال'
                    : jobStatus === 'paused'
                    ? 'متوقف مؤقتاً'
                    : jobStatus === 'completed'
                    ? 'مكتمل'
                    : 'جاهز للإرسال'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                إرسال الرسائل والنشرات الإعلانية لكافة المجموعات مع خوارزميات ذكية لمنع حظر التيليجرام
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

        {/* Action Controls Bar */}
        <div className="px-5 py-3 bg-zinc-900/50 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {jobStatus === 'idle' || jobStatus === 'completed' ? (
              <button
                onClick={handleStartSend}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 shadow-emerald-950/50"
              >
                <Send className="w-4 h-4" />
                <span>بدء الإرسال الفوري للدفعة</span>
              </button>
            ) : (
              <button
                onClick={handleTogglePauseResume}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
                  jobStatus === 'running'
                    ? 'bg-amber-500 text-zinc-950 hover:bg-amber-400 font-black shadow-amber-950/50'
                    : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-950/50'
                }`}
              >
                {jobStatus === 'running' ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>إيقاف مؤقت للإرسال (Pause)</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>استئناف الإرسال (Resume)</span>
                  </>
                )}
              </button>
            )}

            {jobStatus !== 'idle' && (
              <button
                onClick={handleResetJob}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-rose-500/20 hover:text-rose-300 border border-zinc-700 text-xs font-semibold transition-colors"
                title="إعادة تعيين"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة تعيين</span>
              </button>
            )}
          </div>

          {/* Quick Options */}
          <div className="flex items-center gap-3 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer bg-zinc-800/80 px-2.5 py-1.5 rounded-lg border border-zinc-700/60 hover:border-zinc-600">
              <input
                type="checkbox"
                checked={sanitizeGreeting}
                onChange={(e) => setSanitizeGreeting(e.target.checked)}
                className="rounded accent-emerald-500"
              />
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-zinc-300">وضع التحية الآمن</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer bg-zinc-800/80 px-2.5 py-1.5 rounded-lg border border-zinc-700/60 hover:border-zinc-600">
              <input
                type="checkbox"
                checked={smartDelay}
                onChange={(e) => setSmartDelay(e.target.checked)}
                className="rounded accent-sky-500"
              />
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-zinc-300">فاصل زمني ذكي</span>
            </label>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* 1. Message Composer */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-sm text-zinc-200">نص الرسالة المنشورة</span>
              </div>
              {/* Dynamic Variables helper */}
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="text-zinc-400">متغيرات ذكية:</span>
                <button
                  onClick={() => insertVariable('{name}')}
                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700"
                  title="اسم المجموعة أو العضو"
                >
                  {'{name}'}
                </button>
                <button
                  onClick={() => insertVariable('{time}')}
                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700"
                  title="الوقت الحالي"
                >
                  {'{time}'}
                </button>
                <button
                  onClick={() => insertVariable('{salutation}')}
                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700"
                  title="تحية متغيرة عشوائية"
                >
                  {'{salutation}'}
                </button>
              </div>
            </div>

            <textarea
              rows={5}
              placeholder="اكتب نص الرسالة التي ترغب بنشرها في المجموعات..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors leading-relaxed"
            />
          </div>

          {/* 2. Target Selection */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-400" />
                <span className="font-bold text-sm text-zinc-200">
                  تحديد المجموعات والقنوات المستهدفة
                </span>
              </div>
              <span className="text-xs text-zinc-400">
                المتاح لديك: {availableGroups.length} مجموعة وقناة
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold">
              <label className="flex items-center gap-2 cursor-pointer bg-zinc-950 px-3 py-2 rounded-xl border border-zinc-800 hover:border-zinc-700 flex-1">
                <input
                  type="radio"
                  name="targetMode"
                  checked={targetMode === 'all_groups'}
                  onChange={() => setTargetMode('all_groups')}
                  className="accent-emerald-500"
                />
                <span>إرسال لكافة المجموعات والقنوات المشترك بها ({availableGroups.length})</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-zinc-950 px-3 py-2 rounded-xl border border-zinc-800 hover:border-zinc-700 flex-1">
                <input
                  type="radio"
                  name="targetMode"
                  checked={targetMode === 'specific_groups'}
                  onChange={() => setTargetMode('specific_groups')}
                  className="accent-emerald-500"
                />
                <span>تحديد مجموعات مخصصة ({selectedGroupIds.length} محددة)</span>
              </label>
            </div>

            {targetMode === 'specific_groups' && (
              <div className="max-h-40 overflow-y-auto p-2 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
                {availableGroups.map((g) => {
                  const isChecked = selectedGroupIds.includes(String(g.id));
                  return (
                    <label
                      key={g.id}
                      className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-zinc-900 cursor-pointer text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedGroupIds((prev) => [...prev, String(g.id)]);
                          } else {
                            setSelectedGroupIds((prev) => prev.filter((id) => id !== String(g.id)));
                          }
                        }}
                        className="rounded accent-emerald-500"
                      />
                      <span className="text-zinc-200 font-semibold">{g.title || g.name}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Scheduling & Duration */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-sm text-zinc-200">الجدولة والتكرار الدوري</span>
              </div>
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={isScheduled}
                  onChange={(e) => setIsScheduled(e.target.checked)}
                  className="rounded accent-purple-500"
                />
                <span className="text-purple-300">تفعيل الجدولة التلقائية الدورية</span>
              </label>
            </div>

            {isScheduled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <span className="text-xs text-zinc-400">الفاصل الزمني بين كل إرسال والآخر:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={1440}
                      value={intervalMinutes}
                      onChange={(e) => setIntervalMinutes(Math.max(1, Number(e.target.value)))}
                      className="w-24 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-center font-bold text-purple-300 focus:outline-none focus:border-purple-500"
                    />
                    <span className="text-xs text-zinc-400">دقيقة</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs text-zinc-400">مدة استمرار الحملة الإعلانية:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={720}
                      value={durationHours}
                      onChange={(e) => setDurationHours(Math.max(1, Number(e.target.value)))}
                      className="w-24 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-center font-bold text-purple-300 focus:outline-none focus:border-purple-500"
                    />
                    <span className="text-xs text-zinc-400">ساعة</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4. Live Progress indicator when active */}
          {jobStatus !== 'idle' && (
            <div className="bg-zinc-900/80 border border-emerald-500/30 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  حالة إرسال الدفعة الحالية
                </span>
                <span className="text-zinc-300">
                  {progress.current} من {progress.total} مجموعة
                </span>
              </div>
              <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
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
