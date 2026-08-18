import React, { useState, useEffect, useRef } from 'react';

export const TELEGRAM_POPULAR_REACTIONS = [
  '⭐', '👍', '❤️', '🔥', '👏', '🎉', '🤩', '🙏', '👌',
  '🕊️', '😍', '🐳', '🥰', '⚡', '💯', '🤔', '🤣',
  '😢', '😮', '🤡', '🤷‍♂️', '🤝', '🏆', '💔', '🍓'
];

interface ReactionPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectReaction: (emoji: string) => void;
  position?: { x: number; y: number } | null;
  activeEmojis?: string[];
  lang?: 'ar' | 'en';
}

export const ReactionPicker: React.FC<ReactionPickerProps> = ({
  isOpen,
  onClose,
  onSelectReaction,
  position,
  activeEmojis = [],
  lang = 'ar',
}) => {
  const [expanded, setExpanded] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Calculate safe positioned coordinates
  const posX = position ? Math.min(Math.max(16, position.x), window.innerWidth - (expanded ? 340 : 280)) : 100;
  const posY = position ? Math.min(Math.max(16, position.y - (expanded ? 160 : 54)), window.innerHeight - 200) : 100;

  const displayList = expanded ? TELEGRAM_POPULAR_REACTIONS : TELEGRAM_POPULAR_REACTIONS.slice(0, 8);

  return (
    <div
      ref={pickerRef}
      className={`tg-reaction-picker-float ${expanded ? 'expanded' : ''}`}
      style={{
        top: posY,
        left: posX,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="tg-reaction-picker-inner">
        {displayList.map((emoji) => {
          const isActive = activeEmojis.includes(emoji);
          return (
            <button
              key={emoji}
              className={`tg-reaction-item-btn ${isActive ? 'active' : ''}`}
              onClick={() => {
                onSelectReaction(emoji);
                onClose();
              }}
              title={isActive ? (lang === 'ar' ? 'إلغاء التفاعل' : 'Remove reaction') : (lang === 'ar' ? `تفاعل بـ ${emoji}` : `React with ${emoji}`)}
            >
              <span className="tg-react-emoji">{emoji}</span>
            </button>
          );
        })}

        <button
          className="tg-reaction-expand-btn"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          title={expanded ? (lang === 'ar' ? 'تصغير' : 'Less') : (lang === 'ar' ? 'المزيد من التفاعلات' : 'More reactions')}
        >
          <i className={`fas ${expanded ? 'fa-chevron-left' : 'fa-plus'}`} />
        </button>
      </div>
    </div>
  );
};
