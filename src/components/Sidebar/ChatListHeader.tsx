import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  X,
  ArrowLeft,
  Edit3,
  Download,
  Radio,
  Link2,
  MoreVertical,
  Zap,
} from 'lucide-react';
import { useTelegram } from '../../context/TelegramContext';

export const ChatListHeader: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    setIsDrawerOpen,
    setActiveModal,
    resolveTelegramLink,
    settings,
    autoJoinLinksEnabled,
    capturedLinks,
    isSyncing,
  } = useTelegram();

  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isArabic = settings.language === 'ar';
  const isLinkSearch =
    searchQuery.startsWith('@') ||
    searchQuery.startsWith('t.me') ||
    searchQuery.startsWith('https://t.me') ||
    searchQuery.startsWith('+');

  useEffect(() => {
    if (isSearchActive && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchActive]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      e.preventDefault();
      resolveTelegramLink(searchQuery.trim());
    }
  };

  const handleCloseSearch = () => {
    setSearchQuery('');
    setIsSearchActive(false);
  };

  return (
    <div
      id="tg-chat-list-header"
      className="flex flex-col border-b select-none shrink-0"
      style={{
        backgroundColor: 'var(--tg-theme-surface)',
        borderColor: 'var(--tg-theme-border)',
      }}
    >
      {/* Official Telegram Android Action Bar (56px standard) */}
      <div className="h-14 px-2 flex items-center justify-between gap-1 relative">
        {isSearchActive || searchQuery ? (
          /* Search Mode (ActionBarSearchItem) */
          <div className="flex items-center w-full gap-2 px-1 animate-in fade-in duration-150">
            <button
              id="tg-search-back-btn"
              onClick={handleCloseSearch}
              className="p-2 rounded-full hover:bg-white/10 text-gray-300 transition-colors shrink-0"
              title={isArabic ? 'إلغاء البحث' : 'Back'}
            >
              <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
            </button>

            <div className="relative flex-1 flex items-center">
              <input
                ref={searchInputRef}
                id="tg-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder={
                  isArabic
                    ? 'بحث، أو رابط t.me/+ أو @معرف...'
                    : 'Search, or paste t.me/link or @handle...'
                }
                className="w-full py-1.5 px-3 text-sm rounded-full bg-black/20 focus:bg-black/30 focus:outline-none border border-transparent focus:border-[#2481cc]/50 text-white placeholder-gray-400 transition-all"
              />
              {searchQuery && (
                <button
                  id="tg-clear-search-button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 p-1 text-gray-400 hover:text-gray-200 rtl:right-auto rtl:left-2.5"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Normal Action Bar Mode */
          <>
            {/* Left: Hamburger Menu + Brand Title */}
            <div className="flex items-center gap-1.5 min-w-0">
              <button
                id="tg-menu-button"
                onClick={() => setIsDrawerOpen(true)}
                className="p-2.5 rounded-full hover:bg-white/10 active:bg-white/15 text-gray-300 transition-colors shrink-0"
                title={isArabic ? 'القائمة الرئيسية' : 'Main Menu'}
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex flex-col min-w-0">
                <span className="font-bold text-base text-white tracking-tight leading-none">
                  Telegram
                </span>
                <span className="text-[10px] text-sky-400 font-mono mt-0.5 leading-none">
                  {isSyncing ? (isArabic ? 'جاري التحديث...' : 'Updating...') : 'v12.9.2'}
                </span>
              </div>
            </div>

            {/* Right: Actions (Search, Radar, Install, New Chat) */}
            <div className="flex items-center gap-0.5 text-gray-300 shrink-0">
              {/* Search Button */}
              <button
                id="tg-open-search-btn"
                onClick={() => setIsSearchActive(true)}
                className="p-2 rounded-full hover:bg-white/10 active:bg-white/15 text-gray-300 transition-colors"
                title={isArabic ? 'بحث' : 'Search'}
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Radar Live Monitor Button */}
              <button
                id="tg-link-radar-header-btn"
                onClick={() => setActiveModal('link-monitor')}
                className={`p-2 rounded-full transition-colors relative ${
                  autoJoinLinksEnabled
                    ? 'text-emerald-400 bg-emerald-500/15 hover:bg-emerald-500/25'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
                title={isArabic ? 'رادار الروابط والانضمام الفوري' : 'Auto-Join & Links Radar'}
              >
                <Radio className={`w-5 h-5 ${autoJoinLinksEnabled ? 'animate-pulse' : ''}`} />
                {capturedLinks.length > 0 && (
                  <span className="absolute top-1 right-1 rtl:right-auto rtl:left-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                )}
              </button>

              {/* Direct APK Install Button */}
              <button
                id="tg-apk-installer-btn"
                onClick={() => setActiveModal('apk-installer')}
                className="p-2 rounded-full text-emerald-400 hover:bg-emerald-500/15 transition-colors hidden sm:flex"
                title={isArabic ? 'تثبيت التطبيق على الجوال' : 'Install App on Phone'}
              >
                <Download className="w-5 h-5" />
              </button>

              {/* New Chat Button */}
              <button
                id="tg-new-chat-button"
                onClick={() => setActiveModal('new-chat')}
                className="p-2 rounded-full hover:bg-white/10 active:bg-white/15 text-[#5288c1] hover:text-[#6499d3] transition-colors"
                title={isArabic ? 'محادثة أو قناة جديدة' : 'New Chat or Channel'}
              >
                <Edit3 className="w-5 h-5" />
              </button>

              {/* More Menu (Dropdown) */}
              <div className="relative">
                <button
                  id="tg-more-header-btn"
                  onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                  className="p-2 rounded-full hover:bg-white/10 text-gray-300 transition-colors"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>

                {isMoreMenuOpen && (
                  <div
                    className="absolute right-0 rtl:right-auto rtl:left-0 top-12 w-52 bg-[#17212b] border border-[#2b394a] rounded-2xl shadow-2xl py-1.5 z-50 text-xs font-semibold text-gray-200 animate-in fade-in zoom-in-95"
                    onClick={() => setIsMoreMenuOpen(false)}
                  >
                    <button
                      onClick={() => setActiveModal('apk-installer')}
                      className="w-full px-3.5 py-2.5 hover:bg-white/5 flex items-center gap-2.5 text-left rtl:text-right text-gray-200 hover:text-white"
                    >
                      <Download className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{isArabic ? 'تثبيت تطبيق الجوال (APK)' : 'Install Mobile App (APK)'}</span>
                    </button>

                    <button
                      onClick={() => setActiveModal('sender')}
                      className="w-full px-3.5 py-2.5 hover:bg-white/5 flex items-center gap-2.5 text-left rtl:text-right text-gray-200 hover:text-white"
                    >
                      <Zap className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>{isArabic ? 'الإرسال والمراقبة الذكية' : 'Smart Sender & Monitor'}</span>
                    </button>

                    <button
                      onClick={() => setActiveModal('link-monitor')}
                      className="w-full px-3.5 py-2.5 hover:bg-white/5 flex items-center gap-2.5 text-left rtl:text-right text-gray-200 hover:text-white"
                    >
                      <Radio className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{isArabic ? 'رادار الروابط والانضمام' : 'Links Radar & Joiner'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Global Link / Invite Quick Join Action Bar */}
      {isLinkSearch && (
        <div
          onClick={() => resolveTelegramLink(searchQuery.trim())}
          className="mx-2 mb-2 flex items-center justify-between p-2.5 rounded-xl bg-[#2481cc]/20 border border-[#2481cc]/40 text-xs text-sky-300 cursor-pointer hover:bg-[#2481cc]/30 transition-colors animate-in fade-in"
        >
          <div className="flex items-center gap-2 truncate">
            <Link2 className="w-4 h-4 text-[#2481cc] shrink-0" />
            <span className="truncate">
              {isArabic ? 'فتح وانضمام عبر رابط:' : 'Open & Join link:'}{' '}
              <strong className="text-white">{searchQuery}</strong>
            </span>
          </div>
          <span className="font-bold px-2 py-0.5 rounded-md bg-[#2481cc] text-white text-[11px] shrink-0">
            {isArabic ? 'انضمام' : 'Join'}
          </span>
        </div>
      )}
    </div>
  );
};
