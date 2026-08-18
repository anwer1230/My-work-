import React, { useState, useEffect } from 'react';
import { 
  X, 
  Heart, 
  Send, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  Share2, 
  MoreVertical 
} from 'lucide-react';
import { UserStory } from '../../types/telegram';
import { Language, translations } from '../../utils/i18n';

interface StoryViewerModalProps {
  story: UserStory | null;
  onClose: () => void;
  onSendReply: (storyId: string, text: string) => void;
  lang: Language;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  story,
  onClose,
  onSendReply,
  lang,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [liked, setLiked] = useState(false);

  const t = translations[lang];

  useEffect(() => {
    if (!story) return;
    setCurrentIdx(0);
    setProgress(0);
    setLiked(false);
  }, [story]);

  // Story progress timer
  useEffect(() => {
    if (!story || isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentIdx < story.stories.length - 1) {
            setCurrentIdx((i) => i + 1);
            return 0;
          } else {
            clearInterval(interval);
            onClose();
            return 100;
          }
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [story, currentIdx, isPaused, onClose]);

  if (!story) return null;

  const currentItem = story.stories[currentIdx] || story.stories[0];

  const handleNext = () => {
    if (currentIdx < story.stories.length - 1) {
      setCurrentIdx((i) => i + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((i) => i - 1);
      setProgress(0);
    }
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onSendReply(story.id, replyText);
    setReplyText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md select-none">
      <div 
        className="relative w-full max-w-sm h-full max-h-[92vh] md:max-h-[85vh] bg-neutral-950 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Top Progress Bars */}
        <div className="absolute top-3 inset-x-3 z-30 flex gap-1.5">
          {story.stories.map((s, idx) => (
            <div key={s.id} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-100"
                style={{
                  width: idx < currentIdx ? '100%' : idx === currentIdx ? `${progress}%` : '0%'
                }}
              />
            </div>
          ))}
        </div>

        {/* Top User Info & Controls */}
        <div className="absolute top-7 inset-x-3 z-30 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            {story.user.avatar ? (
              <img
                src={story.user.avatar}
                alt={story.user.name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-white/50"
              />
            ) : (
              <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${story.user.avatarColor || 'from-sky-500 to-indigo-600'} flex items-center justify-center font-bold text-xs ring-2 ring-white/50`}>
                {story.user.name.charAt(0)}
              </div>
            )}
            <div>
              <div className="text-xs font-bold leading-tight">{story.user.name}</div>
              <div className="text-[10px] text-white/70">{currentItem.timestamp}</div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onClose}
              className="p-1.5 bg-black/40 hover:bg-black/60 rounded-full text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Story Media */}
        <div className="relative flex-1 w-full h-full flex items-center justify-center bg-neutral-900 overflow-hidden">
          <img
            src={currentItem.mediaUrl}
            alt="Story content"
            className="w-full h-full object-cover"
          />

          {/* Left/Right Click Nav Overlay */}
          <div className="absolute inset-0 flex">
            <div className="w-1/3 h-full cursor-pointer" onClick={handlePrev} />
            <div className="w-2/3 h-full cursor-pointer" onClick={handleNext} />
          </div>

          {/* Caption Overlay */}
          {currentItem.caption && (
            <div className="absolute bottom-16 inset-x-4 z-20 bg-black/60 backdrop-blur-md p-3 rounded-2xl text-white text-xs font-medium text-center shadow-lg">
              {currentItem.caption}
            </div>
          )}
        </div>

        {/* Bottom Reaction & Reply Bar */}
        <div className="absolute bottom-3 inset-x-3 z-30 flex items-center gap-2">
          <form onSubmit={handleReplySubmit} className="flex-1 flex items-center bg-black/50 backdrop-blur-md border border-white/20 rounded-full px-3 py-1.5">
            <input
              type="text"
              placeholder={t.replyToStory}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="flex-1 bg-transparent text-white text-xs placeholder-white/60 focus:outline-hidden"
            />
            {replyText.trim() && (
              <button type="submit" className="text-sky-400 p-1 hover:text-sky-300">
                <Send className="w-4 h-4" />
              </button>
            )}
          </form>

          <button
            onClick={() => setLiked(!liked)}
            className={`p-2.5 rounded-full backdrop-blur-md border transition-transform active:scale-125 ${
              liked 
                ? 'bg-rose-500/80 border-rose-400 text-white' 
                : 'bg-black/50 border-white/20 text-white hover:text-rose-400'
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
