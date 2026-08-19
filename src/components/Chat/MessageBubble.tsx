import React, { useState, useEffect, useRef } from 'react';
import { 
  Check, 
  CheckCheck, 
  Play, 
  Pause, 
  Download, 
  FileText, 
  Eye, 
  MessageCircle, 
  CornerUpLeft, 
  Copy, 
  Trash2, 
  Edit3, 
  Pin, 
  Smile, 
  MoreHorizontal,
  Music,
  BarChart2,
  CheckCircle2,
  HelpCircle,
  Clock,
  Forward,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Message, User } from '../../types/telegram';
import { sounds } from '../../utils/audio';

interface MessageBubbleProps {
  message: Message;
  sender?: User;
  onReply: (message: Message) => void;
  onEdit?: (message: Message) => void;
  onDelete: (messageId: string) => void;
  onPin: (messageId: string) => void;
  onReact: (messageId: string, emoji: string) => void;
  onVotePoll?: (pollId: string, optionId: string) => void;
  onOpenImage?: (imageUrl: string) => void;
  onBotButtonClick?: (callbackData: string) => void;
  onScrollToMessage?: (messageId: string) => void;
  bubbleRadius?: number;
}

const COMMON_REACTIONS = ['❤️', '👍', '🔥', '🎉', '👏', '😂', '🤯', '⚡', '🤩', '💩'];

// Deterministic Telegram User Color Palette for sender names in groups
const USER_COLORS = [
  'text-rose-400',
  'text-sky-400',
  'text-emerald-400',
  'text-amber-400',
  'text-purple-400',
  'text-pink-400',
  'text-teal-400',
  'text-indigo-400'
];

function getUserColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % USER_COLORS.length;
  return USER_COLORS[index];
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  sender,
  onReply,
  onEdit,
  onDelete,
  onPin,
  onReact,
  onVotePoll,
  onOpenImage,
  onBotButtonClick,
  onScrollToMessage,
  bubbleRadius = 16,
}) => {
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [voiceProgress, setVoiceProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.5 | 2>(1);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showQuickReactions, setShowQuickReactions] = useState(false);

  // Telegram Swipe-to-Reply Gesture State
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const longPressTimerRef = useRef<any>(null);
  const didTriggerReplyRef = useRef(false);

  const isOutgoing = message.isOutgoing;

  // Voice note playback simulation
  useEffect(() => {
    let interval: number;
    if (isPlayingVoice) {
      interval = window.setInterval(() => {
        setVoiceProgress((prev) => {
          if (prev >= 100) {
            setIsPlayingVoice(false);
            return 0;
          }
          return prev + (1.5 * playbackSpeed);
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlayingVoice, playbackSpeed]);

  const toggleVoicePlay = () => {
    setIsPlayingVoice(!isPlayingVoice);
    if (!isPlayingVoice && voiceProgress === 0) {
      sounds.playSent();
    }
  };

  const handleSpeedToggle = () => {
    setPlaybackSpeed((prev) => (prev === 1 ? 1.5 : prev === 1.5 ? 2 : 1));
  };

  const handleCopyText = () => {
    if (message.text) {
      navigator.clipboard.writeText(message.text);
    }
    setShowContextMenu(false);
  };

  const handleReactionClick = (emoji: string) => {
    sounds.playReact();
    if (emoji === '🎉' || emoji === '🔥' || emoji === '❤️') {
      try {
        confetti({
          particleCount: 35,
          spread: 65,
          origin: { y: 0.7 },
        });
      } catch {
        // Silently catch
      }
    }
    onReact(message.id, emoji);
    setShowQuickReactions(false);
    setShowContextMenu(false);
  };

  // Touch Swipe-to-Reply Handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    setIsSwiping(false);
    didTriggerReplyRef.current = false;

    // Telegram Long-Press to show Reactions + Context Menu
    longPressTimerRef.current = setTimeout(() => {
      setShowQuickReactions(true);
      setShowContextMenu(true);
      if (navigator.vibrate) navigator.vibrate(35);
    }, 480);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStartXRef.current;
    const diffY = currentY - touchStartYRef.current;

    // If scrolling vertically, cancel swipe gesture
    if (Math.abs(diffY) > Math.abs(diffX) && !isSwiping) {
      clearTimeout(longPressTimerRef.current);
      return;
    }

    if (Math.abs(diffX) > 8) {
      clearTimeout(longPressTimerRef.current);
      setIsSwiping(true);

      // Swiping horizontally with elastic damping: max 75px
      const direction = isOutgoing ? -1 : -1; // Drag left
      let distance = diffX;
      if (Math.abs(distance) > 75) {
        distance = Math.sign(distance) * (75 + Math.sqrt(Math.abs(distance) - 75) * 2);
      }
      setSwipeOffset(distance);

      // Haptic threshold feedback for reply
      if (Math.abs(distance) >= 50 && !didTriggerReplyRef.current) {
        didTriggerReplyRef.current = true;
        if (navigator.vibrate) navigator.vibrate(20);
      }
    }
  };

  const handleTouchEnd = () => {
    clearTimeout(longPressTimerRef.current);
    if (isSwiping && Math.abs(swipeOffset) >= 45) {
      sounds.playSent();
      onReply(message);
    }
    setSwipeOffset(0);
    setIsSwiping(false);
  };

  const renderFormattedText = (text: string) => {
    if (!text) return null;

    const lines = text.split('\n');
    return lines.map((line, lIdx) => {
      if (line.startsWith('`') && line.endsWith('`') && line.length > 2) {
        return (
          <div key={lIdx} className="my-1.5 p-2 bg-black/40 border border-white/10 rounded-lg font-mono text-xs text-sky-300 overflow-x-auto selection:bg-sky-500/30">
            {line.replace(/^`|`$/g, '')}
          </div>
        );
      }

      const parts = line.split(/(\*\*.*?\*\*|`.*?`|https?:\/\/[^\s]+)/g);
      return (
        <span key={lIdx} className="block leading-relaxed">
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={pIdx} className="font-bold">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('`') && part.endsWith('`')) {
              return <code key={pIdx} className="px-1.5 py-0.5 rounded bg-black/30 text-sky-300 font-mono text-xs">{part.slice(1, -1)}</code>;
            }
            if (part.startsWith('http://') || part.startsWith('https://')) {
              return (
                <a 
                  key={pIdx} 
                  href={part} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-sky-300 underline underline-offset-2 hover:text-sky-200 transition-colors break-all"
                >
                  {part}
                </a>
              );
            }
            return part;
          })}
        </span>
      );
    });
  };

  const senderColor = sender ? getUserColor(sender.id) : 'text-sky-400';
  const replyActive = Math.abs(swipeOffset) >= 45;

  return (
    <div 
      id={`msg-container-${message.id}`}
      className={`group relative flex flex-col my-1 select-text transition-all ${
        isOutgoing ? 'items-end' : 'items-start'
      }`}
      onContextMenu={(e) => {
        e.preventDefault();
        setShowContextMenu(true);
        setShowQuickReactions(true);
      }}
    >
      {/* Telegram Floating Quick Reactions Bar on Desktop Hover */}
      <div 
        className={`absolute -top-3 opacity-0 group-hover:opacity-100 transition-opacity z-20 hidden md:flex items-center gap-1 bg-neutral-900/95 border border-neutral-700/80 rounded-full px-2 py-1 shadow-2xl backdrop-blur-md ${
          isOutgoing ? 'right-4' : 'left-4'
        }`}
      >
        <button
          onClick={() => handleReactionClick('❤️')}
          className="hover:scale-130 active:scale-95 transition-transform text-sm p-0.5 cursor-pointer"
          title="Heart"
        >
          ❤️
        </button>
        <button
          onClick={() => handleReactionClick('👍')}
          className="hover:scale-130 active:scale-95 transition-transform text-sm p-0.5 cursor-pointer"
          title="Thumbs Up"
        >
          👍
        </button>
        <button
          onClick={() => handleReactionClick('🔥')}
          className="hover:scale-130 active:scale-95 transition-transform text-sm p-0.5 cursor-pointer"
          title="Fire"
        >
          🔥
        </button>
        <button
          onClick={() => handleReactionClick('🎉')}
          className="hover:scale-130 active:scale-95 transition-transform text-sm p-0.5 cursor-pointer"
          title="Party"
        >
          🎉
        </button>
        <button
          onClick={() => setShowQuickReactions(!showQuickReactions)}
          className="text-neutral-400 hover:text-neutral-200 p-0.5 cursor-pointer"
          title="More reactions"
        >
          <Smile className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onReply(message)}
          className="text-neutral-400 hover:text-neutral-200 p-0.5 cursor-pointer"
          title="Reply"
        >
          <CornerUpLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Telegram Floating Reactions Pill Bar (Mobile & Contextual) */}
      {showQuickReactions && (
        <div 
          className={`absolute -top-10 z-40 flex items-center gap-2 bg-neutral-950/95 border border-neutral-700/90 rounded-full px-3.5 py-2 shadow-2xl backdrop-blur-md animate-scaleUp ${
            isOutgoing ? 'right-2' : 'left-2'
          }`}
        >
          {COMMON_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReactionClick(emoji)}
              className="text-xl hover:scale-135 active:scale-90 transition-transform cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Swipe-to-Reply Spring Indicator (Revealed Behind the Bubble) */}
      <div 
        className={`absolute inset-y-0 flex items-center justify-center pointer-events-none transition-all duration-200 ${
          isOutgoing ? 'right-2' : 'right-2'
        }`}
        style={{
          opacity: Math.min(1, Math.abs(swipeOffset) / 45),
          transform: `scale(${replyActive ? 1.15 : 0.85}) rotate(${replyActive ? -15 : 0}deg)`
        }}
      >
        <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-colors ${
          replyActive ? 'bg-sky-500 text-white' : 'bg-neutral-800 text-neutral-400'
        }`}>
          <CornerUpLeft className="w-5 h-5" />
        </div>
      </div>

      {/* Actual Message Bubble (With Telegram Rounded geometry and Tail) */}
      <div 
        id={`msg-bubble-${message.id}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ 
          borderRadius: `${bubbleRadius}px`,
          transform: `translateX(${swipeOffset}px)`,
          transition: isSwiping ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)'
        }}
        className={`relative max-w-[85%] md:max-w-[72%] px-3.5 py-2.5 shadow-sm text-sm select-text transition-colors ${
          isOutgoing 
            ? 'bg-sky-600 text-white rounded-br-xs' 
            : 'bg-neutral-800 text-neutral-100 rounded-bl-xs border border-neutral-700/50'
        }`}
      >
        {/* Sender Name in groups/channels */}
        {!isOutgoing && sender && sender.id !== 'saved' && (
          <div className={`font-bold text-xs ${senderColor} mb-1 flex items-center gap-1 cursor-pointer hover:underline`}>
            {sender.name}
            {sender.isVerified && (
              <span className="w-3 h-3 bg-sky-500 text-neutral-950 rounded-full inline-flex items-center justify-center text-[8px] font-bold">✓</span>
            )}
          </div>
        )}

        {/* Reply quote banner */}
        {message.replyTo && (
          <div 
            onClick={() => message.replyTo && onScrollToMessage?.(message.replyTo.id)}
            className={`mb-2 pl-2.5 py-1 border-l-2 text-xs rounded-r-md cursor-pointer transition-colors ${
              isOutgoing
                ? 'border-white/70 bg-white/10 hover:bg-white/15 text-sky-100'
                : 'border-sky-500 bg-sky-500/10 hover:bg-sky-500/15 text-neutral-300'
            }`}
          >
            <div className="font-bold text-[11px] text-sky-300">{message.replyTo.senderName}</div>
            <div className="truncate text-neutral-200">{message.replyTo.text}</div>
          </div>
        )}

        {/* Forwarded banner */}
        {message.forwardFrom && (
          <div className="mb-1 text-[11px] italic text-neutral-400 flex items-center gap-1">
            <CornerUpLeft className="w-3 h-3 rotate-180 inline" />
            <span>Forwarded from <strong>{message.forwardFrom.name}</strong></span>
          </div>
        )}

        {/* Photo Attachment */}
        {message.attachments?.map((att, idx) => {
          if (att.type === 'photo') {
            return (
              <div key={idx} className="mb-2 rounded-xl overflow-hidden cursor-pointer group/img relative">
                <img 
                  src={att.url} 
                  alt={att.fileName || 'Attachment'}
                  className="max-h-85 w-auto rounded-xl object-cover transition-transform group-hover/img:scale-[1.01]"
                  onClick={() => onOpenImage?.(att.url)}
                />
              </div>
            );
          }

          if (att.type === 'voice') {
            return (
              <div key={idx} className="mb-1 flex items-center gap-3 min-w-56 py-1">
                <button
                  onClick={toggleVoicePlay}
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-md ${
                    isOutgoing
                      ? 'bg-white text-sky-600 hover:bg-sky-50'
                      : 'bg-sky-500 text-white hover:bg-sky-400'
                  }`}
                >
                  {isPlayingVoice ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                </button>

                <div className="flex-1 min-w-0">
                  {/* Visual Waveform Bar */}
                  <div 
                    className="flex items-center gap-0.5 h-7 cursor-pointer" 
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const pct = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
                      setVoiceProgress(pct);
                    }}
                  >
                    {(att.waveform || [25, 45, 65, 85, 55, 35, 75, 95, 45, 65, 85, 35, 55, 75, 45, 25, 60, 40, 80, 50]).map((val, wIdx, arr) => {
                      const pct = (wIdx / arr.length) * 100;
                      const isPast = pct <= voiceProgress;
                      return (
                        <div
                          key={wIdx}
                          style={{ height: `${Math.max(18, val)}%` }}
                          className={`w-1 rounded-full transition-colors ${
                            isPast
                              ? isOutgoing ? 'bg-white' : 'bg-sky-400'
                              : isOutgoing ? 'bg-white/40' : 'bg-neutral-600'
                          }`}
                        />
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between text-[11px] opacity-85 mt-0.5 font-mono">
                    <span>
                      {isPlayingVoice
                        ? `0:${Math.floor((att.duration || 20) * (voiceProgress / 100)).toString().padStart(2, '0')}`
                        : `0:${(att.duration || 20).toString().padStart(2, '0')}`}
                    </span>
                    <button
                      onClick={handleSpeedToggle}
                      className="px-1.5 py-0.2 bg-black/20 rounded-md text-[10px] font-bold hover:bg-black/40 cursor-pointer"
                    >
                      {playbackSpeed}x
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          if (att.type === 'document' || att.type === 'audio') {
            return (
              <div 
                key={idx}
                className={`mb-2 p-2.5 rounded-xl flex items-center gap-3 ${
                  isOutgoing ? 'bg-white/10' : 'bg-neutral-900/60 border border-neutral-700/60'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-sky-500 text-white shrink-0 shadow-xs">
                  {att.type === 'audio' ? <Music className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs truncate">{att.fileName || 'Document.pdf'}</div>
                  <div className="text-[11px] opacity-75">{att.fileSize || '3.2 MB'}</div>
                </div>
                <button
                  onClick={() => alert(`Simulating download for ${att.fileName || 'file'}`)}
                  className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            );
          }

          return null;
        })}

        {/* Interactive Poll */}
        {message.poll && (
          <div className="my-2 p-1 space-y-2.5 min-w-64 max-w-sm">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-300">
              <BarChart2 className="w-4 h-4" />
              <span>{message.poll.isAnonymous ? 'Anonymous Poll' : 'Public Poll'}</span>
            </div>

            <h4 className="font-semibold text-sm leading-snug">{message.poll.question}</h4>

            <div className="space-y-2">
              {message.poll.options.map((opt) => {
                const total = message.poll?.totalVotes || 0;
                const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
                const hasVoted = opt.voters.includes('me');

                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      onVotePoll?.(message.poll!.id, opt.id);
                      if (message.poll?.isQuiz && opt.id === message.poll.correctOptionId) {
                        try {
                          confetti({ particleCount: 40, spread: 60 });
                        } catch {}
                      }
                    }}
                    className={`w-full text-left relative overflow-hidden p-2.5 rounded-xl border transition-all cursor-pointer ${
                      hasVoted
                        ? 'border-sky-400 bg-sky-500/20'
                        : isOutgoing
                        ? 'border-white/20 hover:bg-white/10'
                        : 'border-neutral-700 hover:bg-neutral-700/50'
                    }`}
                  >
                    <div 
                      style={{ width: `${pct}%` }} 
                      className={`absolute top-0 bottom-0 left-0 transition-all duration-500 opacity-25 ${
                        hasVoted ? 'bg-sky-400' : isOutgoing ? 'bg-white' : 'bg-sky-500'
                      }`}
                    />

                    <div className="relative flex items-center justify-between z-10">
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        {hasVoted ? (
                          <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-neutral-400 shrink-0" />
                        )}
                        <span className="text-xs font-medium truncate">{opt.text}</span>
                      </div>
                      <span className="text-xs font-bold shrink-0">{pct}%</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="text-[11px] opacity-75 text-right font-mono">
              {message.poll.totalVotes} {message.poll.totalVotes === 1 ? 'vote' : 'votes'}
            </div>
          </div>
        )}

        {/* Message Text Content */}
        {message.text && (
          <div className="space-y-1 break-words font-normal">
            {renderFormattedText(message.text)}
          </div>
        )}

        {/* Bot Inline Keyboard Buttons */}
        {message.inlineButtons && message.inlineButtons.length > 0 && (
          <div className="mt-2.5 pt-1.5 space-y-1.5 border-t border-white/10">
            {message.inlineButtons.map((row, rIdx) => (
              <div key={rIdx} className="flex gap-1.5">
                {row.map((btn, bIdx) => (
                  <button
                    key={bIdx}
                    onClick={() => {
                      if (btn.callbackData) {
                        onBotButtonClick?.(btn.callbackData);
                      } else if (btn.url) {
                        window.open(btn.url, '_blank');
                      }
                    }}
                    className="flex-1 py-2 px-3 bg-neutral-900/80 hover:bg-neutral-900 active:scale-98 border border-neutral-700/80 text-sky-300 font-bold text-xs rounded-xl shadow-xs transition-all text-center cursor-pointer"
                  >
                    {btn.text}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Message Footer: Timestamp, Views, Edited, and Double-tick */}
        <div className="flex items-center justify-end gap-1.5 mt-1 text-[11px] select-none opacity-80 float-right ml-2 -mb-0.5 font-mono">
          {message.views !== undefined && (
            <span className="flex items-center gap-0.5">
              <Eye className="w-3 h-3" />
              <span>{message.views > 999 ? `${(message.views / 1000).toFixed(1)}k` : message.views}</span>
            </span>
          )}

          {message.isEdited && <span className="italic font-sans">edited</span>}

          <span>{message.timestamp}</span>

          {isOutgoing && (
            <span className="inline-flex items-center ml-0.5">
              {message.status === 'read' ? (
                <CheckCheck className="w-3.5 h-3.5 text-white" />
              ) : message.status === 'sent' ? (
                <Check className="w-3.5 h-3.5 text-white/80" />
              ) : (
                <Clock className="w-3 h-3 animate-spin" />
              )}
            </span>
          )}
        </div>

        <div className="clear-both" />
      </div>

      {/* Reactions Row below the bubble */}
      {message.reactions && message.reactions.length > 0 && (
        <div className={`flex flex-wrap gap-1 mt-1 z-10 ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
          {message.reactions.map((react) => {
            const hasReacted = react.users.includes('me');
            return (
              <button
                key={react.emoji}
                onClick={() => handleReactionClick(react.emoji)}
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                  hasReacted
                    ? 'bg-sky-500/25 border-sky-400 text-sky-300 shadow-xs scale-105'
                    : 'bg-neutral-800/80 border-neutral-700 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                <span>{react.emoji}</span>
                <span className="font-mono text-[11px]">{react.count}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Context Menu Modal / Dropdown */}
      {showContextMenu && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => {
              setShowContextMenu(false);
              setShowQuickReactions(false);
            }} 
          />
          <div 
            className={`absolute top-full mt-1.5 z-50 bg-neutral-950/95 border border-neutral-800 rounded-2xl shadow-2xl py-1.5 w-48 text-xs font-medium text-neutral-200 backdrop-blur-md animate-scaleUp ${
              isOutgoing ? 'right-0' : 'left-0'
            }`}
          >
            <button
              onClick={() => {
                onReply(message);
                setShowContextMenu(false);
                setShowQuickReactions(false);
              }}
              className="w-full px-3.5 py-2 text-left hover:bg-neutral-800 flex items-center gap-2.5 cursor-pointer"
            >
              <CornerUpLeft className="w-4 h-4 text-sky-400" />
              <span>Reply</span>
            </button>

            {message.text && (
              <button
                onClick={handleCopyText}
                className="w-full px-3.5 py-2 text-left hover:bg-neutral-800 flex items-center gap-2.5 cursor-pointer"
              >
                <Copy className="w-4 h-4 text-neutral-400" />
                <span>Copy Text</span>
              </button>
            )}

            {isOutgoing && onEdit && message.text && (
              <button
                onClick={() => {
                  onEdit(message);
                  setShowContextMenu(false);
                  setShowQuickReactions(false);
                }}
                className="w-full px-3.5 py-2 text-left hover:bg-neutral-800 flex items-center gap-2.5 cursor-pointer"
              >
                <Edit3 className="w-4 h-4 text-emerald-400" />
                <span>Edit</span>
              </button>
            )}

            <button
              onClick={() => {
                onPin(message.id);
                setShowContextMenu(false);
                setShowQuickReactions(false);
              }}
              className="w-full px-3.5 py-2 text-left hover:bg-neutral-800 flex items-center gap-2.5 cursor-pointer"
            >
              <Pin className="w-4 h-4 text-amber-400" />
              <span>{message.isPinned ? 'Unpin' : 'Pin'}</span>
            </button>

            <button
              onClick={() => {
                onDelete(message.id);
                setShowContextMenu(false);
                setShowQuickReactions(false);
              }}
              className="w-full px-3.5 py-2 text-left hover:bg-red-500/20 text-red-400 flex items-center gap-2.5 border-t border-neutral-800/80 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
