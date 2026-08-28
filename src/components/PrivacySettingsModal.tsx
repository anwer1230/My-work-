import React, { useState, useEffect } from 'react';
import {
  Shield,
  Lock,
  KeyRound,
  Trash2,
  Clock,
  Mail,
  UserX,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Check,
  X,
  AlertTriangle,
  Fingerprint,
  Phone,
  Eye,
  Camera,
  Share2,
  PhoneCall,
  Mic,
  FileText,
  HelpCircle,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { mtprotoService } from '../lib/mtprotoService';

// ── Types ──────────────────────────────────────────────────────────────────
export type PrivacyViewType =
  | 'main'
  | 'two_step'
  | 'auto_delete'
  | 'passcode'
  | 'login_email'
  | 'blocked_users'
  | 'privacy_rule';

export interface PrivacyRuleConfig {
  key: string;
  title: string;
  description: string;
  warningNote?: string;
  currentValue: 'everybody' | 'contacts' | 'nobody';
  allowExceptionsCount?: number;
  disallowExceptionsCount?: number;
}

interface PrivacySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenActiveSessions?: () => void;
}

export const PrivacySettingsModal: React.FC<PrivacySettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenActiveSessions,
}) => {
  // Navigation stack
  const [currentView, setCurrentView] = useState<PrivacyViewType>('main');
  const [activeRuleKey, setActiveRuleKey] = useState<string>('phone_number');

  // Loading state
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // 1. Two-Step Verification State
  const [twoStepData, setTwoStepData] = useState({
    has_password: true,
    has_recovery: true,
    hint: 'تاريخ الميلاد أو الرقم السري',
    email_unconfirmed_pattern: 's***@gmail.com',
    email: 's***@gmail.com',
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newHint, setNewHint] = useState('');
  const [newEmail, setNewEmail] = useState('');

  // 2. Auto-Delete Messages Global Timer State
  const [autoDeletePeriod, setAutoDeletePeriod] = useState<number>(0); // 0 = off, 86400 = 1d, 604800 = 1w, 2592000 = 1m

  // 3. Passcode Lock State
  const [passcodeData, setPasscodeData] = useState({
    enabled: false,
    type: 'pin' as 'pin' | 'password',
    timeout_seconds: 300,
    unlock_with_biometrics: true,
  });
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeConfirm, setPasscodeConfirm] = useState('');

  // 4. Login Email State
  const [loginEmail, setLoginEmail] = useState('s***@gmail.com');
  const [rawLoginEmail, setRawLoginEmail] = useState('');
  const [loginEmailCode, setLoginEmailCode] = useState('');

  // 5. Blocked Users State
  const [blockedList, setBlockedList] = useState<Array<{ id: number | string; name: string; username?: string; date: number }>>([
    { id: 109, name: 'حساب مجهول / سبام', username: '@spammer_bot', date: Math.floor(Date.now() / 1000) - 86400 * 5 },
    { id: 882, name: 'مروج إعلانات عشوائي', username: '@ad_promoter_99', date: Math.floor(Date.now() / 1000) - 86400 * 12 },
  ]);
  const [newBlockId, setNewBlockId] = useState('');
  const [newBlockName, setNewBlockName] = useState('');

  // 6. Active Sessions Count
  const [sessionsCount, setSessionsCount] = useState(3);

  // 7. Privacy Rules State
  const [privacyRules, setPrivacyRules] = useState<Record<string, 'everybody' | 'contacts' | 'nobody'>>({
    phone_number: 'nobody',
    status_timestamp: 'everybody',
    profile_photo: 'everybody',
    forwards: 'contacts',
    phone_call: 'everybody',
    voice_messages: 'everybody',
    bio: 'everybody',
  });

  // 8. Self-Destruct Account State
  const [accountTtlMonths, setAccountTtlMonths] = useState(6);

  // ── Sync with MTProto RPCs on Open ─────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setCurrentView('main');
      fetchPrivacyState();
    }
  }, [isOpen]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fetchPrivacyState = async () => {
    setLoading(true);
    try {
      // 1. Password state
      const pwdRes = await fetch('/api/telegram/account/getPassword');
      const pwdData = await pwdRes.json();
      if (pwdData.success) {
        setTwoStepData(pwdData);
        setLoginEmail(pwdData.email_unconfirmed_pattern || pwdData.email || 's***@gmail.com');
      }

      // 2. Privacy rules
      const privRes = await fetch('/api/telegram/account/getPrivacy');
      const privData = await privRes.json();
      if (privData.success && privData.rules) {
        const mapped: any = {};
        Object.keys(privData.rules).forEach((k) => {
          mapped[k] = privData.rules[k].rule;
        });
        setPrivacyRules((prev) => ({ ...prev, ...mapped }));
      }

      // 3. Blocked users
      const blkRes = await fetch('/api/telegram/contacts/getBlocked');
      const blkData = await blkRes.json();
      if (blkData.success && blkData.blocked) {
        setBlockedList(blkData.blocked);
      }

      // 4. Authorizations count
      const authRes = await fetch('/api/telegram/account/getAuthorizations');
      const authData = await authRes.json();
      if (authData.success && authData.authorizations) {
        setSessionsCount(authData.authorizations.length);
      }

      // 5. Global TTL
      const ttlRes = await fetch('/api/telegram/account/getGlobalTtl');
      const ttlData = await ttlRes.json();
      if (ttlData.success) {
        setAutoDeletePeriod(ttlData.period_seconds || 0);
      }

      // 6. Passcode
      const pcRes = await fetch('/api/telegram/account/getPasscodeSettings');
      const pcData = await pcRes.json();
      if (pcData.success) {
        setPasscodeData(pcData);
      }

      // 7. Account TTL
      const accRes = await fetch('/api/telegram/account/getAccountTTL');
      const accData = await accRes.json();
      if (accData.success) {
        setAccountTtlMonths(accData.months || 6);
      }
    } catch (e) {
      console.warn('Failed to fetch complete privacy state:', e);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  // ── Privacy Rules Meta Info ───────────────────────────────────────────────
  const privacyRulesMetadata: Record<string, { title: string; desc: string; warn?: string; icon: any }> = {
    phone_number: {
      title: 'رقم الهاتف (Phone Number)',
      desc: 'التحكم في من يستطيع رؤية رقم هاتفك المرتبط بالحساب وإيجادك به.',
      warn: 'المستخدمون الذين لديهم رقمك محفوظ في جهات اتصالهم سيظلون قادرين على رؤيته إلا إذا قمت بتقييد ذلك.',
      icon: Phone,
    },
    status_timestamp: {
      title: 'آخر ظهور ومتصل الآن (Last Seen & Online)',
      desc: 'التحكم في من يستطيع رؤية وقت آخر ظهور لك وحالتك اللحظية على تليجرام.',
      warn: 'لن تتمكن من رؤية آخر ظهور للأشخاص الذين حجبت عنهم رؤية آخر ظهور لك. سيظهر لهم تقريبياً (منذ وقت قريب، هذا الأسبوع).',
      icon: Eye,
    },
    profile_photo: {
      title: 'الصور ومقاطع الفيديو الشخصية (Profile Photos)',
      desc: 'تحديد من يمكنه مشاهدة صور ملفك الشخصي ومقاطع الفيديو التعريفية.',
      icon: Camera,
    },
    forwards: {
      title: 'الرسائل المحولة (Forwarded Messages)',
      desc: 'التحكم في إمكانية ربط حسابك عند إعادة توجيه رسائلك إلى محادثات أخرى.',
      warn: 'عند اختيار "لا أحد"، ستظهر رسائلك المحولة بدون رابط قابل للنقر يؤدي إلى ملفك الشخصي.',
      icon: Share2,
    },
    phone_call: {
      title: 'المكالمات الصوتية والمرئية (Calls)',
      desc: 'تحديد من يمكنه الاتصال بك هاتفياً أو عبر الفيديو عبر تليجرام.',
      warn: 'تستخدم المكالمات اتصالاً مباشراً (Peer-to-Peer) لتحسين الجودة، مما قد يكشف عنوان IP الخاص بك للمتصلين.',
      icon: PhoneCall,
    },
    voice_messages: {
      title: 'الرسائل الصوتية والمرئية (Voice Messages)',
      desc: 'التحكم في من يمكنه إرسال رسائل صوتية أو دوائر فيديو إليك.',
      warn: 'يمكن لمشتركي Telegram Premium تقييد استلام الرسائل الصوتية فقط من جهات الاتصال.',
      icon: Mic,
    },
    bio: {
      title: 'النبذة التعريفية (Bio)',
      desc: 'تحديد من يمكنه قراءة النبذة التعريفية المكتوبة في ملفك الشخصي.',
      icon: FileText,
    },
  };

  const getRuleDisplay = (val: string) => {
    switch (val) {
      case 'everybody':
        return 'الجميع';
      case 'contacts':
        return 'جهات الاتصال';
      case 'nobody':
        return 'لا أحد';
      default:
        return 'الجميع';
    }
  };

  const getAutoDeleteDisplay = (secs: number) => {
    if (secs === 0) return 'معطل';
    if (secs === 86400) return 'بعد يوم واحد';
    if (secs === 604800) return 'بعد أسبوع';
    if (secs === 2592000) return 'بعد شهر';
    return `مخصص (${Math.round(secs / 86400)} يوم)`;
  };

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleUpdatePrivacyRule = async (key: string, rule: 'everybody' | 'contacts' | 'nobody') => {
    setPrivacyRules((prev) => ({ ...prev, [key]: rule }));
    try {
      await fetch('/api/telegram/account/setPrivacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, rule }),
      });
      showToast('✅ تم حفظ إعداد الخصوصية بنجاح');
    } catch (e) {
      showToast('❌ تعذر الحفظ عبر الخادم');
    }
  };

  const handleSaveTwoStep = async (disable = false) => {
    if (!disable && newPassword && newPassword !== confirmPassword) {
      alert('كلمتا المرور غير متطابقتين!');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/telegram/account/updatePasswordSettings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          new_password: disable ? '' : newPassword,
          hint: newHint,
          email: newEmail,
          disable,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTwoStepData(data.settings);
        showToast(disable ? '🔒 تم تعطيل التحقق بخطوتين' : '🔐 تم تعيين كلمة المرور بنجاح');
        setCurrentView('main');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (e) {
      showToast('❌ حدث خطأ أثناء تحديث كلمة المرور');
    }
    setLoading(false);
  };

  const handleSaveAutoDelete = async (period: number) => {
    setAutoDeletePeriod(period);
    try {
      await fetch('/api/telegram/account/setGlobalTtl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period }),
      });
      showToast('⏳ تم ضبط المؤقت التلقائي للرسائل');
      setCurrentView('main');
    } catch (e) {
      showToast('❌ تعذر تحديث المؤقت');
    }
  };

  const handleSavePasscode = async (disable = false) => {
    if (!disable && passcodeInput && passcodeInput !== passcodeConfirm) {
      alert('رمز القفل غير متطابق!');
      return;
    }
    try {
      const res = await fetch('/api/telegram/account/setPasscode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: !disable,
          code: disable ? '' : passcodeInput,
          type: passcodeData.type,
          timeout_seconds: passcodeData.timeout_seconds,
          unlock_with_biometrics: passcodeData.unlock_with_biometrics,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPasscodeData((prev) => ({ ...prev, enabled: !disable }));
        showToast(disable ? '🔓 تم تعطيل رمز القفل' : '🔒 تم تفعيل رمز القفل بنجاح');
        setCurrentView('main');
        setPasscodeInput('');
        setPasscodeConfirm('');
      }
    } catch (e) {
      showToast('❌ تعذر ضبط رمز القفل');
    }
  };

  const handleUnblockUser = async (id: number | string) => {
    try {
      const res = await fetch('/api/telegram/contacts/unblock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        setBlockedList(data.blocked);
        showToast('✅ تم إلغاء حظر المستخدم');
      }
    } catch (e) {
      showToast('❌ تعذر إلغاء الحظر');
    }
  };

  const handleAddBlockUser = async () => {
    if (!newBlockId.trim()) return;
    try {
      const res = await fetch('/api/telegram/contacts/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newBlockId.trim(),
          name: newBlockName.trim() || 'مستخدم',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBlockedList(data.blocked);
        setNewBlockId('');
        setNewBlockName('');
        showToast('🚫 تم حظر المستخدم بنجاح');
      }
    } catch (e) {
      showToast('❌ تعذر الحظر');
    }
  };

  const handleSetAccountTtl = async (months: number) => {
    setAccountTtlMonths(months);
    try {
      await fetch('/api/telegram/account/setAccountTTL', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ months }),
      });
      showToast(`✅ سيتم حذف الحساب تلقائياً بعد ${months} شهر في حال عدم النشاط`);
    } catch (e) {
      showToast('❌ تعذر التحديث');
    }
  };

  // ═════════════════════════════════════════════════════════════════════════
  // RENDER SUB-VIEWS (1:1 Android Telegram Sub-Activities)
  // ═════════════════════════════════════════════════════════════════════════

  // 1. Two-Step Verification View (TwoStepVerificationActivity.java)
  const renderTwoStepView = () => (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center gap-3 pb-3 border-b border-zinc-800">
        <button
          onClick={() => setCurrentView('main')}
          className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <div>
          <h3 className="font-bold text-sm text-white">التحقق بخطوتين (Two-Step Verification)</h3>
          <p className="text-[11px] text-zinc-400">حماية إضافية لحسابك بكلمة مرور عند تسجيل الدخول</p>
        </div>
      </div>

      <div className="p-4 bg-zinc-950/60 rounded-2xl border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-200">الحالة الحالية:</span>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-bold font-mono ${
              twoStepData.has_password
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}
          >
            {twoStepData.has_password ? 'مفعل (Active)' : 'معطل (Disabled)'}
          </span>
        </div>

        {twoStepData.hint && (
          <div className="text-[11px] text-zinc-400">
            <span className="text-zinc-500">تلميح كلمة المرور: </span>
            <span className="text-sky-300 font-semibold">{twoStepData.hint}</span>
          </div>
        )}

        {twoStepData.email && (
          <div className="text-[11px] text-zinc-400">
            <span className="text-zinc-500">بريد الاسترداد: </span>
            <span className="text-amber-300 font-mono">{twoStepData.email}</span>
          </div>
        )}
      </div>

      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold text-sky-400">
          {twoStepData.has_password ? 'تغيير كلمة المرور أو تحديثها:' : 'تعيين كلمة مرور جديدة:'}
        </h4>

        <div>
          <label className="block text-[11px] text-zinc-400 mb-1">كلمة المرور الجديدة</label>
          <input
            type="password"
            placeholder="أدخل كلمة مرور قوية"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-sky-500 font-mono"
          />
        </div>

        <div>
          <label className="block text-[11px] text-zinc-400 mb-1">تأكيد كلمة المرور</label>
          <input
            type="password"
            placeholder="أعد إدخال كلمة المرور"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-sky-500 font-mono"
          />
        </div>

        <div>
          <label className="block text-[11px] text-zinc-400 mb-1">تلميح كلمة المرور (اختياري)</label>
          <input
            type="text"
            placeholder="مثال: اسم حيواني المفضل"
            value={newHint}
            onChange={(e) => setNewHint(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div>
          <label className="block text-[11px] text-zinc-400 mb-1">بريد الاسترداد الإلكتروني (Recovery Email)</label>
          <input
            type="email"
            placeholder="example@domain.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-sky-500 font-mono"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={() => handleSaveTwoStep(false)}
            disabled={loading || !newPassword}
            className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-400 text-zinc-950 font-bold rounded-xl text-xs transition-colors shadow disabled:opacity-50"
          >
            حفظ وتفعيل كلمة المرور
          </button>
          {twoStepData.has_password && (
            <button
              onClick={() => handleSaveTwoStep(true)}
              className="px-3 py-2.5 bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-zinc-950 font-bold rounded-xl text-xs transition-colors"
            >
              تعطيل
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // 2. Auto-Delete Messages Timer View (AutoDeleteTimerActivity.java)
  const renderAutoDeleteView = () => (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center gap-3 pb-3 border-b border-zinc-800">
        <button
          onClick={() => setCurrentView('main')}
          className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <div>
          <h3 className="font-bold text-sm text-white">الحذف التلقائي للرسائل (Auto-Delete Timer)</h3>
          <p className="text-[11px] text-zinc-400">حذف الرسائل في المحادثات الجديدة تلقائياً بعد فترة محددة</p>
        </div>
      </div>

      <div className="space-y-2">
        {[
          { label: 'معطل (Off)', value: 0, desc: 'لن يتم حذف الرسائل تلقائياً في المحادثات الجديدة.' },
          { label: 'بعد يوم واحد (1 Day)', value: 86400, desc: 'تحذف الرسائل بعد 24 ساعة من إرسالها.' },
          { label: 'بعد أسبوع واحد (1 Week)', value: 604800, desc: 'تحذف الرسائل بعد 7 أيام من إرسالها.' },
          { label: 'بعد شهر واحد (1 Month)', value: 2592000, desc: 'تحذف الرسائل بعد 30 يوماً من إرسالها.' },
        ].map((opt) => {
          const isSelected = autoDeletePeriod === opt.value;
          return (
            <div
              key={opt.value}
              onClick={() => handleSaveAutoDelete(opt.value)}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start justify-between ${
                isSelected
                  ? 'bg-sky-500/10 border-sky-500/50 text-white'
                  : 'bg-zinc-950/40 border-zinc-800/80 text-zinc-300 hover:bg-zinc-900'
              }`}
            >
              <div>
                <div className="font-bold text-xs flex items-center gap-2">
                  <span>{opt.label}</span>
                </div>
                <div className="text-[11px] text-zinc-500 mt-0.5">{opt.desc}</div>
              </div>
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 ${
                  isSelected ? 'border-sky-400 bg-sky-500 text-zinc-950' : 'border-zinc-700'
                }`}
              >
                {isSelected && <Check className="w-2.5 h-2.5" />}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-2xl text-[11px] text-zinc-400 leading-relaxed">
        <p>
          💡 عند تفعيل هذا الخيار، سيتم تطبيق المؤقت التلقائي على جميع المحادثات الفردية والسرية الجديدة تلقائياً
          دون التأثير على المحادثات الحالية.
        </p>
      </div>
    </div>
  );

  // 3. Passcode Lock View (PasscodeActivity.java)
  const renderPasscodeView = () => (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center gap-3 pb-3 border-b border-zinc-800">
        <button
          onClick={() => setCurrentView('main')}
          className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <div>
          <h3 className="font-bold text-sm text-white">رمز القفل (Passcode Lock)</h3>
          <p className="text-[11px] text-zinc-400">قفل التطبيق برمز PIN أو كلمة مرور عند المغادرة</p>
        </div>
      </div>

      <div className="p-4 bg-zinc-950/60 rounded-2xl border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-200">حالة رمز القفل:</span>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-bold font-mono ${
              passcodeData.enabled
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            {passcodeData.enabled ? 'مفعل (Active)' : 'معطل (Disabled)'}
          </span>
        </div>

        <div>
          <label className="block text-[11px] text-zinc-400 mb-1.5">نوع القفل:</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setPasscodeData((prev) => ({ ...prev, type: 'pin' }))}
              className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                passcodeData.type === 'pin'
                  ? 'bg-sky-500/20 border-sky-500 text-sky-400'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400'
              }`}
            >
              رمز PIN (4 أرقام)
            </button>
            <button
              onClick={() => setPasscodeData((prev) => ({ ...prev, type: 'password' }))}
              className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                passcodeData.type === 'password'
                  ? 'bg-sky-500/20 border-sky-500 text-sky-400'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400'
              }`}
            >
              كلمة مرور أبجدية
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[11px] text-zinc-400 mb-1">
            {passcodeData.type === 'pin' ? 'أدخل 4 أرقام لرمز PIN' : 'أدخل كلمة المرور'}
          </label>
          <input
            type={passcodeData.type === 'pin' ? 'number' : 'password'}
            maxLength={passcodeData.type === 'pin' ? 4 : 32}
            placeholder={passcodeData.type === 'pin' ? '••••' : 'كلمة المرور'}
            value={passcodeInput}
            onChange={(e) => setPasscodeInput(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-center text-sm font-mono text-white tracking-widest focus:outline-none focus:border-sky-500"
          />
        </div>

        <div>
          <label className="block text-[11px] text-zinc-400 mb-1">تأكيد الرمز</label>
          <input
            type={passcodeData.type === 'pin' ? 'number' : 'password'}
            maxLength={passcodeData.type === 'pin' ? 4 : 32}
            placeholder={passcodeData.type === 'pin' ? '••••' : 'تأكيد كلمة المرور'}
            value={passcodeConfirm}
            onChange={(e) => setPasscodeConfirm(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-center text-sm font-mono text-white tracking-widest focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80">
          <span className="text-xs text-zinc-300 font-semibold flex items-center gap-1.5">
            <Fingerprint className="w-4 h-4 text-sky-400" />
            <span>فتح القفل بالبصمة (Biometrics)</span>
          </span>
          <input
            type="checkbox"
            checked={passcodeData.unlock_with_biometrics}
            onChange={(e) => setPasscodeData((prev) => ({ ...prev, unlock_with_biometrics: e.target.checked }))}
            className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => handleSavePasscode(false)}
          disabled={!passcodeInput || passcodeInput !== passcodeConfirm}
          className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-400 text-zinc-950 font-bold rounded-xl text-xs transition-colors shadow disabled:opacity-50"
        >
          تفعيل وحفظ رمز القفل
        </button>
        {passcodeData.enabled && (
          <button
            onClick={() => handleSavePasscode(true)}
            className="px-3 py-2.5 bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-zinc-950 font-bold rounded-xl text-xs transition-colors"
          >
            تعطيل القفل
          </button>
        )}
      </div>
    </div>
  );

  // 4. Login Email View (LoginEmailActivity.java)
  const renderLoginEmailView = () => (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center gap-3 pb-3 border-b border-zinc-800">
        <button
          onClick={() => setCurrentView('main')}
          className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <div>
          <h3 className="font-bold text-sm text-white">بريد تسجيل الدخول (Login Email)</h3>
          <p className="text-[11px] text-zinc-400">البريد الإلكتروني المعتمد لاستلام رموز التحقق والتحذيرات</p>
        </div>
      </div>

      <div className="p-4 bg-zinc-950/60 rounded-2xl border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-300">البريد المرتبط حالياً:</span>
          <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-xl border border-sky-500/20">
            {loginEmail}
          </span>
        </div>

        <p className="text-[11px] text-zinc-400 leading-relaxed">
          يُستخدم هذا البريد لتسجيل الدخول السريع واستعادة الحساب عند نسيان كلمة مرور التحقق بخطوتين.
        </p>

        <div className="pt-2">
          <label className="block text-[11px] text-zinc-400 mb-1">تغيير بريد تسجيل الدخول</label>
          <input
            type="email"
            placeholder="new_email@gmail.com"
            value={rawLoginEmail}
            onChange={(e) => setRawLoginEmail(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-sky-500 font-mono"
          />
        </div>

        <button
          onClick={() => {
            if (!rawLoginEmail.includes('@')) {
              alert('يرجى إدخال عنوان بريد إلكتروني صالح');
              return;
            }
            const parts = rawLoginEmail.split('@');
            const masked = parts[0][0] + '***@' + (parts[1] || 'gmail.com');
            setLoginEmail(masked);
            showToast('✅ تم إرسال رمز التحقق إلى بريدك الإلكتروني');
            setRawLoginEmail('');
          }}
          className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-zinc-950 font-bold rounded-xl text-xs transition-colors shadow"
        >
          إرسال رمز التأكيد للبريد الجديد
        </button>
      </div>
    </div>
  );

  // 5. Blocked Users View (BlockedUsersActivity.java)
  const renderBlockedUsersView = () => (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center gap-3 pb-3 border-b border-zinc-800">
        <button
          onClick={() => setCurrentView('main')}
          className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <div>
          <h3 className="font-bold text-sm text-white">المستخدمون المحظورون ({blockedList.length})</h3>
          <p className="text-[11px] text-zinc-400">لن يتمكن المحظورون من مراسلتك أو رؤية صورتك وآخر ظهور</p>
        </div>
      </div>

      {/* Add to block input */}
      <div className="p-3 bg-zinc-950/60 rounded-2xl border border-zinc-800 space-y-2">
        <div className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
          <UserX className="w-4 h-4" />
          <span>حظر مستخدم جديد:</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="معرف المستخدم (ID أو @username)"
            value={newBlockId}
            onChange={(e) => setNewBlockId(e.target.value)}
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-rose-500"
          />
          <button
            onClick={handleAddBlockUser}
            className="px-3 py-2 bg-rose-500 hover:bg-rose-400 text-zinc-950 font-bold rounded-xl text-xs transition-colors shadow flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>حظر</span>
          </button>
        </div>
      </div>

      {/* Blocked List */}
      <div className="space-y-2 max-h-[40vh] overflow-y-auto custom-scrollbar">
        {blockedList.length === 0 ? (
          <div className="text-center py-6 text-zinc-500 text-xs">لا يوجد مستخدمون محظورون حالياً.</div>
        ) : (
          blockedList.map((u) => (
            <div
              key={u.id}
              className="p-3 bg-zinc-950/40 rounded-2xl border border-zinc-800/80 flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 font-bold text-xs flex items-center justify-center border border-rose-500/30">
                  {u.name.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-xs text-zinc-200">{u.name}</div>
                  <div className="text-[10px] text-zinc-500 font-mono">{u.username || `ID: ${u.id}`}</div>
                </div>
              </div>
              <button
                onClick={() => handleUnblockUser(u.id)}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-rose-500 hover:text-zinc-950 text-rose-400 font-bold rounded-xl text-[11px] transition-colors"
              >
                إلغاء الحظر
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // 6. Privacy Rule Detail View (PrivacyControlActivity.java)
  const renderPrivacyRuleDetailView = () => {
    const meta = privacyRulesMetadata[activeRuleKey] || {
      title: 'إعداد الخصوصية',
      desc: 'التحكم في خيارات الخصوصية',
      icon: Shield,
    };
    const currentRule = privacyRules[activeRuleKey] || 'everybody';
    const IconComponent = meta.icon;

    return (
      <div className="space-y-4 animate-fadeIn">
        <div className="flex items-center gap-3 pb-3 border-b border-zinc-800">
          <button
            onClick={() => setCurrentView('main')}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-sky-500/10 rounded-lg text-sky-400">
              <IconComponent className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">{meta.title}</h3>
              <p className="text-[11px] text-zinc-400">من يمكنه رؤية ذلك؟</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {[
            { key: 'everybody', label: 'الجميع (Everybody)', desc: 'متاح للجميع دون أي استثناء.' },
            { key: 'contacts', label: 'جهات اتصالي (My Contacts)', desc: 'المستخدمون المحفوظون في قائمة جهاتك فقط.' },
            { key: 'nobody', label: 'لا أحد (Nobody)', desc: 'إخفاء تام عن الجميع.' },
          ].map((opt) => {
            const isSelected = currentRule === opt.key;
            return (
              <div
                key={opt.key}
                onClick={() => handleUpdatePrivacyRule(activeRuleKey, opt.key as any)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start justify-between ${
                  isSelected
                    ? 'bg-sky-500/10 border-sky-500/50 text-white'
                    : 'bg-zinc-950/40 border-zinc-800/80 text-zinc-300 hover:bg-zinc-900'
                }`}
              >
                <div>
                  <div className="font-bold text-xs">{opt.label}</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">{opt.desc}</div>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 ${
                    isSelected ? 'border-sky-400 bg-sky-500 text-zinc-950' : 'border-zinc-700'
                  }`}
                >
                  {isSelected && <Check className="w-2.5 h-2.5" />}
                </div>
              </div>
            );
          })}
        </div>

        {meta.warn && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-[11px] text-amber-300/90 leading-relaxed flex items-start gap-2">
            <HelpCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <p>{meta.warn}</p>
          </div>
        )}

        <div className="pt-2 border-t border-zinc-800 space-y-2">
          <h4 className="font-bold text-xs text-zinc-200">الاستثناءات (Exceptions)</h4>
          <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/80 text-[11px] text-zinc-400 flex items-center justify-between">
            <span>السماح دائماً لـ:</span>
            <span className="font-bold text-sky-400">إضافة مستخدمين</span>
          </div>
          <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/80 text-[11px] text-zinc-400 flex items-center justify-between">
            <span>عدم السماح أبداً لـ:</span>
            <span className="font-bold text-rose-400">إضافة مستخدمين</span>
          </div>
        </div>
      </div>
    );
  };

  // ═════════════════════════════════════════════════════════════════════════
  // MAIN VIEW: PrivacySettingsActivity.java (1:1 Android Client Layout)
  // ═════════════════════════════════════════════════════════════════════════
  const renderMainView = () => (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs rounded-xl text-center font-bold animate-fadeIn">
          {toastMsg}
        </div>
      )}

      {/* ── SECTION 1: الأمان (Security) ── */}
      <div className="space-y-1.5">
        <div className="px-1 text-[11px] font-bold text-sky-400 uppercase tracking-wider">الأمان (Security)</div>

        <div className="bg-zinc-950/60 border border-zinc-800 rounded-2xl overflow-hidden divide-y divide-zinc-800/60">
          {/* 1. التحقق بخطوتين (Two-Step Verification) */}
          <button
            onClick={() => setCurrentView('two_step')}
            className="w-full p-3.5 text-right flex items-center justify-between hover:bg-zinc-900/80 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 group-hover:scale-105 transition-transform">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-zinc-100 group-hover:text-sky-400 transition-colors">
                  التحقق بخطوتين (Two-Step Verification)
                </div>
                <div className="text-[10px] text-zinc-400">كلمة مرور إضافية عند تسجيل الدخول</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span
                className={`font-bold ${
                  twoStepData.has_password ? 'text-emerald-400' : 'text-zinc-500'
                }`}
              >
                {twoStepData.has_password ? 'مفعل' : 'معطلة'}
              </span>
              <ChevronLeft className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
            </div>
          </button>

          {/* 2. الحذف التلقائي للرسائل (Auto-Delete Messages) */}
          <button
            onClick={() => setCurrentView('auto_delete')}
            className="w-full p-3.5 text-right flex items-center justify-between hover:bg-zinc-900/80 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-105 transition-transform">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-zinc-100 group-hover:text-amber-400 transition-colors">
                  الحذف التلقائي للرسائل (Auto-Delete)
                </div>
                <div className="text-[10px] text-zinc-400">مؤقت الحذف للمحادثات الجديدة</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-bold text-zinc-400">{getAutoDeleteDisplay(autoDeletePeriod)}</span>
              <ChevronLeft className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
            </div>
          </button>

          {/* 3. رمز القفل (Passcode Lock) */}
          <button
            onClick={() => setCurrentView('passcode')}
            className="w-full p-3.5 text-right flex items-center justify-between hover:bg-zinc-900/80 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-105 transition-transform">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-zinc-100 group-hover:text-purple-400 transition-colors">
                  رمز القفل (Passcode Lock)
                </div>
                <div className="text-[10px] text-zinc-400">قفل التطبيق برمز PIN أو البصمة</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className={`font-bold ${passcodeData.enabled ? 'text-purple-400' : 'text-zinc-500'}`}>
                {passcodeData.enabled ? 'مفعل' : 'معطل'}
              </span>
              <ChevronLeft className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
            </div>
          </button>

          {/* 4. بريد تسجيل الدخول (Login Email) */}
          <button
            onClick={() => setCurrentView('login_email')}
            className="w-full p-3.5 text-right flex items-center justify-between hover:bg-zinc-900/80 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-105 transition-transform">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-zinc-100 group-hover:text-blue-400 transition-colors">
                  بريد تسجيل الدخول (Login Email)
                </div>
                <div className="text-[10px] text-zinc-400">تلقي رموز تسجيل الدخول السحابي</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-mono text-zinc-400">{loginEmail}</span>
              <ChevronLeft className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
            </div>
          </button>

          {/* 5. المستخدمون المحظورون (Blocked Users) */}
          <button
            onClick={() => setCurrentView('blocked_users')}
            className="w-full p-3.5 text-right flex items-center justify-between hover:bg-zinc-900/80 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 group-hover:scale-105 transition-transform">
                <UserX className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-zinc-100 group-hover:text-rose-400 transition-colors">
                  المستخدمون المحظورون (Blocked Users)
                </div>
                <div className="text-[10px] text-zinc-400">إدارة قائمة الحظر ومنع الإزعاج</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-bold text-zinc-400 font-mono">{blockedList.length}</span>
              <ChevronLeft className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
            </div>
          </button>

          {/* 6. الجلسات والأجهزة (Active Sessions) */}
          <button
            onClick={() => {
              if (onOpenActiveSessions) {
                onClose();
                onOpenActiveSessions();
              }
            }}
            className="w-full p-3.5 text-right flex items-center justify-between hover:bg-zinc-900/80 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-105 transition-transform">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-zinc-100 group-hover:text-emerald-400 transition-colors">
                  الأجهزة والجلسات النشطة (Devices)
                </div>
                <div className="text-[10px] text-zinc-400">إدارة الهواتف والحواسيب المتصلة</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-bold text-emerald-400 font-mono">{sessionsCount} أجهزة</span>
              <ChevronLeft className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
            </div>
          </button>
        </div>
      </div>

      {/* ── SECTION 2: الخصوصية (Privacy) ── */}
      <div className="space-y-1.5 pt-2">
        <div className="px-1 text-[11px] font-bold text-sky-400 uppercase tracking-wider">الخصوصية (Privacy)</div>

        <div className="bg-zinc-950/60 border border-zinc-800 rounded-2xl overflow-hidden divide-y divide-zinc-800/60">
          {Object.keys(privacyRulesMetadata).map((key) => {
            const meta = privacyRulesMetadata[key];
            const currentVal = privacyRules[key] || 'everybody';
            const IconComp = meta.icon;

            return (
              <button
                key={key}
                onClick={() => {
                  setActiveRuleKey(key);
                  setCurrentView('privacy_rule');
                }}
                className="w-full p-3.5 text-right flex items-center justify-between hover:bg-zinc-900/80 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-zinc-800/60 text-zinc-300 group-hover:text-sky-400 group-hover:scale-105 transition-all">
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-zinc-100 group-hover:text-sky-400 transition-colors">
                      {meta.title}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <span
                    className={`font-semibold ${
                      currentVal === 'nobody'
                        ? 'text-rose-400'
                        : currentVal === 'contacts'
                        ? 'text-sky-400'
                        : 'text-zinc-400'
                    }`}
                  >
                    {getRuleDisplay(currentVal)}
                  </span>
                  <ChevronLeft className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── SECTION 3: حذف الحساب التلقائي (Account Self-Destruct) ── */}
      <div className="space-y-1.5 pt-2">
        <div className="px-1 text-[11px] font-bold text-rose-400 uppercase tracking-wider">
          حذف حسابي تلقائياً (Delete My Account)
        </div>

        <div className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-xs text-zinc-100">إذا غبت لمدة (If Away For)</div>
              <div className="text-[10px] text-zinc-400">حذف الحساب والرسائل السحابية إذا لم تسجل دخولك</div>
            </div>
            <select
              value={accountTtlMonths}
              onChange={(e) => handleSetAccountTtl(parseInt(e.target.value, 10))}
              className="bg-zinc-900 border border-zinc-700 text-xs font-bold text-zinc-100 rounded-xl p-2 focus:outline-none focus:border-rose-500"
            >
              <option value="1">شهر واحد</option>
              <option value="3">3 أشهر</option>
              <option value="6">6 أشهر (افتراضي)</option>
              <option value="12">سنة واحدة</option>
            </select>
          </div>
        </div>

        <div className="px-1 text-[10px] text-zinc-500 leading-relaxed">
          إذا لم تسجل دخولك لمرة واحدة على الأقل خلال هذه الفترة، فسيتم حذف حسابك تلقائياً مع جميع المحادثات والوسائط السحابية.
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none dir-rtl animate-fadeIn">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-zinc-100">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-sky-950 via-zinc-900 to-zinc-900 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>الخصوصية والأمان (Privacy and Security)</span>
                <span className="bg-sky-500/20 text-sky-300 text-[10px] px-2 py-0.5 rounded-full font-mono border border-sky-500/30">
                  Telegram 12.x
                </span>
              </h3>
              <p className="text-xs text-sky-200/80 mt-0.5">
                التحقق بخطوتين، رمز القفل، الجلسات، وقواعد الخصوصية السحابية
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto custom-scrollbar flex-1 text-xs">
          {currentView === 'main' && renderMainView()}
          {currentView === 'two_step' && renderTwoStepView()}
          {currentView === 'auto_delete' && renderAutoDeleteView()}
          {currentView === 'passcode' && renderPasscodeView()}
          {currentView === 'login_email' && renderLoginEmailView()}
          {currentView === 'blocked_users' && renderBlockedUsersView()}
          {currentView === 'privacy_rule' && renderPrivacyRuleDetailView()}
        </div>
      </div>
    </div>
  );
};
