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
  selectedChatId: string | number | null;
  profile: UserProfile;
  stories?: TelegramStory[];
  onOpenStoryViewer?: (index: number) => void;
  onAddStory?: () => void;
  allPinnedMessages?: Array<{ chat_id: string | number; chat_title: string; chat_avatar?: string; message: Message }>;
  onUnpinMessage?: (chatId: string | number, messageId: string | number) => void;
  onSelectChat: (chatId: string | number) => void;
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
    <div className="w-full md:w-80 lg:w-96 bg-slate-900 border-l border-slate-800 flex flex-col h-full select-none text-slate-100">
      {/* Top Header - Telegram Official Web Style with Burger Menu */}
      <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2 space-x-reverse">
          <button
            onClick={() => handleToggleDrawer(true)}
            title="القائمة الجانبية الرئيسية (Telegram Web Menu)"
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            className="flex items-center space-x-2 space-x-reverse cursor-pointer"
            onClick={onOpenProfile}
          >
            <ChatAvatar
              title={`${profile.first_name} ${profile.last_name}`}
              avatar={profile.photo}
              type="private"
              size="sm"
              isOnline={true}
            />
            <div>
              <div className="font-semibold text-xs text-slate-100 flex items-center gap-1">
                <span>
                  {profile.first_name} {profile.last_name}
                </span>
                <Sparkles className="w-3 h-3 text-amber-400" />
              </div>
              <div className="text-[11px] text-sky-400 font-mono">@{profile.username}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1 space-x-reverse">
          <button
            onClick={onNewChat}
            title="محادثة أو مجموعة جديدة"
            className="p-2 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-full transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="p-2.5 bg-slate-900 border-b border-slate-800/60">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 absolute right-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="بحث في المحادثات والقنوات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/80 text-xs text-slate-100 pr-9 pl-3 py-2 rounded-xl border border-slate-700/50 focus:outline-none focus:border-sky-500 transition-colors placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Folders Tab Strip */}
      <div className="flex items-center overflow-x-auto no-scrollbar overscroll-x-contain touch-pan-x bg-slate-950/60 border-b border-slate-800/80 p-1.5 gap-1">
        {folders.map((folder) => {
          const isActive = activeFolderId === folder.id;
          return (
            <button
              key={folder.id}
              onClick={() => onSelectFolder(folder.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <span>{folder.icon}</span>
              <span>{folder.title}</span>
            </button>
          );
        })}
        <button
          onClick={onNewFolder}
          title="إضافة مجلد جديد"
          className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-lg shrink-0 transition-colors"
        >
          <FolderPlus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Telegram Official Stories Horizontal Carousel Bar */}
      {stories && stories.length > 0 && (
        <div className="bg-slate-950/90 border-b border-slate-800/80 p-2 overflow-x-auto no-scrollbar overscroll-x-contain touch-pan-x flex items-center gap-3">
          {/* My Story + Add button */}
          <div
            onClick={onAddStory}
            className="flex flex-col items-center gap-1 cursor-pointer shrink-0 group"
          >
            <div className="relative p-0.5 rounded-full ring-2 ring-sky-500/50 group-hover:scale-105 transition-transform">
              <ChatAvatar title={profile.first_name} avatar={profile.photo} size="sm" />
              <div className="absolute -bottom-1 -right-1 bg-sky-500 text-slate-950 p-0.5 rounded-full border border-slate-900 shadow">
                <Plus className="w-3 h-3 stroke-[3]" />
              </div>
            </div>
            <span className="text-[10px] text-slate-300 font-bold truncate max-w-[54px]">قصتي</span>
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
                    ? 'ring-slate-700'
                    : 'ring-gradient-to-tr from-amber-400 via-rose-500 to-sky-400 ring-sky-400'
                }`}
              >
                <ChatAvatar title={story.user_name} avatar={story.user_avatar} size="sm" />
              </div>
              <span className="text-[10px] text-slate-200 font-medium truncate max-w-[58px]">
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
          className="mx-2 mt-2 p-2.5 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-slate-700/40 flex items-center justify-between cursor-pointer transition-colors group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Archive className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200">المحادثات المؤرشفة</div>
              <div className="text-[11px] text-slate-400">{archivedChats.length} محادثة محفوظة</div>
            </div>
          </div>
          <span className="text-xs font-mono text-sky-400 font-medium">افتتح 📂</span>
        </div>
      )}

      {/* Dedicated Pinned Messages Component */}
      <PinnedMessagesSidebar
        pinnedMessages={allPinnedMessages}
        onSelectChat={onSelectChat}
        onUnpinMessage={onUnpinMessage}
      />

      {/* Chat List Items */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40 p-1">
        {sortedChats.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
            <MessageSquare className="w-8 h-8 opacity-30 text-slate-400" />
            <span>لا توجد محادثات في هذا المجلد</span>
          </div>
        ) : (
          sortedChats.map((chat) => {
            const isSelected = selectedChatId === chat.id;
            return (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`p-3 rounded-xl cursor-pointer transition-all flex items-center gap-3 my-0.5 ${
                  isSelected
                    ? 'bg-sky-600/20 border border-sky-500/40 shadow-sm'
                    : 'hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                {/* Chat Avatar */}
                <ChatAvatar
                  id={chat.id}
                  title={chat.title}
                  avatar={chat.avatar}
                  username={chat.username}
                  type={chat.type}
                  size="lg"
                  isOnline={chat.is_online}
                />

                {/* Chat Title & Last Msg */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-semibold text-xs text-slate-100 truncate flex items-center gap-1">
                      <span>{chat.title}</span>
                      {chat.is_muted && <VolumeX className="w-3 h-3 text-slate-500 shrink-0" />}
                    </div>
                    {chat.last_message && (
                      <span className="text-[10px] text-slate-500 font-mono shrink-0">
                        {new Date(chat.last_message.date).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-400 truncate pl-2">
                      {chat.typing_user ? (
                        <span className="text-sky-400 font-medium animate-pulse">
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

                    <div className="flex items-center gap-1 shrink-0">
                      {chat.is_pinned && <Pin className="w-3 h-3 text-amber-400 rotate-45" />}
                      {chat.unread_count > 0 && (
                        <span className="bg-sky-500 text-slate-950 font-bold text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
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
