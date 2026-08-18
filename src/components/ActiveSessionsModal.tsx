import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Laptop,
  Globe,
  ShieldCheck,
  Power,
  Trash2,
  Clock,
  MapPin,
  Key,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Info,
} from 'lucide-react';

export interface TelegramSession {
  id: string;
  device_name: string;
  app_version: string;
  platform: 'desktop' | 'mobile' | 'web';
  ip_address: string;
  location: string;
  last_active: string;
  is_current: boolean;
  auth_key_hash: string;
}

interface ActiveSessionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTerminateCurrentSession?: () => void;
}

export const ActiveSessionsModal: React.FC<ActiveSessionsModalProps> = ({
  isOpen,
  onClose,
  onTerminateCurrentSession,
}) => {
  const [autoTerminateMonths, setAutoTerminateMonths] = useState<string>('6_months');
  const [currentAuthKey, setCurrentAuthKey] = useState<string>('');
  const [currentSessionFile, setCurrentSessionFile] = useState<string>('');

  // Sample real active sessions list
  const [otherSessions, setOtherSessions] = useState<TelegramSession[]>([
    {
      id: 'session_win_102',
      device_name: 'Telegram Desktop (Windows 11)',
      app_version: 'Telegram v5.2.1 x64',
      platform: 'desktop',
      ip_address: '185.220.101.4',
      location: 'الرياض، المملكة العربية السعودية',
      last_active: 'نشط منذ 12 دقيقة',
      is_current: false,
      auth_key_hash: '8f92a3b4...c710',
    },
    {
      id: 'session_ios_309',
      device_name: 'Telegram for iPhone 15 Pro Max',
      app_version: 'Telegram iOS v10.8.2',
      platform: 'mobile',
      ip_address: '94.201.210.88',
      location: 'جدة، المملكة العربية السعودية',
      last_active: 'نشط أمس 22:15',
      is_current: false,
      auth_key_hash: '1a2b3c4d...e5f6',
    },
    {
      id: 'session_mac_701',
      device_name: 'Telegram WebZ (macOS Sonoma)',
      app_version: 'Chrome v127.0.0.0',
      platform: 'web',
      ip_address: '178.135.90.12',
      location: 'دبي، الإمارات العربية المتحدة',
      last_active: 'منذ 3 أيام',
      is_current: false,
      auth_key_hash: '90817263...4512',
    },
  ]);

  useEffect(() => {
    if (isOpen) {
      const authKey = localStorage.getItem('tg_auth_key') || 'auth_key_live_default_hash_9981';
      const sessionFile = localStorage.getItem('tg_session_file') || 'session_active_default.session';
      setCurrentAuthKey(authKey);
      setCurrentSessionFile(sessionFile);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTerminateSession = (id: string, name: string) => {
    if (confirm(`هل أنت أصلًا متأكد من إنهاء جلسة "${name}" بعيداً؟`)) {
      setOtherSessions((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleTerminateAllOthers = () => {
    if (confirm('هل ترغب حقاً في إنهاء جميع الجلسات النشطة على الأجهزة الأخرى؟ سيُطلب منهم تسجيل الدخول مجدداً.')) {
      setOtherSessions([]);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none dir-rtl animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-sky-950 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>الجلسات النشطة (Active Sessions)</span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-mono border border-emerald-500/30">
                  MTProto Cloud
                </span>
              </h3>
              <p className="text-xs text-sky-200/80 mt-0.5">
                إدارة أجهزتك ومفاتيح التشفير ومتابعة الدخول بحسابك
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 space-y-5 overflow-y-auto custom-scrollbar flex-1 text-xs">
          
          {/* Current Session Card */}
          <div className="p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950/40 border border-sky-500/40 rounded-2xl space-y-3 relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-2">
                <Laptop className="w-5 h-5 text-sky-400" />
                <span className="font-bold text-sky-300 text-xs">هذا الجهاز (الجلسة الحالية)</span>
              </div>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold flex items-center gap-1 border border-emerald-500/30">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                <span>نشط الآن (Active)</span>
              </span>
            </div>

            <div className="space-y-1.5 text-slate-200">
              <div className="font-bold text-sm text-white">
                Telegram Web App (هذا المتصفح)
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                الإصدار: Official Telegram Web & MTProto API v1.4
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[10px] text-slate-300 font-mono">
                <div className="flex items-center gap-1.5 bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="truncate">الموقع: الرياض، المملكة العربية السعودية</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                  <Globe className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="truncate">عنوان IP: 83.137.45.192</span>
                </div>
              </div>

              {/* Session File & Auth Key Info */}
              <div className="mt-2 p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1 font-mono text-[10px]">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1 text-amber-400 font-semibold">
                    <Key className="w-3 h-3" />
                    <span>مفتاح التفويض (Authorization Key):</span>
                  </span>
                  <span className="text-slate-500 truncate max-w-[150px]">{currentAuthKey}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-sky-400 font-semibold">ملف الجلسة (Session File):</span>
                  <span className="text-slate-500 truncate max-w-[150px]">{currentSessionFile}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action to Terminate All Other Sessions */}
          {otherSessions.length > 0 && (
            <button
              onClick={handleTerminateAllOthers}
              className="w-full py-3 bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-slate-950 font-bold rounded-2xl text-xs transition-all flex items-center justify-center gap-2 border border-rose-500/30 shadow-md group"
            >
              <Power className="w-4 h-4 text-rose-400 group-hover:text-slate-950 transition-colors" />
              <span>إنهاء جميع الجلسات الأخرى ({otherSessions.length})</span>
            </button>
          )}

          {/* Other Active Devices List */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-slate-300 font-bold text-xs flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-sky-400" />
                <span>الجلسات النشطة على الأجهزة الأخرى ({otherSessions.length}):</span>
              </label>
            </div>

            {otherSessions.length === 0 ? (
              <div className="p-6 bg-slate-950/60 border border-slate-800/80 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="font-bold text-slate-200 text-xs">لا توجد جلسات أخرى مفتوحة حالياً!</p>
                <p className="text-[11px] text-slate-400">
                  حسابك مسجل فقط من هذا الجهاز، مما يضمن أقصى درجات الأمان والخصوصية.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {otherSessions.map((s) => (
                  <div
                    key={s.id}
                    className="p-3.5 bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-2xl flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="p-2.5 rounded-xl bg-slate-800 text-sky-400 shrink-0 mt-0.5">
                        {s.platform === 'desktop' ? (
                          <Laptop className="w-5 h-5" />
                        ) : s.platform === 'mobile' ? (
                          <Smartphone className="w-5 h-5" />
                        ) : (
                          <Globe className="w-5 h-5" />
                        )}
                      </div>

                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="font-bold text-slate-100 text-xs truncate">
                          {s.device_name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">
                          {s.app_version}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2 pt-0.5">
                          <span>📍 {s.location}</span>
                          <span>🌐 {s.ip_address}</span>
                        </div>
                        <div className="text-[10px] text-emerald-400 font-mono pt-0.5">
                          🕒 {s.last_active}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleTerminateSession(s.id, s.device_name)}
                      className="px-3 py-2 bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white font-bold rounded-xl text-[11px] transition-colors shrink-0 flex items-center gap-1 border border-rose-500/30"
                      title="إنهاء الجلسة عن بُعد"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>إنهاء</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Auto Terminate Settings */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-slate-200 font-bold text-xs">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>إنهاء الجلسات القديمة تلقائياً عند عدم النشاط:</span>
            </div>
            
            <p className="text-[11px] text-slate-400 leading-relaxed">
              يقوم تليجرام تلقائياً بإنهاء أي جلسة غير نشطة إذا لم يتم استخدامها للفترة المحددة:
            </p>

            <select
              value={autoTerminateMonths}
              onChange={(e) => setAutoTerminateMonths(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 text-xs font-semibold focus:outline-none focus:border-sky-400"
            >
              <option value="1_week">بعد أسبوع واحد (1 Week)</option>
              <option value="1_month">بعد شهر واحد (1 Month)</option>
              <option value="3_months">بعد 3 أشهر (3 Months)</option>
              <option value="6_months">بعد 6 أشهر (6 Months - موصى به)</option>
              <option value="1_year">بعد سنة واحدة (1 Year)</option>
            </select>
          </div>

        </div>

        {/* Action Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
            <Info className="w-3.5 h-3.5 text-sky-400" />
            <span>جلسات MTProto السحابية المشفرة</span>
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
