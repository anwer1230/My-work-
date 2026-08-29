import React, { useState } from 'react';
import { X, Users, Megaphone, UserPlus, Check } from 'lucide-react';
import { useTelegram } from '../../context/TelegramContext';

export const NewChatModal: React.FC = () => {
  const { activeModal, setActiveModal, createNewChat, settings } = useTelegram();

  const [chatType, setChatType] = useState<'group' | 'channel' | 'private'>('group');
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [description, setDescription] = useState('');

  if (activeModal !== 'new-chat') return null;

  const isArabic = settings.language === 'ar';

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    createNewChat(chatType, title, username, description);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div
        onClick={() => setActiveModal('none')}
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Modal Dialog */}
      <div
        className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border z-10 animate-in zoom-in-95 duration-150 flex flex-col"
        style={{
          backgroundColor: 'var(--tg-theme-surface)',
          borderColor: 'var(--tg-theme-border)',
          color: 'var(--tg-theme-bubble-in-text)',
        }}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#2481cc] to-[#1c6fad] text-white flex items-center justify-between">
          <div className="font-bold text-base">
            {isArabic ? 'إنشاء محادثة أو قناة جديدة' : 'New Chat or Channel'}
          </div>
          <button
            onClick={() => setActiveModal('none')}
            className="p-1 rounded-full hover:bg-white/20 text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleCreate} className="p-5 space-y-4 text-xs sm:text-sm">
          {/* Chat Type Selection */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setChatType('group')}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                chatType === 'group'
                  ? 'border-[#2481cc] bg-[#2481cc]/20 text-[#2481cc] font-bold'
                  : 'border-white/10 hover:bg-white/5 text-gray-400'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>{isArabic ? 'مجموعة' : 'Group'}</span>
            </button>

            <button
              type="button"
              onClick={() => setChatType('channel')}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                chatType === 'channel'
                  ? 'border-[#2481cc] bg-[#2481cc]/20 text-[#2481cc] font-bold'
                  : 'border-white/10 hover:bg-white/5 text-gray-400'
              }`}
            >
              <Megaphone className="w-5 h-5" />
              <span>{isArabic ? 'قناة' : 'Channel'}</span>
            </button>

            <button
              type="button"
              onClick={() => setChatType('private')}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                chatType === 'private'
                  ? 'border-[#2481cc] bg-[#2481cc]/20 text-[#2481cc] font-bold'
                  : 'border-white/10 hover:bg-white/5 text-gray-400'
              }`}
            >
              <UserPlus className="w-5 h-5" />
              <span>{isArabic ? 'محادثة' : 'Direct'}</span>
            </button>
          </div>

          {/* Title input */}
          <div className="space-y-1">
            <label className="font-semibold text-xs">
              {chatType === 'channel'
                ? isArabic ? 'اسم القناة' : 'Channel Name'
                : chatType === 'group'
                ? isArabic ? 'اسم المجموعة' : 'Group Name'
                : isArabic ? 'اسم جهة الاتصال' : 'Contact Name'}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isArabic ? 'مثال: عشاق التقنية' : 'e.g. Tech Pioneers'}
              className="w-full px-3 py-2 rounded-xl bg-black/20 border border-white/10 text-sm focus:border-[#2481cc] focus:outline-none"
            />
          </div>

          {/* Username / Link input */}
          <div className="space-y-1">
            <label className="font-semibold text-xs">
              {isArabic ? 'المعرف العام (Username / Link)' : 'Public Username / Link'}
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-gray-500 font-mono text-xs rtl:left-auto rtl:right-3">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="custom_handle"
                className="w-full py-2 pl-7 pr-3 rounded-xl bg-black/20 border border-white/10 font-mono text-xs focus:border-[#2481cc] focus:outline-none rtl:pl-3 rtl:pr-7"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="font-semibold text-xs">
              {isArabic ? 'الوصف (اختياري)' : 'Description (Optional)'}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isArabic ? 'أدخل وصفاً للمحادثة...' : 'Brief info...'}
              className="w-full px-3 py-2 rounded-xl bg-black/20 border border-white/10 text-xs focus:border-[#2481cc] focus:outline-none resize-none"
            />
          </div>

          {/* Footer */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setActiveModal('none')}
              className="px-4 py-2 rounded-xl hover:bg-white/10 text-gray-300 text-xs font-semibold"
            >
              {isArabic ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-5 py-2 rounded-xl bg-[#2481cc] hover:bg-[#1c6fad] disabled:opacity-50 text-white text-xs font-bold shadow-md"
            >
              {isArabic ? 'إنشاء' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
