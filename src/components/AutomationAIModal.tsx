import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  Mail,
  Zap,
  Bookmark,
  Bot,
  Repeat,
  Brain,
  BarChart3,
  FileText,
  Search,
  Users2,
  Maximize2,
  Minimize2,
  RefreshCw,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { SendMonitorTab } from './tabs/SendMonitorTab';
import { BatchesTab } from './tabs/BatchesTab';
import { LinkScraperTab } from './tabs/LinkScraperTab';
import { AutoJoinTab } from './tabs/AutoJoinTab';
import { SavedLinksTab } from './tabs/SavedLinksTab';
import { AutoReplyTab } from './tabs/AutoReplyTab';
import { RotatingTab } from './tabs/RotatingTab';
import { LearningTab } from './tabs/LearningTab';
import { AcademicTab } from './tabs/AcademicTab';
import { DocFormatterTab } from './tabs/DocFormatterTab';
import { AccountsManagerTab } from './tabs/AccountsManagerTab';
import { LiveLogs } from './LiveLogs';
import {
  WhatsAppSettings,
  SentBatch,
  SavedLink,
  AutoReplyRule,
  AutoJoinProgressEvent,
  AcademicAnalysisResult,
  ActivityLog,
} from '../types';

export type AutomationTab =
  | 'send_monitor'
  | 'batches'
  | 'link_scraper'
  | 'autojoin'
  | 'links'
  | 'autoreply'
  | 'rotating'
  | 'learning'
  | 'academic'
  | 'formatter'
  | 'accounts';

interface AutomationAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: AutomationTab;
}

export const AutomationAIModal: React.FC<AutomationAIModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'send_monitor',
}) => {
  const [activeTab, setActiveTab] = useState<AutomationTab>(initialTab);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [settings, setSettings] = useState<WhatsAppSettings>({
    message: '',
    groups: [],
    watch_words: [],
    interval_seconds: 3600,
    send_type: 'manual',
    schedule_duration_hours: 0,
    sanitize_mode: 'salam',
    smart_required_messages: 5,
  });
  const [stats, setStats] = useState({
    sent: 0,
    failed: 0,
    errors: 0,
    discovered_groups: 0,
    active_monitors: 0,
  });
  const [sentBatches, setSentBatches] = useState<SentBatch[]>([]);
  const [savedLinks, setSavedLinks] = useState<SavedLink[]>([]);
  const [linkCategories] = useState<string[]>(['عام', 'تقنية', 'أكاديمي', 'تسويق', 'وظائف']);
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(true);
  const [autoReplyRules, setAutoReplyRules] = useState<AutoReplyRule[]>([]);
  const [rotatingStatus, setRotatingStatus] = useState({
    active: false,
    current_index: 0,
    total_messages: 0,
    interval_minutes: 15,
    last_run: 'لم يتم البدء بعد',
    next_run: 'متوقف',
    target_groups_count: 0,
    messages_preview: [],
  });
  const [learningData, setLearningData] = useState<{
    active_private: boolean;
    active_group: boolean;
    services: Record<string, any>;
  }>({
    active_private: true,
    active_group: true,
    services: {},
  });
  const [autoJoinProgress, setAutoJoinProgress] = useState<AutoJoinProgressEvent | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (initialTab) {
        setActiveTab(initialTab);
      }
      fetchAllData();
    }
  }, [isOpen, initialTab]);

  const addLog = (msg: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    const newLog: ActivityLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      message: msg,
      timestamp: new Date().toLocaleTimeString('ar-SA'),
      type,
    };
    setLogs((prev) => [newLog, ...prev.slice(0, 100)]);
  };

  const fetchAllData = async () => {
    try {
      // 1. Settings & Stats
      const resSettings = await fetch('/api/settings').then((r) => r.json()).catch(() => null);
      if (resSettings) {
        if (resSettings.settings) setSettings(resSettings.settings);
        if (resSettings.stats) setStats(resSettings.stats);
        if (resSettings.monitoring_active !== undefined) setIsMonitoring(resSettings.monitoring_active);
      }

      // 2. Sent Batches
      const resBatches = await fetch('/api/sent_batches').then((r) => r.json()).catch(() => null);
      if (resBatches && resBatches.batches) setSentBatches(resBatches.batches);

      // 3. Saved Links
      const resLinks = await fetch('/api/saved_links').then((r) => r.json()).catch(() => null);
      if (resLinks && resLinks.links) setSavedLinks(resLinks.links);

      // 4. Auto Reply
      const resReply = await fetch('/api/get_auto_replies').then((r) => r.json()).catch(() => null);
      if (resReply) {
        setAutoReplyEnabled(resReply.enabled ?? true);
        setAutoReplyRules(resReply.rules || resReply.auto_replies || []);
      }

      // 5. Rotating Status
      const resRot = await fetch('/api/rotating/status').then((r) => r.json()).catch(() => null);
      if (resRot && resRot.status) setRotatingStatus(resRot.status);

      // 6. Learning
      const resLearn = await fetch('/api/learning/status').then((r) => r.json()).catch(() => null);
      if (resLearn && resLearn.data) setLearningData(resLearn.data);
    } catch (e) {
      console.error('Failed to load automation data:', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAllData();
      addLog('تم فتح مركز الأتمتة المتقدم وتحديث كافة المؤشرات والبيانات', 'info');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handlers
  const handleSaveSettings = async (newSettings: WhatsAppSettings) => {
    try {
      const res = await fetch('/api/save_settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      }).then((r) => r.json());
      if (res && res.success) {
        setSettings(newSettings);
        addLog('تم حفظ إعدادات المراقبة والإرسال بنجاح 💾', 'success');
      }
    } catch (e) {
      addLog('فشل حفظ الإعدادات', 'error');
    }
  };

  const handleSendNow = async (sendOptions?: any) => {
    try {
      addLog('جاري تنفيذ عملية الإرسال الفوري لجميع المجموعات المحددة...', 'info');
      const res = await fetch('/api/send_now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sendOptions || {}),
      }).then((r) => r.json());
      if (res && res.success) {
        addLog(`✅ اكتمل الإرسال بنجاح! تم إرسال ${res.sent_count || 1} رسالة.`, 'success');
        fetchAllData();
      } else {
        addLog(`خطأ في الإرسال: ${res?.error || 'فشلت العملية'}`, 'error');
      }
    } catch (e) {
      addLog('حدث خطأ في الاتصال بالخادم أثناء الإرسال', 'error');
    }
  };

  const handleStartMonitoring = async () => {
    try {
      const res = await fetch('/api/start_monitoring', { method: 'POST' }).then((r) => r.json());
      if (res && res.success) {
        setIsMonitoring(true);
        addLog('🚀 تم تفعيل محرك المراقبة والجدولة التلقائية بنجاح!', 'success');
      }
    } catch (e) {
      addLog('تعذر بدء المراقبة', 'error');
    }
  };

  const handleStopMonitoring = async () => {
    try {
      const res = await fetch('/api/stop_monitoring', { method: 'POST' }).then((r) => r.json());
      if (res && res.success) {
        setIsMonitoring(false);
        addLog('⏹️ تم إيقاف المراقبة التلقائية', 'warning');
      }
    } catch (e) {
      addLog('تعذر إيقاف المراقبة', 'error');
    }
  };

  const handleEditBatch = async (batchId: string, newText: string) => {
    try {
      const res = await fetch('/api/edit_batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch_id: batchId, new_text: newText }),
      }).then((r) => r.json());
      if (res && res.success) {
        addLog('تم تعديل الدفعة بنجاح', 'success');
        fetchAllData();
      }
    } catch (e) {
      addLog('فشل تعديل الدفعة', 'error');
    }
  };

  const handleDeleteBatch = async (batchId: string) => {
    try {
      const res = await fetch('/api/delete_batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch_id: batchId }),
      }).then((r) => r.json());
      if (res && res.success) {
        addLog('تم حذف الدفعة من السجل', 'info');
        setSentBatches((prev) => prev.filter((b) => b.id !== batchId));
      }
    } catch (e) {
      addLog('فشل حذف الدفعة', 'error');
    }
  };

  const handleAddLink = async (link: { url: string; title: string; category: string; notes?: string }) => {
    try {
      const res = await fetch('/api/saved_links/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(link),
      }).then((r) => r.json());
      if (res && res.success) {
        addLog(`تمت إضافة الرابط: ${link.title}`, 'success');
        fetchAllData();
      }
    } catch (e) {
      addLog('فشل حفظ الرابط', 'error');
    }
  };

  const handleDeleteLink = async (id: string) => {
    try {
      const res = await fetch('/api/saved_links/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      }).then((r) => r.json());
      if (res && res.success) {
        addLog('تم حذف الرابط', 'info');
        setSavedLinks((prev) => prev.filter((l) => l.id !== id));
      }
    } catch (e) {
      addLog('فشل حذف الرابط', 'error');
    }
  };

  const handleSendToAutoJoin = (urls: string[]) => {
    setActiveTab('autojoin');
    handleStartAutoJoin({
      links: urls.join('\n'),
      delay: 3,
      max_retries: 3,
    });
  };

  const handleStartAutoJoin = async (config: { links: string; delay: number; max_retries: number }) => {
    try {
      addLog(`بدء الانضمام التلقائي إلى الروابط المحددة...`, 'info');
      const res = await fetch('/api/autojoin/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      }).then((r) => r.json());
      if (res && res.success) {
        addLog(`🚀 جاري الانضمام إلى ${res.total || 'المجموعات'} بسرعة واستقرار!`, 'success');
      }
    } catch (e) {
      addLog('فشل بدء الانضمام التلقائي', 'error');
    }
  };

  const handleStopAutoJoin = async () => {
    try {
      await fetch('/api/autojoin/stop', { method: 'POST' });
      addLog('تم إيقاف الانضمام التلقائي', 'warning');
    } catch (e) {
      addLog('خطأ أثناء إيقاف الانضمام', 'error');
    }
  };

  const handlePauseAutoJoin = async () => {
    try {
      const res = await fetch('/api/autojoin/pause', { method: 'POST' }).then((r) => r.json());
      addLog(res.message || 'تم تبديل حالة الإيقاف المؤقت للانضمام', 'info');
    } catch (e) {
      addLog('خطأ أثناء الإيقاف المؤقت', 'error');
    }
  };

  const handleToggleAutoReply = async (enabled: boolean) => {
    try {
      const res = await fetch('/api/toggle_auto_reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      }).then((r) => r.json());
      if (res && res.success) {
        setAutoReplyEnabled(enabled);
        addLog(enabled ? '⚡ تم تفعيل الرد التلقائي' : '🔴 تم إيقاف الرد التلقائي', 'info');
      }
    } catch (e) {
      addLog('فشل تغيير حالة الرد التلقائي', 'error');
    }
  };

  const handleAddAutoReplyRule = async (rule: Omit<AutoReplyRule, 'used_count' | 'last_used'>) => {
    try {
      const res = await fetch('/api/add_auto_reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rule),
      }).then((r) => r.json());
      if (res && res.success) {
        addLog(`تمت إضافة قاعدة رد لكلمة: ${rule.keyword}`, 'success');
        fetchAllData();
      }
    } catch (e) {
      addLog('فشل إضافة قاعدة الرد', 'error');
    }
  };

  const handleDeleteAutoReplyRule = async (index: number) => {
    try {
      const res = await fetch('/api/delete_auto_reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index }),
      }).then((r) => r.json());
      if (res && res.success) {
        addLog('تم حذف قاعدة الرد', 'info');
        fetchAllData();
      }
    } catch (e) {
      addLog('فشل حذف القاعدة', 'error');
    }
  };

  const handleSaveRotating = async (data: { messages: string[]; groups: string[]; interval_minutes: number }) => {
    try {
      const res = await fetch('/api/rotating/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json());
      if (res && res.success) {
        addLog('تم حفظ إعدادات الإرسال المتسلسل الدوار 🔄', 'success');
        fetchAllData();
      }
    } catch (e) {
      addLog('فشل حفظ إعدادات الإرسال المتسلسل', 'error');
    }
  };

  const handleStartRotating = async () => {
    try {
      const res = await fetch('/api/rotating/start', { method: 'POST' }).then((r) => r.json());
      if (res && res.success) {
        addLog('🚀 تم تشغيل النشر والإرسال المتسلسل الدوار بنجاح!', 'success');
        fetchAllData();
      }
    } catch (e) {
      addLog('فشل تشغيل الإرسال المتسلسل', 'error');
    }
  };

  const handleStopRotating = async () => {
    try {
      const res = await fetch('/api/rotating/stop', { method: 'POST' }).then((r) => r.json());
      if (res && res.success) {
        addLog('⏹️ تم إيقاف الإرسال المتسلسل الدوار', 'warning');
        fetchAllData();
      }
    } catch (e) {
      addLog('فشل إيقاف الإرسال المتسلسل', 'error');
    }
  };

  const handleToggleLearningActive = async (type: 'private' | 'group', active: boolean) => {
    try {
      const payload = type === 'private' ? { active_private: active } : { active_group: active };
      const res = await fetch('/api/learning/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then((r) => r.json());
      if (res && res.success && res.data) {
        setLearningData(res.data);
        addLog(`تم تحديث حالة التعلم الذكي (${type === 'private' ? 'الخاص' : 'المجموعات'})`, 'info');
      }
    } catch (e) {
      addLog('فشل تحديث التعلم الذكي', 'error');
    }
  };

  const handleGenerateAiResponse = async (text: string, senderName?: string): Promise<string> => {
    try {
      const res = await fetch('/api/learning/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, sender_name: senderName }),
      }).then((r) => r.json());
      return res.reply || res.response || 'تم توليد الرد بنجاح';
    } catch (e) {
      return 'حدث خطأ أثناء الاتصال بالذكاء الاصطناعي.';
    }
  };

  const handleAnalyzeAcademic = async (input: string): Promise<AcademicAnalysisResult> => {
    try {
      const res = await fetch('/api/academic/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: input }),
      }).then((r) => r.json());
      return res.result || { stats: { 'اكتمل': 1 }, summary: 'تم إجراء التحليل بنجاح' };
    } catch (e) {
      return {
        stats: { خطأ: 0 },
        summary: 'حدث خطأ في إجراء التحليل',
      };
    }
  };

  const handleExportDoc = async (format: 'docx' | 'xlsx' | 'pptx' | 'pdf', htmlContent: string) => {
    try {
      const res = await fetch('/api/doc/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format, html_content: htmlContent }),
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `document.${format === 'pdf' ? 'pdf' : format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      addLog(`تم تصدير المستند بصيغة ${format.toUpperCase()} بنجاح 📄`, 'success');
    } catch (e) {
      addLog('فشل تصدير المستند', 'error');
    }
  };

  const navItems = [
    { id: 'accounts' as const, label: 'إدارة الحسابات', icon: <Users2 className="w-4 h-4 text-emerald-400" />, badge: 'متعدد' },
    { id: 'send_monitor' as const, label: 'المراقبة والإرسال', icon: <Send className="w-4 h-4" /> },
    { id: 'batches' as const, label: 'رسائلي (الدفعات)', icon: <Mail className="w-4 h-4" /> },
    { id: 'link_scraper' as const, label: 'استخراج وفحص وفرز الروابط', icon: <Search className="w-4 h-4 text-sky-400" />, badge: 'فحص وفرز 🔍' },
    { id: 'autojoin' as const, label: 'الانضمام التلقائي', icon: <Zap className="w-4 h-4" />, badge: 'سريع' },
    { id: 'links' as const, label: 'روابطي المحفوظة', icon: <Bookmark className="w-4 h-4" /> },
    { id: 'autoreply' as const, label: 'الرد التلقائي', icon: <Bot className="w-4 h-4" /> },
    { id: 'rotating' as const, label: 'النشر المتسلسل الدوار', icon: <Repeat className="w-4 h-4" /> },
    { id: 'learning' as const, label: 'التعلم الذكي', icon: <Brain className="w-4 h-4" />, badge: 'AI' },
    { id: 'academic' as const, label: 'التحليل الأكاديمي', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'formatter' as const, label: 'منسق المستندات والبحوث', icon: <FileText className="w-4 h-4" /> },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2500] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md select-none">
      <div
        className={`bg-zinc-950 border border-zinc-800 text-zinc-100 flex flex-col rounded-2xl shadow-2xl transition-all duration-300 overflow-hidden font-['Cairo',sans-serif] ${
          isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-7xl h-[92vh]'
        }`}
        dir="rtl"
      >
        {/* Top App Bar Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-zinc-900/90 border-b border-zinc-800/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-zinc-100 tracking-tight">
                  منظومة أتمتة تليجرام المتقدمة (Enjaz Suite)
                </span>
                <span className="px-2 py-0.5 text-[10px] rounded-md font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  v4.8 Pro
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                أدوات الإرسال الدوار، استخراج وفحص وفرز الروابط، الانضمام التلقائي، والتحليل الأكاديمي الشامل
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={fetchAllData}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="تحديث البيانات"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors hidden sm:block"
              title={isFullscreen ? 'تصغير' : 'ملء الشاشة'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="إغلاق النافذة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="bg-zinc-900/60 border-b border-zinc-800/80 px-2 sm:px-4 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto py-2 scrollbar-none">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50 border border-emerald-500/50'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 border border-transparent'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.5 text-[9px] rounded-md font-black transition-colors ${
                        isActive
                          ? 'bg-zinc-950/40 text-emerald-200 border border-white/10'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-zinc-950/50">
          {activeTab === 'accounts' && (
            <AccountsManagerTab
              onAccountSwitched={() => {
                fetchAllData();
                addLog('تم التبديل إلى الحساب المختار بنجاح 👤', 'success');
              }}
            />
          )}

          {activeTab === 'send_monitor' && (
            <SendMonitorTab
              settings={settings}
              monitoringActive={isMonitoring}
              stats={stats}
              onSaveSettings={handleSaveSettings}
              onSendNow={handleSendNow}
              onStartMonitoring={handleStartMonitoring}
              onStopMonitoring={handleStopMonitoring}
            />
          )}

          {activeTab === 'batches' && (
            <BatchesTab
              batches={sentBatches}
              onEditBatch={handleEditBatch}
              onDeleteBatch={handleDeleteBatch}
              onRefresh={fetchAllData}
            />
          )}

          {activeTab === 'link_scraper' && (
            <LinkScraperTab
              onSendToAutoJoin={(urls) => {
                setActiveTab('autojoin');
                handleStartAutoJoin({
                  links: urls.join('\n'),
                  delay: 3,
                  max_retries: 3,
                });
              }}
              onSaveToSavedLinks={(link) => {
                handleAddLink({
                  url: link.url,
                  title: link.title,
                  category: link.category || 'عام',
                  notes: `تم استخراجه من محادثات تليجرام (${link.source || ''})`,
                });
              }}
              onNavigateTab={(tab) => setActiveTab(tab as AutomationTab)}
            />
          )}

          {activeTab === 'autojoin' && (
            <AutoJoinTab
              onStartAutoJoin={handleStartAutoJoin}
              onStopAutoJoin={handleStopAutoJoin}
              onPauseAutoJoin={handlePauseAutoJoin}
              progressEvent={autoJoinProgress}
            />
          )}

          {activeTab === 'links' && (
            <SavedLinksTab
              links={savedLinks}
              categories={linkCategories}
              onAddLink={handleAddLink}
              onDeleteLink={handleDeleteLink}
              onSendToAutoJoin={handleSendToAutoJoin}
            />
          )}

          {activeTab === 'autoreply' && (
            <AutoReplyTab
              enabled={autoReplyEnabled}
              rules={autoReplyRules}
              onToggleEnabled={handleToggleAutoReply}
              onAddRule={handleAddAutoReplyRule}
              onDeleteRule={handleDeleteAutoReplyRule}
            />
          )}

          {activeTab === 'rotating' && (
            <RotatingTab
              status={rotatingStatus}
              onSave={handleSaveRotating}
              onStart={handleStartRotating}
              onStop={handleStopRotating}
            />
          )}

          {activeTab === 'learning' && (
            <LearningTab
              activePrivate={learningData.active_private}
              activeGroup={learningData.active_group}
              services={learningData.services || {}}
              onToggleActive={handleToggleLearningActive}
              onGenerateAiResponse={handleGenerateAiResponse}
            />
          )}

          {activeTab === 'academic' && <AcademicTab onAnalyze={handleAnalyzeAcademic} />}

          {activeTab === 'formatter' && <DocFormatterTab onExportDoc={handleExportDoc} />}

          {/* Live Activity Terminal */}
          <LiveLogs logs={logs} onClearLogs={() => setLogs([])} />
        </div>
      </div>
    </div>
  );
};
