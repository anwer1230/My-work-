import React, { useState, useEffect } from 'react';
import {
  X,
  MessageSquare,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Zap,
  Layers,
} from 'lucide-react';

interface AutoReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ReplyRule {
  id: string;
  keyword: string;
  reply: string;
  scope?: string;
  pattern?: string;
}

const STORAGE_KEY = 'tg_autoreply_settings_v2';

export const AutoReplyModal: React.FC<AutoReplyModalProps> = ({ isOpen, onClose }) => {
  const [rules, setRules] = useState<ReplyRule[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.rules) && parsed.rules.length > 0) return parsed.rules;
      }
    } catch (_) {}
    return [
      {
        id: 'r_1',
        keyword: 'سعر',
        reply: 'أهلاً بك! تختلف الأسعار بحسب التخصص وحجم العمل، تفضل بالتواصل معنا عبر الخاص للتفاصيل ✨',
      },
      {
        id: 'r_2',
        keyword: 'دكتوراه',
        reply: 'مرحباً بك دكتور، يسعدنا تقديم الاستشارات الأكاديمية وإعداد خطط البحث والمقترحات المعتمدة 🎓',
      },
    ];
  });

  const [keywordInput, setKeywordInput] = useState('');
  const [replyInput, setReplyInput] = useState('');
  const [status, setStatus] = useState<'running' | 'paused' | 'idle'>('running');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ rules, status }));
    } catch (_) {}
  }, [rules, status]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddRule = async () => {
    if (!keywordInput.trim() || !replyInput.trim()) {
      showToast('⚠️ يرجى تعبئة الكلمة المفتاحية والرد معاً');
      return;
    }

    const newRule: ReplyRule = {
      id: `r_${Date.now()}`,
      keyword: keywordInput.trim(),
      reply: replyInput.trim(),
    };

    const updated = [...rules, newRule];
    setRules(updated);
    setKeywordInput('');
    setReplyInput('');

    await fetch('/api/add_auto_reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword: newRule.keyword, reply: newRule.reply }),
    }).catch(() => {});

    showToast('✅ تمت إضافة قاعدة الرد التلقائي');
  };

  const handleRemoveRule = async (idx: number) => {
    const updated = rules.filter((_, i) => i !== idx);
    setRules(updated);
    await fetch('/api/delete_auto_reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ index: idx }),
    }).catch(() => {});
    showToast('🗑️ تم حذف القاعدة');
  };

  const handleTogglePauseResume = async () => {
    if (status === 'running') {
      setStatus('paused');
      await fetch('/api/toggle_auto_reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: false }),
      }).catch(() => {});
      showToast('⏸️ تم إيقاف الرد التلقائي مؤقتاً');
    } else {
      setStatus('running');
      await fetch('/api/toggle_auto_reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: true }),
      }).catch(() => {});
      showToast('▶️ تم استئناف الرد التلقائي الذكي');
    }
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
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-zinc-100">
                  الرد التلقائي الذكي (Auto-Reply Engine)
                </span>
                <span
                  className={`px-2 py-0.5 text-[11px] rounded-full font-black flex items-center gap-1 ${
                    status === 'running'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      status === 'running' ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
                    }`}
                  />
                  {status === 'running' ? 'نشط في الخلفية' : 'متوقف مؤقتاً'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                الرد الفوري على الاستفسارات والكلمات المفتاحية في الرسائل الخاصة والمجموعات
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
        <div className="px-5 py-3 bg-zinc-900/50 border-b border-zinc-800/80 flex items-center justify-between shrink-0">
          <button
            onClick={handleTogglePauseResume}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
              status === 'running'
                ? 'bg-amber-500 text-zinc-950 hover:bg-amber-400 font-black'
                : 'bg-rose-600 text-white hover:bg-rose-500'
            }`}
          >
            {status === 'running' ? (
              <>
                <Pause className="w-4 h-4" />
                <span>إيقاف مؤقت للرد التلقائي (Pause)</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>استئناف الرد التلقائي (Resume)</span>
              </>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Add Rule Form */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 space-y-3">
            <span className="font-bold text-sm text-zinc-200">إضافة رد تلقائي جديد</span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-xs text-zinc-400 block mb-1">الكلمة المفتاحية:</span>
                <input
                  type="text"
                  placeholder="مثال: سعر، تسجيل، استفسار..."
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="sm:col-span-2">
                <span className="text-xs text-zinc-400 block mb-1">نص الرد التلقائي:</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="اكتب نص الرسالة التي سيرد بها النظام آلياً..."
                    value={replyInput}
                    onChange={(e) => setReplyInput(e.target.value)}
                    className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-rose-500"
                  />
                  <button
                    onClick={handleAddRule}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors shrink-0 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Rules List */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 space-y-3">
            <span className="font-bold text-sm text-zinc-200">
              قواعد الردود المحفوظة ({rules.length} قاعدة)
            </span>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {rules.map((rule, idx) => (
                <div
                  key={rule.id || idx}
                  className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                        {rule.keyword}
                      </span>
                    </div>
                    <p className="text-zinc-300 truncate">{rule.reply}</p>
                  </div>

                  <button
                    onClick={() => handleRemoveRule(idx)}
                    className="text-zinc-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-zinc-900 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
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
