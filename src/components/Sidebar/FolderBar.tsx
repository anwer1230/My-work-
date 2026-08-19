import React from 'react';
import { 
  MessageSquare, 
  User as UserIcon, 
  Users, 
  Megaphone, 
  Bot, 
  CircleDot,
  Plus
} from 'lucide-react';
import { ChatFolder } from '../../types/telegram';

interface FolderBarProps {
  activeFolderId: string;
  onSelectFolder: (folderId: string) => void;
  unreadCounts: Record<string, number>;
  onOpenNewFolderModal?: () => void;
}

export const FOLDERS: ChatFolder[] = [
  { id: 'all', name: 'All Chats', icon: 'all', filterType: 'all' },
  { id: 'personal', name: 'Personal', icon: 'user', filterType: 'personal' },
  { id: 'groups', name: 'Groups', icon: 'groups', filterType: 'groups' },
  { id: 'channels', name: 'Channels', icon: 'channels', filterType: 'channels' },
  { id: 'bots', name: 'Bots', icon: 'bot', filterType: 'bots' },
  { id: 'unread', name: 'Unread', icon: 'unread', filterType: 'unread' },
];

export const FolderBar: React.FC<FolderBarProps> = ({
  activeFolderId,
  onSelectFolder,
  unreadCounts,
  onOpenNewFolderModal,
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'all': return <MessageSquare className="w-5 h-5" />;
      case 'personal': return <UserIcon className="w-5 h-5" />;
      case 'groups': return <Users className="w-5 h-5" />;
      case 'channels': return <Megaphone className="w-5 h-5" />;
      case 'bots': return <Bot className="w-5 h-5" />;
      case 'unread': return <CircleDot className="w-5 h-5" />;
      default: return <MessageSquare className="w-5 h-5" />;
    }
  };

  return (
    <aside 
      id="telegram-folder-bar"
      className="w-18 bg-neutral-900/90 border-r border-neutral-800/80 flex flex-col items-center py-4 select-none shrink-0 z-10"
    >
      <div className="flex flex-col items-center space-y-3 w-full px-2">
        {FOLDERS.map((folder) => {
          const isActive = activeFolderId === folder.id;
          const count = unreadCounts[folder.id] || 0;

          return (
            <button
              key={folder.id}
              id={`folder-btn-${folder.id}`}
              onClick={() => onSelectFolder(folder.id)}
              className={`relative group w-14 h-14 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 ${
                isActive
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25 scale-100'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
              }`}
              title={folder.name}
            >
              <div className="relative flex items-center justify-center">
                {getIcon(folder.filterType)}
                {count > 0 && !isActive && (
                  <span className="absolute -top-2 -right-2.5 min-w-4.5 h-4.5 px-1 bg-sky-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center border-2 border-neutral-900">
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium mt-1 truncate max-w-[50px] ${isActive ? 'text-white' : 'text-neutral-400'}`}>
                {folder.name.split(' ')[0]}
              </span>

              {/* Tooltip on hover */}
              <div className="absolute left-full ml-3 px-2.5 py-1 bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs font-medium rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50 whitespace-nowrap">
                {folder.name}
                {count > 0 && <span className="ml-1.5 text-sky-400">({count})</span>}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-auto pt-4 flex flex-col items-center">
        {onOpenNewFolderModal && (
          <button
            id="btn-add-folder"
            onClick={onOpenNewFolderModal}
            className="w-11 h-11 rounded-xl text-neutral-400 hover:text-sky-400 hover:bg-neutral-800/60 flex items-center justify-center transition-colors"
            title="Edit Folders"
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
      </div>
    </aside>
  );
};
