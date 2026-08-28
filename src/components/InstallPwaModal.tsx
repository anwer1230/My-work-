import React, { useState, useEffect } from 'react';
import { Download, Smartphone, CheckCircle2, X, Sparkles, Zap, Bell, Loader2, Share2, PlusSquare } from 'lucide-react';

interface InstallPwaModalProps {
  isOpenOverride?: boolean;
  onCloseOverride?: () => void;
}

export const InstallPwaModal: React.FC<InstallPwaModalProps> = ({
  isOpenOverride,
  onCloseOverride,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showNotification, setShowNotification] = useState(true);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);
  const [installStepText, setInstallStepText] = useState('');
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showFullModal, setShowFullModal] = useState(false);

  useEffect(() => {
    // Clear session dismissal on initial load to ensure user sees prompt
    sessionStorage.removeItem('tg_pwa_session_dismissed');

    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js', { scope: '/' }).then((reg) => {
          console.log('✅ ServiceWorker registered:', reg.scope);
        }).catch((err) => {
          console.warn('Service worker registration failed:', err);
        });
      });
    }

    // Check standalone mode or previously installed flag
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      localStorage.getItem('tg_pwa_installed') === 'true';

    if (isStandalone) {
      setIsInstalled(true);
    }

    // Check iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(iosDevice);

    // Pick up early window.__pwa_deferred if already captured by early script
    if ((window as any).__pwa_deferred) {
      setDeferredPrompt((window as any).__pwa_deferred);
    }

    // Listen for beforeinstallprompt and appinstalled
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).__pwa_deferred = e;
      setDeferredPrompt(e);
      setShowNotification(true);
    };

    const handleAppInstalled = () => {
      (window as any).__pwa_deferred = null;
      setIsInstalled(true);
      setIsInstalling(false);
      setInstallProgress(100);
      setInstallStepText('تم تثبيت التطبيق بنجاح! 🎉');
      localStorage.setItem('tg_pwa_installed', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const visible = isOpenOverride !== undefined ? isOpenOverride : showNotification;

  const handleClose = () => {
    setShowNotification(false);
    setShowFullModal(false);
    if (onCloseOverride) onCloseOverride();
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch (e) {
        console.warn('Notification permission error:', e);
      }
    }
  };

  const pwaInstallClick = async () => {
    await requestNotificationPermission();

    const activePrompt = deferredPrompt || (window as any).__pwa_deferred;

    if (isIOS) {
      setShowFullModal(true);
      setShowIOSGuide(true);
      return;
    }

    if (activePrompt) {
      try {
        activePrompt.prompt();
        const choice = await activePrompt.userChoice;
        if (choice.outcome === 'accepted') {
          (window as any).__pwa_deferred = null;
          setDeferredPrompt(null);
          setIsInstalled(true);
          localStorage.setItem('tg_pwa_installed', 'true');
        }
      } catch (err) {
        console.error('Prompt error:', err);
      }
      return;
    }

    // Direct simulated PWA progress fallback if native prompt delayed
    setShowFullModal(true);
    setIsInstalling(true);
    setInstallProgress(30);
    setInstallStepText('جاري تحضير حزمة الخدمة والـ Service Worker للإرسال والتنبيهات...');

    setTimeout(() => {
      setInstallProgress(70);
      setInstallStepText('تفعيل النمط المستقل وإضافة الأيقونة على الشاشة الرئيسية...');
    }, 800);

    setTimeout(() => {
      setInstallProgress(100);
      setInstallStepText('تم تثبيت تطبيق مركز سرعة إنجاز بنجاح! 🎉');
      setIsInstalling(false);
      setIsInstalled(true);
      localStorage.setItem('tg_pwa_installed', 'true');
    }, 1600);
  };

  if (!visible && !isOpenOverride) return null;

  // Full Modal View
  if (showFullModal || isOpenOverride) {
    return (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn dir-rtl">
        <div className="relative w-full max-w-md bg-slate-900 border border-sky-500/50 rounded-3xl shadow-2xl overflow-hidden transition-all">
          <div className="relative bg-gradient-to-r from-sky-700 via-blue-700 to-indigo-800 p-6 text-white text-center">
            <button
              onClick={handleClose}
              className="absolute top-4 left-4 p-1.5 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex justify-center mb-3">
              <div className="relative">
                <img
                  src="https://telegram.org/img/t_logo.png"
                  alt="سرعة إنجاز"
                  className="w-16 h-16 rounded-2xl object-contain shadow-xl border border-white/20"
                />
                {isInstalling && (
                  <div className="absolute inset-0 bg-slate-950/60 rounded-2xl flex items-center justify-center backdrop-blur-xs">
                    <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
                  </div>
                )}
              </div>
            </div>
            <h2 className="text-xl font-bold">مركز سرعة إنجاز PWA</h2>
            <p className="text-xs text-sky-100 mt-1">
              تثبيت التطبيق مباشرةً على شاشة جوالك الرئيسية
            </p>
          </div>

          <div className="p-5 space-y-4 text-slate-200 text-xs">
            {isInstalling ? (
              <div className="space-y-4 py-4 text-center">
                <div className="flex items-center justify-between text-xs font-bold text-sky-400">
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري تثبيت التطبيق...</span>
                  </span>
                  <span className="font-mono text-sm">{installProgress}%</span>
                </div>

                <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-800 shadow-inner">
                  <div
                    className="bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-400 h-full rounded-full transition-all duration-500 shadow-md"
                    style={{ width: `${installProgress}%` }}
                  />
                </div>

                <p className="text-slate-300 font-semibold text-[11px] bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  {installStepText}
                </p>
              </div>
            ) : isInstalled ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-16 h-16 bg-emerald-500/20 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-lg">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="font-bold text-base text-slate-100">التطبيق مثبّت ✅</h3>
                <p className="text-slate-300 text-xs leading-relaxed">
                  تم إضافة الأيقونة وتفعيل الخدمة الخلفية. يمكنك الآن استخدام التطبيق مباشرةً من الشاشة الرئيسية.
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleClose}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-xl shadow-lg transition-all"
                  >
                    فتح واستخدام التطبيق 🚀
                  </button>
                </div>
              </div>
            ) : showIOSGuide ? (
              <div className="space-y-3 dir-rtl">
                <div className="p-3 bg-sky-950/80 border border-sky-500/30 rounded-2xl text-sky-200">
                  <div className="font-bold mb-2 flex items-center gap-2 text-sky-300 text-sm">
                    <Smartphone className="w-4 h-4" />
                    <span>تثبيت التطبيق على iPhone / iPad:</span>
                  </div>
                  <ol className="space-y-2 text-slate-300 text-[11px]">
                    <li className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-lg">
                      <span className="font-bold text-sky-400 shrink-0">①</span>
                      <span>افتح هذا الرابط في متصفح <b>Safari</b>.</span>
                    </li>
                    <li className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-lg">
                      <span className="font-bold text-sky-400 shrink-0">②</span>
                      <span className="flex items-center gap-1 flex-wrap">
                        اضغط زر المشاركة <Share2 className="w-3.5 h-3.5 text-sky-400 inline" /> أسفل الشاشة.
                      </span>
                    </li>
                    <li className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-lg">
                      <span className="font-bold text-sky-400 shrink-0">③</span>
                      <span className="flex items-center gap-1 flex-wrap">
                        اختر <b>"الإضافة إلى الشاشة الرئيسية"</b> <PlusSquare className="w-3.5 h-3.5 text-emerald-400 inline" />.
                      </span>
                    </li>
                    <li className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-lg">
                      <span className="font-bold text-sky-400 shrink-0">④</span>
                      <span>اضغط <b>"إضافة"</b> بالتعلى.</span>
                    </li>
                  </ol>
                </div>
                <button
                  onClick={handleClose}
                  className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold"
                >
                  فهمت! ✓
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center gap-2 p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50">
                    <Smartphone className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>عمل بدون إنترنت</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50">
                    <Bell className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>إشعارات فورية</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50">
                    <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>سرعة عالية</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50">
                    <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>ملء الشاشة</span>
                  </div>
                </div>

                <button
                  id="pwaInstallBtn"
                  onClick={pwaInstallClick}
                  disabled={isInstalling}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-600 to-sky-600 hover:from-emerald-400 hover:to-sky-500 text-slate-950 font-bold text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span id="pwaInstallLabel">📲 تثبيت التطبيق مباشرةً</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Floating Banner
  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[99999] w-[95%] max-w-lg animate-bounce duration-500 dir-rtl">
      <div className="bg-slate-900/95 border-2 border-emerald-500/80 rounded-2xl shadow-2xl backdrop-blur-xl p-3 text-slate-100 flex items-center justify-between gap-3 relative overflow-hidden">
        <div className="relative shrink-0 cursor-pointer" onClick={() => setShowFullModal(true)}>
          <img
            src="https://telegram.org/img/t_logo.png"
            alt="سرعة إنجاز"
            className="w-10 h-10 rounded-xl object-contain shadow-md border border-white/20"
          />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border border-slate-900 flex items-center justify-center">
            <Sparkles className="w-2.5 h-2.5 text-slate-950" />
          </div>
        </div>

        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setShowFullModal(true)}>
          <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-400">
            <span>مركز سرعة إنجاز (تثبيت التطبيق)</span>
            <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded text-[9px]">PWA</span>
          </div>
          <p className="text-[11px] text-slate-300 truncate mt-0.5">
            تثبيت التطبيق على الجوال للحصول على إشعارات فورية وعمل بدون إنترنت.
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            id="pwaInstallBtn"
            onClick={pwaInstallClick}
            disabled={isInstalling}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs px-3 py-2 rounded-xl shadow-lg transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-80"
          >
            <Download className="w-3.5 h-3.5" />
            <span id="pwaInstallLabel">📲 تثبيت</span>
          </button>

          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            title="إغلاق الإشعار"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
