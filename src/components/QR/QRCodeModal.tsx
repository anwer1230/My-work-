import React, { useState } from 'react';
import { X, QrCode, Copy, Check, Share2, Sparkles, Camera } from 'lucide-react';
import { User } from '../../types/telegram';
import { Language, translations } from '../../utils/i18n';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  lang: Language;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  lang,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'my_qr' | 'scan'>('my_qr');
  const t = translations[lang];

  if (!isOpen) return null;

  const profileUrl = `https://t.me/${currentUser.username || 'user'}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div 
        dir={lang === 'ar' ? 'rtl' : 'ltr'} 
        className="relative w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col animate-in zoom-in-95"
      >
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-neutral-100 text-sm">{t.myQRCode}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-neutral-950/60 border-b border-neutral-800 text-xs font-semibold text-center">
          <button
            onClick={() => setActiveTab('my_qr')}
            className={`py-2 rounded-xl transition-colors ${
              activeTab === 'my_qr' ? 'bg-sky-500 text-white' : 'text-neutral-400'
            }`}
          >
            {t.myQRCode}
          </button>
          <button
            onClick={() => setActiveTab('scan')}
            className={`py-2 rounded-xl transition-colors ${
              activeTab === 'scan' ? 'bg-sky-500 text-white' : 'text-neutral-400'
            }`}
          >
            {t.scanQR}
          </button>
        </div>

        <div className="p-6 flex flex-col items-center text-center">
          {activeTab === 'my_qr' ? (
            <>
              {/* QR Code Container */}
              <div className="relative p-4 bg-white rounded-3xl shadow-xl flex items-center justify-center border-4 border-sky-500/20">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(profileUrl)}&color=0e1621&bgcolor=ffffff`}
                  alt="Telegram QR Code"
                  className="w-44 h-44 rounded-xl"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-11 h-11 rounded-full bg-sky-500 border-2 border-white flex items-center justify-center shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" className="w-6 h-6">
                      <path fill="#ffffff" d="M54.5 116.5c34.5-15 57.5-25 69-30 32.8-13.7 39.7-16.1 44.1-16.2 1 0 3.2.2 4.6 1.4 1.2 1 1.5 2.4 1.7 3.4.2 1 0 2.2-.2 3.6-2.5 26.5-13.4 90.8-18.9 120.3-2.3 12.5-6.9 16.7-11.4 17.1-9.7.9-17-6.4-26.4-12.6-14.7-9.6-23-15.6-37.3-25-16.5-10.9-5.8-16.9 3.6-26.7 2.5-2.6 45.4-41.6 46.2-45.2.1-.4.2-2.1-.7-3-1-.8-2.3-.5-3.3-.3-1.4.3-24.1 15.3-68.1 45-6.4 4.4-12.3 6.6-17.5 6.5-5.8-.1-17-3.3-25.3-6-10.2-3.3-18.3-5.1-17.6-10.8.4-3 4.4-6.1 12.1-9.5z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="font-bold text-neutral-100 text-sm">{currentUser.name}</div>
                <div className="text-xs text-sky-400 font-mono mt-0.5">@{currentUser.username}</div>
              </div>

              <div className="w-full mt-5 flex gap-2">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 py-2.5 px-3 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs font-semibold text-neutral-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-neutral-400" />}
                  <span>{copied ? 'تم النسخ' : 'نسخ الرابط'}</span>
                </button>

                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: `${currentUser.name} on Telegram`,
                        url: profileUrl,
                      }).catch(() => {});
                    } else {
                      handleCopyLink();
                    }
                  }}
                  className="flex-1 py-2.5 px-3 bg-sky-500 hover:bg-sky-400 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors shadow-md"
                >
                  <Share2 className="w-4 h-4" />
                  <span>مشاركة</span>
                </button>
              </div>
            </>
          ) : (
            <div className="w-full py-8 flex flex-col items-center justify-center space-y-4">
              <div className="w-48 h-48 border-2 border-dashed border-sky-500/50 rounded-3xl bg-neutral-950/80 flex flex-col items-center justify-center p-4">
                <Camera className="w-10 h-10 text-sky-400 animate-pulse mb-2" />
                <div className="text-xs text-neutral-300 font-semibold">وجه الكاميرا نحو رمز QR</div>
                <div className="text-[10px] text-neutral-500 mt-1">سيتم فتح المحادثة مباشرة</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
