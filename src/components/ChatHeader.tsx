import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowRight,
  MoreVertical,
  Volume2,
  VolumeX,
  Pin,
  Trash2,
  Users,
  Link,
  Archive,
  ArchiveRestore,
  Shield,
  Bot,
  Eraser,
  Lock,
  X,
  LogOut,
  Clock,
  Phone,
  Video,
  Palette,
} from 'lucide-react';
import { Chat, Message } from '../types';
import { ChatAvatar } from './ChatAvatar';

interface ChatHeaderProps {
  chat: Chat;
  pinnedMessages?: Message[];
  onBack: () => void;
  onMute: (chatId: number, duration: number) => void;
  onPin: (chatId: number, pinned: boolean) => void;
  onArchive: (chatId: number, archive: boolean) => void;
  onClear: (chatId: number) => void;
  onDelete: (chatId: number) => void;
  onLeaveGroup?: (chatId: number) => void;
  onShowMembers: (chatId: number) => void;
  onShowInviteLink: (chatId: number) => void;
  onUnpinMessage?: (chatId: number, messageId: string) => void;
  onOpenVoiceCall?: () => void;
  onOpenVideoCall?: () => void;
  onOpenThemeModal?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  chat,
  pinnedMessages = [],
  onBack,
  onMute,
  onPin,
  onArchive,
  onClear,
  onDelete,
  onLeaveGroup,
  onShowMembers,
  onShowInviteLink,
  onUnpinMessage,
  onOpenVoiceCall,
  onOpenVideoCall,
  onOpenThemeModal,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showMuteSubmenu, setShowMuteSubmenu] = useState(false);
  const [currentPinnedIdx, setCurrentPinnedIdx] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const activePinnedMsg = pinnedMessages[currentPinnedIdx % (pinnedMessages.length || 1)];

  const isGroupOrChannel = chat.type === 'group' || chat.type === 'supergroup' || chat.type === 'channel';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
        setShowMuteSubmenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClearHistory = () => {
    if (confirm('هل أنت تأكد من مسح جميع الرسائل وسجل المحادثة نهائياً؟')) {
      onClear(chat.id);
    }
  };

  const handleDeleteChat = () => {
    if (confirm('هل أنت متاكد من حذف هذه المحادثة تماماً من القائمة؟')) {
      onDelete(chat.id);
    }
  };

  const handleLeaveGroupAction = () => {
    if (confirm(`هل أنت متاكد من المغادرة والخروج من "${chat.title}"؟`)) {
      if (onLeaveGroup) {
        onLeaveGroup(chat.id);
      } else {
        onDelete(chat.id);
      }
    }
  };

  return (
    <div className="flex flex-col border-b border-white/[0.06] bg-[#232e3c] z-10 shadow-sm relative select-none font-['Cairo',sans-serif]">
      {/* Primary Header Bar - Telegram Android Action Bar */}
      <div className="px-3 py-2 flex items-center justify-between text-zinc-100">
        <div className="flex items-center space-x-2.5 space-x-reverse min-w-0 flex-1">
          {/* Mobile Back Button */}
          <button
            onClick={onBack}
            className="md:hidden p-2 text-zinc-300 hover:text-white rounded-full active:bg-white/10 transition-colors"
            title="الرجوع للقائمة"
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Avatar & Title Clickable to view Profile */}
          <div
            onClick={() => {
              if (isGroupOrChannel) {
                onShowMembers(chat.id);
              }
            }}
            className="flex items-center space-x-3 space-x-reverse min-w-0 cursor-pointer flex-1"
          >
            <ChatAvatar
              title={chat.title}
              avatar={chat.avatar}
              type={chat.type}
              size="md"
              isOnline={chat.is_online}
            />

            {/* Title & Subtitle */}
            <div className="min-w-0 flex-1">
              <h2 className="font-bold text-sm text-zinc-100 truncate flex items-center gap-1.5">
                <span>{chat.title}</span>
                {chat.type === 'secret' && <Lock className="w-3.5 h-3.5 text-[#4fae4e]" />}
                {chat.type === 'bot' && <Bot className="w-3.5 h-3.5 text-purple-400" />}
              </h2>
              <div className="text-[11px] text-zinc-400 font-sans truncate flex items-center gap-1">
                {chat.is_muted && <VolumeX className="w-3 h-3 text-rose-400 shrink-0" />}
                <span>
                  {chat.type === 'bot'
                    ? '🤖 بوت متصل بالذكاء الاصطناعي'
                    : chat.type === 'secret'
                    ? '🔐 محادثة سرية مشفرة'
                    : chat.members_count
                    ? `${chat.members_count.toLocaleString()} عضو`
                    : chat.username
                    ? `@${chat.username}`
                    : chat.is_online
                    ? 'متصل الآن'
                    : 'آخر ظهور قريباً'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Header Actions: Voice Call, Video Call, Theme, & Options Menu */}
        <div className="flex items-center gap-0.5">
          {onOpenVoiceCall && (
            <button
              onClick={onOpenVoiceCall}
              className="p-2 text-zinc-300 hover:text-[#50a2e9] active:bg-white/10 rounded-full transition-colors"
              title="إجراء مكالمة صوتية"
            >
              <Phone className="w-5 h-5" />
            </button>
          )}

          {onOpenVideoCall && (
            <button
              onClick={onOpenVideoCall}
              className="p-2 text-zinc-300 hover:text-[#50a2e9] active:bg-white/10 rounded-full transition-colors"
              title="إجراء مكالمة فيديو"
            >
              <Video className="w-5 h-5" />
            </button>
          )}

          {onOpenThemeModal && (
            <button
              onClick={onOpenThemeModal}
              className="p-2 text-zinc-300 hover:text-amber-400 active:bg-white/10 rounded-full transition-colors"
              title="تغيير مظهر المحادثة"
            >
              <Palette className="w-5 h-5" />
            </button>
          )}

          {/* Action Menu Trigger */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => {
                setShowMenu(!showMenu);
                setShowMuteSubmenu(false);
              }}
              className="p-2 text-zinc-300 hover:text-white active:bg-white/10 rounded-full transition-colors"
              title="خيارات المحادثة"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

          {/* Dropdown Menu - Android Material Popup */}
          {showMenu && (
            <div className="absolute left-0 mt-1 w-56 bg-[#17212b] border border-white/[0.08] rounded-xl shadow-2xl py-1 z-50 text-xs font-medium text-zinc-200">
              {chat.members_count && (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onShowMembers(chat.id);
                  }}
                  className="w-full text-right px-3.5 py-2.5 hover:bg-[#242f3d] flex items-center gap-3 transition-colors"
                >
                  <Users className="w-4 h-4 text-[#50a2e9]" />
                  <span>عرض الأعضاء والمشرفين</span>
                </button>
              )}

              <button
                onClick={() => {
                  setShowMenu(false);
                  onShowInviteLink(chat.id);
                }}
                className="w-full text-right px-3.5 py-2.5 hover:bg-[#242f3d] flex items-center gap-3 transition-colors"
              >
                <Link className="w-4 h-4 text-amber-400" />
                <span>استعراض / نسخ رابط الدعوة</span>
              </button>

              {/* Mute Options */}
              <div className="relative">
                <button
                  onClick={() => setShowMuteSubmenu(!showMuteSubmenu)}
                  className="w-full text-right px-3.5 py-2.5 hover:bg-[#242f3d] flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {chat.is_muted ? (
                      <Volume2 className="w-4 h-4 text-[#4fae4e]" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-zinc-400" />
                    )}
                    <span>{chat.is_muted ? 'تفعيل التنبيهات (إلغاء الكتم)' : 'كتم الإشعارات...'}</span>
                  </div>
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                </button>

                {showMuteSubmenu && (
                  <div className="p-1 bg-[#0e1621] border border-white/[0.06] rounded-lg my-1 space-y-0.5 mx-2">
                    {chat.is_muted ? (
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          setShowMuteSubmenu(false);
                          onMute(chat.id, 0);
                        }}
                        className="w-full text-right px-3 py-2 hover:bg-[#242f3d] rounded-lg text-[#4fae4e] font-bold"
                      >
                        🔔 إلغاء كتم الإشعارات
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            setShowMuteSubmenu(false);
                            onMute(chat.id, 3600);
                          }}
                          className="w-full text-right px-3 py-2 hover:bg-[#242f3d] rounded-lg text-zinc-300"
                        >
                          ⏳ كتم لمدة ساعة واحدة
                        </button>
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            setShowMuteSubmenu(false);
                            onMute(chat.id, 28800);
                          }}
                          className="w-full text-right px-3 py-2 hover:bg-[#242f3d] rounded-lg text-zinc-300"
                        >
                          ⏳ كتم لمدة 8 ساعات
                        </button>
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            setShowMuteSubmenu(false);
                            onMute(chat.id, 172800);
                          }}
                          className="w-full text-right px-3 py-2 hover:bg-[#242f3d] rounded-lg text-zinc-300"
                        >
                          ⏳ كتم لمدة يومين (48 ساعة)
                        </button>
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            setShowMuteSubmenu(false);
                            onMute(chat.id, -1);
                          }}
                          className="w-full text-right px-3 py-2 hover:bg-[#242f3d] rounded-lg text-rose-400 font-bold"
                        >
                          🔕 كتم الصوت دائماً
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setShowMenu(false);
                  onPin(chat.id, !chat.is_pinned);
                }}
                className="w-full text-right px-3.5 py-2.5 hover:bg-[#242f3d] flex items-center gap-3 transition-colors"
              >
                <Pin className="w-4 h-4 text-amber-400" />
                <span>{chat.is_pinned ? 'إلغاء تثبيت المحادثة' : 'تثبيت المحادثة بالمقدمة'}</span>
              </button>

              <button
                onClick={() => {
                  setShowMenu(false);
                  onArchive(chat.id, !chat.is_archived);
                }}
                className="w-full text-right px-3.5 py-2.5 hover:bg-[#242f3d] flex items-center gap-3 transition-colors"
              >
                {chat.is_archived ? (
                  <>
                    <ArchiveRestore className="w-4 h-4 text-[#50a2e9]" />
                    <span>إخراج من الأرشيف</span>
                  </>
                ) : (
                  <>
                    <Archive className="w-4 h-4 text-[#50a2e9]" />
                    <span>أرشفة المحادثة</span>
                  </>
                )}
              </button>

              <div className="my-1 border-t border-white/[0.06]" />

              {/* Leave Group Option */}
              {isGroupOrChannel && (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    handleLeaveGroupAction();
                  }}
                  className="w-full text-right px-3.5 py-2.5 hover:bg-[#242f3d] text-orange-400 flex items-center gap-3 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{chat.type === 'channel' ? 'المغادرة والخروج من القناة' : 'الخروج من المجموعة'}</span>
                </button>
              )}

              <button
                onClick={() => {
                  setShowMenu(false);
                  handleClearHistory();
                }}
                className="w-full text-right px-3.5 py-2.5 hover:bg-[#242f3d] text-amber-400 flex items-center gap-3 transition-colors"
              >
                <Eraser className="w-4 h-4" />
                <span>مسح سجل المحادثة</span>
              </button>

              <button
                onClick={() => {
                  setShowMenu(false);
                  handleDeleteChat();
                }}
                className="w-full text-right px-3.5 py-2.5 hover:bg-[#242f3d] text-rose-400 flex items-center gap-3 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>حذف الدردشة بالكامل</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>

      {/* Pinned Messages Banner Bar (Telegram Android Style) */}
      {pinnedMessages.length > 0 && activePinnedMsg && (
        <div className="bg-[#17212b] border-t border-white/[0.06] px-4 py-2 flex items-center justify-between transition-colors text-xs border-r-[3px] border-r-[#50a2e9]">
          <div
            className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer group"
            onClick={() => setCurrentPinnedIdx((prev) => prev + 1)}
            title="انقر للتنقل بين الرسائل المثبتة"
          >
            <Pin className="w-4 h-4 text-[#50a2e9] shrink-0 rotate-45 group-hover:scale-110 transition-transform" />
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold text-[#50a2e9] flex items-center gap-1">
                <span>رسالة مثبتة</span>
                {pinnedMessages.length > 1 && (
                  <span className="text-[10px] text-zinc-400 font-mono">
                    ({(currentPinnedIdx % pinnedMessages.length) + 1}/{pinnedMessages.length})
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-300 truncate font-sans">
                <span className="text-[#50a2e9] font-medium">{activePinnedMsg.sender_name}: </span>
                {activePinnedMsg.content.type === 'text'
                  ? activePinnedMsg.content.text
                  : activePinnedMsg.content.caption || `[${activePinnedMsg.content.type.toUpperCase()}]`}
              </p>
            </div>
          </div>

          <button
            onClick={() => onUnpinMessage?.(chat.id, activePinnedMsg.id)}
            className="p-1 text-zinc-400 hover:text-rose-400 rounded-full hover:bg-white/10 transition-colors shrink-0 mr-2"
            title="إلغاء تثبيت هذه الرسالة"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
