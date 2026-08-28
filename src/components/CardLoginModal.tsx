import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';

interface CardLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessAuth?: (cardCode: string) => void;
}

export const CardLoginModal: React.FC<CardLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccessAuth,
}) => {
  const [cardCode, setCardCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  // Format card code as XXXX-XXXX-XXXX
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 12);
    const parts = raw.match(/.{1,4}/g);
    setCardCode(parts ? parts.join('-') : raw);
  };

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = cardCode.replace(/-/g, '');
    if (cleanCode.length < 8) {
      setStatusMessage({ type: 'error', text: 'يرجى إدخال رمز بطاقة الشحن الصحيح المكون من 12 خانة.' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    setTimeout(() => {
      setIsLoading(false);
      setStatusMessage({
        type: 'success',
        text: 'تم التحقق من بطاقة الشحن وتفعيل اشتراك "سرعة إنجاز برو" بنجاح!',
      });
      setTimeout(() => {
        if (onSuccessAuth) onSuccessAuth(cardCode);
        onClose();
      }, 1200);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#121421]/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="glass w-full max-w-[420px] p-8 rounded-[32px] text-center shadow-2xl relative overflow-hidden bg-[#16192b]/95 border border-white/10 text-white">
        
        {/* Glow Element */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#00D1FF]/15 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-600/10 blur-3xl rounded-full pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Key Icon Badge */}
        <div className="w-20 h-20 bg-gradient-to-tr from-[#00D1FF] to-blue-600 rounded-3xl rotate-12 mx-auto flex items-center justify-center mb-6 shadow-xl shadow-cyan-500/20">
          <span className="material-symbols-outlined text-slate-950 font-black text-4xl -rotate-12">
            key
          </span>
        </div>

        <h1 className="text-2xl font-extrabold mb-1 tracking-tight text-white">تفعيل الوصول</h1>
        <p className="text-slate-400 text-sm mb-6">
          أدخل رمز بطاقة الشحن المكون من 12 رقماً لتفعيل الباقة
        </p>

        <form onSubmit={handleActivate} className="space-y-4">
          <div>
            <input
              type="text"
              value={cardCode}
              onChange={handleInputChange}
              placeholder="XXXX-XXXX-XXXX"
              className="w-full bg-white/5 border border-white/15 p-4 rounded-2xl text-center font-mono tracking-widest text-lg font-bold text-[#00D1FF] placeholder-slate-500 outline-none focus:border-[#00D1FF] focus:bg-white/10 transition-all shadow-inner"
              maxLength={14}
              required
            />
          </div>

          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-red-500/20 text-red-300 border border-red-500/40'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#00D1FF] to-blue-500 hover:opacity-95 py-4 rounded-2xl text-slate-950 font-extrabold text-base hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_25px_rgba(0,209,255,0.35)] cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'جاري التحقق من البطاقة...' : 'تفعيل الآن'}
          </button>
        </form>

        <p className="mt-6 text-xs text-slate-400">
          لا تملك بطاقة شحن؟{' '}
          <a
            href="https://t.me/Anwer_Saif"
            target="_blank"
            rel="noreferrer"
            className="text-[#00D1FF] font-bold hover:underline"
          >
            تواصل مع الإدارة
          </a>
        </p>
      </div>
    </div>
  );
};
