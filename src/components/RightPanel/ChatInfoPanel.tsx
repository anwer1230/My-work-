import React, { useState } from 'react';
import {
  X,
  ArrowLeft,
  Bell,
  Image as ImageIcon,
  FileText,
  Music,
  Mic,
  Link,
  Users,
  Shield,
  BadgeCheck,
  Bookmark,
  Share2,
  Download,
  Phone,
  Video,
} from 'lucide-react';
import { useTelegram } from '../../context/TelegramContext';

export const ChatInfoPanel: React.FC = () => {
  const {
    activeChat,
    isRightPanelOpen,
    setIsRightPanelOpen,
    messages,
    activeChatId,
    setViewerMedia,
    setActiveModal,
    startCall,
    openUserProfile,
    currentUser,
    settings,
  } = useTelegram();

  const [activeMediaTab, setActiveMediaTab] = useState<'media' | 'files' | 'voice' | 'links' | 'members'>('media');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  if (!isRightPanelOpen || !activeChat) return null;

  const currentMessages = (activeChatId && messages[activeChatId]) || [];
  const photoMessages = currentMessages.filter((m) => m.media?.type === 'photo' && m.media?.url);
  const fileMessages = currentMessages.filter((m) => m.media?.type === 'document');
  const voiceMessages = currentMessages.filter((m) => m.media?.type === 'voice');

  const isSavedMessages = activeChat.type === 'saved';
  const isArabic = settings.language === 'ar';

  return (
    <div
      id="tg-right-info-panel"
      className="fixed inset-0 z-40 md:relative md:w-80 md:inset-auto md:z-10 border-l flex flex-col h-full select-none shrink-0 animate-in slide-in-from-right duration-200 rtl:slide-in-from-left rtl:border-l-0 rtl:border-r"
      style={{
        backgroundColor: 'var(--tg-theme-surface)',
        borderColor: 'var(--tg-theme-border)',
      }}
    >
      {/* Header */}
      <div className="h-14 px-3 border-b flex items-center justify-between border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <button
            id="tg-close-right-panel-mobile"
            onClick={() => setIsRightPanelOpen(false)}
            className="md:hidden p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-white/10"
            title={isArabic ? 'رجوع' : 'Back'}
          >
            <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
          </button>
          <span className="font-bold text-sm">
            {isArabic ? 'معلومات المحادثة' : 'User Info'}
          </span>
        </div>
        <button
          onClick={() => setIsRightPanelOpen(false)}
          className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Profile Overview */}
      <div className="p-4 flex flex-col items-center text-center border-b border-white/10">
        <div className="w-20 h-20 rounded-full overflow-hidden mb-3 bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold shadow-md">
          {isSavedMessages ? (
            <Bookmark className="w-10 h-10 fill-white text-white" />
          ) : activeChat.avatar ? (
            <img
              src={activeChat.avatar}
              alt={activeChat.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span>{activeChat.title.charAt(0)}</span>
          )}
        </div>

        <div className="flex items-center gap-1 font-bold text-base">
          <span>{activeChat.title}</span>
          {activeChat.isVerified && (
            <BadgeCheck className="w-4 h-4 text-[#2481cc] fill-[#2481cc]/20" />
          )}
        </div>

        {activeChat.username && (
          <div className="text-xs text-sky-400 font-mono mt-0.5">
            @{activeChat.username}
          </div>
        )}

        {activeChat.description && (
          <p className="text-xs text-gray-400 mt-2 px-2 leading-relaxed">
            {activeChat.description}
          </p>
        )}

        {/* Action Buttons: Voice / Video Call & Export Chat */}
        <div className="flex items-center gap-2 mt-4 w-full justify-center">
          <button
            onClick={() => startCall(false)}
            className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isArabic ? 'صوتي' : 'Call'}</span>
          </button>
          <button
            onClick={() => startCall(true)}
            className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Video className="w-3.5 h-3.5 text-sky-400" />
            <span>{isArabic ? 'فيديو' : 'Video'}</span>
          </button>
          <button
            onClick={() => setActiveModal('export-chat')}
            className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            title={isArabic ? 'تصدير السجل' : 'Export Chat'}
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
          </button>
        </div>
      </div>

      {/* Notifications Switch */}
      <div className="p-3.5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-semibold">
            {isArabic ? 'الإشعارات' : 'Notifications'}
          </span>
        </div>
        <button
          onClick={() => setNotificationsEnabled(!notificationsEnabled)}
          className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
            notificationsEnabled ? 'bg-[#2481cc]' : 'bg-gray-600'
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white transition-transform ${
              notificationsEnabled ? 'translate-x-4 rtl:-translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Shared Media Tabs */}
      <div className="flex border-b border-white/10 text-xs font-semibold overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveMediaTab('media')}
          className={`flex-1 py-2 px-2 text-center whitespace-nowrap transition-colors ${
            activeMediaTab === 'media'
              ? 'border-b-2 border-[#2481cc] text-[#2481cc]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          {isArabic ? `الوسائط (${photoMessages.length})` : `Media (${photoMessages.length})`}
        </button>
        <button
          onClick={() => setActiveMediaTab('files')}
          className={`flex-1 py-2 px-2 text-center whitespace-nowrap transition-colors ${
            activeMediaTab === 'files'
              ? 'border-b-2 border-[#2481cc] text-[#2481cc]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          {isArabic ? `الملفات (${fileMessages.length})` : `Files (${fileMessages.length})`}
        </button>
        <button
          onClick={() => setActiveMediaTab('voice')}
          className={`flex-1 py-2 px-2 text-center whitespace-nowrap transition-colors ${
            activeMediaTab === 'voice'
              ? 'border-b-2 border-[#2481cc] text-[#2481cc]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          {isArabic ? `صوتيات (${voiceMessages.length})` : `Audio (${voiceMessages.length})`}
        </button>
        {activeChat.type === 'group' && (
          <button
            onClick={() => setActiveMediaTab('members')}
            className={`flex-1 py-2 px-2 text-center whitespace-nowrap transition-colors ${
              activeMediaTab === 'members'
                ? 'border-b-2 border-[#2481cc] text-[#2481cc]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {isArabic ? 'الأعضاء' : 'Members'}
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeMediaTab === 'media' && (
          <div>
            {photoMessages.length === 0 ? (
              <div className="text-center text-xs text-gray-500 py-6">
                {isArabic ? 'لا توجد وسائط مشاركة' : 'No shared media'}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {photoMessages.map((m) => (
                  <div
                    key={m.id}
                    onClick={() =>
                      setViewerMedia({
                        url: m.media!.url!,
                        title: m.text || activeChat.title,
                        sender: m.senderName,
                        timestamp: m.timestamp,
                      })
                    }
                    className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-85 transition-opacity"
                  >
                    <img
                      src={m.media!.url}
                      alt="shared media"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeMediaTab === 'files' && (
          <div className="space-y-2">
            {fileMessages.length === 0 ? (
              <div className="text-center text-xs text-gray-500 py-6">
                {isArabic ? 'لا توجد ملفات مشاركة' : 'No shared files'}
              </div>
            ) : (
              fileMessages.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-black/15 hover:bg-black/25 text-xs"
                >
                  <FileText className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">
                      {m.media?.fileName || m.text || 'Document.pdf'}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {m.media?.fileSize || '1.2 MB'} • {m.timestamp}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeMediaTab === 'voice' && (
          <div className="space-y-2">
            {voiceMessages.length === 0 ? (
              <div className="text-center text-xs text-gray-500 py-6">
                {isArabic ? 'لا توجد رسائل صوتية' : 'No voice notes'}
              </div>
            ) : (
              voiceMessages.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-black/15 text-xs"
                >
                  <Mic className="w-5 h-5 text-sky-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">
                      {isArabic ? 'رسالة صوتية' : 'Voice message'} ({m.media?.duration || 20}s)
                    </div>
                    <div className="text-[10px] text-gray-400">{m.timestamp}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeMediaTab === 'members' && activeChat.type === 'group' && (
          <div className="space-y-2">
            <div
              onClick={() => {
                openUserProfile({
                  id: currentUser.id,
                  name: currentUser.name,
                  username: currentUser.username,
                  avatar: currentUser.avatar,
                  bio: currentUser.bio,
                  phone: currentUser.phone,
                  isVerified: currentUser.isVerified,
                  isPremium: currentUser.isPremium,
                  isOnline: true,
                  sourceChatId: activeChat.id,
                  sourceChatTitle: activeChat.title,
                });
              }}
              className="flex items-center gap-2.5 p-1.5 text-xs rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#2481cc] text-white flex items-center justify-center font-bold">
                {currentUser.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="font-bold flex items-center gap-1">
                  <span>{currentUser.name} (You)</span>
                  <span className="text-[10px] text-amber-400 bg-amber-400/15 px-1 rounded">Owner</span>
                </div>
                <div className="text-[10px] text-emerald-400 font-medium">online</div>
              </div>
            </div>

            <div
              onClick={() => {
                openUserProfile({
                  id: 'user_nikolay_durov',
                  name: 'Nikolay Durov',
                  username: 'durov_math',
                  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                  bio: 'Co-founder & Lead Architect 💻',
                  isVerified: true,
                  isOnline: false,
                  lastSeen: 'last seen recently',
                  sourceChatId: activeChat.id,
                  sourceChatTitle: activeChat.title,
                });
              }}
              className="flex items-center gap-2.5 p-1.5 text-xs rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                N
              </div>
              <div className="flex-1">
                <div className="font-bold flex items-center gap-1">
                  <span>Nikolay Durov</span>
                  <span className="text-[10px] text-sky-400 bg-sky-400/15 px-1 rounded">Admin</span>
                </div>
                <div className="text-[10px] text-gray-400">last seen recently</div>
              </div>
            </div>

            <div
              onClick={() => {
                openUserProfile({
                  id: 'user_elena_rostova',
                  name: 'Elena Rostova',
                  username: 'elena_designer',
                  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
                  bio: 'Product Designer & UI Specialist 🎨',
                  isOnline: false,
                  lastSeen: 'last seen 2 hours ago',
                  sourceChatId: activeChat.id,
                  sourceChatTitle: activeChat.title,
                });
              }}
              className="flex items-center gap-2.5 p-1.5 text-xs rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                E
              </div>
              <div className="flex-1">
                <div className="font-bold">Elena Rostova</div>
                <div className="text-[10px] text-gray-400">last seen 2 hours ago</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
