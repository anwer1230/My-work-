import React, { useState } from 'react';
import {
  Send,
  Phone,
  QrCode,
  Lock,
  Key,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Globe,
  Smartphone,
  ChevronDown,
} from 'lucide-react';

interface TelegramLoginScreenProps {
  onLoginSuccess: (userData: { name: string; phone: string; username: string }) => void;
}

const ALL_COUNTRIES = [
  { name: 'اليمن', code: '+967', flag: '🇾🇪' },
  { name: 'السعودية', code: '+966', flag: '🇸🇦' },
  { name: 'العراق', code: '+964', flag: '🇮🇶' },
  { name: 'مصر', code: '+20', flag: '🇪🇬' },
  { name: 'الإمارات', code: '+971', flag: '🇦🇪' },
  { name: 'الأردن', code: '+962', flag: '🇯🇴' },
  { name: 'الكويت', code: '+965', flag: '🇰🇼' },
  { name: 'قطر', code: '+974', flag: '🇶🇦' },
  { name: 'عُمان', code: '+968', flag: '🇴🇲' },
  { name: 'البحرين', code: '+973', flag: '🇧🇭' },
  { name: 'سوريا', code: '+963', flag: '🇸🇾' },
  { name: 'لبنان', code: '+961', flag: '🇱🇧' },
  { name: 'السودان', code: '+249', flag: '🇸🇩' },
  { name: 'فلسطين', code: '+970', flag: '🇵🇸' },
  { name: 'المغرب', code: '+212', flag: '🇲🇦' },
  { name: 'الجزائر', code: '+213', flag: '🇩🇿' },
  { name: 'تونس', code: '+216', flag: '🇹🇳' },
  { name: 'ليبيا', code: '+218', flag: '🇱🇾' },
  { name: 'تركيا', code: '+90', flag: '🇹🇷' },
  { name: 'الولايات المتحدة / كندا', code: '+1', flag: '🇺🇸' },
  { name: 'المملكة المتحدة', code: '+44', flag: '🇬🇧' },
  { name: 'ألمانيا', code: '+49', flag: '🇩🇪' },
  { name: 'فرنسا', code: '+33', flag: '🇫🇷' },
  { name: 'إيطاليا', code: '+39', flag: '🇮🇹' },
  { name: 'الهند', code: '+91', flag: '🇮🇳' },
  { name: 'باكستان', code: '+92', flag: '🇵🇰' },
];

export const parsePhoneNumber = (rawInput: string) => {
  let cleaned = rawInput.trim().replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('00')) {
    cleaned = '+' + cleaned.slice(2);
  }
  if (cleaned && !cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }

  const sorted = [...ALL_COUNTRIES].sort((a, b) => b.code.length - a.code.length);
  for (const country of sorted) {
    if (cleaned.startsWith(country.code)) {
      const nationalNumber = cleaned.slice(country.code.length);
      return {
        country,
        countryCode: country.code,
        nationalNumber,
        fullPhone: country.code + nationalNumber,
        isDetected: true,
      };
    }
  }

  return {
    country: { name: 'دولة دولية', code: cleaned.slice(0, 4) || '+', flag: '🌐' },
    countryCode: cleaned.slice(0, 4) || '+',
    nationalNumber: cleaned.slice(4) || cleaned,
    fullPhone: cleaned,
    isDetected: false,
  };
};

export const TelegramLoginScreen: React.FC<TelegramLoginScreenProps> = ({ onLoginSuccess }) => {
  const [loginMethod, setLoginMethod] = useState<'phone' | 'qr'>('phone');
  const [step, setStep] = useState<'phone' | 'code' | '2fa'>('phone');

  // Direct phone input without pre-selected country dropdown, empty by default
  const [rawPhoneInput, setRawPhoneInput] = useState('');
  const [detectedCountry, setDetectedCountry] = useState<{ name: string; code: string; flag: string } | null>(null);
  const [extractedCode, setExtractedCode] = useState('');
  const [extractedNationalNumber, setExtractedNationalNumber] = useState('');

  const [verificationCode, setVerificationCode] = useState('');
  const [cloudPassword, setCloudPassword] = useState('');
  const [keepSigned, setKeepSigned] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [phoneCodeHash, setPhoneCodeHash] = useState('');
  const [apiError, setApiError] = useState('');

  // Live phone parsing as the user types
  const parsedPhone = parsePhoneNumber(rawPhoneInput);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawPhoneInput.trim()) return alert('يرجى إدخال رقم الهاتف مع مفتاح الدولة (مثال: +967772997043)');

    const parsed = parsePhoneNumber(rawPhoneInput);
    setDetectedCountry(parsed.country);
    setExtractedCode(parsed.countryCode);
    setExtractedNationalNumber(parsed.nationalNumber);

    setIsLoading(true);
    setApiError('');
    const fullPhone = parsed.fullPhone;

    try {
      const res = await fetch('/api/auth/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone }),
      });
      const data = await res.json();
      setIsLoading(false);

      if (res.ok && data.status === 'code_sent') {
        setPhoneCodeHash(data.phoneCodeHash || '');
        setStep('code');
      } else {
        setApiError(data.error || 'حدث خطأ في إرسال الرمز الحقيقي عبر تليجرام');
      }
    } catch (err: any) {
      setIsLoading(false);
      setApiError('تعذر الاتصال بسيرفر المصادقة. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) return alert('يرجى إدخال رمز التحقق');
    setIsLoading(true);
    setApiError('');
    const fullPhone = parsePhoneNumber(rawPhoneInput).fullPhone;

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: fullPhone,
          code: verificationCode.trim(),
          phoneCodeHash,
        }),
      });
      const data = await res.json();
      setIsLoading(false);

      if (res.ok) {
        if (data.status === 'wait_password') {
          setStep('2fa');
        } else if (data.status === 'authenticated') {
          onLoginSuccess({
            name: `${data.user?.first_name || ''} ${data.user?.last_name || ''}`.trim() || 'مستخدم تليجرام',
            phone: fullPhone,
            username: data.user?.username || '@user',
          });
        }
      } else {
        setApiError(data.error || 'رمز التحقق الحقيقي غير صحيح أو منتهي الصلاحية');
      }
    } catch (err: any) {
      setIsLoading(false);
      setApiError('حدث خطأ أثناء التحقق من الرمز مع تليجرام');
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cloudPassword.trim()) return alert('يرجى إدخال كلمة المرور السحابية');
    setIsLoading(true);
    setApiError('');
    const fullPhone = parsePhoneNumber(rawPhoneInput).fullPhone;

    try {
      const res = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: fullPhone,
          password: cloudPassword.trim(),
        }),
      });
      const data = await res.json();
      setIsLoading(false);

      if (res.ok && data.status === 'authenticated') {
        onLoginSuccess({
          name: `${data.user?.first_name || ''} ${data.user?.last_name || ''}`.trim() || 'مستخدم تليجرام',
          phone: fullPhone,
          username: data.user?.username || '@user',
        });
      } else {
        setApiError(data.error || 'كلمة المرور السحابية غير صحيحة');
      }
    } catch (err) {
      setIsLoading(false);
      setApiError('حدث خطأ أثناء التحقق من كلمة المرور');
    }
  };

  const handleDemoLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
        name: 'أبو ملك (حساب المشرف الأكاديمي)',
        phone: '+966501234567',
        username: '@Abu_Mlk',
      });
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 z-50 select-none overflow-y-auto">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl w-full max-w-md p-8 shadow-2xl relative backdrop-blur-xl flex flex-col items-center">
        
        {/* Telegram Paper Plane Icon */}
        <div className="relative mb-4">
          <div className="w-20 h-20 bg-gradient-to-tr from-sky-500 to-blue-600 rounded-full flex items-center justify-center shadow-xl shadow-sky-500/20 animate-pulse">
            <Send className="w-10 h-10 text-white -mr-1 mt-1 transform -rotate-12" />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-slate-900 p-1.5 rounded-full border border-slate-800 text-emerald-400" title="تشفير مشفر">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        <h1 className="text-xl font-bold text-slate-100 tracking-tight text-center">
          تسجيل الدخول إلى تيليجرام
        </h1>
        <p className="text-xs text-slate-400 text-center mt-1 mb-6 max-w-xs">
          مرحباً بك في منصة Telegram Web الموحدة مع بوت وسيرفر سرعة إنجاز الأكاديمي
        </p>

        {/* Login Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-2xl mb-6 w-full border border-slate-800 text-xs font-bold">
          <button
            onClick={() => {
              setLoginMethod('phone');
              setStep('phone');
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              loginMethod === 'phone'
                ? 'bg-sky-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>رقم الهاتف</span>
          </button>

          <button
            onClick={() => setLoginMethod('qr')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              loginMethod === 'qr'
                ? 'bg-sky-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>رمز QR</span>
          </button>
        </div>

        {/* API Error Alert Banner */}
        {apiError && (
          <div className="w-full mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-300 text-xs text-center space-y-1">
            <div className="font-bold">⚠️ تنبيه من تليجرام:</div>
            <p>{apiError}</p>
          </div>
        )}

        {/* TAB 1: Phone Login */}
        {loginMethod === 'phone' && (
          <div className="w-full">
            {step === 'phone' && (
              <form onSubmit={handleSendCode} className="space-y-4">
                {/* Single Full Phone Number Input with Auto Country Detection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex justify-between items-center">
                    <span>أدخل رقم الهاتف الدولي المباشر:</span>
                    <span className="text-[10px] text-sky-400 font-mono">مثال: +967772997043</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={rawPhoneInput}
                      onChange={(e) => setRawPhoneInput(e.target.value)}
                      placeholder="+967772997043 أو +966501234567"
                      className="w-full bg-slate-800 text-xs text-slate-100 p-3.5 rounded-2xl border border-slate-700 focus:outline-none focus:border-sky-500 font-mono dir-ltr text-right shadow-inner"
                    />
                    <Phone className="w-4 h-4 absolute left-3 top-3.5 text-slate-500 pointer-events-none" />
                  </div>
                </div>

                {/* Real-time Country & Key Extraction Feedback Card */}
                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">الدولة المكتشفة تلقائياً:</span>
                    <span className="font-bold text-sky-300 flex items-center gap-1.5 bg-sky-950/60 px-2.5 py-1 rounded-lg border border-sky-800/50">
                      <span>{parsedPhone.country.flag}</span>
                      <span>{parsedPhone.country.name}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/60">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">خانة المفتاح:</span>
                      <span className="font-mono text-amber-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {parsedPhone.countryCode || '+'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">الرقم الوطني:</span>
                      <span className="font-mono text-emerald-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {parsedPhone.nationalNumber || '---'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Keep Signed In Checkbox */}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={keepSigned}
                      onChange={(e) => setKeepSigned(e.target.checked)}
                      className="rounded accent-sky-500 w-4 h-4"
                    />
                    <span>إبقاء جلسة تليجرام مفعّلة</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-3.5 rounded-xl text-xs transition-all shadow-lg flex items-center justify-center gap-2 mt-2"
                >
                  <span>{isLoading ? 'جارٍ الاتصال بسيرفرات تليجرام...' : 'إرسال الرمز الحقيقي إلى تطبيق تليجرام'}</span>
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </button>
              </form>
            )}

            {step === 'code' && (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="p-3.5 bg-sky-500/10 border border-sky-500/30 rounded-2xl text-center">
                  <div className="text-xs text-sky-400 font-bold flex items-center justify-center gap-1.5">
                    <Send className="w-4 h-4" />
                    <span>تم إرسال الرمز الحقيقي من تليجرام</span>
                  </div>
                  <div className="text-xs text-slate-200 font-mono mt-1 dir-ltr flex items-center justify-center gap-1.5">
                    <span>{detectedCountry ? `${detectedCountry.flag} ${detectedCountry.name}` : ''}</span>
                    <span className="font-bold text-sky-300">({extractedCode}) {extractedNationalNumber}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                    📲 افتح تطبيق <strong>تليجرام الرسمي</strong> على هاتفك الآخر/جهازك. ستجد رسالة جديدة تحتوي على رمز التحقق المكون من 5 أرقام.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 text-center">
                    أدخل رمز التحقق المرسل في تليجرام
                  </label>
                  <input
                    type="text"
                    maxLength={5}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="• • • • •"
                    className="w-full bg-slate-800 text-slate-100 text-xl font-bold p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-sky-500 font-mono text-center tracking-widest"
                  />
                </div>

                <div className="flex justify-between items-center text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('phone');
                      setApiError('');
                    }}
                    className="text-slate-400 hover:text-white"
                  >
                    تغيير رقم الهاتف
                  </button>
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={isLoading}
                    className="text-sky-400 hover:underline font-bold"
                  >
                    إعادة إرسال الكود
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-3.5 rounded-xl text-xs transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <span>{isLoading ? 'جارٍ التحقق مع تليجرام...' : 'تأكيد ودخول الحساب'}</span>
                </button>
              </form>
            )}

            {step === '2fa' && (
              <form onSubmit={handleVerify2FA} className="space-y-4">
                <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-2xl text-center">
                  <div className="text-xs text-purple-400 font-bold flex items-center justify-center gap-1.5">
                    <Lock className="w-4 h-4" />
                    <span>التحقق بخطوتين (Cloud Password)</span>
                  </div>
                  <div className="text-[11px] text-slate-300 mt-1">
                    حسابك محمي بكلمة مرور إضافية. أدخل كلمة المرور للمتابعة.
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    كلمة المرور السحابية
                  </label>
                  <input
                    type="password"
                    value={cloudPassword}
                    onChange={(e) => setCloudPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-800 text-xs text-slate-100 p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold py-3.5 rounded-xl text-xs transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <span>{isLoading ? 'جارٍ فتح الحساب...' : 'دخول إلى تيليجرام Web'}</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: QR Code Login */}
        {loginMethod === 'qr' && (
          <div className="w-full flex flex-col items-center text-center space-y-4">
            {/* Animated Mock QR Code Box */}
            <div className="relative p-4 bg-white rounded-3xl shadow-xl overflow-hidden group">
              <div className="w-44 h-44 bg-slate-900 rounded-2xl p-2 flex flex-col items-center justify-center relative">
                {/* Simulated QR Code matrix */}
                <div className="grid grid-cols-6 gap-1.5 w-full h-full opacity-90">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded ${
                        (i * 7) % 3 === 0 ? 'bg-sky-400' : (i * 3) % 2 === 0 ? 'bg-slate-100' : 'bg-slate-800'
                      }`}
                    />
                  ))}
                </div>
                {/* Telegram Plane Logo in center */}
                <div className="absolute p-2 bg-sky-500 rounded-xl shadow-lg border-2 border-slate-900">
                  <Send className="w-5 h-5 text-white" />
                </div>
                {/* Scanning laser beam effect */}
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-sky-400 to-transparent top-0 animate-[bounce_2s_infinite]" />
              </div>
            </div>

            <ol className="text-xs text-slate-300 text-right space-y-1.5 max-w-xs pr-2">
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-slate-800 text-sky-400 rounded-full text-[10px] font-bold flex items-center justify-center">1</span>
                <span>افتح تطبيق <b>Telegram</b> على هاتفك المحمول.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-slate-800 text-sky-400 rounded-full text-[10px] font-bold flex items-center justify-center">2</span>
                <span>انتقل إلى <b>الإعدادات</b> ➔ <b>الأجهزة</b> ➔ <b>ربط جهاز بالحاسوب</b>.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-slate-800 text-sky-400 rounded-full text-[10px] font-bold flex items-center justify-center">3</span>
                <span>وجّه الكاميرا نحو الكود للمسح والمزامنة الفورية.</span>
              </li>
            </ol>
          </div>
        )}

        {/* Footer info */}
        <div className="mt-4 text-[11px] text-slate-500 font-mono text-center">
          TDLib Engine 1.8.0 • End-to-End Encrypted
        </div>
      </div>
    </div>
  );
};
