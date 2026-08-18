import React, { useState, useEffect } from 'react';
import {
  X,
  Briefcase,
  Clock,
  MessageSquare,
  Zap,
  MapPin,
  Link2,
  CheckCircle2,
  Plus,
  Trash2,
  Save,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { UserProfile } from '../types';

export interface QuickReplyShortcut {
  id: string;
  shortcut: string;
  message: string;
  media?: string;
}

export interface BusinessConfig {
  hoursEnabled: boolean;
  businessHours: {
    days: string;
    openTime: string;
    closeTime: string;
  };
  greetingEnabled: boolean;
  greetingText: string;
  greetingInactivityDays: number;
  awayEnabled: boolean;
  awayText: string;
  awaySchedule: 'always' | 'outside_hours' | 'custom';
  locationAddress: string;
  quickReplies: QuickReplyShortcut[];
  chatLink: string;
}

const DEFAULT_BUSINESS_CONFIG: BusinessConfig = {
  hoursEnabled: true,
  businessHours: {
    days: 'السبت - الخميس',
    openTime: '08:00',
    closeTime: '22:00',
  },
  greetingEnabled: true,
  greetingText: 'أهلاً بك في منصة سرعة إنجاز! كيف يمكننا مساعدتك اليوم؟ 🚀',
  greetingInactivityDays: 14,
  awayEnabled: true,
  awayText: 'نحن غير متواجدين حالياً، وسنقوم بالرد على رسالتكم فور بدء ساعات العمل.',
  awaySchedule: 'outside_hours',
  locationAddress: 'بغداد، العراق - المنصور / مكتب إنجاز الذكي',
  quickReplies: [
    {
      id: 'qr_1',
      shortcut: '/hello',
      message: 'مرحباً بك! يسعدنا تواصلك معنا دائماً.',
    },
    {
      id: 'qr_2',
      shortcut: '/services',
      message: 'نقدم خدمات الأتمتة المتقدمة، الربط السحابي مع تيليجرام MTProto، والتحليل الذكي للبيانات.',
    },
    {
      id: 'qr_3',
      shortcut: '/support',
      message: 'للتواصل المباشر مع فريق الدعم الفني: @EnjazSupportTeam',
    },
  ],
  chatLink: 'https://t.me/enjaz_pro_bot?start=support',
};

interface TelegramBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  lang?: 'ar' | 'en';
}

export const TelegramBusinessModal: React.FC<TelegramBusinessModalProps> = ({
  isOpen,
  onClose,
  profile,
  lang = 'ar',
}) => {
  const [activeTab, setActiveTab] = useState<'quick_replies' | 'greeting' | 'away' | 'hours' | 'links'>('quick_replies');
  const [config, setConfig] = useState<BusinessConfig>(() => {
    try {
      const saved = localStorage.getItem('tg_business_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load business config:', e);
    }
    return DEFAULT_BUSINESS_CONFIG;
  });

  const [newShortcut, setNewShortcut] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    try {
      localStorage.setItem('tg_business_config', JSON.stringify(config));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (e) {
      console.warn('Failed to save business config:', e);
    }
  };

  const handleAddQuickReply = () => {
    if (!newShortcut.trim() || !newMessage.trim()) return;
    const formatted = newShortcut.startsWith('/') ? newShortcut.trim() : `/${newShortcut.trim()}`;
    const newReply: QuickReplyShortcut = {
      id: 'qr_' + Date.now(),
      shortcut: formatted,
      message: newMessage.trim(),
    };
    setConfig((prev) => ({
      ...prev,
      quickReplies: [...prev.quickReplies, newReply],
    }));
    setNewShortcut('');
    setNewMessage('');
  };

  const handleDeleteQuickReply = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      quickReplies: prev.quickReplies.filter((r) => r.id !== id),
    }));
  };

  if (!isOpen) return null;

  const isAr = lang === 'ar';

  return (
    <div className="fixed inset-0 z-[2600] flex items-center justify-center p-4 select-none font-['Cairo',sans-serif]">
      {/* Backdrop */}
      <div onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" />

      {/* Main Container */}
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh] text-zinc-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-b from-emerald-500/20 via-zinc-900 to-zinc-950 border-b border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-zinc-100">
                  {isAr ? 'تيليجرام للأعمال (Telegram Business)' : 'Telegram Business'}
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Official Suite
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {isAr ? 'الردود السريعة، رسائل الترحيب والغياب، وساعات العمل وإدارة العملاء' : 'Quick replies, greeting & away messages, business hours'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-800 px-4 bg-zinc-950/80 overflow-x-auto scrollbar-none">
          {[
            { id: 'quick_replies', label: isAr ? 'الردود السريعة' : 'Quick Replies', icon: Zap },
            { id: 'greeting', label: isAr ? 'رسالة الترحيب' : 'Greeting', icon: MessageSquare },
            { id: 'away', label: isAr ? 'رسالة الغياب' : 'Away Message', icon: Clock },
            { id: 'hours', label: isAr ? 'ساعات العمل والموقع' : 'Hours & Location', icon: MapPin },
            { id: 'links', label: isAr ? 'روابط المحادثة' : 'Chat Links', icon: Link2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3.5 text-xs font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
                  active
                    ? 'border-emerald-400 text-emerald-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {activeTab === 'quick_replies' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-zinc-100 text-xs">
                    {isAr ? 'اختصارات الردود السريعة (Quick Replies)' : 'Quick Reply Shortcuts'}
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    {isAr
                      ? 'اكتب الاختصار (مثل /hello) في أي محادثة لإرسال الرد الجاهز فوراً.'
                      : 'Type the shortcut in any chat to insert pre-written replies.'}
                  </p>
                </div>
              </div>

              {/* Add new shortcut */}
              <div className="p-3.5 bg-zinc-900/70 border border-zinc-800 rounded-2xl space-y-2.5">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newShortcut}
                    onChange={(e) => setNewShortcut(e.target.value)}
                    placeholder={isAr ? 'الاختصار (مثال: /prices)' : 'Shortcut (e.g. /prices)'}
                    className="w-1/3 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={isAr ? 'نص الرسالة الجاهزة التي سيتم إرسالها...' : 'Reply message content...'}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={handleAddQuickReply}
                    disabled={!newShortcut.trim() || !newMessage.trim()}
                    className="p-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-bold rounded-xl transition-colors flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isAr ? 'إضافة' : 'Add'}</span>
                  </button>
                </div>
              </div>

              {/* List of shortcuts */}
              <div className="space-y-2">
                {config.quickReplies.map((qr) => (
                  <div
                    key={qr.id}
                    className="p-3 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl flex items-center justify-between hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg font-mono font-bold text-xs border border-emerald-500/30">
                        {qr.shortcut}
                      </span>
                      <p className="text-zinc-200 text-xs">{qr.message}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteQuickReply(qr.id)}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg transition-colors"
                      title={isAr ? 'حذف الرد' : 'Delete'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'greeting' && (
            <div className="space-y-4">
              <label className="flex items-center justify-between p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-2xl cursor-pointer">
                <div>
                  <div className="font-bold text-zinc-100">
                    {isAr ? 'تفعيل رسائل الترحيب التلقائية' : 'Enable Greeting Message'}
                  </div>
                  <div className="text-zinc-400 text-[11px] mt-0.5">
                    {isAr ? 'إرسال رسالة ترحيبية فورية للعملاء الجدد عند مراسلتك لأول مرة' : 'Auto-send greeting to new chats'}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.greetingEnabled}
                  onChange={(e) => setConfig({ ...config, greetingEnabled: e.target.checked })}
                  className="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-400"
                />
              </label>

              {config.greetingEnabled && (
                <div className="space-y-2">
                  <label className="font-bold text-zinc-300 block">
                    {isAr ? 'نص رسالة الترحيب:' : 'Greeting Message Text:'}
                  </label>
                  <textarea
                    rows={4}
                    value={config.greetingText}
                    onChange={(e) => setConfig({ ...config, greetingText: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-3 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[11px] text-zinc-500">
                    {isAr
                      ? 'يتم إرسال الرسالة للمحادثات الجديدة أو بعد 14 يوماً من عدم النشاط.'
                      : 'Sent on first contact or after 14 days of inactivity.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'away' && (
            <div className="space-y-4">
              <label className="flex items-center justify-between p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-2xl cursor-pointer">
                <div>
                  <div className="font-bold text-zinc-100">
                    {isAr ? 'تفعيل رسائل الغياب الآلية' : 'Enable Away Message'}
                  </div>
                  <div className="text-zinc-400 text-[11px] mt-0.5">
                    {isAr ? 'الرد التلقائي عند استلام رسائل خارج أوقات الدوام الرسمي' : 'Auto-reply when offline or closed'}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.awayEnabled}
                  onChange={(e) => setConfig({ ...config, awayEnabled: e.target.checked })}
                  className="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-400"
                />
              </label>

              {config.awayEnabled && (
                <div className="space-y-2">
                  <label className="font-bold text-zinc-300 block">
                    {isAr ? 'نص رسالة الغياب:' : 'Away Message Text:'}
                  </label>
                  <textarea
                    rows={4}
                    value={config.awayText}
                    onChange={(e) => setConfig({ ...config, awayText: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-3 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'hours' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-3">
                <h4 className="font-bold text-zinc-100">
                  {isAr ? 'ساعات العمل الرسمية' : 'Business Hours'}
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">{isAr ? 'أيام العمل:' : 'Days:'}</label>
                    <input
                      type="text"
                      value={config.businessHours.days}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          businessHours: { ...config.businessHours, days: e.target.value },
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">{isAr ? 'من:' : 'From:'}</label>
                    <input
                      type="time"
                      value={config.businessHours.openTime}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          businessHours: { ...config.businessHours, openTime: e.target.value },
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">{isAr ? 'إلى:' : 'To:'}</label>
                    <input
                      type="time"
                      value={config.businessHours.closeTime}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          businessHours: { ...config.businessHours, closeTime: e.target.value },
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-100"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-2">
                <h4 className="font-bold text-zinc-100">
                  {isAr ? 'الموقع الجغرافي للنشاط التجاري' : 'Business Location'}
                </h4>
                <input
                  type="text"
                  value={config.locationAddress}
                  onChange={(e) => setConfig({ ...config, locationAddress: e.target.value })}
                  placeholder={isAr ? 'العنوان والمقر...' : 'Address / City...'}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100"
                />
              </div>
            </div>
          )}

          {activeTab === 'links' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-2">
                <h4 className="font-bold text-zinc-100">
                  {isAr ? 'روابط الدردشة المباشرة (Chat Links)' : 'Chat Direct Links'}
                </h4>
                <p className="text-[11px] text-zinc-400">
                  {isAr
                    ? 'شارك هذا الرابط مع عملائك لبدء محادثة مباشرة مع رسالة ترحيبية مخصصة.'
                    : 'Share direct link for clients to start chat.'}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    readOnly
                    value={config.chatLink}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(config.chatLink);
                      alert(isAr ? 'تم نسخ رابط المحادثة!' : 'Copied link!');
                    }}
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold rounded-xl transition-colors"
                  >
                    {isAr ? 'نسخ' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Save Action */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isAr ? 'تم حفظ التغييرات بنجاح!' : 'Saved successfully!'}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-zinc-400 hover:text-zinc-200 text-xs font-semibold"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isAr ? 'حفظ الإعدادات' : 'Save Changes'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
