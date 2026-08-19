import React, { useState } from 'react';
import {
  User,
  Lock,
  KeyRound,
  Sparkles,
  X,
  Camera,
  Laptop,
  Smartphone,
  Globe,
  ShieldCheck,
  ShieldAlert,
  Mail,
  Check,
  Power,
  Trash2,
  RefreshCw,
  Image,
} from 'lucide-react';
import { UserProfile, ActiveSession } from '../types';
import { ChatAvatar } from './ChatAvatar';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateName: (firstName: string, lastName: string) => void;
  onUpdateUsername: (username: string) => void;
  onUpdatePhoto: (photoUrl: string) => void;
  onUpdateBio?: (bio: string) => void;
  onUpdateRecoveryEmail?: (email: string) => void;
  onEnable2FA: (pass: string, hint: string) => void;
  onChange2FA: (oldPass: string, newPass: string, hint: string) => void;
  onDisable2FA: (pass: string) => void;
  onTerminateOtherSessions?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateName,
  onUpdateUsername,
  onUpdatePhoto,
  onUpdateBio,
  onUpdateRecoveryEmail,
  onEnable2FA,
  onChange2FA,
  onDisable2FA,
  onTerminateOtherSessions,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | '2fa' | 'sessions' | 'recovery'>('profile');

  // Profile Fields
  const [firstName, setFirstName] = useState(profile.first_name);
  const [lastName, setLastName] = useState(profile.last_name);
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio || '');
  const [photoUrl, setPhotoUrl] = useState(profile.photo || '');

  // 2FA Security
  const [has2FA, setHas2FA] = useState(profile.has_2fa);
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [hint, setHint] = useState(profile.hint_2fa || '');

  // Recovery Email
  const [recoveryEmail, setRecoveryEmail] = useState(profile.recovery_email || 'anwrfwad178@gmail.com');

  // Sessions Mock State
  const defaultSessions: ActiveSession[] = profile.sessions || [
    {
      id: 'sess_1',
      device_name: 'Telegram Web (Chrome 127 - Windows 11)',
      app_version: 'v2.0.0 Web Unified',
      ip: '185.220.101.4',
      location: 'الرياض, المملكة العربية السعودية',
      last_active: 'نشط الآن (هذا الجهاز)',
      is_current: true,
      platform: 'web',
    },
    {
      id: 'sess_2',
      device_name: 'Telegram Android App (Samsung Galaxy S24 Ultra)',
      app_version: 'v10.12.1 Official App',
      ip: '37.238.102.19',
      location: 'بغداد, العراق',
      last_active: 'منذ 15 دقيقة',
      is_current: false,
      platform: 'mobile',
    },
    {
      id: 'sess_3',
      device_name: 'Telegram Desktop (macOS M2)',
      app_version: 'v10.5.0 macOS Native',
      ip: '82.199.210.88',
      location: 'دبي, الإمارات العربية المتحدة',
      last_active: 'منذ ساعتين',
      is_current: false,
      platform: 'desktop',
    },
  ];

  const [sessions, setSessions] = useState<ActiveSession[]>(defaultSessions);

  // Preset Telegram Profile Photos for quick avatar selection
  const presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=150&q=80',
  ];

  if (!isOpen) return null;

  const handleSaveProfile = () => {
    onUpdateName(firstName, lastName);
    onUpdateUsername(username);
    if (photoUrl) onUpdatePhoto(photoUrl);
    if (onUpdateBio) onUpdateBio(bio);
    alert('✅ تم حفظ كافة بيانات الملف الشخصي والنبذة بنجاح!');
  };

  const handleSave2FA = () => {
    if (has2FA) {
      if (oldPass && newPass) {
        onChange2FA(oldPass, newPass, hint);
        alert('✅ تم تغيير كلمة مرور التحقق بخطوتين بنجاح!');
        setOldPass('');
        setNewPass('');
      } else if (oldPass && !newPass) {
        onDisable2FA(oldPass);
        setHas2FA(false);
        alert('🔴 تم تعطيل التحقق بخطوتين (2FA) للحساب.');
        setOldPass('');
      } else {
        alert('يرجى إدخال كلمة المرور الحالية والجديدة للتحديث.');
      }
    } else {
      if (newPass) {
        onEnable2FA(newPass, hint);
        setHas2FA(true);
        alert('🟢 تم تفعيل التحقق بخطوتين (2FA) بنجاح وتعيين التلميح!');
        setNewPass('');
      } else {
        alert('يرجى إدخال كلمة مرور جديدة لتفعيل 2FA.');
      }
    }
  };

  const handleSaveEmail = () => {
    if (onUpdateRecoveryEmail) {
      onUpdateRecoveryEmail(recoveryEmail);
    }
    alert('📧 تم تحديث بريد استرداد الحساب بنجاح!');
  };

  const handleTerminateSessions = () => {
    if (confirm('هل أنت متاكد من إنهاء الخروج من كافة الجلسات الأخرى على الأجهزة المتصلة؟')) {
      setSessions(sessions.filter((s) => s.is_current));
      if (onTerminateOtherSessions) {
        onTerminateOtherSessions();
      }
      alert('🔒 تم إنهاء جميع الجلسات الأخرى بنجاح! حسابك آمن الآن.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 select-none animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative text-slate-100 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center mb-4 shrink-0">
          <div className="relative mb-2 group">
            <ChatAvatar
              title={`${firstName} ${lastName}`}
              avatar={photoUrl}
              size="xl"
            />
            <button
              onClick={() => {
                const url = prompt('أدخل رابط الصورة الشخصية أو اختر من الأيقونات المتاحة بالأسفل:', photoUrl);
                if (url) setPhotoUrl(url);
              }}
              className="absolute bottom-0 right-0 p-2 bg-sky-500 text-slate-950 rounded-full hover:scale-110 transition-transform shadow-lg"
              title="تغيير صورة الملف الشخصي"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
            <span>{firstName} {lastName}</span>
            {has2FA && <span title="الحساب محمي بـ 2FA"><ShieldCheck className="w-4 h-4 text-emerald-400" /></span>}
          </h3>
          <p className="text-xs text-sky-400 font-mono mt-0.5 dir-ltr">@{username || 'anwer1230'}</p>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950 rounded-2xl border border-slate-800 mb-4 text-xs font-bold text-center shrink-0">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 rounded-xl transition-all flex flex-col items-center gap-1 ${
              activeTab === 'profile'
                ? 'bg-sky-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>الملف</span>
          </button>

          <button
            onClick={() => setActiveTab('2fa')}
            className={`py-2 rounded-xl transition-all flex flex-col items-center gap-1 ${
              activeTab === '2fa'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>التحقق 2FA</span>
          </button>

          <button
            onClick={() => setActiveTab('sessions')}
            className={`py-2 rounded-xl transition-all flex flex-col items-center gap-1 ${
              activeTab === 'sessions'
                ? 'bg-purple-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>الأجهزة ({sessions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('recovery')}
            className={`py-2 rounded-xl transition-all flex flex-col items-center gap-1 ${
              activeTab === 'recovery'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>البريد</span>
          </button>
        </div>

        {/* Tab Contents Scrollable Container */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs">
          {/* TAB 1: Edit Profile */}
          {activeTab === 'profile' && (
            <div className="space-y-3">
              {/* Preset Avatar Selection */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>تغيير الأيقونة والصورة الشخصية:</span>
                  <span className="text-[10px] text-sky-400">اختر صورة جاهزة أو اكتب رابطاً</span>
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {presetAvatars.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setPhotoUrl(url)}
                      className={`relative rounded-full overflow-hidden shrink-0 border-2 transition-all ${
                        photoUrl === url ? 'border-sky-400 scale-110 shadow-lg' : 'border-slate-800 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt={`Preset ${i}`} className="w-10 h-10 object-cover" />
                      {photoUrl === url && (
                        <div className="absolute inset-0 bg-sky-500/40 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      const custom = prompt('أدخل رابط الصورة الشخصية URL:');
                      if (custom) setPhotoUrl(custom);
                    }}
                    className="w-10 h-10 rounded-full bg-slate-800 border border-dashed border-slate-600 flex items-center justify-center text-slate-400 hover:text-sky-400 shrink-0"
                    title="إضافة رابط صورة خارجي"
                  >
                    <Image className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">الاسم الأول</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">الاسم الأخير</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">اسم المستخدم (@username)</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-sky-500 font-mono dir-ltr text-right"
                  placeholder="username"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">النبذة التعريفية (Bio / About)</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-sky-500"
                  placeholder="أكتب نبذة قصيرة عن نفسك..."
                />
              </div>

              <button
                onClick={handleSaveProfile}
                className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-bold py-3 rounded-2xl transition-all shadow-lg text-xs"
              >
                حفظ التغييرات والملف الشخصي
              </button>
            </div>
          )}

          {/* TAB 2: 2FA Verification */}
          {activeTab === '2fa' && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className={`w-5 h-5 ${has2FA ? 'text-emerald-400' : 'text-rose-400'}`} />
                  <div>
                    <span className="font-bold block text-slate-200">التحقق بخطوتين (2-Step Verification)</span>
                    <span className="text-[11px] text-slate-400">حماية حسابك بكلمة مرور إضافية عند الدخول</span>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                  has2FA ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}>
                  {has2FA ? '🟢 مفعل' : '🔴 معطل'}
                </span>
              </div>

              <div className="space-y-2 bg-slate-950/40 p-3 rounded-2xl border border-slate-800/80">
                {has2FA && (
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">كلمة المرور الحالية</label>
                    <input
                      type="password"
                      value={oldPass}
                      onChange={(e) => setOldPass(e.target.value)}
                      placeholder="أدخل كلمة المرور الحالية للتغيير أو التعطيل..."
                      className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700 font-mono"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">
                    {has2FA ? 'كلمة المرور الجديدة' : 'كلمة المرور لتفعيل 2FA'}
                  </label>
                  <input
                    type="password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="كلمة مرور قوية ومحمية..."
                    className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">تلميح كلمة المرور (Password Hint)</label>
                  <input
                    type="text"
                    value={hint}
                    onChange={(e) => setHint(e.target.value)}
                    placeholder="تلميح يذكرك برمزك عند نسيانه..."
                    className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={handleSave2FA}
                    className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl transition-colors shadow"
                  >
                    {has2FA ? 'تحديث كلمة المرور والتلميح' : 'تفعيل التحقق بخطوتين الآن'}
                  </button>

                  {has2FA && (
                    <button
                      onClick={() => {
                        if (oldPass) {
                          onDisable2FA(oldPass);
                          setHas2FA(false);
                          alert('🔴 تم تعطيل التحقق بخطوتين.');
                        } else {
                          alert('يرجى كتابة كلمة المرور الحالية لتعطيل 2FA.');
                        }
                      }}
                      className="bg-rose-500/20 hover:bg-rose-500 hover:text-slate-950 text-rose-400 border border-rose-500/40 font-bold px-3 py-2.5 rounded-xl transition-colors shrink-0"
                    >
                      تعطيل 2FA
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Active Sessions */}
          {activeTab === 'sessions' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-slate-300">الجلسات والأجهزة المفتوحة ({sessions.length})</span>
                <button
                  onClick={handleTerminateSessions}
                  className="bg-rose-500/20 hover:bg-rose-500 hover:text-slate-950 text-rose-400 border border-rose-500/40 font-bold px-3 py-1.5 rounded-xl text-[11px] transition-colors flex items-center gap-1"
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>إنهاء كل الجلسات الأخرى</span>
                </button>
              </div>

              <div className="space-y-2">
                {sessions.map((sess) => (
                  <div
                    key={sess.id}
                    className={`p-3 rounded-2xl border transition-all ${
                      sess.is_current
                        ? 'bg-purple-950/40 border-purple-500/40'
                        : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {sess.platform === 'desktop' ? (
                          <Laptop className="w-4 h-4 text-purple-400" />
                        ) : sess.platform === 'mobile' ? (
                          <Smartphone className="w-4 h-4 text-sky-400" />
                        ) : (
                          <Globe className="w-4 h-4 text-emerald-400" />
                        )}
                        <span className="font-bold text-slate-200">{sess.device_name}</span>
                      </div>
                      {sess.is_current && (
                        <span className="bg-purple-500/30 text-purple-300 border border-purple-500/40 text-[9px] font-bold px-2 py-0.5 rounded-full">
                          هذا الجهاز
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-400 space-y-0.5 dir-ltr text-right">
                      <div><span className="text-slate-500">IP:</span> {sess.ip}</div>
                      <div><span className="text-slate-500">Location:</span> {sess.location}</div>
                      <div><span className="text-slate-500">App:</span> {sess.app_version} • <span className="text-emerald-400">{sess.last_active}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Recovery Email */}
          {activeTab === 'recovery' && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Mail className="w-5 h-5" />
                  <span>البريد الإلكتروني لاسترداد الحساب</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  يُستخدم هذا البريد الإلكتروني لإرسال رموز إعادة التعيين في حال نسيان كلمة مرور التحقق بخطوتين (2FA) لضمان عدم ضياع حسابك نهائياً.
                </p>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">عنوان البريد الإلكتروني:</label>
                  <input
                    type="email"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700 font-mono dir-ltr text-right focus:border-emerald-500"
                    placeholder="user@example.com"
                  />
                </div>

                <button
                  onClick={handleSaveEmail}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl transition-colors shadow mt-1"
                >
                  حفظ وتحديث بريد الاسترداد
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
