import React, { useRef, useEffect, useState } from 'react';
import { Pin, ArrowDown, X } from 'lucide-react';
import { Message, User } from '../../types/telegram';
import { MessageBubble } from './MessageBubble';
import { getWallpaperStyle, WALLPAPER_PRESETS } from '../../data/wallpapers';

interface MessageListProps {
  messages: Message[];
  membersMap: Record<string, User>;
  onReply: (message: Message) => void;
  onEdit: (message: Message) => void;
  onDelete: (messageId: string) => void;
  onPin: (messageId: string) => void;
  onReact: (messageId: string, emoji: string) => void;
  onVotePoll: (pollId: string, optionId: string) => void;
  onOpenImage: (imageUrl: string) => void;
  onBotButtonClick: (callbackData: string) => void;
  bubbleRadius?: number;
  wallpaper?: string;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  membersMap,
  onReply,
  onEdit,
  onDelete,
  onPin,
  onReact,
  onVotePoll,
  onOpenImage,
  onBotButtonClick,
  bubbleRadius = 16,
  wallpaper = 'default',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [unreadBelowCount, setUnreadBelowCount] = useState(0);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Track scroll position to display the floating down arrow
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 180;
    setShowScrollBottom(isScrolledUp);
    if (!isScrolledUp) {
      setUnreadBelowCount(0);
    }
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollBottom(false);
    setUnreadBelowCount(0);
  };

  const pinnedMessage = messages.slice().reverse().find((m) => m.isPinned);

  const scrollToMessage = (messageId: string) => {
    const el = document.getElementById(`msg-container-${messageId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('scale-[1.03]', 'transition-transform', 'duration-300');
      setTimeout(() => {
        el.classList.remove('scale-[1.03]');
      }, 1200);
    }
  };

  const wallpaperStyle = getWallpaperStyle(wallpaper);
  const presetConfig = WALLPAPER_PRESETS.find((p) => p.id === wallpaper);
  const overlayOpacity = presetConfig?.overlayOpacity ?? (wallpaper.startsWith('http') || wallpaper.startsWith('data:') ? 0.65 : 0.2);

  return (
    <div 
      id="chat-messages-viewport"
      style={wallpaperStyle}
      className="relative flex-1 flex flex-col min-h-0 bg-neutral-950 overflow-hidden transition-all duration-300 font-['Cairo',sans-serif]"
    >
      {/* Dark overlay layer for optimal contrast & text legibility */}
      <div 
        className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-300"
        style={{ opacity: overlayOpacity }}
      />

      {/* Subtle Telegram Pattern Accent */}
      <div 
        className="absolute inset-0 opacity-[0.025] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"
      />

      {/* Pinned Message Sticky Top Banner (Telegram Android style) */}
      {pinnedMessage && (
        <div 
          id="pinned-message-banner"
          onClick={() => scrollToMessage(pinnedMessage.id)}
          className="relative z-10 px-4 py-2 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800 flex items-center justify-between cursor-pointer hover:bg-neutral-900 transition-colors shadow-sm"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-1.5 bg-sky-500/20 text-sky-400 rounded-lg shrink-0">
              <Pin className="w-4 h-4 rotate-45" />
            </div>
            <div className="min-w-0 text-xs">
              <div className="font-bold text-sky-400">Pinned Message</div>
              <div className="truncate text-neutral-300">
                {pinnedMessage.text || (pinnedMessage.attachments ? 'Attachment' : 'Pinned message')}
              </div>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPin(pinnedMessage.id);
            }}
            className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-md cursor-pointer"
            title="Unpin"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Message Thread Scroll View */}
      <div 
        ref={scrollRef}
        id="messages-scroll-container"
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3.5 sm:px-6 py-4 space-y-2.5 custom-scrollbar z-0"
      >
        {/* Telegram Date Separator Header */}
        <div className="flex justify-center my-2 sticky top-2 z-10 pointer-events-none">
          <span className="px-3 py-1 bg-black/45 backdrop-blur-md text-neutral-300 text-[11px] font-bold rounded-full border border-white/10 shadow-xs">
            Today
          </span>
        </div>

        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-neutral-500 text-sm">
            <div className="p-5 bg-neutral-900/80 rounded-3xl border border-neutral-800 text-center max-w-sm shadow-xl">
              <p className="font-bold text-neutral-200 mb-1 text-sm">لا توجد رسائل بعد...</p>
              <p className="text-xs text-neutral-400">أرسل رسالة نصية، صورة، أو تسجيلاً صوتياً لبدء المحادثة فوراً!</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const sender = membersMap[msg.senderId];
            return (
              <MessageBubble
                key={msg.id}
                message={msg}
                sender={sender}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                onPin={onPin}
                onReact={onReact}
                onVotePoll={onVotePoll}
                onOpenImage={onOpenImage}
                onBotButtonClick={onBotButtonClick}
                onScrollToMessage={scrollToMessage}
                bubbleRadius={bubbleRadius}
              />
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Telegram Floating Scroll-To-Bottom FAB with Unread Pill */}
      {showScrollBottom && (
        <button
          id="btn-scroll-to-bottom"
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 z-20 w-11 h-11 rounded-full bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700/80 text-white shadow-2xl flex items-center justify-center transition-all animate-scaleUp cursor-pointer hover:scale-105 active:scale-95 backdrop-blur-md"
          title="Scroll to bottom"
        >
          <ArrowDown className="w-5 h-5 text-sky-400" />
          {unreadBelowCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 bg-sky-500 text-white text-[10px] font-bold rounded-full border border-neutral-900">
              {unreadBelowCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
};
