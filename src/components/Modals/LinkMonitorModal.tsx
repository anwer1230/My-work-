import React, { useState, useEffect } from 'react';
import {
  Radio,
  Link as LinkIcon,
  RotateCw,
  Trash2,
  Calendar,
  Globe,
  User,
  Users,
  Hash,
  ArrowRight,
  X,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  LogIn,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTelegram } from '../../context/TelegramContext';
import { CapturedLink } from '../../types';

interface LinkMonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LinkMonitorModal: React.FC<LinkMonitorModalProps> = ({ isOpen, onClose }) => {
  const {
    capturedLinks,
    autoJoinLinksEnabled,
    toggleAutoJoinLinks,
    clearCapturedLinks,
    showToast,
    joinChatByInviteLink,
  } = useTelegram();

  const [isEnabled, setIsEnabled] = useState<boolean>(autoJoinLinksEnabled);
  const [links, setLinks] = useState<CapturedLink[]>(capturedLinks);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [joiningUrls, setJoiningUrls] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setIsEnabled(autoJoinLinksEnabled);
    setLinks(capturedLinks);
    setLastUpdate(new Date().toLocaleTimeString('ar-SA'));
  }, [autoJoinLinksEnabled, capturedLinks, isOpen]);

  // Toggle monitor
  const handleToggle = async () => {
    const nextState = !isEnabled;
    setIsEnabled(nextState);
    toggleAutoJoinLinks();
    if (nextState) {
      showToast('✅ تم تفعيل مراقبة الروابط والانضمام الفوري', '✨');
    } else {
      showToast('⏹ تم إيقاف مراقبة الروابط', 'info');
    }
  };

  // Refresh
  const handleRefresh = () => {
    setLastUpdate(new Date().toLocaleTimeString('ar-SA'));
    setLinks([...capturedLinks]);
    showToast('🔄 تم تحديث البيانات', 'info');
  };

  // Clear All
  const handleClearAll = () => {
    if (window.confirm('هل أنت متأكد من مسح جميع الروابط المسجلة؟')) {
      clearCapturedLinks();
      setLinks([]);
      showToast('🧹 تم مسح قائمة الروابط بنجاح', 'info');
    }
  };

  // Join Link Now
  const handleJoinNow = async (url: string) => {
    setJoiningUrls((prev) => ({ ...prev, [url]: true }));
    try {
      const res = await joinChatByInviteLink(url);
      if (res.success) {
        showToast(res.message || '✅ تم الانضمام وتم إرسال الإشعار للرسائل المحفوظة!', '✨');
        // Update local link status
        setLinks((prev) =>
          prev.map((l) =>
            l.url === url
              ? { ...l, status: 'joined', status_text: '✅ منضم', joined: true }
              : l
          )
        );
      } else {
        showToast(res.message || '❌ تعذر الانضمام للمجموعة', '⚠️');
      }
    } catch (e) {
      showToast('❌ خطأ في الاتصال بالخادم', '⚠️');
    } finally {
      setJoiningUrls((prev) => ({ ...prev, [url]: false }));
    }
  };

  // Delete single link
  const handleDeleteLink = (url: string) => {
    setLinks((prev) => prev.filter((l) => l.url !== url));
    showToast('🗑️ تم حذف الرابط', 'info');
  };

  // Compute stats
  const statTotal = links.length;
  const statValid = links.filter((l) => l.status === 'valid' || !l.status).length;
  const statInvalid = links.filter((l) => l.status === 'invalid').length;
  const statJoined = links.filter((l) => l.status === 'joined' || l.joined).length;
  const statAlready = links.filter((l) => l.status === 'already').length;
  const statPending = links.filter((l) => l.status === 'pending').length;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        id="modal-link-monitor-view"
        className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md select-none overflow-y-auto"
        dir="rtl"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 cursor-pointer"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative z-10 w-full max-w-4xl text-[#e8eaf6] rounded-2xl shadow-2xl overflow-hidden border border-white/10 my-auto flex flex-col max-h-[92vh]"
          style={{
            background: '#0b0f19',
            fontFamily: "'Cairo', sans-serif",
          }}
        >
          {/* Top Bar Navigation */}
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between flex-wrap gap-2 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 rounded-lg px-3 py-1.5 text-[#e8eaf6] text-[0.8rem] flex items-center gap-1.5 transition-all"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>العودة للرئيسية</span>
              </button>
              <h4 className="text-[1.05rem] font-bold text-cyan-400 m-0 flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400" />
                <span>مراقبة وانضمام فوري</span>
              </h4>
            </div>

            <span
              id="statusBadge"
              className={`badge px-2.5 py-1 rounded-full text-[0.7rem] font-bold ${
                isEnabled
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
              }`}
            >
              {isEnabled ? '🟢 نشط' : '⏹ متوقف'}
            </span>
          </div>

          {/* Main Card */}
          <div className="p-3 sm:p-4 overflow-y-auto flex-1 space-y-3">
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl overflow-hidden backdrop-blur-md">
              {/* Card Header with Main Toggle */}
              <div className="px-4 py-3 bg-white/[0.04] border-b border-white/[0.06] flex items-center justify-between flex-wrap gap-2">
                <h6 className="text-[0.9rem] font-bold text-white flex items-center gap-2 m-0">
                  <LinkIcon className="w-4 h-4 text-cyan-400" />
                  <span>مراقبة الروابط والانضمام الفوري</span>
                </h6>
                <div className="flex items-center gap-2">
                  <span className="text-[0.75rem] text-gray-400" id="toggleLabel">
                    {isEnabled ? 'مفعّل' : 'متوقف'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="linkMonitorToggle"
                      checked={isEnabled}
                      onChange={handleToggle}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-3 sm:p-4 space-y-3">
                {/* 6 Stat Boxes */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2" id="statsRow">
                  <div className="bg-white/[0.04] rounded-xl p-2 text-center border border-white/5">
                    <div className="text-[1.2rem] font-bold text-cyan-400" id="statTotal">{statTotal}</div>
                    <div className="text-[0.65rem] text-gray-400">إجمالي</div>
                  </div>
                  <div className="bg-white/[0.04] rounded-xl p-2 text-center border border-white/5">
                    <div className="text-[1.2rem] font-bold text-emerald-400" id="statValid">{statValid}</div>
                    <div className="text-[0.65rem] text-gray-400">✅ سليم</div>
                  </div>
                  <div className="bg-white/[0.04] rounded-xl p-2 text-center border border-white/5">
                    <div className="text-[1.2rem] font-bold text-rose-400" id="statInvalid">{statInvalid}</div>
                    <div className="text-[0.65rem] text-gray-400">❌ غير صالح</div>
                  </div>
                  <div className="bg-white/[0.04] rounded-xl p-2 text-center border border-white/5">
                    <div className="text-[1.2rem] font-bold text-emerald-400" id="statJoined">{statJoined}</div>
                    <div className="text-[0.65rem] text-gray-400">✅ منضم</div>
                  </div>
                  <div className="bg-white/[0.04] rounded-xl p-2 text-center border border-white/5">
                    <div className="text-[1.2rem] font-bold text-amber-400" id="statAlready">{statAlready}</div>
                    <div className="text-[0.65rem] text-gray-400">📌 منضم مسبقاً</div>
                  </div>
                  <div className="bg-white/[0.04] rounded-xl p-2 text-center border border-white/5">
                    <div className="text-[1.2rem] font-bold text-gray-400" id="statPending">{statPending}</div>
                    <div className="text-[0.65rem] text-gray-400">⏳ قيد الفحص</div>
                  </div>
                </div>

                {/* Control Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <button
                    onClick={handleRefresh}
                    className="bg-white/[0.1] hover:bg-white/[0.18] border border-white/15 text-[#e8eaf6] text-[0.78rem] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>تحديث</span>
                  </button>
                  <button
                    onClick={handleClearAll}
                    className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-[0.78rem] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>مسح الكل</span>
                  </button>
                  {lastUpdate && (
                    <span className="text-[0.65rem] text-gray-400 mr-auto" id="lastUpdate">
                      آخر تحديث: {lastUpdate}
                    </span>
                  )}
                </div>

                {/* Links List */}
                <div
                  id="linksList"
                  className="space-y-2 max-h-[420px] overflow-y-auto pr-1"
                >
                  {links.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                      <LinkIcon className="w-10 h-10 mx-auto mb-2 opacity-25" />
                      <div className="font-bold text-[0.85rem]">لا توجد روابط مسجلة</div>
                      <small className="text-[0.7rem] text-gray-500">فعّل المراقبة لبدء رصد الروابط</small>
                    </div>
                  ) : (
                    links.map((link) => {
                      const isJoined = link.status === 'joined' || link.joined;
                      const isAlready = link.status === 'already';
                      const isInvalid = link.status === 'invalid';
                      const isPending = link.status === 'pending';

                      let badgeClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
                      let badgeText = '✅ سليم';
                      let borderRightColor = 'border-r-cyan-500';

                      if (isJoined) {
                        badgeClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
                        badgeText = '✅ منضم';
                        borderRightColor = 'border-r-emerald-500';
                      } else if (isAlready) {
                        badgeClass = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
                        badgeText = '📌 منضم مسبقاً';
                        borderRightColor = 'border-r-amber-500';
                      } else if (isInvalid) {
                        badgeClass = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
                        badgeText = '❌ غير صالح';
                        borderRightColor = 'border-r-rose-500';
                      } else if (isPending) {
                        badgeClass = 'bg-gray-500/20 text-gray-300 border-gray-500/30';
                        badgeText = '⏳ قيد الفحص';
                        borderRightColor = 'border-r-amber-400';
                      }

                      return (
                        <div
                          key={link.id || link.url}
                          className={`bg-white/[0.04] hover:bg-white/[0.08] rounded-lg p-2.5 sm:p-3 border-r-4 ${borderRightColor} border-t border-b border-l border-white/5 text-[0.78rem] transition-all flex justify-between items-start gap-2 flex-wrap`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="url">
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-indigo-400 hover:text-indigo-300 break-all font-mono"
                              >
                                {link.url}
                              </a>
                            </div>

                            <div className="flex gap-2 flex-wrap mt-1.5 items-center">
                              <span className={`badge px-2 py-0.5 rounded-full text-[0.62rem] border ${badgeClass}`}>
                                {badgeText}
                              </span>
                              <span className="text-[0.65rem] text-gray-400 flex items-center gap-1">
                                <Hash className="w-3 h-3 text-gray-500" />
                                <span>{link.source_chat || link.sourceChatTitle || 'محادثة عامة'}</span>
                              </span>
                              <span className="text-[0.65rem] text-gray-400 flex items-center gap-1">
                                <User className="w-3 h-3 text-gray-500" />
                                <span>{link.sender || link.sourceSenderName || 'عضو تيليجرام'}</span>
                              </span>
                              {link.chat_title && (
                                <span className="text-[0.65rem] text-gray-400 flex items-center gap-1">
                                  <Users className="w-3 h-3 text-gray-500" />
                                  <span>{link.chat_title}</span>
                                </span>
                              )}
                            </div>

                            <div className="flex gap-3 flex-wrap mt-1.5 text-[0.62rem] text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>التاريخ: {link.creation_date || 'اليوم'}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <Globe className="w-3 h-3" />
                                <span>الدولة: {link.country || '🇸🇦 السعودية'}</span>
                              </span>
                            </div>

                            {link.join_status && (
                              <div className="text-[0.65rem] text-emerald-400 mt-1">
                                {link.join_status}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col items-end gap-1.5">
                            <div className="text-[0.58rem] text-gray-500 whitespace-nowrap">
                              {link.detected_at
                                ? new Date(link.detected_at).toLocaleTimeString('ar-SA')
                                : 'منذ قليل'}
                            </div>
                            <div className="flex items-center gap-1">
                              {!isJoined && !isAlready && (
                                <button
                                  type="button"
                                  disabled={joiningUrls[link.url]}
                                  onClick={() => handleJoinNow(link.url)}
                                  className="py-1 px-2 rounded bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 text-[0.65rem] flex items-center gap-1 transition-all"
                                  title="انضمام فوري"
                                >
                                  {joiningUrls[link.url] ? (
                                    <RotateCw className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <LogIn className="w-3 h-3" />
                                  )}
                                  <span>انضمام</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteLink(link.url)}
                                className="p-1 rounded bg-rose-500/20 hover:bg-rose-500/40 border border-rose-500/40 text-rose-300 text-[0.6rem] transition-all"
                                title="حذف"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
