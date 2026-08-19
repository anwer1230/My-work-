import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Smartphone, 
  Check, 
  X, 
  ShieldCheck, 
  Zap, 
  Globe, 
  Share2, 
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { translations, Language } from '../../utils/i18n';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallAPKModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const InstallAPKModal: React.FC<InstallAPKModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [activePlatform, setActivePlatform] = useState<'android' | 'ios' | 'desktop'>('android');
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const t = translations[lang];

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Detect if already running in standalone / PWA mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as unknown as { standalone?: boolean }).standalone) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  if (!isOpen) return null;

  const handleTriggerNativeInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // Direct WebAPK download simulation
      handleDownloadWebAPK();
    }
  };

  const handleDownloadWebAPK = () => {
    setDownloading(true);
    setDownloadProgress(10);
    
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setDownloading(false);
          // Trigger download of manifest / WebAPK link
          const blob = new Blob([
            JSON.stringify({
              app: 'Telegram Mobile WebAPK',
              version: '10.8.2',
              package: 'org.telegram.messenger.webapk',
              timestamp: new Date().toISOString(),
              target: 'Android / WebAPK Universal Installer'
            }, null, 2)
          ], { type: 'application/vnd.android.package-archive' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'Telegram_Mobile_v10.8.apk';
          a.click();
          return 100;
        }
        return prev + 25;
      });
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div 
        dir={lang === 'ar' ? 'rtl' : 'ltr'} 
        className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh] animate-in zoom-in-95"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-b from-sky-600/30 to-transparent p-6 pb-4 border-b border-neutral-800/80 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center shadow-lg p-2.5 shrink-0 ring-4 ring-sky-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" className="w-full h-full">
              <path fill="#ffffff" d="M54.5 116.5c34.5-15 57.5-25 69-30 32.8-13.7 39.7-16.1 44.1-16.2 1 0 3.2.2 4.6 1.4 1.2 1 1.5 2.4 1.7 3.4.2 1 0 2.2-.2 3.6-2.5 26.5-13.4 90.8-18.9 120.3-2.3 12.5-6.9 16.7-11.4 17.1-9.7.9-17-6.4-26.4-12.6-14.7-9.6-23-15.6-37.3-25-16.5-10.9-5.8-16.9 3.6-26.7 2.5-2.6 45.4-41.6 46.2-45.2.1-.4.2-2.1-.7-3-1-.8-2.3-.5-3.3-.3-1.4.3-24.1 15.3-68.1 45-6.4 4.4-12.3 6.6-17.5 6.5-5.8-.1-17-3.3-25.3-6-10.2-3.3-18.3-5.1-17.6-10.8.4-3 4.4-6.1 12.1-9.5z" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-neutral-100 text-lg">{t.appName} Mobile</h3>
              <span className="text-[10px] bg-sky-500/20 text-sky-400 font-semibold px-2 py-0.5 rounded-full border border-sky-500/30">
                APK / PWA
              </span>
            </div>
            <p className="text-neutral-400 text-xs mt-1 leading-tight">
              {t.installAppDesc}
            </p>
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-neutral-200 custom-scrollbar text-xs">
          {/* Key Advantages */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 bg-neutral-950/70 border border-neutral-800/80 rounded-2xl text-center space-y-1">
              <Zap className="w-4 h-4 text-amber-400 mx-auto" />
              <div className="font-semibold text-[11px] text-neutral-100">سرعة فائقة</div>
              <div className="text-[10px] text-neutral-400">بدون بطء</div>
            </div>
            <div className="p-2.5 bg-neutral-950/70 border border-neutral-800/80 rounded-2xl text-center space-y-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto" />
              <div className="font-semibold text-[11px] text-neutral-100">تشفير E2E</div>
              <div className="text-[10px] text-neutral-400">حماية كاملة</div>
            </div>
            <div className="p-2.5 bg-neutral-950/70 border border-neutral-800/80 rounded-2xl text-center space-y-1">
              <Smartphone className="w-4 h-4 text-sky-400 mx-auto" />
              <div className="font-semibold text-[11px] text-neutral-100">وضع التطبيق</div>
              <div className="text-[10px] text-neutral-400">شاشة كاملة</div>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="space-y-2 pt-1">
            <button
              id="btn-install-apk-direct"
              onClick={handleTriggerNativeInstall}
              disabled={downloading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 active:scale-[0.98] text-white font-bold text-sm rounded-2xl shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
            >
              {downloading ? (
                <span>جاري تحضير الحزمة ({downloadProgress}%)...</span>
              ) : isInstalled ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>{t.installedSuccess}</span>
                </>
              ) : deferredPrompt ? (
                <>
                  <Download className="w-5 h-5" />
                  <span>تثبيت تيليجرام على الهاتف فوراً</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>{t.installButton}</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadWebAPK}
              className="w-full py-2.5 px-4 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-semibold rounded-2xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-sky-400" />
              <span>{t.downloadWebAPK} (.apk)</span>
            </button>
          </div>

          {/* Platform Tab Instructions */}
          <div className="pt-2">
            <div className="flex border-b border-neutral-800 mb-3">
              <button
                onClick={() => setActivePlatform('android')}
                className={`flex-1 pb-2 font-semibold text-center transition-colors border-b-2 ${
                  activePlatform === 'android' ? 'border-sky-500 text-sky-400' : 'border-transparent text-neutral-400'
                }`}
              >
                Android (أندرويد)
              </button>
              <button
                onClick={() => setActivePlatform('ios')}
                className={`flex-1 pb-2 font-semibold text-center transition-colors border-b-2 ${
                  activePlatform === 'ios' ? 'border-sky-500 text-sky-400' : 'border-transparent text-neutral-400'
                }`}
              >
                iPhone (آيفون)
              </button>
              <button
                onClick={() => setActivePlatform('desktop')}
                className={`flex-1 pb-2 font-semibold text-center transition-colors border-b-2 ${
                  activePlatform === 'desktop' ? 'border-sky-500 text-sky-400' : 'border-transparent text-neutral-400'
                }`}
              >
                كمبيوتر (PC)
              </button>
            </div>

            <div className="bg-neutral-950/80 p-3.5 rounded-2xl border border-neutral-800/80 space-y-2.5">
              {activePlatform === 'android' && (
                <div className="space-y-2 text-[11px] text-neutral-300 leading-relaxed">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center shrink-0 text-xs">1</span>
                    <span>افتح هذا الرابط في متصفح <b>Google Chrome</b> أو <b>Samsung Internet</b> على جوالك.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center shrink-0 text-xs">2</span>
                    <span>اضغط على زر القائمة أعلى المتصفح <b>(⋮)</b>.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center shrink-0 text-xs">3</span>
                    <span>اختر <b>"تثبيت التطبيق" (Install app)</b> أو <b>"إضافة إلى الشاشة الرئيسية"</b>.</span>
                  </div>
                  <div className="text-[10px] text-neutral-500 pt-1 border-t border-neutral-800">
                    💡 سيقوم نظام أندرويد بإنشاء حزمة WebAPK وتثبيت أيقونة تيليجرام مباشرة في قائمة تطبيقاتك.
                  </div>
                </div>
              )}

              {activePlatform === 'ios' && (
                <div className="space-y-2 text-[11px] text-neutral-300 leading-relaxed">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center shrink-0 text-xs">1</span>
                    <span>افتح الرابط في متصفح <b>Safari</b>.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center shrink-0 text-xs">2</span>
                    <span>اضغط على زر المشاركة بالأسفل <b>(⎋ Share)</b>.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center shrink-0 text-xs">3</span>
                    <span>اختر <b>"إضافة إلى الشاشة الرئيسية" (Add to Home Screen)</b>.</span>
                  </div>
                </div>
              )}

              {activePlatform === 'desktop' && (
                <div className="space-y-2 text-[11px] text-neutral-300 leading-relaxed">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center shrink-0 text-xs">1</span>
                    <span>اضغط على أيقونة التثبيت <b>(⊕ Install)</b> في شريط عنوان المتصفح (Chrome/Edge).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center shrink-0 text-xs">2</span>
                    <span>سيعمل تيليجرام في نافذة مستقلة وسريعة كأي برنامج مثبت.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
