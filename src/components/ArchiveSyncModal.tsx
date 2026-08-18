import React, { useState, useEffect } from 'react';
import {
  Archive,
  Cloud,
  CloudUpload,
  CloudDownload,
  Clock,
  Calendar,
  CheckCircle2,
  RefreshCw,
  X,
  Database,
  ShieldCheck,
  Check,
  HardDrive,
  Filter,
  Server,
  Settings2,
  ArrowUpRight,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

interface ArchiveSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  archivedCount?: number;
  onTriggerArchiveNow?: () => void;
}

export const ArchiveSyncModal: React.FC<ArchiveSyncModalProps> = ({
  isOpen,
  onClose,
  archivedCount = 18,
  onTriggerArchiveNow,
}) => {
  // Archiving Schedule States
  const [autoArchiveEnabled, setAutoArchiveEnabled] = useState<boolean>(true);
  const [scheduleFrequency, setScheduleFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [scheduleTime, setScheduleTime] = useState<string>('02:00');
  const [scheduleDay, setScheduleDay] = useState<string>('friday');
  const [cloudProvider, setCloudProvider] = useState<'telegram' | 'gdrive' | 'local'>('telegram');

  // Rules & Filters
  const [archiveInactiveOnly, setArchiveInactiveOnly] = useState<boolean>(true);
  const [includeMedia, setIncludeMedia] = useState<boolean>(true);
  const [enableEncryption, setEnableEncryption] = useState<boolean>(true);

  // Status & Execution States
  const [isArchivingNow, setIsArchivingNow] = useState<boolean>(false);
  const [archiveProgress, setArchiveProgress] = useState<number>(0);
  const [archiveStepText, setArchiveStepText] = useState<string>('');
  const [lastArchiveDate, setLastArchiveDate] = useState<string>('اليوم 02:00 ص');
  const [nextArchiveDate, setNextArchiveDate] = useState<string>('غداً 02:00 ص');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [cloudSizeMB, setCloudSizeMB] = useState<number>(142.8);

  // Load saved settings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tg_archive_sync_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.autoArchiveEnabled !== undefined) setAutoArchiveEnabled(parsed.autoArchiveEnabled);
        if (parsed.scheduleFrequency) setScheduleFrequency(parsed.scheduleFrequency);
        if (parsed.scheduleTime) setScheduleTime(parsed.scheduleTime);
        if (parsed.scheduleDay) setScheduleDay(parsed.scheduleDay);
        if (parsed.cloudProvider) setCloudProvider(parsed.cloudProvider);
        if (parsed.archiveInactiveOnly !== undefined) setArchiveInactiveOnly(parsed.archiveInactiveOnly);
        if (parsed.includeMedia !== undefined) setIncludeMedia(parsed.includeMedia);
        if (parsed.enableEncryption !== undefined) setEnableEncryption(parsed.enableEncryption);
        if (parsed.lastArchiveDate) setLastArchiveDate(parsed.lastArchiveDate);
      }
    } catch (e) {
      console.warn('Error loading archive settings:', e);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle saving configuration
  const handleSaveSettings = () => {
    const config = {
      autoArchiveEnabled,
      scheduleFrequency,
      scheduleTime,
      scheduleDay,
      cloudProvider,
      archiveInactiveOnly,
      includeMedia,
      enableEncryption,
      lastArchiveDate,
    };
    localStorage.setItem('tg_archive_sync_settings', JSON.stringify(config));
    setStatusMessage('✅ تم حفظ جدول ومواصفات الأرشفة التلقائية بنجاح!');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Trigger manual archive process with realistic animated progress
  const handleArchiveNow = async () => {
    setIsArchivingNow(true);
    setArchiveProgress(10);
    setArchiveStepText('تجميع وسائط ومحادثات الأرشيف المحلي...');

    try {
      if (onTriggerArchiveNow) {
        onTriggerArchiveNow();
      }

      await new Promise((r) => setTimeout(r, 600));
      setArchiveProgress(40);
      setArchiveStepText('تشفير بيانات المحادثات بواسطة مفتاح AES-256...');

      await new Promise((r) => setTimeout(r, 800));
      setArchiveProgress(75);
      setArchiveStepText(`رفع حزمة الأرشيف إلى ${cloudProvider === 'telegram' ? 'سحابة تليجرام' : cloudProvider === 'gdrive' ? 'Google Drive' : 'التخزين المحلي المحمي'}...`);

      await new Promise((r) => setTimeout(r, 900));
      setArchiveProgress(100);
      setArchiveStepText('تمت عملية الأرشفة والمزامنة بنجاح!');

      const nowStr = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
      const newDate = `اليوم ${nowStr}`;
      setLastArchiveDate(newDate);
      setCloudSizeMB((prev) => +(prev + 3.4).toFixed(1));

      // Update next schedule
      if (scheduleFrequency === 'daily') {
        setNextArchiveDate(`غداً ${scheduleTime}`);
      } else if (scheduleFrequency === 'weekly') {
        setNextArchiveDate(`الأسبوع القادم (${scheduleDay}) ${scheduleTime}`);
      } else {
        setNextArchiveDate(`الشهر القادم ${scheduleTime}`);
      }

      setStatusMessage('🎉 تم إتمام الأرشفة والمزامنة السحابية بنجاح!');
    } catch (e) {
      setStatusMessage('⚠️ حدث خطأ أثناء الأرشفة السحابية. يرجى المحاولة لاحقاً.');
    } finally {
      setTimeout(() => {
        setIsArchivingNow(false);
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none dir-rtl animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-sky-900 via-blue-900 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 shadow-md">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>جدولة الأرشفة السحابية التلقائية</span>
                <span className="bg-sky-500/20 text-sky-300 text-[10px] px-2 py-0.5 rounded-full font-mono border border-sky-500/30">
                  Cloud Sync
                </span>
              </h3>
              <p className="text-xs text-sky-200/80 mt-0.5">
                أرشفة المحادثات حمايةً للبيانات وتوفيراً للمساحة المحلية
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-colors"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 space-y-5 overflow-y-auto custom-scrollbar flex-1 text-xs">
          
          {/* Status Message Toast */}
          {statusMessage && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-300 font-semibold flex items-center gap-2 animate-fadeIn text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* 1. Live Archiving Status Dashboard Card */}
          <div className="p-4 bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800 rounded-2xl space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-sky-400" />
                <span className="font-bold text-slate-200 text-sm">حالة الأرشفة السحابية الحالية</span>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-500/15 text-emerald-400 px-2.5 py-1 rounded-full text-[11px] font-bold border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>متزامن مع السحابة</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-1">
              <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                <div className="text-slate-400 text-[10px]">عدد المحادثات المؤرشفة</div>
                <div className="text-base font-bold text-sky-400 font-mono mt-0.5">{archivedCount} محادثة</div>
              </div>
              <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                <div className="text-slate-400 text-[10px]">حجم الأرشيف بالسحابة</div>
                <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">{cloudSizeMB} MB</div>
              </div>
              <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                <div className="text-slate-400 text-[10px]">آخر أرشفة تمت</div>
                <div className="text-xs font-semibold text-slate-200 mt-1 truncate">{lastArchiveDate}</div>
              </div>
              <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                <div className="text-slate-400 text-[10px]">الأرشفة التلقائية القادمة</div>
                <div className="text-xs font-semibold text-amber-300 mt-1 truncate">
                  {autoArchiveEnabled ? nextArchiveDate : 'متوقفة'}
                </div>
              </div>
            </div>

            {/* Live Progress Bar if Archiving */}
            {isArchivingNow && (
              <div className="pt-2 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-sky-300">
                  <span className="flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400" />
                    <span>{archiveStepText}</span>
                  </span>
                  <span className="font-mono">{archiveProgress}%</span>
                </div>
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800 p-0.5">
                  <div
                    className="bg-gradient-to-r from-sky-500 to-emerald-400 h-full rounded-full transition-all duration-300 shadow"
                    style={{ width: `${archiveProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Trigger Button */}
            {!isArchivingNow && (
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleArchiveNow}
                  className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <CloudUpload className="w-4 h-4" />
                  <span>بدء الأرشفة السحابية الآن (Archive Now)</span>
                </button>
              </div>
            )}
          </div>

          {/* 2. Schedule Configuration (توقيت الأرشفة التلقائي) */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-slate-200 text-sm">جدولة التوقيت التلقائي (Schedule)</span>
              </div>
              
              {/* Toggle Auto Archive */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoArchiveEnabled}
                  onChange={(e) => setAutoArchiveEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
                <span className="mr-2 text-xs font-semibold text-slate-300">
                  {autoArchiveEnabled ? 'مفعلة' : 'معطلة'}
                </span>
              </label>
            </div>

            {autoArchiveEnabled ? (
              <div className="space-y-3 pt-1">
                {/* Frequency Selector */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    تكرار جدول الأرشفة التلقائية:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setScheduleFrequency('daily')}
                      className={`p-2.5 rounded-xl border text-center font-bold transition-all flex items-center justify-center gap-1.5 ${
                        scheduleFrequency === 'daily'
                          ? 'bg-sky-500/20 text-sky-300 border-sky-400 shadow-md'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>يومي (Daily)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setScheduleFrequency('weekly')}
                      className={`p-2.5 rounded-xl border text-center font-bold transition-all flex items-center justify-center gap-1.5 ${
                        scheduleFrequency === 'weekly'
                          ? 'bg-sky-500/20 text-sky-300 border-sky-400 shadow-md'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>أسبوعي (Weekly)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setScheduleFrequency('monthly')}
                      className={`p-2.5 rounded-xl border text-center font-bold transition-all flex items-center justify-center gap-1.5 ${
                        scheduleFrequency === 'monthly'
                          ? 'bg-sky-500/20 text-sky-300 border-sky-400 shadow-md'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <Database className="w-3.5 h-3.5" />
                      <span>شهري (Monthly)</span>
                    </button>
                  </div>
                </div>

                {/* Specific Execution Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-slate-400 text-[11px] font-semibold mb-1">
                      وقت تنفيذ الأرشفة اليومي/الأسبوعي:
                    </label>
                    <div className="relative">
                      <Clock className="w-4 h-4 text-sky-400 absolute left-3 top-2.5 pointer-events-none" />
                      <input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-sky-400"
                      />
                    </div>
                  </div>

                  {scheduleFrequency === 'weekly' && (
                    <div>
                      <label className="block text-slate-400 text-[11px] font-semibold mb-1">
                        يوم الأرشفة الأسبوعية المحدد:
                      </label>
                      <select
                        value={scheduleDay}
                        onChange={(e) => setScheduleDay(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-sky-400"
                      >
                        <option value="friday">يوم الجمعة</option>
                        <option value="saturday">يوم السبت</option>
                        <option value="sunday">يوم الأحد</option>
                        <option value="monday">يوم الإثنين</option>
                        <option value="thursday">يوم الخميس</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-slate-400 text-[11px] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>تم إيقاف الأرشفة التلقائية. يمكنك الأرشفة يدوياً في أي وقت.</span>
              </div>
            )}
          </div>

          {/* 3. Cloud Provider & Storage Destination */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
              <Server className="w-4 h-4 text-sky-400" />
              <span className="font-bold text-slate-200 text-sm">وجهة التخزين والسحابة المستهدفة</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCloudProvider('telegram')}
                className={`p-3 rounded-xl border text-right transition-all space-y-1 ${
                  cloudProvider === 'telegram'
                    ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-xs">
                  <span>سحابة تليجرام</span>
                  {cloudProvider === 'telegram' && <Check className="w-3.5 h-3.5 text-sky-400" />}
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-1">غير محدودة ومجانية</p>
              </button>

              <button
                type="button"
                onClick={() => setCloudProvider('gdrive')}
                className={`p-3 rounded-xl border text-right transition-all space-y-1 ${
                  cloudProvider === 'gdrive'
                    ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-xs">
                  <span>Google Drive / S3</span>
                  {cloudProvider === 'gdrive' && <Check className="w-3.5 h-3.5 text-sky-400" />}
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-1">تخزين سحابي آمن</p>
              </button>

              <button
                type="button"
                onClick={() => setCloudProvider('local')}
                className={`p-3 rounded-xl border text-right transition-all space-y-1 ${
                  cloudProvider === 'local'
                    ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-xs">
                  <span>الأرشيف المحلي</span>
                  {cloudProvider === 'local' && <Check className="w-3.5 h-3.5 text-sky-400" />}
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-1">IndexedDB مشفر</p>
              </button>
            </div>
          </div>

          {/* 4. Filter Options & Security Rules */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
              <Filter className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-slate-200 text-sm">شروط وقواعد الأرشفة التلقائية</span>
            </div>

            <div className="space-y-2.5">
              <label className="flex items-center gap-2.5 p-2 bg-slate-900/80 rounded-xl border border-slate-800/80 cursor-pointer hover:bg-slate-900">
                <input
                  type="checkbox"
                  checked={archiveInactiveOnly}
                  onChange={(e) => setArchiveInactiveOnly(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-sky-500 w-4 h-4"
                />
                <div>
                  <div className="font-bold text-slate-200 text-xs">أرشفة المحادثات غير النشطة فقط</div>
                  <div className="text-[10px] text-slate-400">نقل المحادثات التي لم تتلقَّ رسائل جديدة منذ 30 يوماً تلقائياً للأرشيف</div>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2 bg-slate-900/80 rounded-xl border border-slate-800/80 cursor-pointer hover:bg-slate-900">
                <input
                  type="checkbox"
                  checked={includeMedia}
                  onChange={(e) => setIncludeMedia(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-sky-500 w-4 h-4"
                />
                <div>
                  <div className="font-bold text-slate-200 text-xs">تضمين الوسائط والمستندات في الأرشيف السحابي</div>
                  <div className="text-[10px] text-slate-400">حفظ الصور، مقاطع الصوت، والملفات المرفقة ضمن حزمة الأرشيف</div>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2 bg-slate-900/80 rounded-xl border border-slate-800/80 cursor-pointer hover:bg-slate-900">
                <input
                  type="checkbox"
                  checked={enableEncryption}
                  onChange={(e) => setEnableEncryption(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-sky-500 w-4 h-4"
                />
                <div>
                  <div className="font-bold text-slate-200 text-xs flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>تشفير الأرشيف السحابي بكلمة سر (AES-256)</span>
                  </div>
                  <div className="text-[10px] text-slate-400">حماية محادثاتك وأرشيفك ضد الوصول غير المصرح به</div>
                </div>
              </label>
            </div>
          </div>

          {/* 5. Archive History Log preview */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-slate-300 font-bold border-b border-slate-800/80 pb-2">
              <span className="flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-sky-400" />
                <span>سجل أحدث عمليات الأرشفة</span>
              </span>
              <span className="text-[10px] text-slate-500">3 سجلات أخيرة</span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between p-2 bg-slate-900/60 rounded-xl border border-slate-800/60">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="font-semibold text-slate-200">أرشفة تلقائية يومية</span>
                </div>
                <div className="text-slate-400 font-mono text-[10px]">اليوم 02:00 ص (14.2 MB)</div>
              </div>

              <div className="flex items-center justify-between p-2 bg-slate-900/60 rounded-xl border border-slate-800/60">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="font-semibold text-slate-200">أرشفة أسبوعية شاملة</span>
                </div>
                <div className="text-slate-400 font-mono text-[10px]">الأسبوع الماضي (128.6 MB)</div>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Action Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
          >
            إلغاء
          </button>

          <button
            onClick={handleSaveSettings}
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg"
          >
            <Check className="w-4 h-4" />
            <span>حفظ جدول وإعدادات الأرشفة</span>
          </button>
        </div>

      </div>
    </div>
  );
};
