import React, { useState } from 'react';
import { Image, FileText, Music, Video, Download, Eye, X } from 'lucide-react';

interface MediaItem {
  id: string;
  type: 'photo' | 'document' | 'voice' | 'video';
  name: string;
  size: string;
  date: string;
  url: string;
}

interface MediaGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MediaGalleryModal: React.FC<MediaGalleryModalProps> = ({ isOpen, onClose }) => {
  const [filter, setFilter] = useState<'all' | 'photo' | 'document' | 'voice' | 'video'>('all');

  const mediaItems: MediaItem[] = [
    {
      id: 'm1',
      type: 'photo',
      name: 'جدول المحاضرات الدراسية.png',
      size: '1.2 MB',
      date: 'اليوم 10:30',
      url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'm2',
      type: 'document',
      name: 'مشروع البحث النهائي - سرعة إنجاز.pdf',
      size: '4.8 MB',
      date: 'أمس 14:15',
      url: '#',
    },
    {
      id: 'm3',
      type: 'voice',
      name: 'ملاحظة صوتية للمشرف الأكاديمي.ogg',
      size: '850 KB',
      date: 'منذ يومين',
      url: '#',
    },
    {
      id: 'm4',
      type: 'video',
      name: 'شرح التنسيق الأكاديمي المتقدم.mp4',
      size: '18.4 MB',
      date: '04 أغسطس',
      url: '#',
    },
  ];

  if (!isOpen) return null;

  const filtered = mediaItems.filter((i) => filter === 'all' || i.type === filter);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative text-slate-100 max-h-[85vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4 text-purple-400">
          <Image className="w-6 h-6" />
          <h3 className="font-bold text-sm">معرض الوسائط والملفات المستلمة</h3>
        </div>

        {/* Filter Strip */}
        <div className="flex bg-slate-950/80 p-1 rounded-xl mb-4 border border-slate-800 overflow-x-auto gap-1">
          {[
            { key: 'all', label: 'الكل' },
            { key: 'photo', label: '📷 الصور' },
            { key: 'document', label: '📄 المستندات' },
            { key: 'voice', label: '🎙️ التسجيلات' },
            { key: 'video', label: '🎬 الفيديوهات' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg whitespace-nowrap transition-colors ${
                filter === tab.key ? 'bg-purple-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 overflow-y-auto pr-1">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/50 flex flex-col justify-between"
            >
              {item.type === 'photo' && (
                <img
                  src={item.url}
                  alt={item.name}
                  className="w-full h-24 object-cover rounded-xl mb-2 border border-slate-700"
                />
              )}

              <div>
                <div className="flex items-center gap-2 mb-1">
                  {item.type === 'photo' && <Image className="w-4 h-4 text-sky-400" />}
                  {item.type === 'document' && <FileText className="w-4 h-4 text-emerald-400" />}
                  {item.type === 'voice' && <Music className="w-4 h-4 text-amber-400" />}
                  {item.type === 'video' && <Video className="w-4 h-4 text-purple-400" />}
                  <div className="font-bold text-xs text-slate-100 truncate">{item.name}</div>
                </div>

                <div className="text-[10px] text-slate-400 flex items-center justify-between font-mono">
                  <span>{item.size}</span>
                  <span>{item.date}</span>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => alert(`تحميل الملف: ${item.name}`)}
                  className="flex-1 bg-purple-500/20 hover:bg-purple-500 hover:text-slate-950 text-purple-400 font-bold py-1.5 rounded-xl text-[11px] transition-colors flex items-center justify-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> تحميل
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
