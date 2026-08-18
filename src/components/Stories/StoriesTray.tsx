import React from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { UserStory, User } from '../../types/telegram';
import { Language, translations } from '../../utils/i18n';

interface StoriesTrayProps {
  stories: UserStory[];
  currentUser: User;
  onOpenStory: (story: UserStory) => void;
  onOpenAddStory: () => void;
  lang: Language;
}

export const StoriesTray: React.FC<StoriesTrayProps> = ({
  stories,
  currentUser,
  onOpenStory,
  onOpenAddStory,
  lang,
}) => {
  const t = translations[lang];

  return (
    <div 
      id="telegram-stories-tray"
      className="py-2.5 px-3 bg-neutral-950/60 border-b border-neutral-800/60 flex items-center gap-3 overflow-x-auto custom-scrollbar shrink-0 select-none"
    >
      {/* Add My Story Button */}
      <button
        onClick={onOpenAddStory}
        className="flex flex-col items-center gap-1 shrink-0 group focus:outline-hidden"
      >
        <div className="relative">
          {currentUser.avatar ? (
            <img
              src={currentUser.avatar}
              alt="My Avatar"
              className="w-13 h-13 rounded-full object-cover ring-2 ring-neutral-800 group-hover:ring-sky-500 transition-all"
            />
          ) : (
            <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold text-base flex items-center justify-center ring-2 ring-neutral-800 group-hover:ring-sky-500 transition-all">
              {currentUser.name.charAt(0)}
            </div>
          )}
          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center border-2 border-neutral-900 shadow-md group-hover:scale-110 transition-transform">
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        </div>
        <span className="text-[11px] text-neutral-300 font-medium max-w-[56px] truncate">
          {t.myStory}
        </span>
      </button>

      {/* Other Stories */}
      {stories.map((story) => (
        <button
          key={story.id}
          onClick={() => onOpenStory(story)}
          className="flex flex-col items-center gap-1 shrink-0 group focus:outline-hidden"
        >
          <div className={`relative p-0.5 rounded-full transition-transform group-hover:scale-105 ${
            story.isViewed
              ? 'ring-2 ring-neutral-700'
              : 'bg-gradient-to-tr from-sky-400 via-indigo-500 to-fuchsia-500 p-[2px]'
          }`}>
            <div className="bg-neutral-900 rounded-full p-[2px]">
              {story.user.avatar ? (
                <img
                  src={story.user.avatar}
                  alt={story.user.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className={`w-12 h-12 rounded-full bg-gradient-to-tr ${story.user.avatarColor || 'from-emerald-500 to-teal-700'} text-white font-bold text-sm flex items-center justify-center`}>
                  {story.user.name.charAt(0)}
                </div>
              )}
            </div>
          </div>
          <span className="text-[11px] text-neutral-300 font-medium max-w-[56px] truncate">
            {story.user.name.split(' ')[0]}
          </span>
        </button>
      ))}
    </div>
  );
};
