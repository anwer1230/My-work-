import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles, CheckCircle2, Share2, PlusSquare } from 'lucide-react';

export const PwaInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(true);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [showIOSGuide, setShowIOSGuide] = useState<boolean>(false);

  useEffect(() => {
    // 1. Check if running in standalone mode (already installed & opened as an app)
    const checkStandalone = () => {
      const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      const isAndroidApp = document.referrer.includes('android-app://');
      const installed = isStandaloneMedia || isIOSStandalone || isAndroidApp;
      setIsStandalone(installed);
      return installed;
    };

    const standalone = checkStandalone();
    if (standalone) return; // Never show inside installed app!

    // Check if user dismissed it in this session
    const dismissedSession = sessionStorage.getItem('pwa_install_banner_dismissed');
    if (dismissedSession === 'true') {
      setIsDismissed(true);
    }

    // Check if iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleMobile = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleMobile);

    // 2. Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      (window as any).__pwa_deferred = e;
    };

    // Check if already captured in index.html
    if ((window as any).__pwa_deferred) {
      setDeferredPrompt((window as any).__pwa_deferred);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 3. Listen for successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsStandalone(true);
      setDeferredPrompt(null);
      (window as any).__pwa_deferred = null;
      console.log('✅ PWA: Application installed successfully');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // Provide global trigger function for any install button in the app
    (window as any).__triggerPwaInstall = async () => {
      const promptEvent = deferredPrompt || (window as any).__pwa_deferred;
      if (promptEvent) {
        promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          setIsStandalone(true);
        }
        setDeferredPrompt(null);
        (window as any).__pwa_deferred = null;
      } else if (isAppleMobile) {
        setShowIOSGuide(true);
      } else {
        alert('لتثبيت التطبيق على جهازك، افتح خيارات المتصفح (⋮) واختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية".');
      }
    };

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [deferredPrompt]);

  // Do NOT render if already standalone / installed or dismissed
  if (isStandalone || isInstalled || isDismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    const promptEvent = deferredPrompt || (window as any).__pwa_deferred;
    if (promptEvent) {
      promptEvent.prompt();
      try {
        const choice = await promptEvent.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          setIsStandalone(true);
        }
      } catch (err) {
        console.warn('Install prompt choice error:', err);
      }
      setDeferredPrompt(null);
      (window as any).__pwa_deferred = null;
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      alert('اضغط على قائمة المتصفح (⋮) ثم اختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية".');
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('pwa_install_banner_dismissed', 'true');
  };

  return (
    <>
      {/* Floating Modern Native Install Notification Banner */}
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-[8888] animate-slideUp select-none dir-rtl">
        <div className="p-3 sm:p-3.5 bg-slate-900/95 backdrop-blur-xl border border-sky-500/40 rounded-2xl shadow-2xl flex items-center justify-between gap-3 text-slate-100 ring-1 ring-white/10">
          
          {/* App Icon & Title */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative shrink-0">
              <img
                src="/static/icons/icon-72.png"
                alt="Telegram App"
                className="w-11 h-11 rounded-2xl object-cover shadow-md border border-sky-400/30"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md border border-sky-400/30 -ml-11 inline-flex">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5 truncate">
                <span>تثبيت التطبيق</span>
                <span className="bg-sky-500/20 text-sky-300 text-[9px] px-1.5 py-0.5 rounded font-mono border border-sky-500/30">
                  تطبيق أصلي
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                تثبيت Telegram للوصول السريع والإشعارات
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3.5 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-sky-500/20 active:scale-95 transition-all"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>تثبيت</span>
            </button>

            <button
              onClick={handleDismiss}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* iOS Safari Minimal 1-Step Helper if needed */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 dir-rtl animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-sm w-full text-slate-100 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-white">
                <Share2 className="w-5 h-5 text-sky-400" />
                <span>تثبيت على جهاز iPhone / iPad</span>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">1</div>
                <div>اضغط على زر المشاركة <Share2 className="w-4 h-4 inline-block text-sky-400 mx-1" /> في أسفل المتصفح.</div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">2</div>
                <div>اختر <PlusSquare className="w-4 h-4 inline-block text-emerald-400 mx-1" /> <strong>"إضافة إلى الشاشة الرئيسية"</strong>.</div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs"
            >
              فهمت
            </button>
          </div>
        </div>
      )}
    </>
  );
};
