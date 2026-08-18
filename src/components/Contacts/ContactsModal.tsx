import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  Search, 
  Phone, 
  MessageSquare, 
  Check, 
  Sparkles,
  Users
} from 'lucide-react';
import { Contact, User } from '../../types/telegram';
import { Language, translations } from '../../utils/i18n';

interface ContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectContact: (contact: Contact) => void;
  onAddContact: (newContact: { name: string; phone: string; username?: string }) => void;
  lang: Language;
}

export const INITIAL_CONTACTS: Contact[] = [
  {
    id: 'durov',
    name: 'Pavel Durov',
    phone: '+971 50 123 4567',
    username: 'durov',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'offline',
  },
  {
    id: 'elena_rostova',
    name: 'Elena Rostova',
    phone: '+1 415 890 1234',
    username: 'elena_r',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    status: 'online',
  },
  {
    id: 'alex_morgan',
    name: 'Alex Morgan',
    phone: '+44 20 7946 0912',
    username: 'alex_m',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    status: 'offline',
  },
  {
    id: 'sarah_chen',
    name: 'Sarah Chen',
    phone: '+65 9123 4567',
    username: 'sarah_c',
    avatarColor: 'from-emerald-500 to-teal-700',
    status: 'online',
  },
  {
    id: 'marcus_v',
    name: 'Marcus Vance',
    phone: '+49 30 1234567',
    username: 'marcus_v',
    avatarColor: 'from-blue-600 to-indigo-600',
    status: 'offline',
  },
];

export const ContactsModal: React.FC<ContactsModalProps> = ({
  isOpen,
  onClose,
  onSelectContact,
  onAddContact,
  lang,
}) => {
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newUsername, setNewUsername] = useState('');

  const t = translations[lang];

  if (!isOpen) return null;

  const filteredContacts = contacts.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.username && c.username.toLowerCase().includes(q))
    );
  });

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    const contact: Contact = {
      id: `contact-${Date.now()}`,
      name: newName.trim(),
      phone: newPhone.trim(),
      username: newUsername.trim() ? newUsername.trim().replace(/^@/, '') : undefined,
      avatarColor: 'from-sky-500 to-indigo-600',
      status: 'offline',
    };

    setContacts((prev) => [contact, ...prev]);
    onAddContact(contact);
    setIsAdding(false);
    setNewName('');
    setNewPhone('');
    setNewUsername('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div 
        dir={lang === 'ar' ? 'rtl' : 'ltr'} 
        className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh] animate-in zoom-in-95"
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-neutral-100 text-base">{t.contacts}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="p-1.5 bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isAdding ? 'إلغاء' : 'إضافة جهة'}</span>
            </button>
            <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-white rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Add Contact Form (if toggled) */}
        {isAdding ? (
          <form onSubmit={handleCreateContact} className="p-5 space-y-3 bg-neutral-950/60 border-b border-neutral-800">
            <div className="font-semibold text-xs text-sky-400">{t.addContact}</div>
            <input
              type="text"
              required
              placeholder="الاسم الكامل"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 focus:border-sky-500 rounded-xl px-3.5 py-2 text-xs text-neutral-100 focus:outline-hidden"
            />
            <input
              type="tel"
              required
              placeholder="رقم الهاتف (مثل +966 50 123 4567)"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 focus:border-sky-500 rounded-xl px-3.5 py-2 text-xs text-neutral-100 focus:outline-hidden"
            />
            <input
              type="text"
              placeholder="اسم المستخدم (اختياري @username)"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 focus:border-sky-500 rounded-xl px-3.5 py-2 text-xs text-neutral-100 focus:outline-hidden"
            />
            <button
              type="submit"
              className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" /> حفظ جهة الاتصال
            </button>
          </form>
        ) : (
          /* Search Bar */
          <div className="p-3 border-b border-neutral-800/80 bg-neutral-950/40">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="بحث في جهات الاتصال..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-full pl-9 pr-4 py-2 text-xs text-neutral-200 focus:outline-hidden focus:border-sky-500"
              />
            </div>
          </div>
        )}

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-800/50 custom-scrollbar p-1">
          {filteredContacts.length === 0 ? (
            <div className="p-8 text-center text-neutral-500 text-xs">
              لم يتم العثور على جهات اتصال
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => {
                  onSelectContact(contact);
                  onClose();
                }}
                className="p-3 flex items-center justify-between hover:bg-neutral-800/50 rounded-2xl cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  {contact.avatar ? (
                    <img
                      src={contact.avatar}
                      alt={contact.name}
                      className="w-11 h-11 rounded-full object-cover ring-1 ring-neutral-800"
                    />
                  ) : (
                    <div className={`w-11 h-11 rounded-full bg-gradient-to-tr ${contact.avatarColor || 'from-sky-500 to-indigo-600'} text-white font-bold text-sm flex items-center justify-center`}>
                      {contact.name.charAt(0)}
                    </div>
                  )}

                  <div>
                    <div className="font-semibold text-xs text-neutral-100">{contact.name}</div>
                    <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                      <span>{contact.phone}</span>
                      {contact.username && <span className="text-sky-400">@{contact.username}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="p-2 text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 rounded-full transition-colors">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
