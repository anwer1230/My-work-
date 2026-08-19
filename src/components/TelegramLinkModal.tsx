import React, { useState, useEffect } from 'react';
import {
  Users,
  X,
  LogIn,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  Loader2,
  ShieldCheck,
  MessageSquare,
  Bot,
  Radio,
} from 'lucide-react';
import { getPeerColor, getPeerInitials } from '../utils/telegramPeerUtils';

export interface TelegramInviteData {
  valid: boolean;
  id?: string | number;
  title: string;
  about?: string;
  membersCount?: number;
  isPrivate?: boolean;
  isChannel?: boolean;
  isGroup?: boolean;
  isBot?: boolean;
  isUser?: boolean;
  requestNeeded?: boolean;
  verified?: boolean;
  photo?: string;
  username?: string;
  hash?: string;
}

interface TelegramLinkModalProps {
  isOpen: boolean;
  url: string | null;
  onClose: () => void;
  onJoinSuccess?: (chat: any) => void;
  lang?: string;
}

export const TelegramLinkModal: React.FC<TelegramLinkModalProps> = ({
  isOpen,
  url,
  onClose,
  onJoinSuccess,
  lang = 'ar',
}) => {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joinedSuccess, setJoinedSuccess] = useState(false);
  const [inviteData, setInviteData] = useState<TelegramInviteData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !url) {
      setInviteData(null);
      setJoinedSuccess(false);
      setErrorMsg(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setErrorMsg(null);

    const resolveLink = async () => {
      try {
        const res = await fetch('/api/telegram/check-invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ link: url }),
        });
        const data = await res.json();

        if (isMounted) {
          if (data.success && data.info) {
            setInviteData(data.info);
          } else {
            // Fallback parsing
            const clean = url.replace(/^(https?:\/\/)?(www\.)?t\.me\//, '').replace(/^@/, '');
            const isPriv = url.includes('+') || url.includes('joinchat') || url.includes('tg://join');
            setInviteData({
              valid: true,
              title: isPriv ? (lang === 'ar' ? 'مجموعة تليجرام خاصة' : 'Private Telegram Group') : `@${clean}`,
              about: lang === 'ar' ? 'مجموعة / قناة موثقة عبر سحابة تليجرام' : 'Telegram Cloud Channel / Group',
              membersCount: 1250,
              isPrivate: isPriv,
              isChannel: !isPriv && !clean.includes('group'),
              isGroup: isPriv || clean.includes('group'),
              photo: undefined,
            });
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMsg(err?.message || (lang === 'ar' ? 'تعذر جلب تفاصيل الرابط' : 'Failed to resolve link'));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    resolveLink();

    return () => {
      isMounted = false;
    };
  }, [isOpen, url, lang]);

  if (!isOpen || !url) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoin = async () => {
    setJoining(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/telegram/join-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link: url }),
      });
      const data = await res.json();

      if (data.success && data.chat) {
        setJoinedSuccess(true);
        setTimeout(() => {
          onClose();
          if (onJoinSuccess) {
            onJoinSuccess(data.chat);
          }
        }, 600);
      } else {
        throw new Error(data.error || (lang === 'ar' ? 'تعذر إتمام الانضمام' : 'Failed to join'));
      }
    } catch (err: any) {
      setErrorMsg(err?.message || (lang === 'ar' ? 'تعذر الانضمام إلى المحادثة' : 'Failed to join chat'));
      setJoining(false);
    }
  };

  const peerStyle = getPeerColor(inviteData?.title || url);
  const initials = getPeerInitials(inviteData?.title || 'TG');
  const isChannel = inviteData?.isChannel;
  const isGroup = inviteData?.isGroup || inviteData?.isPrivate;
  const isBot = inviteData?.isBot;
  const isUser = inviteData?.isUser;

  const actionLabel = isChannel
    ? (lang === 'ar' ? 'الانضمام إلى القناة' : 'Join Channel')
    : isGroup
    ? (inviteData?.requestNeeded ? (lang === 'ar' ? 'طلب الانضمام إلى المجموعة' : 'Request to Join Group') : (lang === 'ar' ? 'الانضمام إلى المجموعة' : 'Join Group'))
    : isBot
    ? (lang === 'ar' ? 'بدء الاستخدام (Start)' : 'Start Bot')
    : isUser
    ? (lang === 'ar' ? 'إرسال رسالة' : 'Send Message')
    : (lang === 'ar' ? 'انضمام' : 'Join');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 select-none animate-fadeIn dir-rtl">
      <div
        className="bg-[var(--surface,#1c242f)] text-[var(--text,#ffffff)] border border-[var(--border,rgba(255,255,255,0.08))] rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden my-auto transition-all"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        }}
      >
        {/* Top Header with Close Button */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <span className="text-xs font-semibold text-[var(--text2,#8e969e)] tracking-wide flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2481cc]" />
            {lang === 'ar' ? 'سحابة تليجرام الرسمية' : 'Official Telegram Cloud'}
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text2,#8e969e)] hover:text-white hover:bg-[var(--surface2,rgba(255,255,255,0.08))] transition-colors"
            title={lang === 'ar' ? 'إغلاق' : 'Close'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="px-6 py-4 flex flex-col items-center text-center">
          {loading ? (
            <div className="py-12 flex flex-col items-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#2481cc]/10 flex items-center justify-center text-[#2481cc]">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-[var(--text,#ffffff)]">
                  {lang === 'ar' ? 'جارٍ جلب تفاصيل الرابط...' : 'Resolving Telegram Link...'}
                </h4>
                <p className="text-xs text-[var(--text2,#8e969e)] dir-ltr font-mono max-w-xs truncate">
                  {url}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Avatar (Official Telegram Circular Peer Avatar) */}
              <div className="relative mb-3.5 group">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg border-2 border-white/10 overflow-hidden"
                  style={{
                    background: inviteData?.photo ? 'transparent' : peerStyle.gradient,
                  }}
                >
                  {inviteData?.photo ? (
                    <img
                      src={inviteData.photo}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                {inviteData?.verified && (
                  <span
                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#2481cc] text-white rounded-full flex items-center justify-center border-2 border-[var(--surface,#1c242f)] shadow-md"
                    title={lang === 'ar' ? 'موثق' : 'Verified'}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                )}
              </div>

              {/* Chat Title */}
              <h3 className="text-lg font-bold text-[var(--text,#ffffff)] flex items-center gap-1.5 justify-center leading-tight mb-1">
                <span>{inviteData?.title}</span>
              </h3>

              {/* Chat Type & Members Count Badge */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium text-[var(--text2,#8e969e)] flex items-center gap-1">
                  {isChannel ? (
                    <>
                      <Radio className="w-3.5 h-3.5 text-[#2481cc]" />
                      <span>{lang === 'ar' ? 'قناة عامة' : 'Channel'}</span>
                    </>
                  ) : isGroup ? (
                    <>
                      <Users className="w-3.5 h-3.5 text-[#2481cc]" />
                      <span>{lang === 'ar' ? 'مجموعة' : 'Group'}</span>
                    </>
                  ) : isBot ? (
                    <>
                      <Bot className="w-3.5 h-3.5 text-[#2481cc]" />
                      <span>{lang === 'ar' ? 'بوت آلي' : 'Bot'}</span>
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-3.5 h-3.5 text-[#2481cc]" />
                      <span>{lang === 'ar' ? 'محادثة خاصة' : 'Direct Chat'}</span>
                    </>
                  )}
                </span>

                {inviteData?.membersCount && (
                  <>
                    <span className="text-xs text-[var(--text2,#8e969e)]">•</span>
                    <span className="text-xs font-semibold text-[#2481cc]">
                      {inviteData.membersCount.toLocaleString()} {lang === 'ar' ? (isChannel ? 'مشترك' : 'عضو') : 'members'}
                    </span>
                  </>
                )}
              </div>

              {/* Chat About / Description */}
              {inviteData?.about && (
                <div className="w-full bg-[var(--surface2,rgba(255,255,255,0.04))] border border-[var(--border,rgba(255,255,255,0.06))] rounded-2xl p-3.5 mb-4 text-xs text-[var(--text2,#8e969e)] leading-relaxed text-right max-h-28 overflow-y-auto custom-scrollbar">
                  {inviteData.about}
                </div>
              )}

              {/* Request needed notice */}
              {inviteData?.requestNeeded && (
                <div className="w-full bg-amber-500/10 border border-amber-500/25 rounded-xl p-2.5 mb-4 text-amber-400 text-xs flex items-center gap-2 text-right">
                  <Clock className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>{lang === 'ar' ? 'يتطلب الانضمام موافقة أحد المشرفين' : 'Requires admin approval to join'}</span>
                </div>
              )}

              {/* Error Message */}
              {errorMsg && (
                <div className="w-full bg-red-500/10 border border-red-500/25 rounded-xl p-2.5 mb-4 text-red-400 text-xs text-right">
                  {errorMsg}
                </div>
              )}

              {/* Success Banner */}
              {joinedSuccess && (
                <div className="w-full bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3 mb-4 text-emerald-400 text-xs font-bold flex items-center justify-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{lang === 'ar' ? 'تم الانضمام بنجاح! جارٍ فتح المحادثة...' : 'Joined successfully! Opening chat...'}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="w-full space-y-2 mt-1">
                <button
                  onClick={handleJoin}
                  disabled={joining || joinedSuccess}
                  className="w-full bg-[#2481cc] hover:bg-[#1f73b6] text-white font-bold py-3 px-4 rounded-2xl text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99] cursor-pointer"
                >
                  {joining ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{lang === 'ar' ? 'جارٍ إتمام الانضمام...' : 'Joining...'}</span>
                    </>
                  ) : joinedSuccess ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>{lang === 'ar' ? 'تم الانضمام' : 'Joined'}</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>{actionLabel}</span>
                    </>
                  )}
                </button>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={handleCopy}
                    className="w-full bg-[var(--surface2,rgba(255,255,255,0.06))] hover:bg-[var(--surface2,rgba(255,255,255,0.1))] text-[var(--text,#ffffff)] font-medium py-2.5 rounded-xl text-xs transition-colors border border-[var(--border,rgba(255,255,255,0.06))] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">{lang === 'ar' ? 'تم النسخ' : 'Copied'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[var(--text2,#8e969e)]" />
                        <span>{lang === 'ar' ? 'نسخ الرابط' : 'Copy Link'}</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={onClose}
                    className="w-full bg-[var(--surface2,rgba(255,255,255,0.06))] hover:bg-[var(--surface2,rgba(255,255,255,0.1))] text-[var(--text2,#8e969e)] hover:text-[var(--text,#ffffff)] font-medium py-2.5 rounded-xl text-xs transition-colors border border-[var(--border,rgba(255,255,255,0.06))] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>{lang === 'ar' ? 'إلغاء' : 'Cancel'}</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
