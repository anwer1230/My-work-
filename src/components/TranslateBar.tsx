import React, { useState } from 'react';
import { Languages, X, Check, RefreshCw, Sparkles, ArrowRight } from 'lucide-react';

interface TranslateBarProps {
  chatTitle: string;
  onTranslateAll?: (targetLang: string) => void;
  onClose: () => void;
  lang?: 'ar' | 'en';
}

export const TranslateBar: React.FC<TranslateBarProps> = ({
  chatTitle,
  onTranslateAll,
  onClose,
  lang = 'ar',
}) => {
  const [targetLang, setTargetLang] = useState<'ar' | 'en' | 'ru' | 'tr' | 'fa'>('ar');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translated, setTranslated] = useState(false);

  const handleTranslate = () => {
    setIsTranslating(true);
    setTimeout(() => {
      setIsTranslating(false);
      setTranslated(true);
      if (onTranslateAll) onTranslateAll(targetLang);
    }, 400);
  };

  const isAr = lang === 'ar';

  return (
    <div className="bg-gradient-to-r from-sky-950/80 via-zinc-900 to-sky-950/80 border-b border-sky-500/20 px-4 py-2 flex items-center justify-between text-xs text-zinc-200 select-none animate-in slide-in-from-top-2 duration-200">
      <div className="flex items-center gap-2.5 flex-wrap">
        <div className="flex items-center gap-1.5 text-sky-400 font-bold">
          <Languages className="w-4 h-4" />
          <span>{isAr ? 'ترجمة الدردشة الفورية' : 'Live Chat Translate'}</span>
        </div>

        <div className="flex items-center gap-1 bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-800 text-[11px]">
          <span className="text-zinc-400">{isAr ? 'الترجمة إلى:' : 'To:'}</span>
          <select
            value={targetLang}
            onChange={(e) => {
              setTargetLang(e.target.value as any);
              setTranslated(false);
            }}
            className="bg-transparent text-sky-300 font-bold focus:outline-none cursor-pointer"
          >
            <option value="ar" className="bg-zinc-900 text-zinc-100">العربية (Arabic)</option>
            <option value="en" className="bg-zinc-900 text-zinc-100">English (الإنجليزية)</option>
            <option value="ru" className="bg-zinc-900 text-zinc-100">Русский (الروسية)</option>
            <option value="tr" className="bg-zinc-900 text-zinc-100">Türkçe (التركية)</option>
            <option value="fa" className="bg-zinc-900 text-zinc-100">فارسی (الفارسية)</option>
          </select>
        </div>

        <button
          onClick={handleTranslate}
          disabled={isTranslating}
          className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
            translated
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-sky-500 text-zinc-950 hover:bg-sky-400 shadow-sm'
          }`}
        >
          {isTranslating ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : translated ? (
            <Check className="w-3.5 h-3.5" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          <span>{translated ? (isAr ? 'مترجم' : 'Translated') : (isAr ? 'ترجمة الكل' : 'Translate')}</span>
        </button>
      </div>

      <button
        onClick={onClose}
        className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
        title={isAr ? 'إغلاق شريط الترجمة' : 'Close Translate Bar'}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
