import React, { useState, useEffect } from 'react';
import { X, Flame, Eye, Lock, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ViewOnceMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaUrl: string;
  mediaType?: 'photo' | 'video';
  ttlSeconds?: number;
  senderName?: string;
  lang?: 'ar' | 'en';
}

export const ViewOnceMediaModal: React.FC<ViewOnceMediaModalProps> = ({
  isOpen,
  onClose,
  mediaUrl,
  mediaType = 'photo',
  ttlSeconds = 10,
  senderName = 'المستخدم',
  lang = 'ar',
}) => {
  const [timeLeft, setTimeLeft] = useState(ttlSeconds);
  const [hasExpired, setHasExpired] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(ttlSeconds);
      setHasExpired(false);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setHasExpired(true);
          setTimeout(() => {
            onClose();
          }, 1500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, ttlSeconds, onClose]);

  if (!isOpen) return null;

  const isAr = lang === 'ar';
  const progressPercent = (timeLeft / ttlSeconds) * 100;

  return (
    <div className="fixed inset-0 z-[2800] flex items-center justify-center p-4 select-none font-['Cairo',sans-serif]">
      {/* Dark backdrop with privacy guard */}
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" />

      {/* Main Container */}
      <div className="relative w-full max-w-xl bg-zinc-950/90 border border-rose-500/40 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col items-center p-5 text-zinc-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top bar with burning timer indicator */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center animate-pulse">
              <Flame className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                <span>{isAr ? 'عرض لمرة واحدة (View Once)' : 'View Once Media'}</span>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-mono">
                  {timeLeft}s
                </span>
              </div>
              <p className="text-[10px] text-zinc-400">
                {isAr ? `مرسلة من: ${senderName}` : `From: ${senderName}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media Preview Box */}
        <div className="relative w-full max-h-[60vh] flex items-center justify-center rounded-2xl overflow-hidden bg-black/60 border border-zinc-800">
          {hasExpired ? (
            <div className="p-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center text-3xl animate-ping">
                🔥
              </div>
              <h4 className="font-bold text-zinc-200 text-sm">
                {isAr ? 'تم تدمير الوسائط ذاتياً!' : 'Media Self-Destructed!'}
              </h4>
              <p className="text-xs text-zinc-500">
                {isAr ? 'انتهى وقت المشاهدة المخصص ولا يمكن إعادة فتحها.' : 'Expired and cannot be viewed again.'}
              </p>
            </div>
          ) : mediaType === 'video' ? (
            <video
              src={mediaUrl}
              autoPlay
              controls
              className="max-h-[55vh] w-auto rounded-xl object-contain"
            />
          ) : (
            <img
              src={mediaUrl}
              alt="View once media"
              className="max-h-[55vh] w-auto rounded-xl object-contain select-none pointer-events-none"
            />
          )}

          {/* Burning progress bottom line */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-zinc-800">
            <div
              className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-yellow-500 transition-all duration-1000 ease-linear"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Security watermark footer */}
        <div className="mt-4 flex items-center gap-2 text-[11px] text-zinc-400 bg-zinc-900/60 px-3 py-1.5 rounded-full border border-zinc-800">
          <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
          <span>{isAr ? 'محمي ببروتوكول التدمير الذاتي المشفر من تيليجرام' : 'Protected with Telegram Self-Destruct Protocol'}</span>
        </div>

      </div>
    </div>
  );
};
