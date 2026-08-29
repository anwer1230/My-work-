import React from 'react';
import { X, Download, ZoomIn, ZoomOut, Share2 } from 'lucide-react';
import { useTelegram } from '../../context/TelegramContext';

export const MediaViewerModal: React.FC = () => {
  const { viewerMedia, setViewerMedia, settings } = useTelegram();

  if (!viewerMedia) return null;

  const isArabic = settings.language === 'ar';

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 select-none animate-in fade-in duration-150 text-white">
      {/* Top Controls Bar */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-white/10 z-10">
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-sm truncate">{viewerMedia.title || 'Photo'}</span>
          <span className="text-xs text-gray-400">
            {viewerMedia.sender} • {viewerMedia.timestamp}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={viewerMedia.url}
            download="telegram-media.jpg"
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
            title={isArabic ? 'تحميل' : 'Download'}
          >
            <Download className="w-5 h-5" />
          </a>
          <button
            onClick={() => setViewerMedia(null)}
            className="p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
            title={isArabic ? 'إغلاق' : 'Close'}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Image Preview Canvas */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        {viewerMedia.url ? (
          <img
            src={viewerMedia.url}
            alt={viewerMedia.title || 'Media preview'}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="text-gray-400 text-sm">No Preview Available</div>
        )}
      </div>
    </div>
  );
};
