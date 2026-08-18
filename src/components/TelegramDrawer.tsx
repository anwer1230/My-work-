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
  Gift,
  Briefcase,
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
  onOpenStars?: () => void;
  onOpenBusiness?: () => void;
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
  onOpenStars,
  onOpenBusiness,
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

      {/* Drawer Panel (Telegram Android Official Standard) */}
      <div className="relative w-80 max-w-[85vw] bg-[#17212b] border-l border-white/[0.08] h-full flex flex-col shadow-2xl z-10 overflow-hidden dir-rtl text-zinc-100 touch-pan-y">
        
        {/* 1. رأس القائمة (Telegram Android Profile Header) */}
        <div className="p-4 bg-[#232e3c] border-b border-white/[0.06] relative shrink-0">
          <div className="flex items-center justify-between mb-3">
            {/* Avatar */}
            <div
              onClick={() => handleAction(onOpenProfile)}
              className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-[#50a2e9] to-[#2481cc] flex items-center justify-center text-white text-xl font-bold border-2 border-white/20 shadow-md cursor-pointer active:scale-95 transition-transform"
            >
              {profile.photo ? (
                <img src={profile.photo} alt={profile.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span>{(profile.first_name || profile.name || 'T')[0]}</span>
              )}
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#4fae4e] border-2 border-[#232e3c] rounded-full" />
            </div>

            {/* Dark Mode Quick Switcher */}
            <button
              onClick={() => {
                if (onToggleTheme) onToggleTheme();
              }}
              className="p-2 text-zinc-300 hover:text-white active:bg-white/10 rounded-full transition-colors"
              title="تبديل الوضع الليلي / النهاري"
            >
              {isDarkMode ? <Moon className="w-5 h-5 text-[#50a2e9]" /> : <Sun className="w-5 h-5 text-amber-400" />}
            </button>
          </div>

          <div
            onClick={() => handleAction(onOpenProfile)}
            className="cursor-pointer group select-none"
            title="استعراض وإدارة الملف الشخصي"
          >
            <div className="font-bold text-sm text-zinc-100 flex items-center gap-1.5 group-hover:text-[#50a2e9] transition-colors">
              <span>{profile.first_name} {profile.last_name || profile.name}</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xs text-zinc-400 font-mono mt-0.5 dir-ltr text-right">
              {profile.phone || '+967 772 997 043'}
            </div>
            <div className="text-[11px] text-[#50a2e9] font-medium mt-0.5">
              @{profile.username || 'user_telegram'}
            </div>
          </div>
        </div>

        {/* Drawer Menu List - Telegram Android official list items */}
        <div className="p-2 space-y-0.5 flex-1 min-h-0 overflow-y-auto overscroll-contain text-xs font-semibold touch-pan-y">

          {/* 1. حسابي والملف الشخصي */}
          <button
            onClick={() => handleAction(onOpenProfile)}
            className="w-full p-3 rounded-xl hover:bg-[#242f3d] text-zinc-200 hover:text-[#50a2e9] active:bg-[#2b5278]/50 flex items-center justify-between transition-colors group"
          >
            <div className="flex items-center gap-3.5">
              <User className="w-5 h-5 text-zinc-400 group-hover:text-[#50a2e9]" />
              <span className="text-sm">حسابي والملف الشخصي</span>
            </div>
          </button>

          {/* 2. الرسائل المحفوظة (Saved Messages - Self Chat) */}
          <button
            onClick={() => handleAction(onOpenSavedMessages)}
            className="w-full p-3 rounded-xl hover:bg-[#242f3d] text-zinc-200 hover:text-[#50a2e9] active:bg-[#2b5278]/50 flex items-center justify-between transition-colors group"
            title="مساحة التخزين السحابية لتدوين الملاحظات والوسائط"
          >
            <div className="flex items-center gap-3.5">
              <Bookmark className="w-5 h-5 text-zinc-400 group-hover:text-[#50a2e9]" />
              <span className="text-sm">الرسائل المحفوظة</span>
            </div>
            <span className="text-[10px] text-zinc-400">سحابي</span>
          </button>

          {/* 3. جهات الاتصال (Contacts) */}
          <button
            onClick={() => handleAction(onOpenContacts)}
            className="w-full p-3 rounded-xl hover:bg-[#242f3d] text-zinc-200 hover:text-[#50a2e9] active:bg-[#2b5278]/50 flex items-center justify-between transition-colors group"
            title="عرض قائمة جهات الاتصال"
          >
            <div className="flex items-center gap-3.5">
              <Contact className="w-5 h-5 text-zinc-400 group-hover:text-[#50a2e9]" />
              <span className="text-sm">جهات الاتصال</span>
            </div>
            <span className="text-[10px] bg-[#50a2e9]/20 text-[#50a2e9] px-1.5 py-0.5 rounded font-mono">
              MTProto
            </span>
          </button>

          {/* 4. المكالمات (Calls) */}
          <button
            onClick={() => handleAction(onOpenVoiceCall)}
            className="w-full p-3 rounded-xl hover:bg-[#242f3d] text-zinc-200 hover:text-[#50a2e9] active:bg-[#2b5278]/50 flex items-center justify-between transition-colors group"
          >
            <div className="flex items-center gap-3.5">
              <PhoneCall className="w-5 h-5 text-zinc-400 group-hover:text-[#50a2e9]" />
              <span className="text-sm">المكالمات</span>
            </div>
            <span className="text-[10px] text-[#4fae4e] font-mono">E2EE</span>
          </button>

          {/* 5. نجوم تيليجرام (Telegram Stars) */}
          <button
            onClick={() => handleAction(onOpenStars)}
            className="w-full p-3 rounded-xl hover:bg-[#242f3d] text-zinc-200 hover:text-amber-400 active:bg-[#2b5278]/50 flex items-center justify-between transition-colors group"
          >
            <div className="flex items-center gap-3.5">
              <Star className="w-5 h-5 text-amber-400" />
              <span className="text-sm">نجوم تيليجرام (Telegram Stars)</span>
            </div>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
              ⭐ Stars
            </span>
          </button>

          {/* 6. تيليجرام للأعمال (Telegram Business) */}
          <button
            onClick={() => handleAction(onOpenBusiness)}
            className="w-full p-3 rounded-xl hover:bg-[#242f3d] text-zinc-200 hover:text-emerald-400 active:bg-[#2b5278]/50 flex items-center justify-between transition-colors group"
          >
            <div className="flex items-center gap-3.5">
              <Briefcase className="w-5 h-5 text-emerald-400" />
              <span className="text-sm">تيليجرام للأعمال (Business)</span>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
              Pro
            </span>
          </button>

          {/* 7. الإعدادات (Settings) */}
          <button
            onClick={() => handleAction(onOpenSettings)}
            className="w-full p-3 rounded-xl hover:bg-[#242f3d] text-zinc-200 hover:text-[#50a2e9] active:bg-[#2b5278]/50 flex items-center justify-between transition-colors group"
          >
            <div className="flex items-center gap-3.5">
              <Settings className="w-5 h-5 text-zinc-400 group-hover:text-[#50a2e9]" />
              <span className="text-sm">الإعدادات</span>
            </div>
          </button>

          <hr className="border-white/[0.06] my-2" />

          {/* Collapsible Automation & Enjaz Suite (⭐ الوظائف المميزة والأتمتة) */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 overflow-hidden transition-all my-1">
            <button
              onClick={() => setIsFeaturedOpen(!isFeaturedOpen)}
              className="w-full p-3 flex items-center justify-between text-amber-400 hover:bg-amber-500/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400/30" />
                <span className="font-bold text-sm text-zinc-100">الوظائف المميزة والأتمتة</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] bg-amber-500 text-zinc-950 px-2 py-0.5 rounded-full font-bold">
                  10 أدوات
                </span>
                {isFeaturedOpen ? (
                  <ChevronDown className="w-4 h-4 text-zinc-400" />
                ) : (
                  <ChevronLeft className="w-4 h-4 text-zinc-400" />
                )}
              </div>
            </button>

            {isFeaturedOpen && (
              <div className="p-1 space-y-0.5 bg-[#0e1621]/60 border-t border-amber-500/10 text-zinc-200">
                <button
                  onClick={() => handleOpenTab('send_monitor')}
                  className="w-full p-2 rounded-lg hover:bg-[#242f3d] hover:text-amber-300 flex items-center gap-2.5 transition-colors"
                >
                  <Rocket className="w-4 h-4 text-amber-400" />
                  <span>1. المراقبة والإرسال (Send & Mon)</span>
                </button>

                <button
                  onClick={() => handleOpenTab('batches')}
                  className="w-full p-2 rounded-lg hover:bg-[#242f3d] hover:text-sky-300 flex items-center gap-2.5 transition-colors"
                >
                  <Clock className="w-4 h-4 text-sky-400" />
                  <span>2. رسائلي الدفعات (My Messages)</span>
                </button>

                <button
                  onClick={() => handleOpenTab('link_scraper')}
                  className="w-full p-2 rounded-lg hover:bg-[#242f3d] hover:text-cyan-300 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Search className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-cyan-300">3. فحص وفرز الروابط (Link Search)</span>
                  </div>
                  <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded font-black">جديد 🔍</span>
                </button>

                <button
                  onClick={() => handleOpenTab('autojoin')}
                  className="w-full p-2 rounded-lg hover:bg-[#242f3d] hover:text-emerald-300 flex items-center gap-2.5 transition-colors"
                >
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>4. الانضمام التلقائي (Auto Join)</span>
                </button>

                <button
                  onClick={() => handleOpenTab('links')}
                  className="w-full p-2 rounded-lg hover:bg-[#242f3d] hover:text-purple-300 flex items-center gap-2.5 transition-colors"
                >
                  <Bookmark className="w-4 h-4 text-purple-400" />
                  <span>5. روابطي المحفوظة (Saved Links)</span>
                </button>

                <button
                  onClick={() => handleOpenTab('autoreply')}
                  className="w-full p-2 rounded-lg hover:bg-[#242f3d] hover:text-rose-300 flex items-center gap-2.5 transition-colors"
                >
                  <Repeat className="w-4 h-4 text-rose-400" />
                  <span>6. الرد التلقائي (Auto Replies)</span>
                </button>

                <button
                  onClick={() => handleOpenTab('rotating')}
                  className="w-full p-2 rounded-lg hover:bg-[#242f3d] hover:text-indigo-300 flex items-center gap-2.5 transition-colors"
                >
                  <RotateCcw className="w-4 h-4 text-indigo-400" />
                  <span>7. النشر المتسلسل (Rotating Send)</span>
                </button>

                <button
                  onClick={() => handleOpenTab('learning')}
                  className="w-full p-2 rounded-lg hover:bg-[#242f3d] hover:text-amber-200 flex items-center gap-2.5 transition-colors"
                >
                  <Brain className="w-4 h-4 text-amber-300" />
                  <span>8. نظام التعلم الذكي (Smart Learning)</span>
                </button>

                <button
                  onClick={() => handleOpenTab('academic')}
                  className="w-full p-2 rounded-lg hover:bg-[#242f3d] hover:text-teal-300 flex items-center gap-2.5 transition-colors"
                >
                  <GraduationCap className="w-4 h-4 text-teal-400" />
                  <span>9. التحليل الأكاديمي (Academic Tools)</span>
                </button>

                <button
                  onClick={() => handleOpenTab('formatter')}
                  className="w-full p-2 rounded-lg hover:bg-[#242f3d] hover:text-pink-300 flex items-center gap-2.5 transition-colors"
                >
                  <FileEdit className="w-4 h-4 text-pink-400" />
                  <span>10. منسق المستندات (Doc Formatter)</span>
                </button>
              </div>
            )}
          </div>

          <hr className="border-white/[0.06] my-2" />

          {/* MTProto Sync & Quick Install */}
          <div className="space-y-1">
            <button
              onClick={() => handleAction(onOpenMTProtoSync)}
              className="w-full p-2.5 rounded-xl hover:bg-[#242f3d] text-[#50a2e9] flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-3">
                <Zap className="w-4 h-4 text-[#50a2e9]" />
                <span>مزامنة MTProto السحابية</span>
              </div>
              <span className="text-[10px] bg-[#50a2e9]/20 text-[#50a2e9] px-2 py-0.5 rounded-full font-bold">
                سحابي
              </span>
            </button>

            {onOpenInstallPwa && (
              <button
                onClick={() => handleAction(onOpenInstallPwa)}
                className="w-full p-2.5 rounded-xl bg-[#50a2e9]/15 text-[#50a2e9] border border-[#50a2e9]/30 flex items-center justify-between transition-colors font-bold"
              >
                <div className="flex items-center gap-3">
                  <Download className="w-4 h-4 text-[#50a2e9]" />
                  <span>تثبيت التطبيق (PWA)</span>
                </div>
                <span className="text-[10px] bg-[#50a2e9] text-white px-2 py-0.5 rounded-full font-bold">
                  تثبيت
                </span>
              </button>
            )}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full p-2.5 rounded-xl hover:bg-rose-500/15 text-rose-400 flex items-center gap-3 transition-colors font-bold mt-2"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>تسجيل الخروج من الحساب</span>
            </button>
          </div>

        </div>

        {/* Telegram Android Footer */}
        <div className="p-3 bg-[#17212b] border-t border-white/[0.06] text-[11px] text-zinc-400 font-mono text-center">
          Telegram for Android v10.14.2 (Official)
        </div>
      </div>
    </div>
  );
};
