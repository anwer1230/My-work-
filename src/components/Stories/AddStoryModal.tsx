import React, { useState, useRef } from 'react';
import { X, Camera, Image, Sparkles, Send, Check } from 'lucide-react';
import { Language, translations } from '../../utils/i18n';

interface AddStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStory: (mediaUrl: string, caption: string) => void;
  lang: Language;
}

export const AddStoryModal: React.FC<AddStoryModalProps> = ({
  isOpen,
  onClose,
  onAddStory,
  lang,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = translations[lang];

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSampleSelect = (url: string) => {
    setSelectedImage(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage) return;
    onAddStory(selectedImage, caption);
    setSelectedImage(null);
    setCaption('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div 
        dir={lang === 'ar' ? 'rtl' : 'ltr'} 
        className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh] animate-in zoom-in-95"
      >
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-neutral-100 text-base">{t.addStory}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
          {/* Media Preview or Picker */}
          {selectedImage ? (
            <div className="relative w-full h-64 bg-neutral-950 rounded-2xl overflow-hidden border border-neutral-800">
              <img src={selectedImage} alt="Story preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="absolute top-3 right-3 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-44 border-2 border-dashed border-neutral-700 hover:border-sky-500/80 rounded-2xl bg-neutral-950/60 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <div className="p-3 bg-sky-500/10 text-sky-400 rounded-full">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="text-xs font-semibold text-neutral-200">{t.takePhoto}</div>
                <div className="text-[10px] text-neutral-500">JPG, PNG, WebP</div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              {/* Sample Stock Templates */}
              <div>
                <div className="text-[11px] text-neutral-400 mb-2 font-medium">أو اختر صورة جاهزة سريعة:</div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
                  ].map((url, i) => (
                    <div
                      key={i}
                      onClick={() => handleSampleSelect(url)}
                      className="h-20 rounded-xl overflow-hidden border border-neutral-800 cursor-pointer hover:ring-2 hover:ring-sky-500"
                    >
                      <img src={url} alt="sample" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Caption */}
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">نص القصة (Caption)</label>
            <input
              type="text"
              placeholder="اكتب وصفاً للقصة..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-neutral-100 focus:outline-hidden"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-xl"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={!selectedImage}
              className="px-5 py-2 text-xs font-semibold bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-4 h-4" /> نشر القصة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
