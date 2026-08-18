import React, { useState } from 'react';
import {
  Search,
  Plus,
  RefreshCw,
  User,
  FolderPlus,
  Archive,
  Pin,
  VolumeX,
  Bot,
  Shield,
  MessageSquare,
  Lock,
  Sparkles,
  Menu,
} from 'lucide-react';
import { Chat, ChatFolder, UserProfile, Message, TelegramStory } from '../types';
import { TelegramDrawer } from './TelegramDrawer';
import { AutomationTab } from './AutomationAIModal';
import { PinnedMessagesSidebar } from './PinnedMessagesSidebar';
import { ChatAvatar } from './ChatAvatar';

interface SidebarProps {
  chats: Chat[];
  archivedChats: Chat[];
  folders: ChatFolder[];
  activeFolderId: string;
  selectedChatId: number | null;
  profile: UserProfile;
  stories?: TelegramStory[];
  onOpenStoryViewer?: (index: number) => void;
  onAddStory?: () => void;
  allPinnedMessages?: Array<{ chat_id: number; chat_title: string; chat_avatar?: string; message: Message }>;
  onUnpinMessage?: (chatId: number, messageId: string) => void;
  onSelectChat: (chatId: number) => void;
  onSelectFolder: (folderId: string) => void;
  onOpenArchive: () => void;
  onOpenProfile: () => void;
  onOpenLogin: () => void;
  onCheckUpdate: () => void;
  onNewChat: () => void;
  onNewFolder: () => void;
  onOpenAcademic?: () => void;
  onOpenLinkFinder?: () => void;
  onOpenMediaGallery?: () => void;
  onOpenVoiceCall?: () => void;
  onOpenPrivacy?: () => void;
  onOpenActiveSessions?: () => void;
  onOpenSync?: () => void;
  onOpenMTProtoSync?: () => void;
  onOpenArchiveSync?: () => void;
  onOpenMonitor?: () => void;
  onOpenSettings?: () => void;
  onOpenAutomationAI?: (tab?: AutomationTab) => void;
  onOpenInstallPwa?: () => void;
  isDrawerOpen?: boolean;
  onOpenDrawer?: () => void;
  onCloseDrawer?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  chats,
  archivedChats,
  folders,
  activeFolderId,
  selectedChatId,
  profile,
  stories,
  onOpenStoryViewer,
  onAddStory,
  allPinnedMessages = [],
  onUnpinMessage,
  onSelectChat,
  onSelectFolder,
  onOpenArchive,
  onOpenProfile,
  onOpenLogin,
  onCheckUpdate,
  onNewChat,
  onNewFolder,
  onOpenAcademic,
  onOpenLinkFinder,
  onOpenMediaGallery,
  onOpenVoiceCall,
  onOpenPrivacy,
  onOpenActiveSessions,
  onOpenSync,
  onOpenMTProtoSync,
  onOpenArchiveSync,
  onOpenMonitor,
  onOpenSettings,
  onOpenAutomationAI,
  onOpenInstallPwa,
  isDrawerOpen: isDrawerOpenProp,
  onOpenDrawer,
  onCloseDrawer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [internalDrawerOpen, setInternalDrawerOpen] = useState(false);

  const drawerState = isDrawerOpenProp !== undefined ? isDrawerOpenProp : internalDrawerOpen;

  const handleToggleDrawer = (open: boolean) => {
    if (open) {
      if (onOpenDrawer) onOpenDrawer();
      else setInternalDrawerOpen(true);
    } else {
      if (onCloseDrawer) onCloseDrawer();
      else setInternalDrawerOpen(false);
    }
  };

  // Filter chats by active folder and search query
  const filteredChats = chats.filter((chat) => {
    const matchesSearch =
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (chat.username && chat.username.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeFolderId === 'all') return true;
    if (activeFolderId === 'secret') return chat.type === 'secret';
    if (activeFolderId === 'bots') return chat.type === 'bot';

    return chat.folder_ids?.includes(activeFolderId);
  });

  // Sort: Pinned first
  const sortedChats = [...filteredChats].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return 0;
  });

  return (
    <div className="w-full md:w-80 lg:w-96 bg-[#0e1621] border-l border-[#17212b]/90 flex flex-col h-full select-none text-zinc-100 relative font-['Cairo',sans-serif]">
      {/* Top Header - Telegram Android Official Action Bar */}
      <div className="px-3.5 py-3 bg-[#17212b] border-b border-white/[0.06] flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleToggleDrawer(true)}
            title="القائمة الجانبية (Telegram Menu)"
            className="p-2 text-zinc-300 hover:text-white active:bg-white/10 rounded-full transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            className="flex items-center gap-2.5 cursor-pointer select-none"
            onClick={onOpenProfile}
          >
            <ChatAvatar
              title={`${profile.first_name} ${profile.last_name}`}
              avatar={profile.photo}
              type="private"
              size="sm"
              isOnline={true}
            />
            <div className="min-w-0">
              <div className="font-bold text-sm text-zinc-100 flex items-center gap-1.5 truncate">
                <span>
                  {profile.first_name} {profile.last_name}
                </span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              </div>
              <div className="text-[11px] text-[#50a2e9] font-medium">@{profile.username}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              const el = document.getElementById('tg-sidebar-search-input');
              if (el) el.focus();
            }}
            title="بحث"
            className="p-2 text-zinc-400 hover:text-[#50a2e9] active:bg-white/10 rounded-full transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Telegram Android Search Bar */}
      <div className="px-3 py-2 bg-[#17212b] border-b border-white/[0.04]">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 absolute right-3 text-zinc-400 pointer-events-none" />
          <input
            id="tg-sidebar-search-input"
            type="text"
            placeholder="بحث في المحادثات والقنوات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#242f3d] text-xs text-zinc-100 pr-9 pl-3 py-2 rounded-xl border border-transparent focus:border-[#50a2e9] focus:outline-none transition-all placeholder:text-zinc-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-2.5 p-1 text-zinc-400 hover:text-white"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Folders Tab Strip - Telegram Android Material Tabs */}
      <div className="flex items-center overflow-x-auto no-scrollbar bg-[#17212b] border-b border-white/[0.06] px-2 gap-1 shrink-0">
        {folders.map((folder) => {
          const isActive = activeFolderId === folder.id;
          return (
            <button
              key={folder.id}
              onClick={() => onSelectFolder(folder.id)}
              className={`relative flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'text-[#50a2e9]'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>{folder.icon}</span>
              <span>{folder.title}</span>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#50a2e9] rounded-t-full shadow-sm shadow-[#50a2e9]" />
              )}
            </button>
          );
        })}
        <button
          onClick={onNewFolder}
          title="إضافة مجلد جديد"
          className="p-2 text-zinc-400 hover:text-[#50a2e9] active:bg-white/10 rounded-lg shrink-0 transition-colors mr-auto"
        >
          <FolderPlus className="w-4 h-4" />
        </button>
      </div>

      {/* Telegram Official Stories Horizontal Carousel Bar */}
      {stories && stories.length > 0 && (
        <div className="bg-[#17212b]/80 border-b border-white/[0.04] p-2.5 overflow-x-auto no-scrollbar flex items-center gap-3 shrink-0">
          {/* My Story + Add button */}
          <div
            onClick={onAddStory}
            className="flex flex-col items-center gap-1 cursor-pointer shrink-0 group"
          >
            <div className="relative p-0.5 rounded-full ring-2 ring-[#50a2e9] group-hover:scale-105 transition-transform">
              <ChatAvatar title={profile.first_name} avatar={profile.photo} size="sm" />
              <div className="absolute -bottom-1 -right-1 bg-[#50a2e9] text-white p-0.5 rounded-full border-2 border-[#17212b] shadow">
                <Plus className="w-3 h-3 stroke-[3]" />
              </div>
            </div>
            <span className="text-[10px] text-zinc-300 font-bold truncate max-w-[54px]">قصتي</span>
          </div>

          {/* User Stories */}
          {stories.map((story, sIdx) => (
            <div
              key={story.id}
              onClick={() => onOpenStoryViewer?.(sIdx)}
              className="flex flex-col items-center gap-1 cursor-pointer shrink-0 group"
            >
              <div
                className={`p-0.5 rounded-full ring-2 transition-transform group-hover:scale-105 ${
                  story.is_viewed
                    ? 'ring-zinc-600'
                    : 'ring-[#50a2e9]'
                }`}
              >
                <ChatAvatar title={story.user_name} avatar={story.user_avatar} size="sm" />
              </div>
              <span className="text-[10px] text-zinc-200 font-medium truncate max-w-[58px]">
                {story.user_name.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Archived Chats Banner */}
      {archivedChats.length > 0 && (
        <div
          onClick={onOpenArchive}
          className="mx-2 mt-2 p-2.5 bg-[#17212b] hover:bg-[#242f3d] rounded-xl border border-white/[0.06] flex items-center justify-between cursor-pointer transition-colors group shrink-0"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#50a2e9]/15 text-[#50a2e9] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Archive className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-zinc-100">المحادثات المؤرشفة</div>
              <div className="text-[11px] text-zinc-400">{archivedChats.length} محادثة محفوظة</div>
            </div>
          </div>
          <span className="text-xs text-[#50a2e9] font-medium">فتح 📂</span>
        </div>
      )}

      {/* Dedicated Pinned Messages Component */}
      <PinnedMessagesSidebar
        pinnedMessages={allPinnedMessages}
        onSelectChat={onSelectChat}
        onUnpinMessage={onUnpinMessage}
      />

      {/* Chat List Items - Telegram Android Clean List with Ripple */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/[0.03] p-1 overscroll-contain">
        {sortedChats.length === 0 ? (
          <div className="p-10 text-center text-zinc-400 text-xs flex flex-col items-center gap-2.5">
            <MessageSquare className="w-10 h-10 opacity-30 text-zinc-400" />
            <span>لا توجد محادثات في هذا المجلد</span>
          </div>
        ) : (
          sortedChats.map((chat) => {
            const isSelected = selectedChatId === chat.id;
            return (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`p-3 rounded-xl cursor-pointer transition-all flex items-center gap-3 my-0.5 relative ${
                  isSelected
                    ? 'bg-[#2b5278]/40 border border-[#50a2e9]/30 shadow-sm'
                    : 'hover:bg-[#17212b]/80 border border-transparent active:bg-[#242f3d]'
                }`}
              >
                {/* Chat Avatar */}
                <ChatAvatar
                  title={chat.title}
                  avatar={chat.avatar}
                  type={chat.type}
                  size="lg"
                  isOnline={chat.is_online}
                />

                {/* Chat Title & Last Msg */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-bold text-xs text-zinc-100 truncate flex items-center gap-1">
                      <span>{chat.title}</span>
                      {chat.is_muted && <VolumeX className="w-3 h-3 text-zinc-500 shrink-0" />}
                    </div>
                    {chat.last_message && (
                      <span className="text-[10px] text-zinc-400 shrink-0">
                        {new Date(chat.last_message.date).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-zinc-400 truncate pl-2">
                      {chat.typing_user ? (
                        <span className="text-[#50a2e9] font-medium animate-pulse">
                          ✍️ {chat.typing_user} يكتب الآن...
                        </span>
                      ) : chat.last_message ? (
                        chat.last_message.content.type === 'text' ? (
                          chat.last_message.content.text
                        ) : (
                          `[${chat.last_message.content.type.toUpperCase()}]`
                        )
                      ) : (
                        'لا توجد رسائل بعد'
                      )}
                    </p>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {chat.is_pinned && <Pin className="w-3.5 h-3.5 text-zinc-400 rotate-45" />}
                      {chat.unread_count > 0 && (
                        <span className="bg-[#50a2e9] text-white font-bold text-[10px] px-2 py-0.5 rounded-full min-w-[20px] text-center shadow-sm">
                          {chat.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Action Button (FAB) - Telegram Android Official Style */}
      <button
        onClick={onNewChat}
        title="محادثة جديدة"
        className="absolute bottom-5 left-5 w-14 h-14 rounded-full bg-[#50a2e9] text-white shadow-xl shadow-sky-950/60 hover:bg-[#64b5f6] active:scale-95 transition-all flex items-center justify-center z-20 cursor-pointer border border-white/20"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Telegram Official Web Sliding Drawer Menu */}
      <TelegramDrawer
        isOpen={drawerState}
        onClose={() => handleToggleDrawer(false)}
        profile={profile}
        onOpenProfile={onOpenProfile}
        onOpenInstallPwa={onOpenInstallPwa}
        onOpenAutomationAI={onOpenAutomationAI}
        onOpenAcademic={onOpenAcademic}
        onOpenLinkFinder={onOpenLinkFinder}
        onOpenMediaGallery={onOpenMediaGallery}
        onOpenVoiceCall={onOpenVoiceCall}
        onOpenPrivacy={onOpenPrivacy}
        onOpenActiveSessions={onOpenActiveSessions}
        onOpenSync={onOpenSync}
        onOpenMTProtoSync={onOpenMTProtoSync}
        onOpenArchiveSync={onOpenArchiveSync}
        onOpenMonitor={onOpenMonitor}
        onOpenSettings={onOpenSettings}
        onNewFolder={onNewFolder}
        onOpenArchive={onOpenArchive}
        onCheckUpdate={onCheckUpdate}
        onOpenLogin={onOpenLogin}
      />
    </div>
  );
};
