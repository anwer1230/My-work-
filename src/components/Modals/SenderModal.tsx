import React, { useState, useEffect, useRef } from 'react';
import {
  Paperclip,
  Image as ImageIcon,
  Send,
  Save,
  Play,
  Square,
  RotateCw,
  Info,
  ChevronDown,
  Shield,
  Trash2,
  Bell,
  CheckCircle2,
  AlertCircle,
  X,
  Radio,
  ExternalLink,
  Layers,
  UploadCloud,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTelegram } from '../../context/TelegramContext';
import { notificationsService } from '../../core/NotificationsService';
import { notificationsController } from '../../core/NotificationsController';
import { MonitorAlert, ProtectionMode } from '../../types';

export const SenderModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    chats,
    messages,
    showToast,
    jumpToMessage,
  } = useTelegram();

  const isOpen = activeModal === ('sender' as any) || activeModal === ('send-only' as any);

  // Form State - Sender
  const [messageText, setMessageText] = useState<string>(() => localStorage.getItem('draft_message') || '');
  const [groupsText, setGroupsText] = useState<string>(() => localStorage.getItem('draft_groups') || '');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [sendType, setSendType] = useState<'manual' | 'scheduled'>('manual');
  const [intervalMinutes, setIntervalMinutes] = useState<number>(60);
  const [scheduleDuration, setScheduleDuration] = useState<number>(0);
  const [sanitizeMode, setSanitizeMode] = useState<string>('salam');
  const [showModeDesc, setShowModeDesc] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sendStatusMsg, setSendStatusMsg] = useState<{ text: string; success: boolean } | null>(null);

  // Monitoring State
  const [watchWords, setWatchWords] = useState<string>('واجب\nبحث\nسعر\nوظيفة\nتصميم\nبرمجة');
  const [monitorStatus, setMonitorStatus] = useState<'stopped' | 'running' | 'paused'>('stopped');
  const [alerts, setAlerts] = useState<MonitorAlert[]>([]);
  const [scheduleRemaining, setScheduleRemaining] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync monitoring state with notificationsService
  useEffect(() => {
    const unsub = notificationsService.subscribe(() => {
      setAlerts([...notificationsService.getMonitorAlerts()]);
      const cfg = notificationsService.getMonitorConfig();
      if (cfg.isEnabled) {
        setMonitorStatus('running');
      }
    });
    setAlerts([...notificationsService.getMonitorAlerts()]);
    if (notificationsService.getMonitorConfig().isEnabled) {
      setMonitorStatus('running');
    }
    return () => unsub();
  }, []);

  // Fetch dialogs from Telegram
  const handleFetchDialogs = () => {
    const groupLines = chats
      .filter((c) => c.type === 'group' || c.type === 'channel')
      .map((c) => (c.username ? `@${c.username}` : c.title));

    if (groupLines.length === 0) {
      // If no specific groups, use titles of existing dialogs
      const allLines = chats.map((c) => (c.username ? `@${c.username}` : c.title));
      setGroupsText(allLines.join('\n'));
    } else {
      setGroupsText(groupLines.join('\n'));
    }
    showToast(`✅ تم جلب ${chats.length} محادثة ومجموعة من حسابك في تيليجرام`, '✨');
  };

  // Image Upload handler
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (reader.result) {
            setUploadedImages((prev) => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Drag & Drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = () => {
            if (reader.result) {
              setUploadedImages((prev) => [...prev, reader.result as string]);
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };

  // Save Settings
  const handleSaveSettings = () => {
    localStorage.setItem('draft_message', messageText);
    localStorage.setItem('draft_groups', groupsText);
    showToast('💾 تم حفظ الإعدادات والمسودة بنجاح في الذاكرة', '✅');
  };

  // Send Now Execution
  const handleSendNow = async () => {
    if (!messageText.trim() && uploadedImages.length === 0) {
      showToast('⚠️ يجب كتابة رسالة أو رفع صورة أولاً', '⚠️');
      return;
    }
    if (!groupsText.trim()) {
      showToast('⚠️ يجب تحديد مجموعات أو وجهات الإرسال', '⚠️');
      return;
    }

    localStorage.setItem('draft_message', messageText);
    localStorage.setItem('draft_groups', groupsText);

    setIsSending(true);
    setSendStatusMsg(null);

    const groupList = groupsText
      .split('\n')
      .map((g) => g.trim())
      .filter(Boolean);

    // Map targets to chat IDs or titles
    const targetChatIds = groupList.map((g) => {
      const matched = chats.find(
        (c) =>
          c.title.toLowerCase() === g.toLowerCase() ||
          (c.username && `@${c.username.toLowerCase()}` === g.toLowerCase())
      );
      return matched ? matched.id : `custom_${g}`;
    });

    const batch = await notificationsService.executeSendBatch({
      text: messageText,
      images: uploadedImages,
      targetChatIds: targetChatIds.length > 0 ? targetChatIds : chats.map((c) => c.id),
      allChats: chats,
      protectionMode: (sanitizeMode === 'smart' ? 'smart_clean' : sanitizeMode === 'always' ? 'permanent_clean' : sanitizeMode === 'off' ? 'disabled' : sanitizeMode) as ProtectionMode,
      isScheduled: sendType === 'scheduled',
      intervalMinutes: intervalMinutes,
      durationHours: scheduleDuration,
    });

    setIsSending(false);

    if (sendType === 'scheduled') {
      setSendStatusMsg({
        text: `⏳ تم تفعيل الجدولة الدورية بنجاح كل ${intervalMinutes} دقيقة!`,
        success: true,
      });
      showToast('⏳ تم تفعيل الجدولة الدورية بنجاح!', '✨');
    } else {
      setSendStatusMsg({
        text: `📢 تم إرسال الرسالة إلى ${batch.totalSuccess} وجهة بنجاح! تم توثيق التقرير في الرسائل المحفوظة.`,
        success: true,
      });
      showToast(`📢 تم إرسال الرسالة إلى ${batch.totalSuccess} وجهة بنجاح!`, '✨');
    }
  };

  // Monitoring controls
  const handleStartMonitoring = () => {
    const kws = watchWords
      .split('\n')
      .map((k) => k.trim())
      .filter(Boolean);

    notificationsService.setMonitorConfig({
      isEnabled: true,
      keywords: kws,
      sendAlertsToSavedMessages: true,
      browserPushAlerts: true,
    });
    setMonitorStatus('running');
    showToast('🟢 تم تفعيل نظام المراقبة الذكية ورصد الكلمات المفتاحية فورياً', '✅');
  };

  const handleStopMonitoring = () => {
    notificationsService.setMonitorConfig({
      isEnabled: false,
      keywords: watchWords.split('\n').map((k) => k.trim()).filter(Boolean),
      sendAlertsToSavedMessages: true,
      browserPushAlerts: true,
    });
    setMonitorStatus('stopped');
    showToast('⏹️ تم إيقاف نظام المراقبة', '⏹');
  };

  const handleResumeMonitoring = () => {
    handleStartMonitoring();
    showToast('🔄 تم استئناف المراقبة بنجاح', '🔄');
  };

  const handleTestAlertTrigger = () => {
    const sampleChat = chats.find((c) => c.type === 'group' || c.type === 'channel') || chats[0];
    const chatId = sampleChat ? sampleChat.id : 'chat_group_main';
    const chatTitle = sampleChat ? sampleChat.title : 'مجموعة سرعة إنجاز الرسمية';
    const chatUsername = sampleChat?.username;
    const currentMsgs = messages[chatId] || [];
    const sampleMsg = currentMsgs[currentMsgs.length - 1];
    const messageId = sampleMsg ? sampleMsg.id : `msg_test_${Date.now()}`;
    const testKeyword = watchWords.split('\n')[0] || 'واجب';

    notificationsController.postNotification({
      category: 'keyword_alert',
      title: `🚨 كلمة مراقبة: [${testKeyword}]`,
      body: `💬 الرسالة: السلام عليكم، مطلوب حل ${testKeyword} لمشروع التخرج بشكل عاجل اليوم.\n📍 المصدر: ${chatTitle}`,
      avatar: sampleChat?.avatar,
      chatId: chatId,
      chatTitle: chatTitle,
      chatUsername: chatUsername,
      messageId: messageId,
      senderId: 'user_dev_ali',
      senderName: 'علي التقني',
      senderUsername: 'ali_tech',
      keyword: testKeyword,
      messageText: `السلام عليكم، مطلوب حل ${testKeyword} لمشروع التخرج بشكل عاجل اليوم.`,
      replyAction: true,
    });

    showToast('📨 تم إرسال تنبيه تجريبي ومحاكاة رصد فوري للرسائل المحفوظة', '🚨');
  };

  const handleClearAlerts = () => {
    notificationsService.clearAlerts();
    setAlerts([]);
    showToast('🧹 تم مسح سجل التنبيهات', 'info');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        id="modal-sender-activity"
        className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md select-none overflow-y-auto"
        dir="rtl"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => setActiveModal('none')}
          className="fixed inset-0 cursor-pointer"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative z-10 w-full max-w-5xl text-[#e8eaf6] rounded-2xl shadow-2xl overflow-hidden border border-white/10 my-auto flex flex-col max-h-[92vh]"
          style={{
            background: 'linear-gradient(135deg, #0b0f19 0%, #111827 50%, #0d1322 100%)',
            fontFamily: "'Cairo', sans-serif",
          }}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-white/[0.03]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-cyan-400 m-0">الإرسال والمراقبة</h4>
                <p className="text-[10px] text-gray-400 m-0">نشر مجدول وذكي ومراقبة الرسائل والكلمات المفتاحية فورياً</p>
              </div>
            </div>
            <button
              onClick={() => setActiveModal('none')}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body with 2-Column Responsive Layout */}
          <div className="p-3 sm:p-4 overflow-y-auto flex-1 space-y-4">
            {/* 5. الإرسال والمراقبة */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
              {/* العمود الأيمن: الإرسال الذكي والمباشر */}
              <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden backdrop-blur-md flex flex-col">
                <div className="px-3.5 py-2.5 bg-white/[0.04] border-b border-white/[0.06] flex items-center justify-between">
                  <h6 className="text-[0.85rem] font-bold text-white flex items-center gap-2 m-0">
                    <Send className="w-3.5 h-3.5 text-blue-400" />
                    <span>الإرسال الذكي والمباشر</span>
                  </h6>
                </div>
                <div className="p-3 space-y-3 flex-1">
                  {/* الرسالة */}
                  <div>
                    <label className="block text-[0.75rem] font-medium text-gray-300 mb-1">الرسالة</label>
                    <textarea
                      id="message"
                      rows={3}
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="اكتب الرسالة المراد إرسالها"
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-[0.82rem] text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 resize-none transition-all"
                    />
                  </div>

                  {/* إضافة صور للرسالة */}
                  <div>
                    <label className="block text-[0.75rem] font-medium text-gray-300 mb-1 flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                      <span>إضافة صور للرسالة (اختياري)</span>
                    </label>
                    <div
                      id="dropZone"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className="border border-dashed border-white/20 hover:border-cyan-400/50 rounded-xl p-3 text-center cursor-pointer bg-white/[0.02] hover:bg-white/[0.04] transition-all"
                    >
                      <UploadCloud className="w-6 h-6 text-gray-400 mx-auto mb-1 opacity-70" />
                      <p className="text-[0.75rem] text-gray-300 font-medium m-0">اسحب الصور هنا أو انقر للاختيار</p>
                      <small className="text-[0.65rem] text-gray-400">يدعم: JPG, PNG, GIF, WebP | 10MB لكل صورة</small>
                      <input
                        ref={fileInputRef}
                        type="file"
                        id="imageUpload"
                        accept="image/*"
                        multiple
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </div>

                    {/* معاينة الصور */}
                    {uploadedImages.length > 0 && (
                      <div id="imagePreview" className="mt-2">
                        <div id="imagePreviewContainer" className="flex gap-2 flex-wrap">
                          {uploadedImages.map((img, idx) => (
                            <div key={idx} className="relative group w-14 h-14 rounded-lg overflow-hidden border border-white/20">
                              <img src={img} alt="preview" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setUploadedImages((prev) => prev.filter((_, i) => i !== idx));
                                }}
                                className="absolute inset-0 bg-black/60 flex items-center justify-center text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* مجموعات الإرسال */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[0.75rem] font-medium text-gray-300 m-0">مجموعات الإرسال</label>
                      <button
                        type="button"
                        id="fetchDialogsBtn"
                        onClick={handleFetchDialogs}
                        className="btn btn-outline-info text-[0.7rem] py-0.5 px-2 rounded border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20 transition-all flex items-center gap-1"
                        title="جلب جميع المجموعات والقنوات التي اشتركت بها من حسابك في تيليجرام"
                      >
                        <RotateCw className="w-3 h-3" />
                        <span>جلب مجموعاتي من تيليجرام</span>
                      </button>
                    </div>
                    <textarea
                      id="groups"
                      rows={3}
                      value={groupsText}
                      onChange={(e) => setGroupsText(e.target.value)}
                      placeholder="ضع كل مجموعة في سطر منفصل (@username أو رابط المجموعة أو اسمها)"
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-[0.82rem] text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 resize-none font-mono"
                    />
                    <div className="text-[0.68rem] text-gray-400 mt-0.5">
                      📤 يدعم: المعرفات (@group)، الروابط (t.me/group أو t.me/+hash)، أو أسماء المجموعات المشترك بها
                    </div>
                  </div>

                  {/* نوع الإرسال */}
                  <div>
                    <label className="block text-[0.75rem] font-medium text-gray-300 mb-1">نوع الإرسال</label>
                    <select
                      id="sendType"
                      value={sendType}
                      onChange={(e) => setSendType(e.target.value as any)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-[0.75rem] text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="manual">يدوي</option>
                      <option value="scheduled">مجدول</option>
                    </select>
                  </div>

                  {/* خيارات الجدولة */}
                  {sendType === 'scheduled' && (
                    <div id="scheduledOptions" className="grid grid-cols-2 gap-2 p-2 bg-white/[0.02] border border-white/10 rounded-lg">
                      <div>
                        <label className="block text-[0.7rem] text-gray-400 mb-0.5">الفترة (دقائق)</label>
                        <input
                          type="number"
                          id="intervalMinutes"
                          min={1}
                          value={intervalMinutes}
                          onChange={(e) => setIntervalMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full bg-black/50 border border-white/10 rounded p-1.5 text-[0.75rem] text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[0.7rem] text-gray-400 mb-0.5">المدة (ساعات)</label>
                        <input
                          type="number"
                          id="scheduleDuration"
                          min={0}
                          step={0.5}
                          value={scheduleDuration}
                          onChange={(e) => setScheduleDuration(parseFloat(e.target.value) || 0)}
                          className="w-full bg-black/50 border border-white/10 rounded p-1.5 text-[0.75rem] text-white"
                        />
                        <div className="text-[0.6rem] text-gray-500 mt-0.5">0 = غير محدود</div>
                      </div>
                    </div>
                  )}

                  {/* وضع الإرسال عند المجموعات المحمية */}
                  <div>
                    <label className="block text-[0.75rem] font-medium text-gray-300 mb-1 flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-emerald-400" />
                      <span>وضع الإرسال عند المجموعات المحمية</span>
                    </label>
                    <select
                      id="sanitizeMode"
                      value={sanitizeMode}
                      onChange={(e) => setSanitizeMode(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-[0.75rem] text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="salam">🤖 ذكي (salam)</option>
                      <option value="skip">⏭️ تخطي</option>
                      <option value="smart">🧠 ذكية</option>
                      <option value="always">🛡️ تنقية</option>
                      <option value="off">🚫 معطّل</option>
                    </select>

                    <div className="mt-1.5">
                      <button
                        type="button"
                        onClick={() => setShowModeDesc(!showModeDesc)}
                        className="w-full text-right bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 rounded-lg py-1.5 px-2.5 text-[0.65rem] text-gray-300 flex items-center justify-between transition-all"
                      >
                        <span className="flex items-center gap-1">
                          <Info className="w-3 h-3 text-cyan-400" />
                          <span>شرح الأوضاع</span>
                        </span>
                        <ChevronDown className={`w-3 h-3 transition-transform ${showModeDesc ? 'rotate-180' : ''}`} />
                      </button>

                      {showModeDesc && (
                        <div id="modeDesc" className="mt-1.5 p-2 bg-black/40 border border-white/10 rounded-lg text-[0.68rem] text-gray-300 space-y-1 leading-relaxed">
                          <div><strong>🤖 ذكي (salam):</strong> يرسل "السلام عليكم"، ينتظر interval، إن وصلت ≥3 رسائل عدّل إلى رسالتك، وإلا حذف وأعاد الدورة.</div>
                          <div><strong>⏭️ تخطي:</strong> يتجاهل المجموعات المحمية تماماً – الأمن للحساب.</div>
                          <div><strong>🧠 ذكية:</strong> يحذف الروابط والأرقام تلقائياً قبل الإرسال.</div>
                          <div><strong>🛡️ تنقية:</strong> يحذف الروابط من كل رسالة لجميع المجموعات.</div>
                          <div><strong>🚫 معطّل:</strong> يرسل الرسالة كما هي (خطر حظر).</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* أزرار الإجراءات */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      id="saveBtn"
                      onClick={handleSaveSettings}
                      className="w-full py-2 px-3 rounded-lg text-[0.78rem] font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>حفظ الإعدادات</span>
                    </button>
                    <button
                      type="button"
                      id="sendNowBtn"
                      disabled={isSending}
                      onClick={handleSendNow}
                      className="w-full py-2 px-3 rounded-lg text-[0.78rem] font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                    >
                      {isSending ? (
                        <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>إرسال الآن</span>
                    </button>
                  </div>

                  {sendStatusMsg && (
                    <div id="sendStatus" className={`mt-2 p-2 rounded text-[0.75rem] ${sendStatusMsg.success ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
                      {sendStatusMsg.text}
                    </div>
                  )}
                </div>
              </div>

              {/* العمود الأيسر: المراقبة */}
              <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden backdrop-blur-md flex flex-col">
                <div className="px-3.5 py-2.5 bg-white/[0.04] border-b border-white/[0.06] flex items-center justify-between">
                  <h6 className="text-[0.85rem] font-bold text-white flex items-center gap-2 m-0">
                    <Radio className="w-3.5 h-3.5 text-amber-400" />
                    <span>المراقبة</span>
                  </h6>
                </div>
                <div className="p-3 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <label className="block text-[0.75rem] font-medium text-gray-300 mb-1">كلمات المراقبة (اختيارية)</label>
                    <textarea
                      id="watchWords"
                      rows={2}
                      value={watchWords}
                      onChange={(e) => setWatchWords(e.target.value)}
                      placeholder="كل كلمة في سطر"
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-[0.82rem] text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 resize-none font-mono"
                    />
                    <div className="text-[0.68rem] text-gray-400 mt-0.5">
                      🔹 فارغة = تنبيه لكل الرسائل 🔹 كلمات = تنبيه عند ورودها فقط
                    </div>
                  </div>

                  {/* أزرار التحكم بالمراقبة */}
                  <div className="grid grid-cols-3 gap-2">
                    {monitorStatus !== 'running' ? (
                      <button
                        type="button"
                        id="startMonitorBtn"
                        onClick={handleStartMonitoring}
                        className="w-full py-1.5 px-2 rounded-lg text-[0.75rem] font-bold text-white bg-blue-600 hover:bg-blue-500 flex items-center justify-center gap-1 transition-all"
                      >
                        <Play className="w-3 h-3" />
                        <span>بدء</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        id="stopMonitorBtn"
                        onClick={handleStopMonitoring}
                        className="w-full py-1.5 px-2 rounded-lg text-[0.75rem] font-bold text-white bg-rose-600 hover:bg-rose-500 flex items-center justify-center gap-1 transition-all"
                      >
                        <Square className="w-3 h-3" />
                        <span>إيقاف</span>
                      </button>
                    )}

                    <button
                      type="button"
                      id="resumeMonitorBtn"
                      onClick={handleResumeMonitoring}
                      className="w-full py-1.5 px-2 rounded-lg text-[0.75rem] font-bold text-white bg-cyan-600 hover:bg-cyan-500 flex items-center justify-center gap-1 transition-all"
                    >
                      <RotateCw className="w-3 h-3" />
                      <span>استئناف</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleTestAlertTrigger}
                      className="w-full py-1.5 px-2 rounded-lg text-[0.7rem] font-medium text-amber-300 border border-amber-400/40 hover:bg-amber-400/10 flex items-center justify-center gap-1 transition-all"
                      title="اختبار تنبيه فوري ومجمّع"
                    >
                      <Bell className="w-3 h-3" />
                      <span>تجربة</span>
                    </button>
                  </div>

                  {/* شارة الحالة */}
                  <div id="monitorStatus" className="text-center py-1">
                    <span
                      id="monitorState"
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.7rem] font-bold ${
                        monitorStatus === 'running'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${monitorStatus === 'running' ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`} />
                      <span>{monitorStatus === 'running' ? 'نشط • يعمل' : 'غير نشط'}</span>
                    </span>
                  </div>

                  <hr className="border-white/10 my-1" />

                  {/* التنبيهات الواردة */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[0.75rem] text-gray-200 flex items-center gap-1">
                        <Bell className="w-3 h-3 text-amber-400" />
                        <span>التنبيهات الواردة</span>
                        <small className="text-[0.65rem] text-gray-400">(تجميع ذكي + إرسال فوري 📨)</small>
                      </span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={handleClearAlerts}
                          className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/15 text-[0.6rem] text-gray-300"
                        >
                          مسح
                        </button>
                      </div>
                    </div>

                    <div
                      id="alertsList"
                      className="bg-black/30 border border-white/5 rounded-lg p-2 max-h-[180px] overflow-y-auto space-y-1.5 flex-1"
                    >
                      {alerts.length === 0 ? (
                        <div className="text-center text-gray-500 py-5 text-[0.7rem]">
                          في انتظار التنبيهات...
                        </div>
                      ) : (
                        alerts.map((alert) => (
                          <div
                            key={alert.id}
                            className="bg-white/[0.04] hover:bg-white/[0.07] border-r-2 border-amber-400 rounded p-2 text-[0.72rem] transition-all flex flex-col gap-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-amber-300 flex items-center gap-1">
                                <span>🚨 {alert.keyword}</span>
                              </span>
                              <span className="text-[0.6rem] text-gray-400">{alert.timestamp}</span>
                            </div>
                            <p className="text-[0.7rem] text-gray-300 line-clamp-2 m-0">{alert.messageText}</p>
                            <div className="flex items-center justify-between text-[0.62rem] text-gray-400 pt-0.5">
                              <span>{alert.sourceChatTitle}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  jumpToMessage(alert.sourceChatId, alert.id);
                                  setActiveModal('none');
                                }}
                                className="text-cyan-400 hover:underline"
                              >
                                انتقال للرسالة ↗
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
