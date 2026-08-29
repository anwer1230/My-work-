import React from 'react';
import {
  Folder as FolderIcon,
  User as UserIcon,
  Megaphone,
  Users,
  Bot,
} from 'lucide-react';
import { useTelegram } from '../../context/TelegramContext';

const ICON_MAP: Record<string, React.ElementType> = {
  Folder: FolderIcon,
  User: UserIcon,
  Megaphone: Megaphone,
  Users: Users,
  Bot: Bot,
};

export const FolderBar: React.FC = () => {
  const { folders, activeFolderId, setActiveFolderId, chats, settings } = useTelegram();

  const getFolderUnread = (folderId: string) => {
    if (folderId === 'all') {
      return chats.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
    }
    const folder = folders.find((f) => f.id === folderId);
    if (!folder) return 0;
    return chats
      .filter((c) => {
        if (folder.chatTypes && folder.chatTypes.includes(c.type)) return true;
        if (folder.includedChatIds && folder.includedChatIds.includes(c.id)) return true;
        return false;
      })
      .reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  };

  return (
    <div
      id="tg-folder-bar"
      className="flex items-center gap-1 px-2 border-b overflow-x-auto select-none no-scrollbar shrink-0"
      style={{
        backgroundColor: 'var(--tg-theme-surface)',
        borderColor: 'var(--tg-theme-border)',
      }}
    >
      {folders.map((folder) => {
        const IconComponent = ICON_MAP[folder.icon] || FolderIcon;
        const isActive = activeFolderId === folder.id;
        const unread = getFolderUnread(folder.id);
        const label = settings.language === 'ar' ? folder.nameAr : folder.name;

        return (
          <button
            key={folder.id}
            id={`folder-tab-${folder.id}`}
            onClick={() => setActiveFolderId(folder.id)}
            className={`relative flex items-center gap-1.5 px-3.5 py-2.5 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors duration-150 border-b-2 ${
              isActive
                ? 'border-[#2481cc] text-[#2481cc] font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            <IconComponent className="w-4 h-4 shrink-0" />
            <span>{label}</span>
            {unread > 0 && (
              <span
                id={`folder-unread-${folder.id}`}
                className={`ml-1 text-[11px] px-1.5 py-0.2 rounded-full font-bold leading-tight ${
                  isActive ? 'bg-[#2481cc] text-white' : 'bg-gray-600 text-gray-200'
                }`}
              >
                {unread}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
