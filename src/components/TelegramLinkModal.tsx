import React, { useState, useEffect } from 'react';
import {
  ExternalLink,
  Copy,
  Check,
  Users,
  X,
  LogIn,
  Globe,
  ShieldCheck,
  Zap,
  Radio,
  Clock,
  Loader2,
  Smartphone,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import {
  mtprotoService,
  DeepLinkInviteInfo,
  ParticipantUpdateEvent,
} from '../lib/mtprotoService';

interface TelegramLinkModalProps {
  isOpen: boolean;
  url: string | null;
  onClose: () => void;
  onJoinGroup?: (link: string) => void;
}

export const TelegramLinkModal: React.FC<TelegramLinkModalProps> = ({
  isOpen,
  url,
  onClose,
  onJoinGroup,
}) => {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joinedEvent, setJoinedEvent] = useState<ParticipantUpdateEvent | null>(null);
  const [inviteInfo, setInviteInfo] = useState<DeepLinkInviteInfo | null>(null);

  useEffect(() => {
    if (!isOpen || !url) {
      setInviteInfo(null);
      setJoinedEvent(null);
      return;
    }

    const verifyLink = async () => {
      setLoading(true);
      try {
        const info = await mtprotoService.checkChatInvite(url);
        setInviteInfo(info);
      } catch (err) {
        console.error('Error verifying link:', err);
      } finally {
        setLoading(false);
      }
    };

    verifyLink();
  }, [isOpen, url]);

  if (!isOpen || !url) return null;

  const isTelegramLink =
    url.includes('t.me/') ||
    url.includes('telegram.me/') ||
    url.includes('joinchat') ||
    url.includes('tg://join');

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecuteJoin = async () => {
    if (!inviteInfo) return;
    setJoining(true);

    try {
      let event: ParticipantUpdateEvent;
      if (inviteInfo.isPrivate) {
        // Execute messages.importChatInvite
        event = await mtprotoService.importChatInvite(
          inviteInfo.hashOrUsername,
          inviteInfo.title
        );
      } else {
        // Execute channels.joinChannel
        event = await mtprotoService.joinChannel(
          inviteInfo.hashOrUsername,
          inviteInfo.title
        );
      }

      setJoinedEvent(event);

      if (onJoinGroup) {
        onJoinGroup(url);
      }
    } catch (err) {
      console.error('Join error:', err);
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none animate-fadeIn dir-rtl">
      <div className="bg-slate-900 border border-sky-500/30 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative text-slate-100 overflow-hidden my-auto">
        {/* Header Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          title="إغلاق النافذة"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Top Header */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-sky-500/20 mb-3">
            {isTelegramLink ? <Users className="w-7 h-7" /> : <Globe className="w-7 h-7" />}
          </div>

          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-slate-100">
              {isTelegramLink ? 'معالجة رابط الدعوة العميق (Deep Link)' : 'معاينة رابط خارجي'}
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
              MTProto 2.0
            </span>
          </div>

          <p className="text-xs text-sky-400 font-mono mt-1 dir-ltr max-w-full truncate px-2">
            {url}
          </p>
        </div>

        {/* Deep Link 3-Step Architecture Banner */}
        <div className="bg-slate-950/80 rounded-2xl p-3 border border-slate-800 mb-4 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-300 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-sky-400" />
              <span className="font-bold text-slate-200">1. التفعيل والرابط العميق:</span>
            </div>
            <span className="font-mono text-[11px] text-sky-300 font-bold">
              {url.includes('tg://') ? 'tg://join?invite' : 't.me/joinchat'}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-300 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-slate-200">2. أمر العضوية (RPC):</span>
            </div>
            <span className="font-mono text-[11px] text-emerald-400 font-bold">
              {inviteInfo?.isPrivate ? 'messages.importChatInvite' : 'channels.joinChannel'}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-purple-400" />
              <span className="font-bold text-slate-200">3. بث التحديث للأجهزة:</span>
            </div>
            <span className="font-mono text-[11px] text-purple-400 font-bold">
              {inviteInfo?.isPrivate ? 'updateChatParticipant' : 'updateChatParticipants'}
            </span>
          </div>
        </div>

        {/* Loading / Preview Section */}
        {loading ? (
          <div className="p-6 bg-slate-950/60 rounded-2xl border border-slate-800 text-center space-y-3 mb-4">
            <Loader2 className="w-6 h-6 text-sky-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-400">
              جارٍ التحقق من صحة رابط الدعوة وجلب معلومات المجموعة من خادم تليجرام...
            </p>
          </div>
        ) : inviteInfo ? (
          <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800 mb-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-200 text-sm">{inviteInfo.title}</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <span className="px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-bold">
                {inviteInfo.membersCount.toLocaleString()} عضو
              </span>
            </div>

            <p className="text-slate-400 text-[11px] leading-relaxed">
              {inviteInfo.about}
            </p>

            {inviteInfo.requestNeeded && (
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-[11px] flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>تتطلب هذه المجموعة موافقة مشرف قبل الانضمام النهائي (Approval Queue).</span>
              </div>
            )}
          </div>
        ) : null}

        {/* Join Success Multi-Device Broadcast Event Result */}
        {joinedEvent && (
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl space-y-2 mb-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                تم الانضمام وبث التحديث الفوري للأجهزة بنجاح!
              </span>
              <span className="font-mono text-[10px] text-emerald-300 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-full">
                PTS #{joinedEvent.pts}
              </span>
            </div>

            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-[11px] space-y-1 text-slate-300">
              <div className="text-slate-400 font-bold">الأجهزة التي تلقت التحديث الفوري الآن (0ms delay):</div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {joinedEvent.devicesSynced.map((dev, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-sky-300 font-mono text-[10px] flex items-center gap-1">
                    <Smartphone className="w-3 h-3 text-sky-400" />
                    {dev}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons Grid */}
        <div className="space-y-2.5">
          {isTelegramLink && !joinedEvent && (
            <button
              onClick={handleExecuteJoin}
              disabled={joining || loading}
              className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-bold py-3 rounded-2xl text-xs transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {joining ? (
                <>
                  <Loader2 className="w-4 h-4 text-slate-950 animate-spin" />
                  <span>جارٍ تنفيذ أمر الانضمام والمزامنة السحابية...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 text-slate-950" />
                  <span>انضمام فوري ومزامنة كافة الأجهزة (Join Group)</span>
                </>
              )}
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopy}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 rounded-2xl text-xs transition-colors border border-slate-700 flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">تم النسخ</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-sky-400" />
                  <span>نسخ الرابط</span>
                </>
              )}
            </button>

            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 rounded-2xl text-xs transition-colors border border-slate-700 flex items-center justify-center gap-2 text-center"
            >
              <ExternalLink className="w-4 h-4 text-amber-400" />
              <span>فتح الرابط مباشرة</span>
            </a>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white font-bold py-2.5 rounded-2xl text-xs transition-colors border border-slate-800 flex items-center justify-center gap-2"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
};
