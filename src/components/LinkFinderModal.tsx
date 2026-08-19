import React, { useState } from 'react';
import { Compass, Bookmark, Search, ExternalLink, Plus, Trash2, X } from 'lucide-react';
import { ChatAvatar } from './ChatAvatar';

interface SavedLink {
  id: string;
  title: string;
  url: string;
  category: string;
}

interface LinkFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LinkFinderModal: React.FC<LinkFinderModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'finder' | 'saved'>('finder');

  const [savedLinks, setSavedLinks] = useState<SavedLink[]>([
    { id: '1', title: 'قناة المكتبة الأكاديمية', url: 'https://t.me/Abu_Mlk', category: 'أكاديمي' },
    { id: '2', title: 'بوت الخدمات الطلابية', url: 'https://t.me/Abu_Mlk_bot', category: 'بوتات' },
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');

  if (!isOpen) return null;

  const publicChannels = [
    { title: 'قناة الكتب والأبحاث الأكاديمية', username: '@Academic_Books_Zone', subs: '124K' },
    { title: 'قناة المراجع العلمية والترجمة', username: '@Sci_Trans_Hub', subs: '88K' },
    { title: 'مركز الأخبار والتحديثات الطلابية', username: '@Student_News_IQ', subs: '210K' },
    { title: 'ملتقى برامج الماجستير والدكتوراه', username: '@Master_PhD_Forum', subs: '65K' },
  ].filter(c => c.title.includes(query) || c.username.includes(query));

  const handleAddLink = () => {
    if (!newTitle.trim() || !newUrl.trim()) return;
    setSavedLinks([
      ...savedLinks,
      { id: Date.now().toString(), title: newTitle, url: newUrl, category: 'شخصي' }
    ]);
    setNewTitle('');
    setNewUrl('');
  };

  const handleRemoveLink = (id: string) => {
    setSavedLinks(savedLinks.filter(l => l.id !== id));
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative text-slate-100 max-h-[85vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4 text-emerald-400">
          <Compass className="w-6 h-6" />
          <h3 className="font-bold text-sm">باحث القنوات والروابط المحفوظة</h3>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-950/80 p-1 rounded-xl mb-4 border border-slate-800">
          <button
            onClick={() => setActiveTab('finder')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'finder' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            🔍 باحث القنوات العامة
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'saved' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            🔖 الروابط المحفوظة
          </button>
        </div>

        {activeTab === 'finder' ? (
          <div className="space-y-3 flex-1 flex flex-col overflow-y-auto pr-1">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute right-3 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="ابحث عن اسم قناة أو تخصص..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-slate-800 text-xs text-slate-100 pr-9 pl-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto">
              {publicChannels.map((chan, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <ChatAvatar title={chan.title} type="channel" size="sm" />
                    <div>
                      <div className="font-bold text-xs text-slate-100">{chan.title}</div>
                      <div className="text-[11px] text-emerald-400 font-mono">{chan.username}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-slate-900 px-2 py-1 rounded-lg text-slate-400">
                      {chan.subs} مشترك
                    </span>
                    <a
                      href={`https://t.me/${chan.username.replace('@', '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 rounded-xl transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3 flex-1 flex flex-col overflow-y-auto pr-1">
            <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
              <div className="text-[11px] font-bold text-emerald-400">حفظ رابط جديد</div>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="عنوان الرابط..."
                className="w-full bg-slate-800 text-xs text-slate-100 p-2 rounded-xl border border-slate-700"
              />
              <input
                type="text"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-slate-800 text-xs text-slate-100 p-2 rounded-xl border border-slate-700 font-mono dir-ltr text-right"
              />
              <button
                onClick={handleAddLink}
                className="w-full bg-emerald-500 text-slate-950 font-bold py-1.5 rounded-xl text-xs flex items-center justify-center gap-1 shadow"
              >
                <Plus className="w-4 h-4" /> إضافة للروابط المحفوظة
              </button>
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto">
              {savedLinks.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/50 flex items-center justify-between"
                >
                  <div className="truncate max-w-[200px]">
                    <div className="font-bold text-xs text-slate-100 truncate">{item.title}</div>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-sky-400 font-mono truncate block hover:underline"
                    >
                      {item.url}
                    </a>
                  </div>
                  <button
                    onClick={() => handleRemoveLink(item.id)}
                    className="p-2 text-rose-400 hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
