import React, { useState } from 'react';
import { ShieldCheck, Phone, Key, Lock, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartAuth: (phone: string) => void;
  onVerifyCode: (code: string) => void;
  onVerifyPass: (password: string) => void;
  authStateStatus: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onStartAuth,
  onVerifyCode,
  onVerifyPass,
  authStateStatus,
}) => {
  const [phone, setPhone] = useState('+966501234567');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'phone' | 'code' | 'password'>('phone');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'phone') {
      if (!phone) return alert('أدخل رقم الهاتف');
      onStartAuth(phone);
      setStep('code');
    } else if (step === 'code') {
      if (!code) return alert('أدخل كود التحقق');
      onVerifyCode(code);
      setStep('password');
    } else {
      if (!password) return alert('أدخل كلمة المرور');
      onVerifyPass(password);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 bg-sky-500/20 text-sky-400 rounded-2xl flex items-center justify-center mb-3">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-100">تسجيل الدخول - تيليجرام الموحد</h3>
          <p className="text-xs text-slate-400 mt-1">
            {step === 'phone'
              ? 'أدخل رقم هاتفك للربط بالنواة TDLib'
              : step === 'code'
              ? 'أدخل كود التحقق المرسل إلى حسابك'
              : 'أدخل كلمة المرور للتحقق بخطوتين (2FA)'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 'phone' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                رقم الهاتف (مع الرمز الدولي)
              </label>
              <div className="relative flex items-center">
                <Phone className="w-4 h-4 absolute right-3 text-slate-500" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+9665..."
                  className="w-full bg-slate-800 text-xs text-slate-100 pr-9 pl-3 py-3 rounded-xl border border-slate-700 focus:outline-none focus:border-sky-500 font-mono dir-ltr text-right"
                />
              </div>
            </div>
          )}

          {step === 'code' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                كود التحقق السري
              </label>
              <div className="relative flex items-center">
                <Key className="w-4 h-4 absolute right-3 text-slate-500" />
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="12345"
                  className="w-full bg-slate-800 text-xs text-slate-100 pr-9 pl-3 py-3 rounded-xl border border-slate-700 focus:outline-none focus:border-sky-500 font-mono tracking-widest text-center"
                />
              </div>
            </div>
          )}

          {step === 'password' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                كلمة المرور الإضافية (2FA)
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 absolute right-3 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-800 text-xs text-slate-100 pr-9 pl-3 py-3 rounded-xl border border-slate-700 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-3 rounded-xl text-xs transition-colors shadow-lg mt-2"
          >
            {step === 'phone'
              ? 'إرسال كود التحقق'
              : step === 'code'
              ? 'تأكيد الكود'
              : 'تأكيد ودخول الحساب'}
          </button>
        </form>
      </div>
    </div>
  );
};
