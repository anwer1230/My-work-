import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Lock,
  Clock,
  UserX,
  UserCheck,
  Sparkles,
  X,
  Check,
  AlertTriangle,
  Crown,
  Ban,
  Sliders,
  MessageSquare,
  Image,
  Smile,
  Link,
  Pin,
  VolumeX,
} from 'lucide-react';
import { useTelegram } from '../../context/TelegramContext';
import { messagesController, ChatParticipantInfo } from '../../core/MessagesController';
import { TLRPC } from '../../core/TLRPC';

export const GroupAdminModal: React.FC = () => {
  const { activeModal, setActiveModal, activeChat, showToast } = useTelegram();
  const [participants, setParticipants] = useState<ChatParticipantInfo[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatParticipantInfo | null>(null);
  const [adminOnlyPosting, setAdminOnlyPosting] = useState<boolean>(false);
  const [slowmodeSeconds, setSlowmodeSeconds] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'members' | 'permissions' | 'slowmode'>('members');

  useEffect(() => {
    if (activeChat && activeModal === ('group-admin' as any)) {
      setParticipants(messagesController.getParticipants(activeChat.id));
      setAdminOnlyPosting(messagesController.isAdminOnlyPosting(activeChat.id));
    }
  }, [activeChat, activeModal]);

  if (activeModal !== ('group-admin' as any) || !activeChat) return null;

  const handleToggleAdminOnly = (enabled: boolean) => {
    setAdminOnlyPosting(enabled);
    messagesController.setAdminOnlyPosting(activeChat.id, enabled);
    showToast(
      enabled
        ? 'تم تفعيل وضع "المشرفون فقط يكتبون" في المجموعة 🔒'
        : 'تم السماح لجميع الأعضاء بالكتابة في المجموعة 💬',
      '🛡️'
    );
  };

  const handleSetSlowMode = (seconds: number) => {
    setSlowmodeSeconds(seconds);
    messagesController.setSlowMode(activeChat.id, seconds);
    showToast(
      seconds > 0
        ? `تم تفعيل الوضع البطيء: ${seconds} ثانية بين كل رسالة ⏳`
        : 'تم إيقاف الوضع البطيء',
      '⏱️'
    );
  };

  const handlePromoteToAdmin = async (user: ChatParticipantInfo) => {
    await messagesController.editAdminRights(activeChat.id, user.userId, TLRPC.DEFAULT_ADMIN_RIGHTS);
    setParticipants([...messagesController.getParticipants(activeChat.id)]);
    showToast(`تمت ترقية "${user.name}" إلى مشرف بنجاح ⭐`, '👑');
  };

  const handleRestrictUser = async (user: ChatParticipantInfo) => {
    await messagesController.editBannedRights(activeChat.id, user.userId, {
      ...TLRPC.DEFAULT_USER_BANNED_RIGHTS,
      send_messages: false,
      send_media: false,
      send_stickers: false,
    });
    setParticipants([...messagesController.getParticipants(activeChat.id)]);
    showToast(`تم تقييد صلاحيات "${user.name}" بنجاح 🚫`, '⚠️');
  };

  const handleBanUser = async (user: ChatParticipantInfo) => {
    await messagesController.editBannedRights(activeChat.id, user.userId, {
      ...TLRPC.DEFAULT_USER_BANNED_RIGHTS,
      view_messages: true,
      send_messages: false,
      send_media: false,
    });
    setParticipants([...messagesController.getParticipants(activeChat.id)]);
    showToast(`تم حظر "${user.name}" من المجموعة ❌`, '🚫');
  };

  const handleUnbanUser = async (user: ChatParticipantInfo) => {
    await messagesController.unbanUser(activeChat.id, user.userId);
    setParticipants([...messagesController.getParticipants(activeChat.id)]);
    showToast(`تم إلغاء القيود عن "${user.name}" بنجاح ✅`, '✨');
  };

  return (
    <div
      id="modal-group-admin"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md select-none"
      dir="rtl"
    >
      <div
        className="w-full max-w-lg text-[#e8eaf6] rounded-3xl shadow-2xl overflow-hidden border border-sky-500/30 my-auto animate-in zoom-in-95 duration-200"
        style={{
          background: 'linear-gradient(145deg, #111a2e, #17213b, #0c1220)',
        }}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-400/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">إدارة المجموعة والصلاحيات</h3>
              <p className="text-[11px] text-sky-300/80">{activeChat.title} (TLRPC Engine)</p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal('none')}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center border-b border-white/10 bg-black/20 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('members')}
            className={`flex-1 py-3 border-b-2 text-center transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'members'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>الأعضاء ({participants.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('permissions')}
            className={`flex-1 py-3 border-b-2 text-center transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'permissions'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>صلاحيات النشر</span>
          </button>

          <button
            onClick={() => setActiveTab('slowmode')}
            className={`flex-1 py-3 border-b-2 text-center transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'slowmode'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>الوضع البطيء</span>
          </button>
        </div>

        {/* Tab 1: Members List & Moderation */}
        {activeTab === 'members' && (
          <div className="p-4 max-h-[50vh] overflow-y-auto space-y-2.5">
            {participants.map((user) => (
              <div
                key={user.userId}
                className="flex items-center justify-between p-3 rounded-2xl bg-black/30 border border-white/5 hover:border-white/15 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover border border-white/20"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#5288c1] flex items-center justify-center text-white font-bold text-sm border border-white/20">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {user.role === 'creator' && (
                      <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-amber-500 text-white shadow">
                        <Crown className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-white">{user.name}</span>
                      {user.role === 'creator' && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                          المالك
                        </span>
                      )}
                      {user.role === 'admin' && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30">
                          مشرف
                        </span>
                      )}
                      {user.role === 'restricted' && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                          مقيد
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400">@{user.username || 'user'}</span>
                  </div>
                </div>

                {user.role !== 'creator' && (
                  <div className="flex items-center gap-1.5">
                    {user.role === 'member' && (
                      <button
                        onClick={() => handlePromoteToAdmin(user)}
                        className="p-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-[11px] font-bold transition-colors"
                        title="ترقية إلى مشرف"
                      >
                        <Crown className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {user.role !== 'restricted' && user.role !== 'banned' ? (
                      <button
                        onClick={() => handleRestrictUser(user)}
                        className="p-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[11px] font-bold transition-colors"
                        title="تقييد العضو"
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUnbanUser(user)}
                        className="p-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold transition-colors"
                        title="إلغاء القيود"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Group Permissions & Admin-Only Posting */}
        {activeTab === 'permissions' && (
          <div className="p-5 space-y-4">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-white">المشرفون فقط يكتبون</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    تعطيل كتابة الرسائل لجميع الأعضاء العاديين وقصرها على المشرفين
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={adminOnlyPosting}
                  onChange={(e) => handleToggleAdminOnly(e.target.checked)}
                  className="w-5 h-5 rounded accent-sky-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-2 text-xs text-gray-300">
              <span className="font-bold text-gray-200 block text-xs">صلاحيات الأعضاء الافتراضية:</span>
              {[
                { label: 'إرسال الرسائل النصية', icon: <MessageSquare className="w-3.5 h-3.5" /> },
                { label: 'إرسال الوسائط والصور', icon: <Image className="w-3.5 h-3.5" /> },
                { label: 'إرسال الملصقات والمتحركات', icon: <Smile className="w-3.5 h-3.5" /> },
                { label: 'معاينة الروابط المضمنة', icon: <Link className="w-3.5 h-3.5" /> },
                { label: 'تثبيت الرسائل', icon: <Pin className="w-3.5 h-3.5" /> },
              ].map((perm, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-black/20 border border-white/5"
                >
                  <div className="flex items-center gap-2">
                    {perm.icon}
                    <span>{perm.label}</span>
                  </div>
                  <Check className="w-4 h-4 text-emerald-400" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Slow Mode Countdown */}
        {activeTab === 'slowmode' && (
          <div className="p-5 space-y-4">
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
              <span className="text-xs font-bold text-white block">الوضع البطيء (Slow Mode)</span>
              <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                يحدد مهلة زمنية إجبارية يجب على العضو انتظارها قبل إرسال الرسالة التالية في المجموعة.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {[
                { label: 'معطل', val: 0 },
                { label: '10 ثواني', val: 10 },
                { label: '30 ثانية', val: 30 },
                { label: '1 دقيقة', val: 60 },
                { label: '5 دقائق', val: 300 },
                { label: '15 دقيقة', val: 900 },
                { label: '1 ساعة', val: 3600 },
              ].map((item) => (
                <button
                  key={item.val}
                  onClick={() => handleSetSlowMode(item.val)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                    slowmodeSeconds === item.val
                      ? 'bg-sky-500/30 border-sky-400 text-sky-200 shadow-md'
                      : 'bg-black/20 border-white/10 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-black/40 border-t border-white/10 flex justify-end">
          <button
            onClick={() => setActiveModal('none')}
            className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
