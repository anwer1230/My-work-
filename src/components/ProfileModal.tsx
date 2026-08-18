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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 z-50 select-none animate-fadeIn font-['Cairo',sans-serif]">
      <div className="bg-[#17212b] border border-white/[0.08] rounded-3xl w-full max-w-md shadow-2xl relative text-zinc-100 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Top Android Action Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-[#232e3c] shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-300 hover:text-white rounded-full active:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="font-bold text-sm text-zinc-100">الملف الشخصي</h2>
          </div>

          <button
            onClick={handleSaveProfile}
            className="text-xs font-bold text-[#50a2e9] hover:text-[#64b5f6] px-2 py-1 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-1"
          >
            <Check className="w-4 h-4" />
            <span>حفظ</span>
          </button>
        </div>

        {/* Telegram Android Profile Header */}
        <div className="flex flex-col items-center py-5 px-4 bg-[#232e3c] border-b border-white/[0.06] shrink-0">
          <div className="relative mb-3 group">
            <ChatAvatar
              title={`${firstName} ${lastName}`}
              avatar={photoUrl}
              size="xl"
            />
            <button
              onClick={() => {
                const url = prompt('أدخل رابط الصورة الشخصية:', photoUrl);
                if (url) setPhotoUrl(url);
              }}
              className="absolute bottom-0 right-0 p-2 bg-[#50a2e9] text-white rounded-full hover:scale-110 active:scale-95 transition-all shadow-lg"
              title="تعيين صورة للملف الشخصي"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-base font-bold text-zinc-100 flex items-center gap-1.5">
            <span>{firstName} {lastName}</span>
            {has2FA && <span title="الحساب محمي بـ 2FA"><ShieldCheck className="w-4 h-4 text-[#4fae4e]" /></span>}
          </h3>
          <p className="text-xs text-[#50a2e9] font-sans mt-0.5 dir-ltr">@{username || 'anwer1230'}</p>
          <span className="text-[11px] text-zinc-400 mt-0.5">متصل الآن</span>
        </div>

        {/* Material Navigation Segment Tabs */}
        <div className="flex border-b border-white/[0.06] bg-[#17212b] px-2 text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${
              activeTab === 'profile'
                ? 'border-[#50a2e9] text-[#50a2e9]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            المعلومات
          </button>

          <button
            onClick={() => setActiveTab('2fa')}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${
              activeTab === '2fa'
                ? 'border-[#50a2e9] text-[#50a2e9]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            التحقق 2FA
          </button>

          <button
            onClick={() => setActiveTab('sessions')}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${
              activeTab === 'sessions'
                ? 'border-[#50a2e9] text-[#50a2e9]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            الأجهزة ({sessions.length})
          </button>

          <button
            onClick={() => setActiveTab('recovery')}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${
              activeTab === 'recovery'
                ? 'border-[#50a2e9] text-[#50a2e9]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            الاسترداد
          </button>
        </div>

        {/* Tab Contents Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* TAB 1: Edit Profile */}
          {activeTab === 'profile' && (
            <div className="space-y-3.5">
              {/* Preset Avatar Selection */}
              <div>
                <label className="block font-semibold text-zinc-300 mb-2 flex items-center justify-between">
                  <span>الصورة الشخصية:</span>
                  <span className="text-[10px] text-[#50a2e9]">اختر رمزاً سريعاً</span>
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {presetAvatars.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setPhotoUrl(url)}
                      className={`relative rounded-full overflow-hidden shrink-0 border-2 transition-all ${
                        photoUrl === url ? 'border-[#50a2e9] scale-105 shadow-md' : 'border-white/10 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt={`Preset ${i}`} className="w-10 h-10 object-cover" />
                      {photoUrl === url && (
                        <div className="absolute inset-0 bg-[#50a2e9]/40 flex items-center justify-center">
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
                    className="w-10 h-10 rounded-full bg-[#242f3d] border border-dashed border-zinc-600 flex items-center justify-center text-zinc-400 hover:text-[#50a2e9] shrink-0"
                    title="رابط صورة مخصص"
                  >
                    <Image className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-zinc-400 text-[11px] mb-1">الاسم الأول</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-[#242f3d] text-zinc-100 p-2.5 rounded-xl border border-transparent focus:border-[#50a2e9] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-[11px] mb-1">الاسم الأخير</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-[#242f3d] text-zinc-100 p-2.5 rounded-xl border border-transparent focus:border-[#50a2e9] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 text-[11px] mb-1">اسم المستخدم (@username)</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#242f3d] text-zinc-100 p-2.5 rounded-xl border border-transparent focus:border-[#50a2e9] focus:outline-none font-mono dir-ltr text-right"
                  placeholder="username"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-[11px] mb-1">النبذة التعريفية (Bio)</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  className="w-full bg-[#242f3d] text-zinc-100 p-2.5 rounded-xl border border-transparent focus:border-[#50a2e9] focus:outline-none leading-relaxed"
                  placeholder="أكتب نبذة عنك تظهر للمستخدمين..."
                />
              </div>

              <button
                onClick={handleSaveProfile}
                className="w-full bg-[#50a2e9] hover:bg-[#64b5f6] text-white font-bold py-3 rounded-2xl transition-all shadow-md active:scale-98 text-xs"
              >
                حفظ التغييرات
              </button>
            </div>
          )}

          {/* TAB 2: 2FA Verification */}
          {activeTab === '2fa' && (
            <div className="space-y-3.5">
              <div className="p-3 bg-[#242f3d] border border-white/[0.06] rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className={`w-5 h-5 ${has2FA ? 'text-[#4fae4e]' : 'text-rose-400'}`} />
                  <div>
                    <span className="font-bold block text-zinc-200">التحقق بخطوتين (2FA)</span>
                    <span className="text-[11px] text-zinc-400">حماية حسابك بكلمة مرور سحابية</span>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                  has2FA ? 'bg-[#4fae4e]/20 text-[#4fae4e]' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {has2FA ? 'مفعل' : 'معطل'}
                </span>
              </div>

              <div className="space-y-2.5 bg-[#242f3d] p-3.5 rounded-2xl border border-white/[0.06]">
                {has2FA && (
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">كلمة المرور الحالية</label>
                    <input
                      type="password"
                      value={oldPass}
                      onChange={(e) => setOldPass(e.target.value)}
                      placeholder="أدخل كلمة المرور الحالية..."
                      className="w-full bg-[#17212b] text-zinc-100 p-2.5 rounded-xl border border-transparent focus:border-[#50a2e9] focus:outline-none font-mono"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">
                    {has2FA ? 'كلمة المرور الجديدة' : 'كلمة مرور التحقق بخطوتين'}
                  </label>
                  <input
                    type="password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="كلمة مرور قوية..."
                    className="w-full bg-[#17212b] text-zinc-100 p-2.5 rounded-xl border border-transparent focus:border-[#50a2e9] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">تلميح كلمة المرور</label>
                  <input
                    type="text"
                    value={hint}
                    onChange={(e) => setHint(e.target.value)}
                    placeholder="تلميح لتذكيرك في حال النسيان..."
                    className="w-full bg-[#17212b] text-zinc-100 p-2.5 rounded-xl border border-transparent focus:border-[#50a2e9] focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={handleSave2FA}
                    className="flex-1 bg-[#50a2e9] hover:bg-[#64b5f6] text-white font-bold py-2.5 rounded-xl transition-colors shadow"
                  >
                    {has2FA ? 'تحديث كلمة المرور' : 'تفعيل 2FA'}
                  </button>

                  {has2FA && (
                    <button
                      onClick={() => {
                        if (oldPass) {
                          onDisable2FA(oldPass);
                          setHas2FA(false);
                          alert('تم تعطيل التحقق بخطوتين.');
                        } else {
                          alert('يرجى كتابة كلمة المرور الحالية للتعطيل.');
                        }
                      }}
                      className="bg-rose-500/20 hover:bg-rose-500 hover:text-white text-rose-400 font-bold px-3 py-2.5 rounded-xl transition-colors shrink-0"
                    >
                      تعطيل
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
                <span className="font-bold text-zinc-300">الأجهزة النشطة ({sessions.length})</span>
                <button
                  onClick={handleTerminateSessions}
                  className="bg-rose-500/20 hover:bg-rose-500 hover:text-white text-rose-400 font-bold px-3 py-1.5 rounded-xl text-[11px] transition-colors flex items-center gap-1.5"
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>إنهاء باقي الجلسات</span>
                </button>
              </div>

              <div className="space-y-2">
                {sessions.map((sess) => (
                  <div
                    key={sess.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      sess.is_current
                        ? 'bg-[#242f3d] border-[#50a2e9]/50'
                        : 'bg-[#242f3d]/60 border-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5">
                        {sess.platform === 'desktop' ? (
                          <Laptop className="w-4 h-4 text-purple-400" />
                        ) : sess.platform === 'mobile' ? (
                          <Smartphone className="w-4 h-4 text-[#50a2e9]" />
                        ) : (
                          <Globe className="w-4 h-4 text-[#4fae4e]" />
                        )}
                        <span className="font-bold text-zinc-200">{sess.device_name}</span>
                      </div>
                      {sess.is_current && (
                        <span className="bg-[#50a2e9]/20 text-[#50a2e9] text-[10px] font-bold px-2 py-0.5 rounded-full">
                          هذا الجهاز
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-zinc-400 space-y-0.5 dir-ltr text-right">
                      <div><span className="text-zinc-500">IP:</span> {sess.ip}</div>
                      <div><span className="text-zinc-500">الموقع:</span> {sess.location}</div>
                      <div><span className="text-zinc-500">التطبيق:</span> {sess.app_version} • <span className="text-[#4fae4e]">{sess.last_active}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Recovery Email */}
          {activeTab === 'recovery' && (
            <div className="space-y-3">
              <div className="p-4 bg-[#242f3d] border border-white/[0.06] rounded-2xl space-y-3">
                <div className="flex items-center gap-2.5 text-[#4fae4e] font-bold">
                  <Mail className="w-5 h-5" />
                  <span>بريد استرداد الحساب</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  يُستخدم هذا البريد الإلكتروني لإرسال رموز استعادة الحساب وإعادة تعيين كلمة المرور في حال فقدانها.
                </p>

                <div>
                  <label className="block font-semibold text-zinc-300 text-[11px] mb-1">البريد الإلكتروني:</label>
                  <input
                    type="email"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    className="w-full bg-[#17212b] text-zinc-100 p-2.5 rounded-xl border border-transparent focus:border-[#4fae4e] focus:outline-none font-mono dir-ltr text-right"
                    placeholder="user@example.com"
                  />
                </div>

                <button
                  onClick={handleSaveEmail}
                  className="w-full bg-[#4fae4e] hover:bg-emerald-400 text-white font-bold py-2.5 rounded-xl transition-colors shadow mt-1"
                >
                  حفظ بريد الاسترداد
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
