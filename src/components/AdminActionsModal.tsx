import React, { useState } from 'react';
import {
  ShieldAlert,
  Ban,
  ShieldCheck,
  AlertOctagon,
  Image,
  Crown,
  UserMinus,
  Pin,
  Edit3,
  Bell,
  X,
  Send,
  Sparkles,
  Users,
  CheckCircle2
} from 'lucide-react';

interface AdminActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentChat: any;
  onTriggerAction: (actionData: {
    action_type: string;
    user_name: string;
    is_me: boolean;
    custom_text?: string;
  }) => Promise<void>;
  onTestNotification: () => Promise<void>;
  lang?: 'ar' | 'en';
}

export const AdminActionsModal: React.FC<AdminActionsModalProps> = ({
  isOpen,
  onClose,
  currentChat,
  onTriggerAction,
  onTestNotification,
  lang = 'ar',
}) => {
  const [userName, setUserName] = useState('أحمد العراقي');
  const [isMe, setIsMe] = useState(false);
  const [customText, setCustomText] = useState('');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const chatTitle = currentChat?.title || currentChat?.name || (lang === 'ar' ? 'المجموعة' : 'The Group');

  const handleAction = async (actionType: string) => {
    setLoadingAction(actionType);
    setSuccessNotice(null);
    try {
      await onTriggerAction({
        action_type: actionType,
        user_name: userName.trim() || (lang === 'ar' ? 'مستخدم' : 'User'),
        is_me: isMe,
        custom_text: customText.trim() || undefined,
      });
      setSuccessNotice(lang === 'ar' ? 'تم تنفيذ وإرسال إجراء النظام بنجاح!' : 'System action executed successfully!');
      setTimeout(() => setSuccessNotice(null), 3000);
    } catch (e: any) {
      console.error(e);
    }
    setLoadingAction(null);
  };

  const handleTestPush = async () => {
    setLoadingAction('push_test');
    try {
      await onTestNotification();
      setSuccessNotice(lang === 'ar' ? 'تم إرسال الإشعار الفوري للمتصفح!' : 'Push notification sent to browser!');
      setTimeout(() => setSuccessNotice(null), 3000);
    } catch (e) {
      console.error(e);
    }
    setLoadingAction(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100">
                {lang === 'ar' ? 'إجراءات المشرفين ورسائل النظام' : 'Admin & System Events Manager'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {chatTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 custom-scrollbar">
          {successNotice && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Target User & Options */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3.5 space-y-3">
            <label className="block text-xs font-semibold text-slate-300">
              {lang === 'ar' ? 'العضو المستهدف بالإجراء:' : 'Target User Name:'}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder={lang === 'ar' ? 'اسم العضو (مثال: محمد علي)' : 'User name'}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
              />
              <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer select-none bg-slate-900/60 px-2.5 py-1.5 rounded-lg border border-slate-700">
                <input
                  type="checkbox"
                  checked={isMe}
                  onChange={(e) => setIsMe(e.target.checked)}
                  className="rounded border-slate-600 text-sky-500 focus:ring-0"
                />
                <span>{lang === 'ar' ? 'إجراء يخصني (أنا)' : 'Affects Me'}</span>
              </label>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-400">
              {lang === 'ar' ? 'الإجراءات الإدارية ورسائل النظام:' : 'Administrative Actions & Events:'}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Ban */}
              <button
                onClick={() => handleAction('ban')}
                disabled={loadingAction !== null}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-600/30 text-rose-300 text-xs font-medium transition-all text-start"
              >
                <Ban className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{lang === 'ar' ? '🚫 حظر من المجموعة' : 'Ban User'}</span>
              </button>

              {/* Unban */}
              <button
                onClick={() => handleAction('unban')}
                disabled={loadingAction !== null}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-600/30 text-emerald-300 text-xs font-medium transition-all text-start"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{lang === 'ar' ? '✅ إلغاء الحظر' : 'Unban User'}</span>
              </button>

              {/* Mute Writing */}
              <button
                onClick={() => handleAction('restrict_send')}
                disabled={loadingAction !== null}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/50 border border-amber-600/30 text-amber-300 text-xs font-medium transition-all text-start"
              >
                <AlertOctagon className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{lang === 'ar' ? '⛔ تقييد من الكتابة' : 'Restrict Writing'}</span>
              </button>

              {/* Mute Media */}
              <button
                onClick={() => handleAction('restrict_media')}
                disabled={loadingAction !== null}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/50 border border-amber-600/30 text-amber-300 text-xs font-medium transition-all text-start"
              >
                <Image className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{lang === 'ar' ? '⛔ منع إرسال الوسائط' : 'Restrict Media'}</span>
              </button>

              {/* Promote Admin */}
              <button
                onClick={() => handleAction('promote')}
                disabled={loadingAction !== null}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-yellow-950/40 hover:bg-yellow-900/50 border border-yellow-600/30 text-yellow-300 text-xs font-medium transition-all text-start"
              >
                <Crown className="w-4 h-4 text-yellow-400 shrink-0" />
                <span>{lang === 'ar' ? '👑 تعيين مشرفاً' : 'Promote Admin'}</span>
              </button>

              {/* Demote Admin */}
              <button
                onClick={() => handleAction('demote')}
                disabled={loadingAction !== null}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium transition-all text-start"
              >
                <Crown className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{lang === 'ar' ? '👑 سحب الإشراف' : 'Demote Admin'}</span>
              </button>

              {/* Join */}
              <button
                onClick={() => handleAction('join')}
                disabled={loadingAction !== null}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-sky-950/40 hover:bg-sky-900/50 border border-sky-600/30 text-sky-300 text-xs font-medium transition-all text-start"
              >
                <Users className="w-4 h-4 text-sky-400 shrink-0" />
                <span>{lang === 'ar' ? '👤 انضمام عضو' : 'User Joined'}</span>
              </button>

              {/* Leave */}
              <button
                onClick={() => handleAction('leave')}
                disabled={loadingAction !== null}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium transition-all text-start"
              >
                <UserMinus className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{lang === 'ar' ? '🚪 مغادرة عضو' : 'User Left'}</span>
              </button>
            </div>
          </div>

          {/* Test Push Notification */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'ar' ? 'إشعارات المتصفح الفورية (Web Push)' : 'Browser Push Notifications'}</span>
              </div>
              <div className="text-[11px] text-slate-400">
                {lang === 'ar' ? 'اختبر ظهور الإشعار في نظام التشغيل وسطح المكتب' : 'Test notification popup in system'}
              </div>
            </div>
            <button
              onClick={handleTestPush}
              disabled={loadingAction !== null}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-medium transition-colors"
            >
              {loadingAction === 'push_test' ? 'جاري الإرسال...' : '🔔 إرسال إشعار تجريبي'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
