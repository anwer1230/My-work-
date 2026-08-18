import React from 'react';
import { 
  Bookmark, 
  UserCheck, 
  Phone, 
  Settings, 
  Moon, 
  Sun, 
  Sparkles, 
  HelpCircle,
  ShieldCheck,
  LogOut,
  X,
  PlusCircle,
  FolderOpen,
  Download,
  QrCode,
  Users,
  Languages,
  Smartphone
} from 'lucide-react';
import { User, AppSettings } from '../../types/telegram';
import { Language, translations } from '../../utils/i18n';

interface MainMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onOpenSettings: () => void;
  onOpenSavedMessages: () => void;
  onOpenNewGroup: () => void;
  onOpenNewChannel: () => void;
  onOpenContacts: () => void;
  onOpenCalls: () => void;
  onOpenQRCode: () => void;
  onOpenInstallModal: () => void;
  onToggleLanguage: () => void;
  lang: Language;
}

export const MainMenuDrawer: React.FC<MainMenuDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  settings,
  onUpdateSettings,
  onOpenSettings,
  onOpenSavedMessages,
  onOpenNewGroup,
  onOpenNewChannel,
  onOpenContacts,
  onOpenCalls,
  onOpenQRCode,
  onOpenInstallModal,
  onToggleLanguage,
  lang,
}) => {
  if (!isOpen) return null;

  const isDarkMode = settings.theme !== 'light';
  const t = translations[lang];

  const toggleNightMode = () => {
    onUpdateSettings({
      theme: isDarkMode ? 'light' : 'dark',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Menu */}
      <div 
        id="telegram-main-menu"
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
        className="relative w-80 max-w-[85vw] h-full bg-neutral-900 border-neutral-800 shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200"
      >
        {/* User profile card */}
        <div className="p-5 bg-gradient-to-b from-neutral-800/90 to-neutral-900 border-b border-neutral-800">
          <div className="flex items-start justify-between mb-3">
            <div className="relative">
              {currentUser.avatar ? (
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-sky-500/50 shadow-md"
                />
              ) : (
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${currentUser.avatarColor || 'from-sky-500 to-blue-600'} text-white font-semibold text-xl flex items-center justify-center shadow-md`}>
                  {currentUser.name.charAt(0)}
                </div>
              )}
              {currentUser.isPremium && (
                <span className="absolute -bottom-1 -right-1 bg-amber-500 text-black p-0.5 rounded-full ring-2 ring-neutral-900" title="Telegram Premium">
                  <Sparkles className="w-3.5 h-3.5" />
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  onOpenQRCode();
                  onClose();
                }}
                className="p-2 text-neutral-400 hover:text-sky-400 hover:bg-neutral-800/80 rounded-xl transition-colors"
                title="My QR Code"
              >
                <QrCode className="w-5 h-5" />
              </button>
              <button 
                onClick={onClose}
                className="p-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <h3 className="font-semibold text-neutral-100 text-base flex items-center gap-1.5">
            {currentUser.name}
            {currentUser.isPremium && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-neutral-950 rounded-md">
                PREMIUM
              </span>
            )}
          </h3>
          <p className="text-xs text-neutral-400">@{currentUser.username}</p>
          <p className="text-xs text-neutral-500 mt-0.5">{currentUser.phone}</p>
        </div>

        {/* Highlighted Install Telegram APK Action */}
        <div className="p-3 bg-neutral-950/60 border-b border-neutral-800">
          <button
            onClick={() => {
              onOpenInstallModal();
              onClose();
            }}
            className="w-full p-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 active:scale-[0.98] text-white rounded-2xl shadow-lg shadow-sky-500/20 flex items-center justify-between transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-white/20 rounded-xl">
                <Smartphone className="w-4 h-4 text-white" />
              </div>
              <div className="text-right">
                <div className="text-xs font-bold">{t.installApp}</div>
                <div className="text-[10px] text-sky-100">{t.installAppDesc}</div>
              </div>
            </div>
            <Download className="w-4 h-4 text-white shrink-0 ml-1" />
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-2 divide-y divide-neutral-800/50 custom-scrollbar">
          <div className="py-1">
            <button
              onClick={() => {
                onOpenContacts();
                onClose();
              }}
              className="w-full px-5 py-3 flex items-center gap-4 text-sm font-medium text-neutral-200 hover:bg-neutral-800/70 transition-colors text-left cursor-pointer"
            >
              <Users className="w-5 h-5 text-sky-400 shrink-0" />
              <span>{t.contacts}</span>
            </button>

            <button
              onClick={() => {
                onOpenCalls();
                onClose();
              }}
              className="w-full px-5 py-3 flex items-center gap-4 text-sm font-medium text-neutral-200 hover:bg-neutral-800/70 transition-colors text-left cursor-pointer"
            >
              <Phone className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{t.calls}</span>
            </button>

            <button
              onClick={() => {
                onOpenSavedMessages();
                onClose();
              }}
              className="w-full px-5 py-3 flex items-center gap-4 text-sm font-medium text-neutral-200 hover:bg-neutral-800/70 transition-colors text-left cursor-pointer"
            >
              <Bookmark className="w-5 h-5 text-sky-400 shrink-0" />
              <span>{t.savedMessages}</span>
            </button>

            <button
              onClick={() => {
                onOpenNewGroup();
                onClose();
              }}
              className="w-full px-5 py-3 flex items-center gap-4 text-sm font-medium text-neutral-200 hover:bg-neutral-800/70 transition-colors text-left cursor-pointer"
            >
              <PlusCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{t.newGroup}</span>
            </button>

            <button
              onClick={() => {
                onOpenNewChannel();
                onClose();
              }}
              className="w-full px-5 py-3 flex items-center gap-4 text-sm font-medium text-neutral-200 hover:bg-neutral-800/70 transition-colors text-left cursor-pointer"
            >
              <PlusCircle className="w-5 h-5 text-purple-400 shrink-0" />
              <span>{t.newChannel}</span>
            </button>
          </div>

          <div className="py-1">
            <button
              onClick={() => {
                onOpenSettings();
                onClose();
              }}
              className="w-full px-5 py-3 flex items-center gap-4 text-sm font-medium text-neutral-200 hover:bg-neutral-800/70 transition-colors text-left cursor-pointer"
            >
              <Settings className="w-5 h-5 text-neutral-400 shrink-0" />
              <span>{t.settings}</span>
            </button>

            {/* Language switch */}
            <button
              onClick={onToggleLanguage}
              className="w-full px-5 py-3 flex items-center justify-between text-sm font-medium text-neutral-200 hover:bg-neutral-800/70 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <Languages className="w-5 h-5 text-indigo-400 shrink-0" />
                <span>{t.language}</span>
              </div>
              <span className="text-xs bg-neutral-800 text-sky-400 px-2 py-0.5 rounded-md font-semibold">
                {lang === 'ar' ? 'العربية' : 'English'}
              </span>
            </button>

            {/* Night mode toggle */}
            <div className="w-full px-5 py-3 flex items-center justify-between text-sm font-medium text-neutral-200 hover:bg-neutral-800/70 transition-colors">
              <div className="flex items-center gap-4">
                {isDarkMode ? (
                  <Moon className="w-5 h-5 text-amber-400 shrink-0" />
                ) : (
                  <Sun className="w-5 h-5 text-amber-500 shrink-0" />
                )}
                <span>{t.nightMode}</span>
              </div>
              <button
                onClick={toggleNightMode}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  isDarkMode ? 'bg-sky-500' : 'bg-neutral-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    isDarkMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="py-3 px-5 text-xs text-neutral-500 space-y-1">
            <div className="flex items-center justify-between">
              <span>Telegram Mobile WebAPK v10.8</span>
              <span className="text-emerald-400 font-medium">Ready</span>
            </div>
            <p className="text-[11px] leading-tight">End-to-End Encryption • Multi-Device Sync</p>
          </div>
        </div>
      </div>
    </div>
  );
};
