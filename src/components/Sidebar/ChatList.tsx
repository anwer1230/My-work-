import React, { useState, useRef, useMemo } from 'react';
import { 
  Menu, 
  Search, 
  X, 
  Pin, 
  VolumeX, 
  Volume2,
  Check, 
  CheckCheck, 
  Image as ImageIcon, 
  Mic, 
  FileText, 
  BarChart2, 
  Bookmark, 
  Sparkles,
  Megaphone,
  Users,
  Bot,
  Circle,
  MoreVertical,
  Trash2,
  Edit,
  Download,
  Smartphone,
  Phone,
  Settings,
  MessageSquare,
  Zap,
  Archive,
  Eye,
  CornerUpLeft,
  CheckCircle,
  UserCheck
} from 'lucide-react';
import { Chat, User, UserStory } from '../../types/telegram';
import { StoriesTray } from '../Stories/StoriesTray';
import { Language, translations } from '../../utils/i18n';
import { FOLDERS } from './FolderBar';
import { sortChatsWithLastActivePriority, isGroupChat } from '../../utils/chatSorting';

interface ChatListProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onOpenMainMenu: () => void;
  onTogglePinChat: (chatId: string) => void;
  onToggleMuteChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  stories: UserStory[];
  currentUser: User;
  onOpenStory: (story: UserStory) => void;
  onOpenAddStory: () => void;
  onOpenNewChatModal: () => void;
  onOpenInstallModal: () => void;
  onOpenContacts: () => void;
  onOpenCalls: () => void;
  onOpenSettings: () => void;
  activeFolderId: string;
  onSelectFolder: (folderId: string) => void;
  lang: Language;
}

export const ChatList: React.FC<ChatListProps> = ({
  chats,
  activeChatId,
  onSelectChat,
  onOpenMainMenu,
  onTogglePinChat,
  onToggleMuteChat,
  onDeleteChat,
  searchQuery,
  onSearchChange,
  stories,
  currentUser,
  onOpenStory,
  onOpenAddStory,
  onOpenNewChatModal,
  onOpenInstallModal,
  onOpenContacts,
  onOpenCalls,
  onOpenSettings,
  activeFolderId,
  onSelectFolder,
  lang,
}) => {
  const [contextMenuChat, setContextMenuChat] = useState<Chat | null>(null);
  const [swipedChatId, setSwipedChatId] = useState<string | null>(null);
  const [swipeOffset, setSwipeOffset] = useState<number>(0);
  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);
  const isSwipingRef = useRef<boolean>(false);
  const longPressTimerRef = useRef<any>(null);

  const t = translations[lang];

  // Touch event handlers for Telegram Swipe-to-Reveal Actions (Pin, Mute, Archive, Delete)
  const handleTouchStart = (chat: Chat, e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    isSwipingRef.current = false;

    // Trigger long press context menu after 500ms
    longPressTimerRef.current = setTimeout(() => {
      if (!isSwipingRef.current) {
        setContextMenuChat(chat);
        if (navigator.vibrate) navigator.vibrate(30);
      }
    }, 550);
  };

  const handleTouchMove = (chatId: string, e: React.TouchEvent) => {
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStartXRef.current;
    const diffY = currentY - touchStartYRef.current;

    // If scrolling vertically, cancel swipe
    if (Math.abs(diffY) > Math.abs(diffX) && !isSwipingRef.current) {
      clearTimeout(longPressTimerRef.current);
      return;
    }

    if (Math.abs(diffX) > 10) {
      isSwipingRef.current = true;
      clearTimeout(longPressTimerRef.current);

      if (swipedChatId !== chatId) {
        setSwipedChatId(chatId);
      }

      // Constrain swipe offset between -180px and 0px (Swipe left)
      const clamped = Math.max(-190, Math.min(0, diffX));
      setSwipeOffset(clamped);
    }
  };

  const handleTouchEnd = (chat: Chat) => {
    clearTimeout(longPressTimerRef.current);
    if (!isSwipingRef.current) return;

    // If swiped past 90px, latch open, else snap back
    if (swipeOffset < -70) {
      setSwipeOffset(-180);
    } else {
      setSwipeOffset(0);
      setSwipedChatId(null);
    }
    isSwipingRef.current = false;
  };

  const closeSwipe = () => {
    setSwipeOffset(0);
    setSwipedChatId(null);
  };

  const getChatAvatar = (chat: Chat) => {
    if (chat.type === 'saved') {
      return (
        <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shrink-0 border border-sky-400/30">
          <Bookmark className="w-6 h-6 fill-current" />
        </div>
      );
    }

    const hasStory = stories.some(s => s.user.id === chat.id);

    if (chat.avatar) {
      return (
        <div className="relative shrink-0">
          <div className={`p-0.5 rounded-full ${hasStory ? 'bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-500' : ''}`}>
            <img 
              src={chat.avatar} 
              alt={chat.title} 
              className="w-13 h-13 rounded-full object-cover shadow-sm bg-neutral-800"
            />
          </div>
          {chat.isOnline && (
            <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-neutral-900 rounded-full shadow-xs ring-1 ring-emerald-400/50" />
          )}
        </div>
      );
    }

    return (
      <div className="relative shrink-0">
        <div className={`p-0.5 rounded-full ${hasStory ? 'bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-500' : ''}`}>
          <div className={`w-13 h-13 rounded-full bg-gradient-to-tr ${chat.avatarColor || 'from-sky-500 to-indigo-600'} text-white font-bold text-lg flex items-center justify-center shadow-md border border-white/10`}>
            {chat.type === 'channel' ? <Megaphone className="w-6 h-6" /> : 
             chat.type === 'group' ? <Users className="w-6 h-6" /> : 
             chat.type === 'bot' ? <Bot className="w-6 h-6" /> : 
             chat.title.charAt(0).toUpperCase()}
          </div>
        </div>
        {chat.isOnline && (
          <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-neutral-900 rounded-full shadow-xs ring-1 ring-emerald-400/50" />
        )}
      </div>
    );
  };

  const getMessageSnippet = (chat: Chat) => {
    if (chat.typing) {
      return (
        <span className="text-sky-400 font-semibold flex items-center gap-1.5 text-[13px]">
          <span>{chat.typing}</span>
          <span className="inline-flex gap-0.5 items-center">
            <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce" />
            <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce [animation-delay:0.18s]" />
            <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce [animation-delay:0.36s]" />
          </span>
        </span>
      );
    }

    if (chat.draft) {
      return (
        <span className="text-red-400 font-normal truncate text-[13px]">
          <span className="font-bold text-red-500">Draft: </span>{chat.draft}
        </span>
      );
    }

    const lastMsg = chat.lastMessage;
    if (!lastMsg) return <span className="text-neutral-500 italic text-[12px]">No messages yet</span>;

    const isOutgoing = lastMsg.isOutgoing;

    return (
      <div className="flex items-center gap-1 text-[13px] text-neutral-400 truncate">
        {isOutgoing && (
          <span className="shrink-0 inline-flex items-center mr-0.5">
            {lastMsg.status === 'read' ? (
              <CheckCheck className="w-3.5 h-3.5 text-sky-400" />
            ) : lastMsg.status === 'sent' ? (
              <Check className="w-3.5 h-3.5 text-neutral-400" />
            ) : (
              <span className="w-2.5 h-2.5 border-1 border-neutral-400 rounded-full animate-spin" />
            )}
            <span className="text-sky-400/90 font-medium ml-1">You: </span>
          </span>
        )}

        {!isOutgoing && isGroupChat(chat as any) && (
          <span className="text-sky-300 font-medium shrink-0">
            {chat.members?.find(m => m.id === lastMsg.senderId)?.name || 'Member'}:{' '}
          </span>
        )}

        {/* Media Type Icons */}
        {lastMsg.attachments && lastMsg.attachments.length > 0 && (
          <span className="inline-flex items-center gap-1 text-sky-300 font-medium shrink-0">
            {lastMsg.attachments[0].type === 'photo' && <ImageIcon className="w-3.5 h-3.5 text-sky-400" />}
            {lastMsg.attachments[0].type === 'voice' && <Mic className="w-3.5 h-3.5 text-emerald-400" />}
            {lastMsg.attachments[0].type === 'document' && <FileText className="w-3.5 h-3.5 text-amber-400" />}
            <span className="capitalize">{lastMsg.attachments[0].type}</span>
          </span>
        )}

        {lastMsg.poll && (
          <span className="inline-flex items-center gap-1 text-purple-300 font-medium shrink-0">
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Poll: </span>
          </span>
        )}

        <span className="truncate">{lastMsg.text}</span>
      </div>
    );
  };

  const filteredChats = useMemo(() => {
    return chats.filter((chat) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = chat.title.toLowerCase().includes(q);
        const matchMsg = chat.lastMessage?.text.toLowerCase().includes(q);
        const matchUsername = chat.username?.toLowerCase().includes(q);
        if (!matchTitle && !matchMsg && !matchUsername) return false;
      }

      if (activeFolderId === 'all') return true;
      if (activeFolderId === 'personal') return chat.type === 'direct' || chat.type === 'saved';
      if (activeFolderId === 'groups') return chat.type === 'group';
      if (activeFolderId === 'channels') return chat.type === 'channel';
      if (activeFolderId === 'bots') return chat.type === 'bot';
      if (activeFolderId === 'unread') return (chat.unreadCount || 0) > 0;
      return true;
    });
  }, [chats, searchQuery, activeFolderId]);

  return (
    <div className="relative flex flex-col h-full bg-neutral-900/95 border-r border-neutral-800 select-none overflow-hidden font-['Cairo',sans-serif]">
      
      {/* Top Header & Search Bar (Telegram Classic Top Navigation) */}
      <div className="p-3.5 border-b border-neutral-800/80 bg-neutral-950/70 backdrop-blur-md space-y-3 shrink-0">
        <div className="flex items-center justify-between gap-3">
          <button
            id="btn-main-menu-drawer"
            onClick={onOpenMainMenu}
            className="p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search Capsule */}
          <div className="flex-1 relative flex items-center">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
            <input
              id="telegram-chat-search"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t.search}
              className="w-full pl-9.5 pr-8 py-2 bg-neutral-900 border border-neutral-800/90 rounded-2xl text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-sky-500/70 focus:ring-1 focus:ring-sky-500/30 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 p-1 text-neutral-400 hover:text-neutral-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Telegram Folder Tabs Pill Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {FOLDERS.map((f) => (
            <button
              key={f.id}
              onClick={() => {
                onSelectFolder(f.id);
                closeSwipe();
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeFolderId === f.id
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'bg-neutral-900/90 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/80 border border-neutral-800'
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>
      </div>

      {/* Stories Tray */}
      <StoriesTray
        stories={stories}
        currentUser={currentUser}
        onOpenStory={onOpenStory}
        onOpenAddStory={onOpenAddStory}
        lang={lang}
      />

      {/* Chat List Items with Full Gesture & Physics Support */}
      <div 
        id="telegram-chat-list-container"
        className="flex-1 overflow-y-auto divide-y divide-neutral-800/40 custom-scrollbar pb-18 md:pb-0"
      >
        {filteredChats.length === 0 ? (
          <div className="p-10 text-center text-neutral-500 text-xs flex flex-col items-center justify-center space-y-2">
            <MessageSquare className="w-8 h-8 opacity-30 text-neutral-400" />
            <p>{t.noChatsFound}</p>
          </div>
        ) : (
          sortChatsWithLastActivePriority(filteredChats).map((chat) => {
            const isActive = activeChatId === chat.id;
            const hasUnread = (chat.unreadCount || 0) > 0;
            const isGroup = isGroupChat(chat as any);
            const isSwiped = swipedChatId === chat.id;
            const currentOffset = isSwiped ? swipeOffset : 0;

            const hasSystemActivity = isGroup && Boolean(
              chat.has_system_activity ||
              chat.hasRecentSystemActivity ||
              ((chat as any).last_system_activity && (chat as any).last_system_activity > 0) ||
              (chat.lastSystemActivity && chat.lastSystemActivity > 0)
            );

            return (
              <div 
                key={chat.id} 
                className="relative overflow-hidden bg-neutral-950"
              >
                {/* Swipe Action Buttons Revealed Behind Chat Row */}
                <div className="absolute inset-y-0 right-0 flex items-center justify-end w-48 bg-neutral-900 z-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePinChat(chat.id);
                      closeSwipe();
                    }}
                    className="h-full px-3.5 bg-sky-600 hover:bg-sky-500 text-white flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition-colors cursor-pointer"
                    title="Pin"
                  >
                    <Pin className="w-4 h-4" />
                    <span>{chat.isPinned ? 'Unpin' : 'Pin'}</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleMuteChat(chat.id);
                      closeSwipe();
                    }}
                    className="h-full px-3.5 bg-amber-600 hover:bg-amber-500 text-white flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition-colors cursor-pointer"
                    title="Mute"
                  >
                    {chat.isMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    <span>{chat.isMuted ? 'Unmute' : 'Mute'}</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                      closeSwipe();
                    }}
                    className="h-full px-3.5 bg-red-600 hover:bg-red-500 text-white flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>

                {/* Foreground Chat Row (Draggable & Clickable) */}
                <div
                  id={`chat-item-${chat.id}`}
                  onClick={() => {
                    if (isSwiped) {
                      closeSwipe();
                    } else {
                      onSelectChat(chat.id);
                    }
                  }}
                  onTouchStart={(e) => handleTouchStart(chat, e)}
                  onTouchMove={(e) => handleTouchMove(chat.id, e)}
                  onTouchEnd={() => handleTouchEnd(chat)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setContextMenuChat(chat);
                  }}
                  style={{
                    transform: `translateX(${currentOffset}px)`,
                    transition: isSwipingRef.current ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)'
                  }}
                  className={`relative px-3.5 py-3 flex items-center gap-3.5 cursor-pointer z-10 transition-colors ${
                    isActive
                      ? 'bg-sky-500/15 border-l-4 border-sky-500'
                      : 'bg-neutral-900/90 hover:bg-neutral-800/60 active:bg-neutral-800'
                  }`}
                >
                  {getChatAvatar(chat)}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={`font-bold text-[14px] truncate ${isActive ? 'text-sky-400' : 'text-neutral-100'}`}>
                          {chat.title}
                        </span>

                        {hasSystemActivity && (
                          <span
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.2 bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[9px] font-bold rounded-md shrink-0"
                            title="Active Group"
                          >
                            <Zap className="w-2.5 h-2.5 fill-current" />
                            <span>نظام</span>
                          </span>
                        )}

                        {chat.isVerified && (
                          <span className="text-sky-400 shrink-0" title="Verified">
                            <CheckCircle className="w-4 h-4 fill-sky-500 text-neutral-950" />
                          </span>
                        )}

                        {chat.isMuted && (
                          <VolumeX className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                        )}
                      </div>

                      <span className="text-[11px] text-neutral-500 shrink-0 ml-2 font-mono font-medium">
                        {chat.lastMessage?.timestamp || ''}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="truncate pr-2">
                        {getMessageSnippet(chat)}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {chat.isPinned && (
                          <Pin className="w-3.5 h-3.5 text-neutral-400 fill-current rotate-45" />
                        )}
                        {hasUnread && (
                          <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full min-w-5 text-center shadow-xs ${
                            chat.isMuted
                              ? 'bg-neutral-700 text-neutral-300'
                              : 'bg-sky-500 text-white'
                          }`}>
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Telegram Floating Context Action Modal / Bottom Sheet */}
      {contextMenuChat && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          onClick={() => setContextMenuChat(null)}
        >
          <div 
            className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden p-4 space-y-3 text-xs animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-800">
              {getChatAvatar(contextMenuChat)}
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-white truncate">{contextMenuChat.title}</h4>
                <p className="text-neutral-400 text-[11px] truncate">
                  {contextMenuChat.type === 'channel' ? 'Channel' : contextMenuChat.type === 'group' ? 'Group' : 'Direct Message'}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => {
                  onTogglePinChat(contextMenuChat.id);
                  setContextMenuChat(null);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl hover:bg-neutral-800 flex items-center gap-3 text-neutral-200 font-medium transition-colors cursor-pointer"
              >
                <Pin className="w-4 h-4 text-sky-400" />
                <span>{contextMenuChat.isPinned ? 'Unpin from Top' : 'Pin to Top'}</span>
              </button>

              <button
                onClick={() => {
                  onToggleMuteChat(contextMenuChat.id);
                  setContextMenuChat(null);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl hover:bg-neutral-800 flex items-center gap-3 text-neutral-200 font-medium transition-colors cursor-pointer"
              >
                <VolumeX className="w-4 h-4 text-amber-400" />
                <span>{contextMenuChat.isMuted ? 'Unmute Notifications' : 'Mute Notifications'}</span>
              </button>

              <button
                onClick={() => {
                  onDeleteChat(contextMenuChat.id);
                  setContextMenuChat(null);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl hover:bg-red-500/20 text-red-400 flex items-center gap-3 font-medium transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Chat</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button for New Chat / Compose */}
      <button
        id="btn-compose-fab"
        onClick={onOpenNewChatModal}
        className="absolute bottom-20 md:bottom-6 right-5 w-14 h-14 rounded-full bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 text-white shadow-xl shadow-sky-500/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-20 cursor-pointer"
        title={t.newChat}
      >
        <Edit className="w-6 h-6" />
      </button>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden absolute bottom-0 inset-x-0 bg-neutral-950/95 border-t border-neutral-800/90 py-2 px-4 flex items-center justify-around z-20 backdrop-blur-md">
        <button
          onClick={() => onSelectFolder('all')}
          className="flex flex-col items-center gap-0.5 text-sky-400"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] font-bold">{t.chats}</span>
        </button>

        <button
          onClick={onOpenCalls}
          className="flex flex-col items-center gap-0.5 text-neutral-400 hover:text-neutral-200"
        >
          <Phone className="w-5 h-5" />
          <span className="text-[10px] font-medium">{t.calls}</span>
        </button>

        <button
          onClick={onOpenContacts}
          className="flex flex-col items-center gap-0.5 text-neutral-400 hover:text-neutral-200"
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] font-medium">{t.contacts}</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="flex flex-col items-center gap-0.5 text-neutral-400 hover:text-neutral-200"
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-medium">{t.settings}</span>
        </button>
      </div>
    </div>
  );
};
