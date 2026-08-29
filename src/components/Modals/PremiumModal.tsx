import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Check,
  Star,
  Flame,
  FileText,
  Clock,
  ShieldCheck,
  Crown,
  Volume2,
  Smile,
  X,
  CreditCard,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTelegram } from '../../context/TelegramContext';
import confetti from 'canvas-confetti';

export const PremiumModal: React.FC = () => {
  const { activeModal, setActiveModal, showToast, currentUser, updateAccountProfile } = useTelegram();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const [isProcessing, setIsProcessing] = useState(false);

  const isOpen = activeModal === ('premium' as any);

  const handleSubscribe = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      updateAccountProfile({ isPremium: true });
      try {
        confetti({
          particleCount: 100,
          spread: 90,
          origin: { y: 0.5 },
          colors: ['#a855f7', '#ec4899', '#3b82f6', '#fbbf24'],
        });
      } catch {}
      showToast('تهانينا! تم تفعيل اشتراك Telegram Premium بنجاح ⭐', '🌟');
      setActiveModal('none');
    }, 1200);
  };

  const features = [
    {
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
      title: 'مضاعفة السعات والحدود (Doubled Limits)',
      desc: 'حتى 1000 قناة، 30 مجلداً للمحادثات، 10 محادثات مثبتة، 4 حسابات نشطة.',
    },
    {
      icon: <FileText className="w-5 h-5 text-pink-400" />,
      title: 'رفع ملفات ضخمة بحجم 4GB',
      desc: 'إمكانية إرسال مقاطع فيديو وملفات مستندات تصل سعتها إلى 4 جيجابايت لكل ملف.',
    },
    {
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      title: 'أقصى سرعة تحميل وتنزيل',
      desc: 'لا حدود للسرعة على تحميل وسائط القنوات والمحادثات السحابية.',
    },
    {
      icon: <Volume2 className="w-5 h-5 text-sky-400" />,
      title: 'تحويل الصوت إلى نص (Voice-to-Text)',
      desc: 'قراءة الرسائل الصوتية وتحويلها إلى نصوص بدقة عالية فورية.',
    },
    {
      icon: <Smile className="w-5 h-5 text-emerald-400" />,
      title: 'رموز تعبيرية وتفاعلات لا محدودة',
      desc: 'وصول لآلاف الإيموجيات المتحركة والتفاعلات الخاصة بالمشتركين.',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-indigo-400" />,
      title: 'إدارة متقدمة للدردشات وحظر الإعلانات',
      desc: 'إخفاء الإعلانات من القنوات العامة وتعيين مجلد افتراضي للتشغيل.',
    },
    {
      icon: <Star className="w-5 h-5 text-amber-300" />,
      title: 'شارات النجوم والملف الشخصي الفاخر',
      desc: 'نجمة بريميوم بجانب اسمك وصور متحركة للملف الشخصي.',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="telegram-premium-modal"
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-lg select-none overflow-y-auto"
          dir="rtl"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setActiveModal('none')}
            className="absolute inset-0 cursor-pointer"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative z-10 w-full max-w-xl text-[#e8eaf6] rounded-3xl shadow-2xl overflow-hidden border border-purple-500/30 my-auto"
            style={{
              background: 'linear-gradient(145deg, #180d2b, #251347, #0f0721)',
            }}
          >
            {/* Header / Banner */}
            <div className="relative p-6 text-center border-b border-purple-500/20 overflow-hidden">
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-600/30 rounded-full blur-3xl pointer-events-none" />
              <button
                onClick={() => setActiveModal('none')}
                className="absolute top-4 left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-purple-500 via-pink-500 to-amber-400 p-0.5 shadow-xl shadow-purple-500/30 animate-pulse">
                <div className="w-full h-full bg-[#180d2b] rounded-[14px] flex items-center justify-center">
                  <Star className="w-8 h-8 text-amber-400 fill-amber-400" />
                </div>
              </div>

              <h2 className="text-xl font-bold text-white flex items-center justify-center gap-2">
                <span>Telegram Premium</span>
                <Crown className="w-5 h-5 text-amber-400" />
              </h2>
              <p className="text-xs text-purple-200/80 mt-1 max-w-md mx-auto">
                ارتقِ بتجربتك مع ميزات حصرية وسرعات غير محدودة ومضاعفة السعات
              </p>
            </div>

            {/* Features List */}
            <div className="p-5 max-h-[45vh] overflow-y-auto space-y-3">
              {features.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3.5 p-3 rounded-xl bg-white/5 border border-purple-500/15 hover:bg-white/10 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-black/40 shrink-0">{feat.icon}</div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{feat.title}</h4>
                    <p className="text-[11px] text-gray-300 leading-relaxed mt-0.5">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing Selection */}
            <div className="p-5 bg-black/40 border-t border-purple-500/20 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedPlan('annual')}
                  className={`p-3 rounded-2xl border text-right transition-all relative ${
                    selectedPlan === 'annual'
                      ? 'border-purple-400 bg-purple-600/30 shadow-lg shadow-purple-500/20'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <span className="absolute -top-2 left-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-[9px] font-bold text-white shadow">
                    وفّر 40%
                  </span>
                  <div className="text-xs font-bold text-white">سنوي</div>
                  <div className="text-sm font-extrabold text-amber-300 mt-0.5 font-mono">
                    $28.99 <span className="text-[10px] text-gray-300 font-normal">/ سنة</span>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedPlan('monthly')}
                  className={`p-3 rounded-2xl border text-right transition-all ${
                    selectedPlan === 'monthly'
                      ? 'border-purple-400 bg-purple-600/30 shadow-lg shadow-purple-500/20'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="text-xs font-bold text-white">شهري</div>
                  <div className="text-sm font-extrabold text-white mt-0.5 font-mono">
                    $3.99 <span className="text-[10px] text-gray-300 font-normal">/ شهر</span>
                  </div>
                </button>
              </div>

              <button
                onClick={handleSubscribe}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-bold text-sm shadow-xl shadow-purple-600/30 hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <span>جاري تفعيل الاشتراك السحابي...</span>
                ) : (
                  <>
                    <Crown className="w-4 h-4 text-amber-300" />
                    <span>
                      {currentUser.isPremium ? 'تجديد اشتراك Premium' : 'الاشتراك في Telegram Premium'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
