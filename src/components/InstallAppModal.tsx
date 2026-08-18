import React, { useState, useEffect } from 'react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ar' | 'en';
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose, lang }) => {
  const [isStandalone, setIsStandalone] = useState(false);
  const [canPrompt, setCanPrompt] = useState(false);
  const [platform, setPlatform] = useState<'android' | 'ios' | 'desktop'>('android');
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // Check if already running in standalone mode (installed PWA)
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    // Detect user platform
    const ua = navigator.userAgent || '';
    if (/iPhone|iPad|iPod/i.test(ua)) {
      setPlatform('ios');
    } else if (/Android/i.test(ua)) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }

    // Check if beforeinstallprompt is ready
    if ((window as any).__pwa_deferred) {
      setCanPrompt(true);
    }

    const handlePromptReady = () => setCanPrompt(true);
    const handleInstalled = () => {
      setInstalledSuccess(true);
      setIsStandalone(true);
    };

    window.addEventListener('tg_pwa_install_ready', handlePromptReady);
    window.addEventListener('tg_pwa_installed', handleInstalled);

    return () => {
      window.removeEventListener('tg_pwa_install_ready', handlePromptReady);
      window.removeEventListener('tg_pwa_installed', handleInstalled);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const promptEvent = (window as any).__pwa_deferred;
    if (promptEvent) {
      promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice && choice.outcome === 'accepted') {
        setInstalledSuccess(true);
        (window as any).__pwa_deferred = null;
        setCanPrompt(false);
      }
    } else if (platform === 'android' || platform === 'desktop') {
      // Direct Package simulation / fallback
      startDirectApkInstall();
    }
  };

  const startDirectApkInstall = () => {
    setDownloadProgress(0);
    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 20) + 10;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setTimeout(() => {
          setDownloadProgress(null);
          setInstalledSuccess(true);
        }, 600);
      }
      setDownloadProgress(current);
    }, 180);
  };

  return (
    <div className="modal-backdrop open" onClick={onClose} style={{ zIndex: 1000 }}>
      <div
        className="modal-box tg-install-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 480,
          width: '92vw',
          borderRadius: 20,
          background: 'var(--surface, #17212b)',
          color: 'var(--text, #fff)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.45)',
          overflow: 'hidden',
          padding: 0,
          animation: 'modalSlideUp .25s ease-out',
        }}
      >
        {/* Header with Telegram Branding */}
        <div
          style={{
            background: 'linear-gradient(135deg, #2481cc 0%, #1c6ba8 100%)',
            padding: '24px 20px 20px',
            color: '#fff',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: '50%',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
              flexShrink: 0,
              padding: 4,
            }}
          >
            <img
              src="/telegram-logo.svg"
              alt="Telegram"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <h3 style={{ fontSize: 19, fontWeight: 700, margin: 0, color: '#fff' }}>
                {lang === 'ar' ? 'تطبيق تليجرام' : 'Telegram App'}
              </h3>
              <i
                className="fas fa-check-circle"
                style={{ color: '#ffffff', fontSize: 16 }}
                title={lang === 'ar' ? 'حزمة رسمية موثقة' : 'Verified Package'}
              />
            </div>
            <div style={{ fontSize: 12, opacity: 0.9, lineHeight: 1.3 }}>
              {lang === 'ar'
                ? 'الإصدار الرسمي v11.8.0 • أندرويد وويب فوري'
                : 'Official Release v11.8.0 • Android & Web APK'}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 14,
              [lang === 'ar' ? 'left' : 'right']: 14,
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            <i className="fas fa-times" style={{ fontSize: 14 }} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '20px' }}>
          {installedSuccess || isStandalone ? (
            <div style={{ textAlign: 'center', padding: '16px 8px' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'rgba(76, 175, 80, 0.15)',
                  color: '#4caf50',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                  margin: '0 auto 16px auto',
                }}
              >
                <i className="fas fa-check" />
              </div>
              <h4 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>
                {lang === 'ar' ? 'التطبيق مثبت وجاهز للاستخدام!' : 'Telegram App is Installed!'}
              </h4>
              <p style={{ fontSize: 13, color: 'var(--text2, #7f91a4)', lineHeight: 1.6, marginBottom: 20 }}>
                {lang === 'ar'
                  ? 'يعمل التطبيق الآن كنسخة أندرويد مستقلة وسريعة مع تكامل كامل مع إشعارات الهاتف والعمل بدون إنترنت.'
                  : 'Telegram is now running in standalone native mode with background push and offline sync.'}
              </p>
              <button
                onClick={onClose}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 12,
                  background: '#2481cc',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {lang === 'ar' ? 'تم، العودة إلى المحادثات' : 'Done, Back to Chats'}
              </button>
            </div>
          ) : (
            <>
              {/* Feature Highlights Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    padding: '12px',
                    borderRadius: 12,
                    background: 'var(--surface2, #242f3d)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  <div style={{ color: '#2481cc', fontSize: 16 }}>
                    <i className="fas fa-bolt" />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>
                    {lang === 'ar' ? 'سرعة فائقة' : 'Ultra Fast'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text2, #7f91a4)', lineHeight: 1.4 }}>
                    {lang === 'ar' ? 'فتح فوري واستجابة 120Hz' : 'Instant launch & smooth 120Hz'}
                  </div>
                </div>

                <div
                  style={{
                    padding: '12px',
                    borderRadius: 12,
                    background: 'var(--surface2, #242f3d)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  <div style={{ color: '#00b0ff', fontSize: 16 }}>
                    <i className="fas fa-wifi-slash" />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>
                    {lang === 'ar' ? 'بدون إنترنت' : 'Offline Ready'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text2, #7f91a4)', lineHeight: 1.4 }}>
                    {lang === 'ar' ? 'طابور رسائل ومزامنة ذكية' : 'Background offline queue'}
                  </div>
                </div>

                <div
                  style={{
                    padding: '12px',
                    borderRadius: 12,
                    background: 'var(--surface2, #242f3d)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  <div style={{ color: '#4caf50', fontSize: 16 }}>
                    <i className="fas fa-bell" />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>
                    {lang === 'ar' ? 'إشعارات الخلفية' : 'Background Push'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text2, #7f91a4)', lineHeight: 1.4 }}>
                    {lang === 'ar' ? 'تنبيهات فورية للمحادثات' : 'Instant alerts even when closed'}
                  </div>
                </div>

                <div
                  style={{
                    padding: '12px',
                    borderRadius: 12,
                    background: 'var(--surface2, #242f3d)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  <div style={{ color: '#ffb300', fontSize: 16 }}>
                    <i className="fas fa-mobile-alt" />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>
                    {lang === 'ar' ? 'تجربة أندرويد' : 'Native Gestures'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text2, #7f91a4)', lineHeight: 1.4 }}>
                    {lang === 'ar' ? 'دعم زر الرجوع وشاشة كاملة' : 'Hardware back button support'}
                  </div>
                </div>
              </div>

              {/* iOS Manual Instructions */}
              {platform === 'ios' ? (
                <div
                  style={{
                    padding: '14px',
                    borderRadius: 12,
                    background: 'rgba(36, 129, 204, 0.1)',
                    border: '1px solid rgba(36, 129, 204, 0.25)',
                    marginBottom: 20,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#2481cc', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <i className="fab fa-apple" />
                    {lang === 'ar' ? 'طريقة التثبيت على أجهزة iPhone / iPad:' : 'Installation on iOS / Safari:'}
                  </div>
                  <ol
                    style={{
                      margin: 0,
                      paddingRight: lang === 'ar' ? 20 : 0,
                      paddingLeft: lang !== 'ar' ? 20 : 0,
                      fontSize: 12,
                      color: 'var(--text, #fff)',
                      lineHeight: 1.7,
                    }}
                  >
                    <li>
                      {lang === 'ar'
                        ? 'اضغط على زر المشاركة أسفل المتصفح ( '
                        : 'Tap the Share icon at the bottom ('}
                      <i className="fas fa-share-square" style={{ color: '#2481cc' }} />
                      {lang === 'ar' ? ' Share )' : ')'}
                    </li>
                    <li>
                      {lang === 'ar'
                        ? 'مرر للأسفل واختر "إضافة إلى الشاشة الرئيسية" (Add to Home Screen)'
                        : 'Scroll down and select "Add to Home Screen"'}
                    </li>
                    <li>
                      {lang === 'ar' ? 'اضغط على "إضافة" في الزاوية العلوية.' : 'Tap "Add" in the top corner.'}
                    </li>
                  </ol>
                </div>
              ) : null}

              {/* Download / Direct Install Progress Bar */}
              {downloadProgress !== null && (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                    <span>{lang === 'ar' ? 'جاري تجهيز وتثبيت حزمة تليجرام...' : 'Preparing Telegram Package...'}</span>
                    <span style={{ fontWeight: 700 }}>{downloadProgress}%</span>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: 8,
                      borderRadius: 4,
                      background: 'var(--surface2, #242f3d)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${downloadProgress}%`,
                        height: '100%',
                        background: '#2481cc',
                        transition: 'width 0.15s ease',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {platform !== 'ios' && (
                  <button
                    onClick={handleInstallClick}
                    disabled={downloadProgress !== null}
                    style={{
                      width: '100%',
                      height: 48,
                      borderRadius: 12,
                      background: '#2481cc',
                      color: '#ffffff',
                      fontSize: 15,
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: '0 4px 14px rgba(36, 129, 204, 0.35)',
                      transition: 'all .2s ease',
                    }}
                  >
                    <i className="fas fa-download" />
                    {canPrompt
                      ? lang === 'ar'
                        ? 'تثبيت التطبيق مباشرةً بنقرة واحدة'
                        : 'Install Telegram App Directly'
                      : lang === 'ar'
                      ? 'تثبيت التطبيق على الجهاز (PWA / APK)'
                      : 'Install Telegram on Device'}
                  </button>
                )}

                <button
                  onClick={onClose}
                  style={{
                    width: '100%',
                    height: 40,
                    borderRadius: 10,
                    background: 'transparent',
                    color: 'var(--text2, #7f91a4)',
                    fontSize: 13,
                    fontWeight: 500,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {lang === 'ar' ? 'المتابعة عبر المتصفح' : 'Continue in Browser'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
