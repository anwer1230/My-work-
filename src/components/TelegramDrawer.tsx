import React, { useState } from 'react';
import {
  X,
  User,
  Bookmark,
  Image as ImageIcon,
  Phone,
  Shield,
  Settings,
  Archive,
  RefreshCw,
  Sparkles,
  ChevronLeft,
  ChevronDown,
  Contact,
  PhoneCall,
  UserCheck,
  Plus,
  Moon,
  Sun,
  LogOut,
  Zap,
  Rocket,
  Clock,
  Search,
  Users,
  Repeat,
  RotateCcw,
  Brain,
  GraduationCap,
  FileEdit,
  Download,
  Star,
} from 'lucide-react';
import { UserProfile } from '../types';
import { AutomationTab } from './AutomationAIModal';

interface TelegramDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onOpenProfile: () => void;
  onOpenSavedMessages?: () => void;
  onOpenContacts?: () => void;
  onOpenVoiceCall?: () => void;
  onOpenSettings?: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  onOpenInstallPwa?: () => void;
  onOpenAutomationAI?: (tab?: AutomationTab) => void;
  onOpenAcademic?: () => void;
  onOpenLinkFinder?: () => void;
  onOpenMediaGallery?: () => void;
  onOpenPrivacy?: () => void;
  onOpenActiveSessions?: () => void;
  onOpenSync?: () => void;
  onOpenMTProtoSync?: () => void;
  onOpenArchiveSync?: () => void;
  onOpenMonitor?: () => void;
  onNewFolder?: () => void;
  onOpenArchive?: () => void;
  onCheckUpdate?: () => void;
  onOpenLogin: () => void;
}

export const TelegramDrawer: React.FC<TelegramDrawerProps> = ({
  isOpen,
  onClose,
  profile,
  onOpenProfile,
  onOpenSavedMessages,
  onOpenContacts,
  onOpenVoiceCall,
  onOpenSettings,
  theme = 'dark',
  onToggleTheme,
  onOpenInstallPwa,
  onOpenAutomationAI,
  onOpenAcademic,
  onOpenLinkFinder,
  onOpenMediaGallery,
  onOpenPrivacy,
  onOpenActiveSessions,
  onOpenSync,
  onOpenMTProtoSync,
  onOpenArchiveSync,
  onOpenMonitor,
  onNewFolder,
  onOpenArchive,
  onCheckUpdate,
  onOpenLogin,
}) => {
  const [isFeaturedOpen, setIsFeaturedOpen] = useState(false);
  const isDarkMode = theme === 'dark';

  if (!isOpen) return null;

  const handleAction = (action?: () => void) => {
    onClose();
    if (action) action();
  };

  const handleOpenTab = (tab: AutomationTab) => {
    onClose();
    if (onOpenAutomationAI) onOpenAutomationAI(tab);
  };

  const handleLogout = () => {
    if (window.confirm('هل أنت متأكد من تسجيل الخروج من حساب تليجرام؟')) {
      handleAction(onOpenLogin);
    }
  };

  return (
    <div className="fixed inset-0 z-[2500] flex select-none font-['Cairo',sans-serif]">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Panel (Telegram Official Web Standard) */}
      <div className="relative w-80 max-w-[85vw] bg-zinc-950 border-l border-zinc-800/90 h-full flex flex-col shadow-2xl z-10 overflow-y-auto dir-rtl text-zinc-100">
        
        {/* 1. رأس القائمة (Profile Header) */}
        <div className="p-5 bg-gradient-to-b from-zinc-900 to-zinc-950 border-b border-zinc-800/80 relative">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
            title="إغلاق القائمة"
          >
            <X className="w-5 h-5" />
          </button>

          <div
            onClick={() => handleAction(onOpenProfile)}
            className="cursor-pointer group flex flex-col space-y-3"
            title="استعراض وإدارة الملف الشخصي"
          >
            {/* Avatar */}
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold border-2 border-sky-400/40 shadow-lg group-hover:scale-105 transition-transform">
              {profile.photo ? (
                <img src={profile.photo} alt={profile.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span>{(profile.first_name || profile.name || 'T')[0]}</span>
              )}
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-zinc-950 rounded-full" />
            </div>

            <div>
              <div className="font-bold text-base text-zinc-100 flex items-center gap-1.5 group-hover:text-sky-400 transition-colors">
                <span>{profile.first_name} {profile.last_name || profile.name}</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xs text-sky-400 font-mono mt-0.5">
                @{profile.username || 'user_telegram'}
              </div>
              <div className="text-[11px] text-zinc-400 mt-0.5 font-mono dir-ltr text-right">
                {profile.phone || '+964 770 123 4567'}
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Menu List */}
        <div className="p-2.5 space-y-1 flex-1 text-xs font-semibold overflow-y-auto overscroll-contain touch-pan-y custom-scrollbar">

          {/* 2. الرسائل المحفوظة (Saved Messages - Self Chat) */}
          <button
            onClick={() => handleAction(onOpenSavedMessages)}
            className="w-full p-2.5 rounded-xl hover:bg-zinc-900 text-zinc-200 hover:text-sky-400 flex items-center justify-between transition-colors group"
            title="مساحة التخزين السحابية لتدوين الملاحظات والوسائط"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 group-hover:scale-110 transition-transform">
                <Bookmark className="w-4 h-4" />
              </div>
              <span>الرسائل المحفوظة (Saved Messages)</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-normal">سحابي</span>
          </button>

          {/* 3. جهات الاتصال (Contacts) */}
          <button
            onClick={() => handleAction(onOpenContacts)}
            className="w-full p-2.5 rounded-xl hover:bg-zinc-900 text-zinc-200 hover:text-sky-400 flex items-center justify-between transition-colors group"
            title="عرض قائمة جهات الاتصال وحالة الظهور وإضافة أصدقاء"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                <Contact className="w-4 h-4" />
              </div>
              <span>جهات الاتصال (Contacts)</span>
            </div>
            <span className="text-[10px] bg-sky-500/20 text-sky-400 px-1.5 py-0.5 rounded font-mono">
              MTProto
            </span>
          </button>

          {/* 4. المكالمات (Calls) */}
          <button
            onClick={() => handleAction(onOpenVoiceCall)}
            className="w-full p-2.5 rounded-xl hover:bg-zinc-900 text-zinc-200 hover:text-emerald-400 flex items-center justify-between transition-colors group"
            title="سجل المكالمات الواردة والصادرة والمفقودة والاتصال المشفر"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                <PhoneCall className="w-4 h-4" />
              </div>
              <span>المكالمات (Calls)</span>
            </div>
            <span className="text-[10px] text-emerald-400/80 font-mono">E2EE</span>
          </button>

          {/* 5. الإعدادات (Settings) */}
          <button
            onClick={() => handleAction(onOpenSettings)}
            className="w-full p-2.5 rounded-xl hover:bg-zinc-900 text-zinc-200 hover:text-amber-400 flex items-center justify-between transition-colors group"
            title="مركز التحكم الكامل بالحساب والمظهر والأمان والأجهزة"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                <Settings className="w-4 h-4" />
              </div>
              <span>الإعدادات (Settings)</span>
            </div>
            <span className="text-[10px] text-zinc-500">التحكم</span>
          </button>

          {/* 5.2. الخصوصية والأمان (Privacy and Security) */}
          <button
            onClick={() => handleAction(onOpenPrivacy)}
            className="w-full p-2.5 rounded-xl hover:bg-zinc-900 text-zinc-200 hover:text-sky-400 flex items-center justify-between transition-colors group"
            title="التحقق بخطوتين، رمز القفل، الجلسات النشطة، وقواعد الخصوصية"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 group-hover:scale-110 transition-transform">
                <Shield className="w-4 h-4" />
              </div>
              <span>الخصوصية والأمان (Privacy & Security)</span>
            </div>
            <span className="text-[10px] bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded font-mono">
              MTProto
            </span>
          </button>

          {/* 6. زر الوضع الليلي (Night Mode Switcher) */}
          <button
            onClick={() => {
              if (onToggleTheme) onToggleTheme();
            }}
            className="w-full p-2.5 rounded-xl hover:bg-zinc-900 text-zinc-200 hover:text-indigo-400 flex items-center justify-between transition-colors group"
            title="التبديل الفوري بين الوضع الليلي والوضع النهاري"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
                {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </div>
              <span>{isDarkMode ? 'الوضع الليلي (مفعل)' : 'الوضع النهاري (مفعل)'}</span>
            </div>
            <span className="text-[10px] text-indigo-400 font-mono">
              {isDarkMode ? 'Dark' : 'Light'}
            </span>
          </button>

          <hr className="border-zinc-800/80 my-2" />

          {/* Collapsible Automation & Enjaz Suite (⭐ الوظائف المميزة والأتمتة) */}
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 overflow-hidden transition-all my-1">
            <button
              onClick={() => setIsFeaturedOpen(!isFeaturedOpen)}
              className="w-full p-2.5 flex items-center justify-between text-amber-400 hover:bg-amber-500/10 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400/30" />
                <span className="font-bold text-zinc-100">الوظائف المميزة والأتمتة</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] bg-amber-500 text-zinc-950 px-2 py-0.5 rounded-full font-bold">
                  11 أداة
                </span>
                {isFeaturedOpen ? (
                  <ChevronDown className="w-4 h-4 text-zinc-400" />
                ) : (
                  <ChevronLeft className="w-4 h-4 text-zinc-400" />
                )}
              </div>
            </button>

            {isFeaturedOpen && (
              <div className="p-1 space-y-0.5 bg-zinc-950/60 border-t border-amber-500/10 text-zinc-200">
                <button
                  onClick={() => handleOpenTab('send_monitor')}
                  className="w-full p-2 rounded-xl hover:bg-zinc-900 hover:text-amber-300 flex items-center gap-2.5 transition-colors"
                >
                  <Rocket className="w-4 h-4 text-amber-400" />
                  <span>1. المراقبة والإرسال (Send & Mon)</span>
                </button>

                <button
                  onClick={() => handleOpenTab('batches')}
                  className="w-full p-2 rounded-xl hover:bg-zinc-900 hover:text-sky-300 flex items-center gap-2.5 transition-colors"
                >
                  <Clock className="w-4 h-4 text-sky-400" />
                  <span>2. رسائلي الدفعات (My Messages)</span>
                </button>

                <button
                  onClick={() => handleOpenTab('link_scraper')}
                  className="w-full p-2 rounded-xl hover:bg-zinc-900 hover:text-cyan-300 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Search className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-cyan-300">3. فحص وفرز الروابط (Link Search)</span>
                  </div>
                  <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded font-black">جديد 🔍</span>
                </button>

                <button
                  onClick={() => handleOpenTab('autojoin')}
                  className="w-full p-2 rounded-xl hover:bg-zinc-900 hover:text-emerald-300 flex items-center gap-2.5 transition-colors"
                >
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>4. الانضمام التلقائي (Auto Join)</span>
                </button>

                <button
                  onClick={() => handleOpenTab('links')}
                  className="w-full p-2 rounded-xl hover:bg-zinc-900 hover:text-purple-300 flex items-center gap-2.5 transition-colors"
                >
                  <Bookmark className="w-4 h-4 text-purple-400" />
                  <span>5. روابطي المحفوظة (Saved Links)</span>
                </button>

                <button
                  onClick={() => handleOpenTab('autoreply')}
                  className="w-full p-2 rounded-xl hover:bg-zinc-900 hover:text-rose-300 flex items-center gap-2.5 transition-colors"
                >
                  <Repeat className="w-4 h-4 text-rose-400" />
                  <span>6. الرد التلقائي (Auto Replies)</span>
                </button>

                <button
                  onClick={() => handleOpenTab('rotating')}
                  className="w-full p-2 rounded-xl hover:bg-zinc-900 hover:text-indigo-300 flex items-center gap-2.5 transition-colors"
                >
                  <RotateCcw className="w-4 h-4 text-indigo-400" />
                  <span>7. النشر المتسلسل (Rotating Send)</span>
                </button>

                <button
                  onClick={() => handleOpenTab('learning')}
                  className="w-full p-2 rounded-xl hover:bg-zinc-900 hover:text-amber-200 flex items-center gap-2.5 transition-colors"
                >
                  <Brain className="w-4 h-4 text-amber-300" />
                  <span>8. نظام التعلم الذكي (Smart Learning)</span>
                </button>

                <button
                  onClick={() => handleOpenTab('academic')}
                  className="w-full p-2 rounded-xl hover:bg-zinc-900 hover:text-teal-300 flex items-center gap-2.5 transition-colors"
                >
                  <GraduationCap className="w-4 h-4 text-teal-400" />
                  <span>9. التحليل الأكاديمي (Academic Tools)</span>
                </button>

                <button
                  onClick={() => handleOpenTab('formatter')}
                  className="w-full p-2 rounded-xl hover:bg-zinc-900 hover:text-pink-300 flex items-center gap-2.5 transition-colors"
                >
                  <FileEdit className="w-4 h-4 text-pink-400" />
                  <span>10. منسق المستندات (Doc Formatter)</span>
                </button>

                <button
                  onClick={() => handleOpenTab('accounts')}
                  className="w-full p-2 rounded-xl hover:bg-zinc-900 hover:text-emerald-300 flex items-center gap-2.5 transition-colors"
                >
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>11. إدارة الحسابات (Accounts Manager)</span>
                </button>
              </div>
            )}
          </div>

          <hr className="border-zinc-800/80 my-2" />

          {/* MTProto Sync & Quick Install */}
          <div className="space-y-1">
            <button
              onClick={() => handleAction(onOpenMTProtoSync)}
              className="w-full p-2 rounded-xl hover:bg-zinc-900 text-sky-400 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-sky-400" />
                <span>مزامنة MTProto السحابية (PTS/SEQ)</span>
              </div>
              <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full font-bold">
                سحابي
              </span>
            </button>

            {onOpenInstallPwa && (
              <button
                onClick={() => handleAction(onOpenInstallPwa)}
                className="w-full p-2.5 rounded-xl bg-gradient-to-r from-sky-500/20 to-blue-600/20 text-sky-300 border border-sky-500/30 flex items-center justify-between transition-colors font-bold"
              >
                <div className="flex items-center gap-2.5">
                  <Download className="w-4 h-4 text-sky-400" />
                  <span>تثبيت التطبيق (PWA / Web App)</span>
                </div>
                <span className="text-[10px] bg-sky-500 text-zinc-950 px-2 py-0.5 rounded-full font-bold">
                  تثبيت
                </span>
              </button>
            )}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full p-2 rounded-xl hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 flex items-center gap-2.5 transition-colors font-bold mt-2"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>تسجيل الخروج من الحساب</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 bg-zinc-950/90 border-t border-zinc-800 text-[10px] text-zinc-500 font-mono text-center">
          مركز سرعة إنجاز - تليجرام ويب الرسمية v2.5
        </div>
      </div>
    </div>
  );
};
