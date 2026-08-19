import React, { useState } from 'react';
import { Shield, ShieldAlert, UserX, Lock, KeyRound, Check, X, Smartphone, Key } from 'lucide-react';

interface PrivacySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenActiveSessions?: () => void;
}

export const PrivacySettingsModal: React.FC<PrivacySettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenActiveSessions,
}) => {
  const [phoneNumberVisibility, setPhoneNumberVisibility] = useState('nobody');
  const [lastSeenVisibility, setLastSeenVisibility] = useState('everybody');
  const [forwardedMessages, setForwardedMessages] = useState('contacts');

  const [blockedUsers, setBlockedUsers] = useState([
    { id: 109, name: 'حساب مجهول / سبام', username: '@spammer_bot' },
  ]);

  if (!isOpen) return null;

  const handleUnblock = (id: number) => {
    setBlockedUsers(blockedUsers.filter((u) => u.id !== id));
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative text-slate-100 max-h-[85vh] overflow-y-auto space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-rose-400">
          <Shield className="w-6 h-6" />
          <h3 className="font-bold text-sm">إعدادات الخصوصية والحظر والأمان</h3>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">من يمكنه رؤية رقم هاتفك؟</label>
            <select
              value={phoneNumberVisibility}
              onChange={(e) => setPhoneNumberVisibility(e.target.value)}
              className="w-full bg-slate-800 p-2.5 rounded-xl border border-slate-700 text-slate-100 focus:outline-none focus:border-rose-500"
            >
              <option value="everybody">الجميع</option>
              <option value="contacts">جهاتي فقط</option>
              <option value="nobody">لا أحد (موصى به)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">من يمكنه رؤية آخر ظهور وعبر الإنترنت؟</label>
            <select
              value={lastSeenVisibility}
              onChange={(e) => setLastSeenVisibility(e.target.value)}
              className="w-full bg-slate-800 p-2.5 rounded-xl border border-slate-700 text-slate-100 focus:outline-none focus:border-rose-500"
            >
              <option value="everybody">الجميع</option>
              <option value="contacts">جهاتي فقط</option>
              <option value="nobody">لا أحد</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">توجيه الرسائل والرابط إلى حسابك:</label>
            <select
              value={forwardedMessages}
              onChange={(e) => setForwardedMessages(e.target.value)}
              className="w-full bg-slate-800 p-2.5 rounded-xl border border-slate-700 text-slate-100 focus:outline-none focus:border-rose-500"
            >
              <option value="everybody">الجميع</option>
              <option value="contacts">جهاتي فقط</option>
              <option value="nobody">لا أحد</option>
            </select>
          </div>

          <button
            onClick={() => alert('✅ تم حفظ إعدادات الخصوصية والأمان!')}
            className="w-full bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-colors shadow"
          >
            حفظ التعديلات الخصوصية
          </button>

          <hr className="border-slate-800 my-3" />

          {/* Active Sessions Button */}
          {onOpenActiveSessions && (
            <div className="p-3 bg-gradient-to-r from-sky-950 to-slate-900 border border-sky-500/30 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-sky-300 font-bold">
                <Smartphone className="w-4 h-4 text-sky-400" />
                <span>الجلسات النشطة والأجهزة الحالية (Devices)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                عرض جميع الأجهزة المسجل دخولها بحسابك ومفاتيح التفويض، مع إمكانية إنهاء أي جلسة عن بُعد.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenActiveSessions();
                }}
                className="w-full py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow flex items-center justify-center gap-1.5"
              >
                <Key className="w-3.5 h-3.5" />
                <span>عرض الجلسات النشطة ومفاتيح التشفير</span>
              </button>
            </div>
          )}

          <hr className="border-slate-800 my-3" />

          <div>
            <h4 className="font-bold text-slate-200 mb-2 flex items-center gap-1.5">
              <UserX className="w-4 h-4 text-rose-400" />
              <span>المستخدمون المحظورون ({blockedUsers.length})</span>
            </h4>

            {blockedUsers.length === 0 ? (
              <div className="text-slate-500 text-[11px]">لا يوجد مستخدمون محظورون حالياً.</div>
            ) : (
              <div className="space-y-2">
                {blockedUsers.map((u) => (
                  <div
                    key={u.id}
                    className="p-2.5 bg-slate-800/80 rounded-2xl border border-slate-700/50 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-100">{u.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{u.username}</div>
                    </div>
                    <button
                      onClick={() => handleUnblock(u.id)}
                      className="px-3 py-1 bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-slate-950 font-bold rounded-xl text-[11px] transition-colors"
                    >
                      إلغاء الحظر
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
