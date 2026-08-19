import React, { useState } from 'react';
import { 
  X, 
  Phone, 
  Video, 
  Bell, 
  BellOff, 
  Image as ImageIcon, 
  FileText, 
  Link as LinkIcon, 
  Music, 
  Mic, 
  Lock, 
  Copy, 
  Check, 
  Users, 
  Megaphone, 
  Bot, 
  Bookmark, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Chat, Message, User } from '../../types/telegram';

interface ChatInfoPanelProps {
  chat: Chat;
  messages: Message[];
  isOpen: boolean;
  onClose: () => void;
  onStartCall: (type: 'audio' | 'video') => void;
  onToggleMute: () => void;
  onOpenImage: (url: string) => void;
}

export const ChatInfoPanel: React.FC<ChatInfoPanelProps> = ({
  chat,
  messages,
  isOpen,
  onClose,
  onStartCall,
  onToggleMute,
  onOpenImage,
}) => {
  const [activeTab, setActiveTab] = useState<'media' | 'files' | 'links' | 'voice'>('media');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Collect media items from messages
  const mediaItems = messages.flatMap((m) => 
    (m.attachments || []).filter((a) => a.type === 'photo').map((a) => a.url)
  );

  const fileItems = messages.flatMap((m) => 
    (m.attachments || []).filter((a) => a.type === 'document' || a.type === 'audio')
  );

  const voiceItems = messages.flatMap((m) => 
    (m.attachments || []).filter((a) => a.type === 'voice')
  );

  // Extract URLs from text messages
  const linkItems = messages.flatMap((m) => {
    const urlMatches = m.text.match(/https?:\/\/[^\s]+/g);
    return urlMatches || [];
  });

  return (
    <aside 
      id="chat-info-panel"
      className="w-80 md:w-96 bg-neutral-900 border-l border-neutral-800 flex flex-col h-full shrink-0 z-20 select-none overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
        <h3 className="font-semibold text-neutral-100 text-sm">
          {chat.type === 'channel' ? 'Channel Info' : chat.type === 'group' ? 'Group Info' : 'User Info'}
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-neutral-800/60 custom-scrollbar">
        {/* Profile Card */}
        <div className="p-6 flex flex-col items-center text-center">
          <div className="relative mb-3">
            {chat.type === 'saved' ? (
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
                <Bookmark className="w-12 h-12 fill-current" />
              </div>
            ) : chat.avatar ? (
              <img 
                src={chat.avatar} 
                alt={chat.title} 
                className="w-24 h-24 rounded-full object-cover shadow-lg ring-2 ring-neutral-800"
              />
            ) : (
              <div className={`w-24 h-24 rounded-full bg-gradient-to-tr ${chat.avatarColor || 'from-sky-500 to-indigo-600'} text-white font-bold text-3xl flex items-center justify-center shadow-lg`}>
                {chat.type === 'channel' ? <Megaphone className="w-10 h-10" /> : 
                 chat.type === 'group' ? <Users className="w-10 h-10" /> : 
                 chat.type === 'bot' ? <Bot className="w-10 h-10" /> : 
                 chat.title.charAt(0)}
              </div>
            )}
            {chat.isOnline && (
              <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-3 border-neutral-900 rounded-full" />
            )}
          </div>

          <h2 className="text-lg font-bold text-neutral-100 flex items-center gap-1.5">
            {chat.title}
            {chat.isVerified && (
              <span className="w-4 h-4 bg-sky-500 text-neutral-950 rounded-full inline-flex items-center justify-center text-[10px] font-bold">✓</span>
            )}
          </h2>

          <p className="text-xs text-neutral-400 mt-0.5">
            {chat.type === 'channel' && chat.membersCount ? `${chat.membersCount.toLocaleString()} subscribers` :
             chat.type === 'group' && chat.membersCount ? `${chat.membersCount.toLocaleString()} members` :
             chat.isOnline ? 'online' : 'last seen recently'}
          </p>

          {/* Call buttons for direct contacts */}
          {chat.type === 'direct' && (
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => onStartCall('audio')}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-xl flex items-center gap-2 transition-colors"
              >
                <Phone className="w-4 h-4 text-sky-400" />
                <span>Call</span>
              </button>
              <button
                onClick={() => onStartCall('video')}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-xl flex items-center gap-2 transition-colors"
              >
                <Video className="w-4 h-4 text-sky-400" />
                <span>Video</span>
              </button>
            </div>
          )}
        </div>

        {/* Details & Metadata */}
        <div className="p-4 space-y-3 text-xs">
          {chat.about && (
            <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/80">
              <span className="text-[11px] font-semibold text-neutral-400 block mb-1">About</span>
              <p className="text-neutral-200 leading-relaxed">{chat.about}</p>
            </div>
          )}

          {chat.username && (
            <div 
              onClick={() => handleCopy(`https://t.me/${chat.username}`, 'username')}
              className="p-3 bg-neutral-950/60 hover:bg-neutral-800/60 rounded-xl border border-neutral-800/80 cursor-pointer flex items-center justify-between transition-colors"
            >
              <div>
                <span className="text-[11px] font-semibold text-neutral-400 block">Username</span>
                <span className="text-sky-400 font-medium">@{chat.username}</span>
              </div>
              <div className="text-neutral-400">
                {copiedText === 'username' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </div>
            </div>
          )}

          <div 
            onClick={onToggleMute}
            className="p-3 bg-neutral-950/60 hover:bg-neutral-800/60 rounded-xl border border-neutral-800/80 cursor-pointer flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-2.5">
              {chat.isMuted ? <BellOff className="w-4 h-4 text-neutral-400" /> : <Bell className="w-4 h-4 text-sky-400" />}
              <span className="font-medium text-neutral-200">Notifications</span>
            </div>
            <span className={`text-[11px] font-bold ${chat.isMuted ? 'text-neutral-500' : 'text-sky-400'}`}>
              {chat.isMuted ? 'Off' : 'On'}
            </span>
          </div>

          <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/80 flex items-center gap-2.5 text-neutral-400">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-[11px]">End-to-end encrypted cloud channel</span>
          </div>
        </div>

        {/* Media & Shared Files Tabs */}
        <div className="p-4">
          <div className="grid grid-cols-4 gap-1 p-1 bg-neutral-950 rounded-xl border border-neutral-800 mb-3 text-xs font-medium text-center">
            <button
              onClick={() => setActiveTab('media')}
              className={`py-1.5 rounded-lg transition-colors ${activeTab === 'media' ? 'bg-sky-500 text-white' : 'text-neutral-400 hover:text-neutral-200'}`}
            >
              Media ({mediaItems.length})
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`py-1.5 rounded-lg transition-colors ${activeTab === 'files' ? 'bg-sky-500 text-white' : 'text-neutral-400 hover:text-neutral-200'}`}
            >
              Files ({fileItems.length})
            </button>
            <button
              onClick={() => setActiveTab('links')}
              className={`py-1.5 rounded-lg transition-colors ${activeTab === 'links' ? 'bg-sky-500 text-white' : 'text-neutral-400 hover:text-neutral-200'}`}
            >
              Links ({linkItems.length})
            </button>
            <button
              onClick={() => setActiveTab('voice')}
              className={`py-1.5 rounded-lg transition-colors ${activeTab === 'voice' ? 'bg-sky-500 text-white' : 'text-neutral-400 hover:text-neutral-200'}`}
            >
              Voice ({voiceItems.length})
            </button>
          </div>

          {/* Tab Contents */}
          <div className="min-h-40">
            {activeTab === 'media' && (
              mediaItems.length === 0 ? (
                <div className="text-center py-8 text-neutral-500 text-xs">No media shared yet</div>
              ) : (
                <div className="grid grid-cols-3 gap-1.5">
                  {mediaItems.map((url, idx) => (
                    <img 
                      key={idx} 
                      src={url} 
                      alt="Shared media" 
                      onClick={() => onOpenImage(url)}
                      className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  ))}
                </div>
              )
            )}

            {activeTab === 'files' && (
              fileItems.length === 0 ? (
                <div className="text-center py-8 text-neutral-500 text-xs">No files shared yet</div>
              ) : (
                <div className="space-y-2">
                  {fileItems.map((file, idx) => (
                    <div key={idx} className="p-2 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center gap-2.5 text-xs">
                      <FileText className="w-4 h-4 text-sky-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-neutral-200 truncate">{file.fileName || 'file.dat'}</div>
                        <div className="text-[10px] text-neutral-500">{file.fileSize || '1.2 MB'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {activeTab === 'links' && (
              linkItems.length === 0 ? (
                <div className="text-center py-8 text-neutral-500 text-xs">No links shared yet</div>
              ) : (
                <div className="space-y-2">
                  {linkItems.map((url, idx) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 bg-neutral-950 hover:bg-neutral-800 rounded-xl border border-neutral-800 flex items-center justify-between text-xs text-sky-400 transition-colors"
                    >
                      <span className="truncate mr-2">{url}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </a>
                  ))}
                </div>
              )
            )}

            {activeTab === 'voice' && (
              voiceItems.length === 0 ? (
                <div className="text-center py-8 text-neutral-500 text-xs">No voice messages yet</div>
              ) : (
                <div className="space-y-2">
                  {voiceItems.map((voice, idx) => (
                    <div key={idx} className="p-2 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center gap-2.5 text-xs">
                      <Mic className="w-4 h-4 text-purple-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-neutral-200">Voice Note #{idx + 1}</div>
                        <div className="text-[10px] text-neutral-500">0:{voice.duration?.toString().padStart(2, '0') || '20'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
