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
  onMute: (chatId: string | number, duration: number) => void;
  onPin: (chatId: string | number, pinned: boolean) => void;
  onArchive: (chatId: string | number, archive: boolean) => void;
  onClear: (chatId: string | number) => void;
  onDelete: (chatId: string | number) => void;
  onLeaveGroup?: (chatId: string | number) => void;
  onShowMembers: (chatId: string | number) => void;
  onShowInviteLink: (chatId: string | number) => void;
  onUnpinMessage?: (chatId: string | number, messageId: string | number) => void;
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
    <div className="flex flex-col border-b border-slate-800 bg-slate-900 z-10 shadow-sm relative select-none">
      {/* Primary Header Bar */}
      <div className="px-4 py-2.5 flex items-center justify-between text-slate-100">
        <div className="flex items-center space-x-3 space-x-reverse min-w-0">
          {/* Mobile Back Button */}
          <button
            onClick={onBack}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="الرجوع للقائمة"
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Avatar */}
          <ChatAvatar
            title={chat.title}
            avatar={chat.avatar}
            type={chat.type}
            size="md"
            isOnline={chat.is_online}
          />

          {/* Title & Subtitle */}
          <div className="min-w-0">
            <h2 className="font-bold text-sm text-slate-100 truncate flex items-center gap-1.5">
              <span>{chat.title}</span>
              {chat.type === 'secret' && <Lock className="w-3.5 h-3.5 text-emerald-400" />}
              {chat.type === 'bot' && <Bot className="w-3.5 h-3.5 text-purple-400" />}
            </h2>
            <div className="text-xs text-slate-400 font-sans truncate flex items-center gap-1">
              {chat.is_muted && <VolumeX className="w-3 h-3 text-rose-400 shrink-0" />}
              <span>
                {chat.type === 'bot'
                  ? '🤖 بوت متصل بالذكاء الاصطناعي'
                  : chat.type === 'secret'
                  ? '🔐 محادثة سرية مشفرة'
                  : chat.members_count
                  ? `👥 ${chat.members_count.toLocaleString()} عضو`
                  : chat.username
                  ? `@${chat.username}`
                  : 'متصل الآن'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Header Actions: Voice Call, Video Call, Theme, & Options Menu */}
        <div className="flex items-center gap-1">
          {onOpenVoiceCall && (
            <button
              onClick={onOpenVoiceCall}
              className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-xl transition-colors"
              title="إجراء مكالمة صوتية"
            >
              <Phone className="w-4 h-4" />
            </button>
          )}

          {onOpenVideoCall && (
            <button
              onClick={onOpenVideoCall}
              className="p-2 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-xl transition-colors"
              title="إجراء مكالمة فيديو مرئية"
            >
              <Video className="w-4 h-4" />
            </button>
          )}

          {onOpenThemeModal && (
            <button
              onClick={onOpenThemeModal}
              className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-xl transition-colors"
              title="تغيير خلفية وثيمة المحادثة"
            >
              <Palette className="w-4 h-4" />
            </button>
          )}

          {/* Action Menu Trigger */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => {
                setShowMenu(!showMenu);
                setShowMuteSubmenu(false);
              }}
              className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors"
              title="خيارات المحادثة"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute left-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-1.5 z-50 text-xs font-medium text-slate-200">
              {chat.members_count && (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onShowMembers(chat.id);
                  }}
                  className="w-full text-right px-3.5 py-2 hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
                >
                  <Users className="w-4 h-4 text-sky-400" />
                  <span>عرض الأعضاء والمشرفين</span>
                </button>
              )}

              <button
                onClick={() => {
                  setShowMenu(false);
                  onShowInviteLink(chat.id);
                }}
                className="w-full text-right px-3.5 py-2 hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
              >
                <Link className="w-4 h-4 text-amber-400" />
                <span>استعراض / نسخ رابط الدعوة</span>
              </button>

              {/* Mute Options */}
              <div className="relative">
                <button
                  onClick={() => setShowMuteSubmenu(!showMuteSubmenu)}
                  className="w-full text-right px-3.5 py-2 hover:bg-slate-800 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    {chat.is_muted ? (
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-slate-400" />
                    )}
                    <span>{chat.is_muted ? 'تفعيل التنبيهات (إلغاء الكتم)' : 'كتم الإشعارات...'}</span>
                  </div>
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {showMuteSubmenu && (
                  <div className="p-2 bg-slate-950 border border-slate-800 rounded-xl my-1 space-y-1 mx-2">
                    {chat.is_muted ? (
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          setShowMuteSubmenu(false);
                          onMute(chat.id, 0);
                        }}
                        className="w-full text-right px-3 py-1.5 hover:bg-slate-800 rounded-lg text-emerald-400 font-bold"
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
                          className="w-full text-right px-3 py-1.5 hover:bg-slate-800 rounded-lg text-slate-300"
                        >
                          ⏳ كتم لمدة ساعة واحدة
                        </button>
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            setShowMuteSubmenu(false);
                            onMute(chat.id, 28800);
                          }}
                          className="w-full text-right px-3 py-1.5 hover:bg-slate-800 rounded-lg text-slate-300"
                        >
                          ⏳ كتم لمدة 8 ساعات
                        </button>
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            setShowMuteSubmenu(false);
                            onMute(chat.id, 172800);
                          }}
                          className="w-full text-right px-3 py-1.5 hover:bg-slate-800 rounded-lg text-slate-300"
                        >
                          ⏳ كتم لمدة يومين (48 ساعة)
                        </button>
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            setShowMuteSubmenu(false);
                            onMute(chat.id, -1);
                          }}
                          className="w-full text-right px-3 py-1.5 hover:bg-slate-800 rounded-lg text-rose-400 font-bold"
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
                className="w-full text-right px-3.5 py-2 hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
              >
                <Pin className="w-4 h-4 text-amber-400" />
                <span>{chat.is_pinned ? 'إلغاء تثبيت المحادثة' : 'تثبيت المحادثة بالمقدمة'}</span>
              </button>

              <button
                onClick={() => {
                  setShowMenu(false);
                  onArchive(chat.id, !chat.is_archived);
                }}
                className="w-full text-right px-3.5 py-2 hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
              >
                {chat.is_archived ? (
                  <>
                    <ArchiveRestore className="w-4 h-4 text-sky-400" />
                    <span>إخراج من الأرشيف</span>
                  </>
                ) : (
                  <>
                    <Archive className="w-4 h-4 text-sky-400" />
                    <span>أرشفة المحادثة</span>
                  </>
                )}
              </button>

              <div className="my-1 border-t border-slate-800" />

              {/* Leave Group Option */}
              {isGroupOrChannel && (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    handleLeaveGroupAction();
                  }}
                  className="w-full text-right px-3.5 py-2 hover:bg-slate-800 text-orange-400 flex items-center gap-2.5 transition-colors"
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
                className="w-full text-right px-3.5 py-2 hover:bg-slate-800 text-amber-400 flex items-center gap-2.5 transition-colors"
              >
                <Eraser className="w-4 h-4" />
                <span>مسح سجل المحادثة (Clear)</span>
              </button>

              <button
                onClick={() => {
                  setShowMenu(false);
                  handleDeleteChat();
                }}
                className="w-full text-right px-3.5 py-2 hover:bg-slate-800 text-rose-400 flex items-center gap-2.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>حذف الدردشة بالكامل</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>

      {/* Pinned Messages Banner Bar (Telegram Official Web Style) */}
      {pinnedMessages.length > 0 && activePinnedMsg && (
        <div className="bg-slate-950/90 border-t border-slate-800/80 px-4 py-2 flex items-center justify-between transition-colors text-xs border-r-4 border-r-amber-400">
          <div
            className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer group"
            onClick={() => setCurrentPinnedIdx((prev) => prev + 1)}
            title="انقر للتنقل بين الرسائل المثبتة في هذه المحادثة"
          >
            <Pin className="w-4 h-4 text-amber-400 shrink-0 rotate-45 group-hover:scale-110 transition-transform" />
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                <span>الرسائل المثبتة</span>
                {pinnedMessages.length > 1 && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({(currentPinnedIdx % pinnedMessages.length) + 1}/{pinnedMessages.length})
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300 truncate font-sans">
                <span className="text-sky-300 font-semibold">{activePinnedMsg.sender_name}: </span>
                {activePinnedMsg.content?.type === 'text'
                  ? activePinnedMsg.content?.text
                  : activePinnedMsg.content?.caption || activePinnedMsg.text || `[${(activePinnedMsg.content?.type || 'MESSAGE').toUpperCase()}]`}
              </p>
            </div>
          </div>

          <button
            onClick={() => onUnpinMessage?.(chat.id, activePinnedMsg.id)}
            className="p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors shrink-0 mr-2"
            title="إلغاء تثبيت هذه الرسالة"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
