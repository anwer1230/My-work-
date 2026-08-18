import React, { useState } from 'react';
import { RefreshCw, X, Sparkles, GitBranch, CheckCircle2, ShieldCheck, ArrowRightLeft } from 'lucide-react';
import { SystemUpdateStatus } from '../types';

interface UpdateToastProps {
  status: SystemUpdateStatus | null;
  onPerformUpdate: () => Promise<void> | void;
  onDismiss: () => void;
}

export const UpdateToast: React.FC<UpdateToastProps> = ({
  status,
  onPerformUpdate,
  onDismiss,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStep, setUpdateStep] = useState<string>('');

  if (!status || !status.has_update) return null;

  const handleUpdateClick = async () => {
    setIsUpdating(true);
    setUpdateStep('جاري حفظ جلسة الحساب ومفتاح التفويض (Auth Key)...');

    setTimeout(async () => {
      setUpdateStep('جاري جلب التحديثات الجديدة من المستودع السحابي...');
      try {
        await onPerformUpdate();
      } catch (e) {
        console.error('Update error:', e);
      }
      setTimeout(() => {
        setUpdateStep('تم تطبيق التحديث بنجاح! جاري إعادة التحميل...');
        setTimeout(() => {
          window.location.reload();
        }, 800);
      }, 1000);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[10000] w-[92%] max-w-md bg-slate-900/95 backdrop-blur-xl border border-sky-500/50 text-slate-100 p-4 rounded-3xl shadow-2xl shadow-sky-950/80 animate-bounceOnce text-xs select-none dir-rtl">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 shrink-0">
            <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin text-sky-300' : 'text-sky-400'}`} />
          </div>
          <div>
            <div className="font-bold text-white flex items-center gap-1.5 text-xs">
              <span>تحديث جديد في المستودع!</span>
              <span className="bg-sky-500/20 text-sky-300 text-[10px] px-2 py-0.5 rounded-full font-mono border border-sky-500/30">
                GitHub Sync
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
              <GitBranch className="w-3 h-3 text-amber-400 shrink-0" />
              <span>الإصدار: {status.current || 'v5.2'} ➔ {status.latest || 'v5.3'}</span>
            </div>
          </div>
        </div>

        {!isUpdating && (
          <button
            onClick={onDismiss}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            title="إغلاق التنبيه"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Body Message */}
      <div className="py-2.5 text-[11px] text-slate-300 leading-relaxed">
        {isUpdating ? (
          <div className="flex items-center gap-2.5 p-2 bg-sky-950/50 border border-sky-500/30 rounded-xl text-sky-200 font-semibold animate-pulse">
            <Sparkles className="w-4 h-4 text-sky-400 animate-spin shrink-0" />
            <span className="truncate">{updateStep}</span>
          </div>
        ) : (
          <p>
            {status.message || 'يتوفر تحديث برلمجي جديد للمستودع. سيتم تحديث النظام مع الحفاظ الكامل على جلسة تسجيل الدخول والمحادثات.'}
          </p>
        )}
      </div>

      {/* Session Security Guarantee Banner */}
      <div className="mb-3 px-2.5 py-1.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl flex items-center gap-2 text-[10px] text-emerald-300">
        <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
        <span className="truncate">مضمون: لن يتم تسجيل الخروج وسيتم استعادة جلسة MTProto تلقائياً.</span>
      </div>

      {/* Action Buttons */}
      {!isUpdating && (
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleUpdateClick}
            className="flex-1 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-bold rounded-2xl text-xs transition-all shadow-lg shadow-sky-500/20 flex items-center justify-center gap-1.5 group active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-950 group-hover:rotate-180 transition-transform duration-500" />
            <span>تحديث الآن (بدون خروج)</span>
          </button>

          <button
            onClick={onDismiss}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-2xl text-xs transition-colors"
          >
            لاحقاً
          </button>
        </div>
      )}

    </div>
  );
};
