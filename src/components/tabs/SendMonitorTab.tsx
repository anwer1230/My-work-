import React, { useState } from 'react';
import { 
  Send, 
  Upload, 
  Trash2, 
  Image as ImageIcon, 
  Play, 
  Square, 
  ShieldCheck, 
  Clock, 
  Settings2,
  AlertCircle,
  CheckCircle2,
  Activity,
  Zap,
  Layers,
  Sparkles
} from 'lucide-react';
import { WhatsAppSettings, SanitizeMode, SendType } from '../../types';

interface SendMonitorTabProps {
  settings: WhatsAppSettings;
  monitoringActive: boolean;
  stats?: { sent: number; errors: number; received: number };
  onSaveSettings: (updated: Partial<WhatsAppSettings>) => void;
  onSendNow: (data: { message: string; groups: string; images: any[]; send_to_all: boolean; action?: SanitizeMode }) => void;
  onStartMonitoring: () => void;
  onStopMonitoring: () => void;
}

export const SendMonitorTab: React.FC<SendMonitorTabProps> = ({
  settings,
  monitoringActive,
  stats = { sent: 0, errors: 0, received: 0 },
  onSaveSettings,
  onSendNow,
  onStartMonitoring,
  onStopMonitoring
}) => {
  const [message, setMessage] = useState(settings.message || '');
  const [groups, setGroups] = useState((settings.groups || []).join('\n'));
  const [watchWords, setWatchWords] = useState((settings.watch_words || []).join('\n'));
  const [sanitizeMode, setSanitizeMode] = useState<SanitizeMode>(settings.sanitize_mode || 'salam');
  const [sendType, setSendType] = useState<SendType>(settings.send_type || 'manual');
  const [intervalMinutes, setIntervalMinutes] = useState(Math.max(1, Math.floor((settings.interval_seconds || 1500) / 60)));
  const [scheduleDurationHours, setScheduleDurationHours] = useState(settings.schedule_duration_hours || 0);
  const [images, setImages] = useState<Array<{ name: string; data: string; type: string }>>([]);
  const [sendToAll, setSendToAll] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const safeSent = Number(stats?.sent) || 0;
  const safeErrors = Number((stats as any)?.errors ?? (stats as any)?.failed ?? 0) || 0;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files: File[] = Array.from(e.target.files);
    files.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages((prev) => [
            ...prev,
            { name: file.name, data: event.target!.result as string, type: file.type }
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendNowClick = async () => {
    setIsSending(true);
    await onSendNow({
      message,
      groups,
      images,
      send_to_all: sendToAll,
      action: sanitizeMode
    });
    setIsSending(false);
  };

  const handleSaveClick = () => {
    onSaveSettings({
      message,
      groups: groups.split('\n').map((g) => g.trim()).filter(Boolean),
      watch_words: watchWords.split('\n').map((w) => w.trim()).filter(Boolean),
      sanitize_mode: sanitizeMode,
      send_type: sendType,
      interval_seconds: intervalMinutes * 60,
      schedule_duration_hours: scheduleDurationHours
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Quick Status */}
      <div className="bg-gradient-to-r from-sky-950/40 via-zinc-900/60 to-zinc-950 border border-sky-500/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl backdrop-blur-md">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-zinc-100 font-extrabold text-sm sm:text-base">نظام مراقبة وإرسال النشرات عبر تليجرام (Telegram MTProto)</h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                monitoringActive 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
              }`}>
                {monitoringActive ? '🟢 المراقبة نشطة' : '⚪ متوقف'}
              </span>
            </div>
            <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
              إعداد رسالة النشر، رفع الصور، تحديد المجموعات المستهدفة، وضبط وضع الحماية الذكية مع الفاصل الزمني.
            </p>
          </div>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <div className="bg-zinc-950/80 border border-zinc-800 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs">
            <span className="text-zinc-400 font-medium">المرسلة:</span>
            <span className="text-emerald-400 font-bold font-mono">{safeSent}</span>
          </div>
          <div className="bg-zinc-950/80 border border-zinc-800 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs">
            <span className="text-zinc-400 font-medium">الأخطاء:</span>
            <span className="text-rose-400 font-bold font-mono">{safeErrors}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Input Controls */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* 1. Message Input */}
          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-5 shadow-2xl backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-bold text-zinc-100 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-black">1</span>
                <span>محتوى الرسالة المراد إرسالها (Message)</span>
              </label>
              <span className="text-[11px] text-zinc-500 font-mono">{message.length} حرف</span>
            </div>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="اكتب نص الرسالة التسويقية أو الإرشادية هنا..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/80 transition-all font-medium leading-relaxed"
            />
          </div>

          {/* Image Drag/Drop Upload Zone */}
          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-5 shadow-2xl backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-bold text-zinc-100 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center text-xs font-black">2</span>
                <span>رفع المرفقات والصور</span>
              </label>
              <span className="text-xs text-zinc-400 font-normal">اختياري (JPG, PNG, WEBP)</span>
            </div>

            <label className="border-2 border-dashed border-zinc-800 hover:border-emerald-500/60 bg-zinc-950/60 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all">
              <Upload className="w-7 h-7 text-emerald-400 mb-1.5" />
              <span className="text-xs font-bold text-zinc-300">انقر هنا لاختيار الصور أو اسحبها برفق</span>
              <span className="text-[10px] text-zinc-500 mt-0.5">يمكنك إرفاق عدة صور لإرسالها كألبوم متكامل</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-3 pt-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
                    <img src={img.data} alt={img.name} className="w-full h-24 object-cover" />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-lg opacity-90 hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="absolute bottom-1 left-1 right-1 text-[10px] text-white bg-zinc-950/80 px-1 py-0.5 rounded truncate">
                      {img.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Groups & Telegram Targets */}
          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-5 shadow-2xl backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-bold text-zinc-100 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xs font-black">3</span>
                <span>القنوات والمجموعات المستهدفة (Groups & Channels)</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-bold text-sky-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendToAll}
                  onChange={(e) => setSendToAll(e.target.checked)}
                  className="rounded border-zinc-800 text-sky-500 focus:ring-sky-500 bg-zinc-950"
                />
                الإرسال لكافة المجموعات
              </label>
            </div>
            <textarea
              rows={5}
              disabled={sendToAll}
              value={groups}
              onChange={(e) => setGroups(e.target.value)}
              placeholder={`ضع رابط قناة أو معرف تليجرام في كل سطر:\nhttps://t.me/academic_services_group\n@academic_researches_sa\nhttps://t.me/+AbCdEfGhIjKlMnOp\n@graduation_projects_help`}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-sky-500/80 transition-all font-mono text-xs leading-relaxed disabled:opacity-50"
            />
          </div>

          {/* 4. Watch Words */}
          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-5 shadow-2xl backdrop-blur-xl space-y-3">
            <label className="block text-sm font-bold text-zinc-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-black">4</span>
              <span>كلمات المراقبة المستهدفة (Watch Words)</span>
            </label>
            <textarea
              rows={3}
              value={watchWords}
              onChange={(e) => setWatchWords(e.target.value)}
              placeholder="ضع كل كلمة في سطر منفصل (مثل: واجب، بحث، استفسار، مشروع تخرج)..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/80 transition-all font-medium"
            />
          </div>

        </div>

        {/* Right 1 Column: Protection, Schedules & Buttons */}
        <div className="space-y-5">
          
          {/* Sanitize Mode Select */}
          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-5 shadow-2xl backdrop-blur-xl space-y-3">
            <label className="block text-sm font-bold text-zinc-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>وضع أمان وتنقية المجموعات</span>
            </label>
            <select
              value={sanitizeMode}
              onChange={(e) => setSanitizeMode(e.target.value as SanitizeMode)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500/80"
            >
              <option value="salam">🤖 ذكي (salam) — أرسل "السلام عليكم" ثم عدّل عند النشاط (موصى به ✅)</option>
              <option value="skip">⏭️ تخطي — لا ترسل للمجموعات المحمية والبوتات</option>
              <option value="smart">🧠 ذكية — ينقّي الرسالة (يحذف الروابط والأرقام)</option>
              <option value="always">🛡️ تنقية — أرسل مع حذف الروابط دائماً</option>
              <option value="off">🚫 معطّل — أرسل كما هي بدون معالجة</option>
            </select>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              * وضع سلام الذكي يرسل إلقاء تحية طبيعية أولاً ثم يحدّث الرسالة عند وجود حركة لمنع كشف الإرسال الآلي.
            </p>
          </div>

          {/* Scheduling Configuration */}
          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-5 shadow-2xl backdrop-blur-xl space-y-4">
            <label className="block text-sm font-bold text-zinc-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>جدولة الإرسال التلقائي</span>
            </label>

            <div>
              <span className="text-xs font-semibold text-zinc-300 block mb-1">نوع الإرسال (Send Type)</span>
              <select
                value={sendType}
                onChange={(e) => setSendType(e.target.value as SendType)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500/80"
              >
                <option value="manual">يدوي (عند النقر فقط)</option>
                <option value="scheduled">مجدول (إرسال دوري تلقائي)</option>
              </select>
            </div>

            <div>
              <span className="text-xs font-semibold text-zinc-300 block mb-1">الفاصل الزمني بالدقائق</span>
              <input
                type="number"
                min="1"
                value={intervalMinutes}
                onChange={(e) => setIntervalMinutes(parseInt(e.target.value) || 1)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500/80"
              />
            </div>

            <div>
              <span className="text-xs font-semibold text-zinc-300 block mb-1">مدة التشغيل بالساعات (0 = غير محدود)</span>
              <input
                type="number"
                min="0"
                step="0.5"
                value={scheduleDurationHours}
                onChange={(e) => setScheduleDurationHours(parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500/80"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            
            <button
              onClick={handleSendNowClick}
              disabled={isSending}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-950/50 border border-emerald-500/30 transition-all active:scale-95 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {isSending ? 'جارِ الإرسال...' : 'إرسال الآن (Send Now)'}
            </button>

            <button
              onClick={handleSaveClick}
              className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 font-bold text-xs rounded-xl border border-zinc-700/60 transition-all shadow-sm"
            >
              <Settings2 className="w-4 h-4" />
              حفظ الإعدادات والتفضيلات
            </button>

            {monitoringActive ? (
              <button
                onClick={onStopMonitoring}
                className="w-full flex items-center justify-center gap-2 py-3 bg-rose-600/90 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-950/40 border border-rose-500/30 transition-all"
              >
                <Square className="w-4 h-4 fill-white" />
                إيقاف المراقبة والتسجيل
              </button>
            ) : (
              <button
                onClick={onStartMonitoring}
                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/40 border border-emerald-500/30 transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                بدء المراقبة والإرسال الآلي
              </button>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
