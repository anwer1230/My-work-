import React, { useState } from 'react';
import { 
  Phone, 
  Video, 
  Search, 
  Sidebar, 
  MoreVertical, 
  Bookmark, 
  Megaphone, 
  Users, 
  Bot, 
  Check,
  VolumeX,
  Volume2,
  Trash2,
  Eraser,
  Pin,
  ArrowLeft
} from 'lucide-react';
import { Chat } from '../../types/telegram';

interface ChatHeaderProps {
  chat: Chat;
  onBackMobile?: () => void;
  onToggleInfoPanel: () => void;
  isInfoPanelOpen: boolean;
  onStartCall: (type: 'audio' | 'video') => void;
  onToggleMute: () => void;
  onClearHistory: () => void;
  onDeleteChat: () => void;
  onOpenSearchInChat: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  chat,
  onBackMobile,
  onToggleInfoPanel,
  isInfoPanelOpen,
  onStartCall,
  onToggleMute,
  onClearHistory,
  onDeleteChat,
  onOpenSearchInChat,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const getSubtitle = () => {
    if (chat.typing) {
      return (
        <span className="text-sky-400 font-medium flex items-center gap-1">
          <span>{chat.typing} is typing</span>
          <span className="inline-flex gap-0.5 items-center">
            <span className="w-1 h-1 bg-sky-400 rounded-full animate-bounce" />
            <span className="w-1 h-1 bg-sky-400 rounded-full animate-bounce [animation-delay:0.2s]" />
            <span className="w-1 h-1 bg-sky-400 rounded-full animate-bounce [animation-delay:0.4s]" />
          </span>
        </span>
      );
    }

    if (chat.type === 'saved') {
      return <span className="text-neutral-400">Personal cloud storage</span>;
    }
    if (chat.type === 'bot') {
      return <span className="text-sky-400 font-medium">bot</span>;
    }
    if (chat.type === 'channel') {
      return <span className="text-neutral-400">{chat.membersCount ? `${chat.membersCount.toLocaleString()} subscribers` : 'channel'}</span>;
    }
    if (chat.type === 'group') {
      return <span className="text-neutral-400">{chat.membersCount ? `${chat.membersCount.toLocaleString()} members` : 'group'}</span>;
    }
    if (chat.isOnline) {
      return <span className="text-sky-400 font-medium">online</span>;
    }
    return <span className="text-neutral-500">last seen recently</span>;
  };

  const getAvatar = () => {
    if (chat.type === 'saved') {
      return (
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs">
          <Bookmark className="w-5 h-5 fill-current" />
        </div>
      );
    }
    if (chat.avatar) {
      return (
        <img 
          src={chat.avatar} 
          alt={chat.title} 
          className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-neutral-800 shadow-xs"
        />
      );
    }
    return (
      <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${chat.avatarColor || 'from-sky-500 to-indigo-600'} text-white font-semibold text-sm flex items-center justify-center shrink-0 shadow-xs`}>
        {chat.type === 'channel' ? <Megaphone className="w-4 h-4" /> : 
         chat.type === 'group' ? <Users className="w-4 h-4" /> : 
         chat.type === 'bot' ? <Bot className="w-4 h-4" /> : 
         chat.title.charAt(0).toUpperCase()}
      </div>
    );
  };

  return (
    <header 
      id="chat-header"
      className="h-16 bg-neutral-900/95 border-b border-neutral-800 px-4 flex items-center justify-between z-20 shrink-0 select-none backdrop-blur-xs"
    >
      <div className="flex items-center gap-3 min-w-0 cursor-pointer" onClick={onToggleInfoPanel}>
        {onBackMobile && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBackMobile();
            }}
            className="md:hidden p-1.5 -ml-1 text-neutral-400 hover:text-neutral-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        {getAvatar()}

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h2 className="font-semibold text-neutral-100 text-sm md:text-base truncate hover:underline">
              {chat.title}
            </h2>
            {chat.isVerified && (
              <span className="text-sky-400 shrink-0" title="Verified">
                <Check className="w-3 h-3 bg-sky-500 text-neutral-950 rounded-full p-0.5" />
              </span>
            )}
            {chat.isMuted && (
              <VolumeX className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
            )}
          </div>
          <div className="text-xs truncate">{getSubtitle()}</div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {chat.type === 'direct' && (
          <>
            <button
              id="btn-voice-call"
              onClick={() => onStartCall('audio')}
              className="p-2 text-neutral-400 hover:text-sky-400 hover:bg-neutral-800/80 rounded-xl transition-colors"
              title="Voice Call"
            >
              <Phone className="w-5 h-5" />
            </button>
            <button
              id="btn-video-call"
              onClick={() => onStartCall('video')}
              className="p-2 text-neutral-400 hover:text-sky-400 hover:bg-neutral-800/80 rounded-xl transition-colors"
              title="Video Call"
            >
              <Video className="w-5 h-5" />
            </button>
          </>
        )}

        <button
          id="btn-search-chat"
          onClick={onOpenSearchInChat}
          className="p-2 text-neutral-400 hover:text-sky-400 hover:bg-neutral-800/80 rounded-xl transition-colors"
          title="Search in Chat"
        >
          <Search className="w-5 h-5" />
        </button>

        <button
          id="btn-toggle-info"
          onClick={onToggleInfoPanel}
          className={`p-2 rounded-xl transition-colors ${
            isInfoPanelOpen
              ? 'text-sky-400 bg-sky-500/15'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/80'
          }`}
          title="Profile & Media Info"
        >
          <Sidebar className="w-5 h-5" />
        </button>

        <div className="relative">
          <button
            id="btn-chat-options"
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/80 rounded-xl transition-colors"
            title="More Options"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showMenu && (
            <div 
              className="absolute right-0 top-11 bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl py-1 w-48 text-xs font-medium text-neutral-200 z-50 animate-in fade-in zoom-in-95 duration-100"
              onClick={() => setShowMenu(false)}
            >
              <button
                onClick={onToggleMute}
                className="w-full px-4 py-2.5 text-left hover:bg-neutral-800 flex items-center gap-2.5"
              >
                {chat.isMuted ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-neutral-400" />}
                {chat.isMuted ? 'Unmute Notifications' : 'Mute Notifications'}
              </button>

              <button
                onClick={onClearHistory}
                className="w-full px-4 py-2.5 text-left hover:bg-neutral-800 flex items-center gap-2.5"
              >
                <Eraser className="w-4 h-4 text-amber-400" />
                Clear History
              </button>

              <button
                onClick={onDeleteChat}
                className="w-full px-4 py-2.5 text-left hover:bg-red-500/20 text-red-400 flex items-center gap-2.5 border-t border-neutral-800/80"
              >
                <Trash2 className="w-4 h-4" />
                Delete Chat
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
