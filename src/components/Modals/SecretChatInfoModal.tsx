import React, { useState } from 'react';
import {
  Lock,
  Clock,
  ShieldCheck,
  Flame,
  Key,
  Smartphone,
  EyeOff,
  Sparkles,
  X,
  CheckCircle2,
} from 'lucide-react';
import { useTelegram } from '../../context/TelegramContext';
import { telegramE2EE } from '../../utils/e2eeEngine';

export const SecretChatInfoModal: React.FC = () => {
  const { activeModal, setActiveModal, activeChat, showToast } = useTelegram();
  const [selectedTTL, setSelectedTTL] = useState<number>(activeChat?.ttlSeconds || 0);

  if (activeModal !== ('secret-chat-info' as any) || !activeChat) return null;

  const handleUpdateTTL = (seconds: number) => {
    setSelectedTTL(seconds);
    telegramE2EE.setTTL(activeChat.id, seconds);
    showToast(
      seconds > 0
        ? `تم ضبط مؤقت التدمير الذاتي على ${seconds} ثانية ⏳`
        : 'تم إيقاف مؤقت التدمير الذاتي',
      '🔒'
    );
  };

  const fingerprint = activeChat.secretFingerprint || '3F8A B29C 411E 998D';

  return (
    <div
      id="modal-secret-chat-info"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md select-none"
      dir="rtl"
    >
      <div
        className="w-full max-w-md text-[#e8eaf6] rounded-3xl shadow-2xl overflow-hidden border border-emerald-500/30 my-auto animate-in zoom-in-95 duration-200"
        style={{
          background: 'linear-gradient(145deg, #062b1b, #0a1f17, #03140e)',
        }}
      >
        {/* Header */}
        <div className="p-5 border-b border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-400/30">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">محادثة سرية مشفرة (Secret Chat)</h3>
              <p className="text-[10px] text-emerald-300/80">تشفير تام من طرف لطرف End-to-End</p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal('none')}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4">
          {/* E2EE Features List */}
          <div className="space-y-2 text-xs text-emerald-100 bg-black/30 p-3.5 rounded-2xl border border-emerald-500/15">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>استخدام تشفير متقدم من طرف لطرف (Diffie-Hellman Key Exchange)</span>
            </div>
            <div className="flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>لا تترك أي أثر على خوادم تيليجرام السحابية</span>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>تدعم مؤقت التدمير الذاتي للرسائل والصور (Self-Destruct)</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>تمنع تحويل الرسائل وتمنع التقاط الشاشة على الجهاز</span>
            </div>
          </div>

          {/* Visual Encryption Key Fingerprint */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-200 block flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>بصمة مفتاح التشفير المرئي (Encryption Key)</span>
            </label>
            <div className="p-3 bg-black/50 rounded-xl border border-emerald-500/30 text-center font-mono text-sm tracking-widest text-emerald-300 font-bold">
              {fingerprint}
            </div>
            <small className="text-[10px] text-gray-400 block text-center">
              إذا تطابقت هذه البصمة مع شاشة الطرف الآخر، فإن المحادثة آمنة 100% ولا يمكن لأحد التنصت عليها.
            </small>
          </div>

          {/* Self-Destruct Timer (TTL) Selector */}
          <div className="space-y-1.5 pt-2 border-t border-emerald-500/20">
            <label className="text-xs font-semibold text-gray-200 block flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>مؤقت التدمير الذاتي (Self-Destruct Timer)</span>
            </label>

            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'إيقاف', val: 0 },
                { label: '5 ثواني', val: 5 },
                { label: '30 ثانية', val: 30 },
                { label: '1 دقيقة', val: 60 },
                { label: '1 ساعة', val: 3600 },
                { label: '1 يوم', val: 86400 },
                { label: '1 أسبوع', val: 604800 },
              ].map((item) => (
                <button
                  key={item.val}
                  onClick={() => handleUpdateTTL(item.val)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                    selectedTTL === item.val
                      ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200 shadow-md'
                      : 'bg-black/20 border-white/10 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-black/40 border-t border-emerald-500/20 flex justify-end">
          <button
            onClick={() => setActiveModal('none')}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
          >
            حفظ وإغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
