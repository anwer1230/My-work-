import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Bookmark,
  Search,
  Tag,
  MessageSquare,
  FileText,
  Link2,
  Image as ImageIcon,
  Plus,
  Trash2,
  Share2,
  Copy,
  Check,
  Filter,
} from 'lucide-react';
import { UserProfile } from '../types';

export interface SavedNoteItem {
  id: string | number;
  text: string;
  senderChatTitle?: string;
  senderChatId?: string | number;
  tags: string[];
  type: 'text' | 'link' | 'media' | 'document';
  mediaUrl?: string;
  date: string;
  isPinned?: boolean;
}

const DEFAULT_SAVED_NOTES: SavedNoteItem[] = [
  {
    id: 'sn_1',
    text: 'رابط التوثيق الرسمي لـ Telegram MTProto API وبروتوكولات التشفير الأمني: https://core.telegram.org/mtproto',
    senderChatTitle: 'مجموعة المطورين',
    tags: ['روابط', 'برمجة', 'مهم'],
    type: 'link',
    date: new Date(Date.now() - 3600000 * 2).toISOString(),
    isPinned: true,
  },
  {
    id: 'sn_2',
    text: 'ملاحظة: تفعيل ميزة النجوم Stars في القنوات يتيح تفاعلات مميزة وسحب أرباح لمنشئي المحتوى.',
    senderChatTitle: 'قناة الأخبار والتقنية',
    tags: ['أفكار', 'تحديثات'],
    type: 'text',
    date: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'sn_3',
    text: 'قائمة المهام الأسبوعية: مراجعة خوادم إنجاز، ترقية واجهات تيليجرام ويب، وفحص مزامنة الرسائل غير المتصلة.',
    senderChatTitle: 'ملاحظات شخصية',
    tags: ['مهام', 'عمل', 'مهم'],
    type: 'text',
    date: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

const PRESET_TAGS = [
  { label: 'الكل', tag: 'all', icon: '📁' },
  { label: '#مهم', tag: 'مهم', icon: '⭐' },
  { label: '#روابط', tag: 'روابط', icon: '🔗' },
  { label: '#مهام', tag: 'مهام', icon: '✅' },
  { label: '#عمل', tag: 'عمل', icon: '💼' },
  { label: '#برمجة', tag: 'برمجة', icon: '💻' },
  { label: '#أفكار', tag: 'أفكار', icon: '💡' },
];

interface SavedMessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  lang?: 'ar' | 'en';
}

export const SavedMessagesModal: React.FC<SavedMessagesModalProps> = ({
  isOpen,
  onClose,
  profile,
  lang = 'ar',
}) => {
  const [notes, setNotes] = useState<SavedNoteItem[]>(() => {
    try {
      const saved = localStorage.getItem('tg_saved_messages_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load saved notes:', e);
    }
    return DEFAULT_SAVED_NOTES;
  });

  const [activeView, setActiveView] = useState<'all' | 'chats' | 'tags'>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedChat, setSelectedChat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteTags, setNewNoteTags] = useState('');
  const [copiedId, setCopiedId] = useState<string | number | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('tg_saved_messages_v2', JSON.stringify(notes));
    } catch (e) {
      console.warn('Failed to save notes:', e);
    }
  }, [notes]);

  const uniqueChats = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => {
      if (n.senderChatTitle) set.add(n.senderChatTitle);
    });
    return Array.from(set);
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes.filter((item) => {
      // Search match
      const matchSearch =
        !searchQuery ||
        item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.senderChatTitle && item.senderChatTitle.toLowerCase().includes(searchQuery.toLowerCase()));

      // Tag filter
      const matchTag = selectedTag === 'all' || item.tags.includes(selectedTag);

      // Chat filter
      const matchChat = selectedChat === 'all' || item.senderChatTitle === selectedChat;

      return matchSearch && matchTag && matchChat;
    });
  }, [notes, searchQuery, selectedTag, selectedChat]);

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;

    const detectedType = newNoteText.includes('http://') || newNoteText.includes('https://') ? 'link' : 'text';
    const tagList = newNoteTags
      .split(/[\s,]+/)
      .map((t) => t.replace(/^#/, '').trim())
      .filter(Boolean);

    const newNote: SavedNoteItem = {
      id: 'sn_' + Date.now(),
      text: newNoteText.trim(),
      senderChatTitle: 'ملاحظاتي السريعة',
      tags: tagList.length > 0 ? tagList : ['ملاحظات'],
      type: detectedType,
      date: new Date().toISOString(),
    };

    setNotes((prev) => [newNote, ...prev]);
    setNewNoteText('');
    setNewNoteTags('');
  };

  const handleDeleteNote = (id: string | number) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleCopy = (text: string, id: string | number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  const isAr = lang === 'ar';

  return (
    <div className="fixed inset-0 z-[2600] flex items-center justify-center p-4 select-none font-['Cairo',sans-serif]">
      {/* Backdrop */}
      <div onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" />

      {/* Main Container */}
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-sky-500/30 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh] text-zinc-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-b from-sky-500/20 via-zinc-900 to-zinc-950 border-b border-sky-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
              <Bookmark className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-zinc-100">
                  {isAr ? 'الرسائل المحفوظة 2.0 (Saved Messages)' : 'Saved Messages 2.0'}
                </h3>
                <span className="text-[10px] bg-sky-500/20 text-sky-300 font-bold px-2 py-0.5 rounded-full border border-sky-500/30">
                  Tags & Chats
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {isAr ? 'مساحتك السحابية الخاصة مع الوسوم والفرز حسب المحادثات الأصلية' : 'Cloud storage with tags & source chat filtering'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View switcher & Search bar */}
        <div className="p-4 bg-zinc-900/70 border-b border-zinc-800/80 space-y-3">
          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAr ? 'بحث في الرسائل المحفوظة والوسوم...' : 'Search saved messages...'}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pr-9 pl-4 py-2 text-xs text-zinc-100 focus:outline-none focus:border-sky-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* View Mode Buttons */}
            <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
              <button
                onClick={() => {
                  setActiveView('all');
                  setSelectedChat('all');
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeView === 'all' ? 'bg-sky-500 text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {isAr ? 'الكل' : 'All'}
              </button>
              <button
                onClick={() => setActiveView('chats')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeView === 'chats' ? 'bg-sky-500 text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {isAr ? 'حسب المحادثة' : 'By Chats'}
              </button>
            </div>
          </div>

          {/* Tags bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {PRESET_TAGS.map((t) => {
              const active = selectedTag === t.tag;
              return (
                <button
                  key={t.tag}
                  onClick={() => setSelectedTag(t.tag)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    active
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                      : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80'
                  }`}
                >
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Chat origins filter (if 'chats' view active) */}
          {activeView === 'chats' && (
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-zinc-800/50">
              <button
                onClick={() => setSelectedChat('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${
                  selectedChat === 'all'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-zinc-950 text-zinc-400 border border-zinc-800'
                }`}
              >
                {isAr ? 'جميع المحادثات' : 'All Chats'}
              </button>
              {uniqueChats.map((chat) => (
                <button
                  key={chat}
                  onClick={() => setSelectedChat(chat)}
                  className={`px-2.5 py-1 rounded-lg text-xs whitespace-nowrap ${
                    selectedChat === chat
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                      : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  💬 {chat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notes List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {filteredNotes.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-xs flex flex-col items-center justify-center space-y-2">
              <Bookmark className="w-10 h-10 text-zinc-600 mb-1" />
              <p className="font-bold text-zinc-400">
                {isAr ? 'لا توجد رسائل محفوظة تطابق هذا البحث' : 'No saved messages found'}
              </p>
              <p className="text-[11px] text-zinc-500 max-w-xs">
                {isAr
                  ? 'يمكنك حفظ الرسائل من أي محادثة أو كتابة ملاحظة سريعة أدناه.'
                  : 'Save messages or write quick notes below.'}
              </p>
            </div>
          ) : (
            filteredNotes.map((note) => {
              const isCopied = copiedId === note.id;
              return (
                <div
                  key={note.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    note.isPinned
                      ? 'bg-sky-950/20 border-sky-500/30'
                      : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  {/* Note header: Chat source + Date */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-[11px] text-sky-400 font-bold">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{note.senderChatTitle || (isAr ? 'ملاحظة شخصية' : 'Personal')}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-500">
                        {new Date(note.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button
                        onClick={() => handleCopy(note.text, note.id)}
                        className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                        title={isAr ? 'نسخ النص' : 'Copy'}
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1 text-zinc-500 hover:text-rose-400 rounded-lg hover:bg-zinc-800 transition-colors"
                        title={isAr ? 'حذف' : 'Delete'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Note body */}
                  <p className="text-xs text-zinc-100 whitespace-pre-wrap leading-relaxed select-text font-normal">
                    {note.text}
                  </p>

                  {/* Tags */}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {note.tags.map((t) => (
                        <span
                          key={t}
                          onClick={() => setSelectedTag(t)}
                          className="cursor-pointer text-[10px] bg-zinc-950 text-sky-400 hover:bg-sky-500/20 px-2 py-0.5 rounded-md font-mono border border-zinc-800 hover:border-sky-500/30 transition-colors"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Quick Note Composer Bar */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddNote();
              }}
              placeholder={isAr ? 'اكتب ملاحظة أو الصق رابطاً لحفظه...' : 'Write note or paste link...'}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-sky-500"
            />
            <input
              type="text"
              value={newNoteTags}
              onChange={(e) => setNewNoteTags(e.target.value)}
              placeholder={isAr ? 'وسوم: #مهم #عمل' : 'Tags: #work'}
              className="w-32 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-sky-500"
            />
            <button
              onClick={handleAddNote}
              disabled={!newNoteText.trim()}
              className="p-2.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-zinc-950 font-bold rounded-xl transition-colors flex items-center justify-center"
              title={isAr ? 'حفظ الملاحظة' : 'Save'}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
