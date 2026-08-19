import React, { useState } from 'react';
import { FolderPlus, X } from 'lucide-react';

interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFolder: (title: string, icon: string) => void;
}

export const FolderModal: React.FC<FolderModalProps> = ({
  isOpen,
  onClose,
  onCreateFolder,
}) => {
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('📁');

  if (!isOpen) return null;

  const iconsList = ['📁', '📚', '💼', '🎬', '🤖', '🔐', '⭐', '🔥', '🎓', '🚀'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert('أدخل اسم المجلد');
    onCreateFolder(title.trim(), icon);
    setTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4 text-sky-400">
          <FolderPlus className="w-6 h-6" />
          <h3 className="font-bold text-sm">إنشاء مجلد محادثات جديد</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">اسم المجلد</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: مشاريع الجامعة، العمل، العائلة..."
              className="w-full bg-slate-800 text-xs text-slate-100 p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">رمز المجلد (Aesthetic Icon)</label>
            <div className="flex flex-wrap gap-2">
              {iconsList.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`p-2 rounded-xl text-lg transition-transform ${
                    icon === ic ? 'bg-sky-500/20 border-2 border-sky-400 scale-110' : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-colors shadow mt-2"
          >
            إضافة المجلد
          </button>
        </form>
      </div>
    </div>
  );
};
