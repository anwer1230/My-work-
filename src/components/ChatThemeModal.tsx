import React, { useState } from 'react';
import {
  X,
  Palette,
  Check,
  Sparkles,
  Image as ImageIcon,
  CheckCircle2,
  RefreshCw,
  Droplet,
} from 'lucide-react';

interface ChatThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatTitle?: string;
  currentWallpaper?: string;
  onSelectWallpaper: (wallpaperUrl: string) => void;
}

export interface WallpaperPreset {
  id: string;
  name: string;
  url: string;
  previewGradient?: string;
}

export const WALLPAPER_PRESETS: WallpaperPreset[] = [
  {
    id: 'default_dark',
    name: 'الليل الساحر (افتراضي)',
    url: '',
    previewGradient: 'radial-gradient(ellipse at top, #0f172a, #020617, #020617)',
  },
  {
    id: 'telegram_emerald',
    name: 'الزمرد الكلاسيكي (Emerald)',
    url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80',
    previewGradient: 'linear-gradient(to bottom, #064e3b, #022c22)',
  },
  {
    id: 'telegram_cosmic',
    name: 'الفضاء الكوني (Cosmic Blue)',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
    previewGradient: 'linear-gradient(to bottom, #0f172a, #1e1b4b)',
  },
  {
    id: 'telegram_sunset',
    name: 'شفق التليجرام (Sunset Glow)',
    url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1200&q=80',
    previewGradient: 'linear-gradient(to bottom, #451a03, #1c1917)',
  },
  {
    id: 'telegram_minimal',
    name: 'الرمادي الهادئ (Dark Slate)',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    previewGradient: 'linear-gradient(to bottom, #1e293b, #0f172a)',
  },
  {
    id: 'telegram_cyber',
    name: 'السايبر المضيء (Neon Grid)',
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
    previewGradient: 'linear-gradient(to bottom, #312e81, #0f172a)',
  },
];

export const ChatThemeModal: React.FC<ChatThemeModalProps> = ({
  isOpen,
  onClose,
  chatTitle = 'هذه المحادثة',
  currentWallpaper = '',
  onSelectWallpaper,
}) => {
  const [selectedUrl, setSelectedUrl] = useState<string>(currentWallpaper);
  const [customInputUrl, setCustomInputUrl] = useState<string>('');

  if (!isOpen) return null;

  const handleApply = (url: string) => {
    onSelectWallpaper(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none dir-rtl animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-sky-900 via-blue-900 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 shadow-md">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>تخصيص خلفية وثيمة المحادثة</span>
                <span className="bg-sky-500/20 text-sky-300 text-[10px] px-2 py-0.5 rounded-full font-mono border border-sky-500/30">
                  Chat Theme
                </span>
              </h3>
              <p className="text-xs text-sky-200/80 mt-0.5">
                تغيير الخلفية والألوان الخاصة بـ "{chatTitle}"
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 overflow-y-auto custom-scrollbar flex-1 text-xs">
          
          {/* Wallpapers Grid */}
          <div>
            <label className="block text-slate-300 font-bold mb-2.5 text-xs">
              اختر إحدى خلفيات تليجرام الرسمية المتاحة:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {WALLPAPER_PRESETS.map((p) => {
                const isSelected = selectedUrl === p.url;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedUrl(p.url);
                      handleApply(p.url);
                    }}
                    className={`relative rounded-2xl overflow-hidden border-2 h-32 transition-all group text-right flex flex-col justify-end p-2.5 ${
                      isSelected
                        ? 'border-sky-400 shadow-lg shadow-sky-500/20 scale-[1.02]'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                    style={{
                      backgroundImage: p.url ? `url('${p.url}')` : p.previewGradient,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {isSelected && (
                      <div className="absolute top-2 left-2 bg-sky-500 text-slate-950 p-1 rounded-full shadow">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}

                    <span className="relative z-10 font-bold text-[11px] text-white group-hover:text-sky-300 transition-colors truncate">
                      {p.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Image URL Upload */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2.5">
            <label className="block text-slate-300 font-bold text-xs flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-emerald-400" />
              <span>إدخال رابط صورة خلفية مخصصة (Custom Image URL)</span>
            </label>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={customInputUrl}
                onChange={(e) => setCustomInputUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs font-mono focus:outline-none focus:border-sky-400"
              />
              <button
                onClick={() => {
                  if (customInputUrl.trim()) {
                    setSelectedUrl(customInputUrl.trim());
                    handleApply(customInputUrl.trim());
                  }
                }}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-colors shrink-0"
              >
                تطبيق
              </button>
            </div>
          </div>

        </div>

        {/* Action Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => handleApply('')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>إعادة الخلفية الافتراضية</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md"
          >
            تم
          </button>
        </div>

      </div>
    </div>
  );
};
