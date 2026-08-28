import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  UserPlus,
  Phone,
  MessageSquare,
  Share2,
  X,
  Check,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

export interface TelegramContact {
  id: string | number;
  name: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  username?: string;
  photo?: string;
  status: 'online' | 'recently' | 'offline';
  status_text?: string;
  is_online?: boolean;
}

interface ContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectContact: (contact: TelegramContact) => void;
}

export const ContactsModal: React.FC<ContactsModalProps> = ({
  isOpen,
  onClose,
  onSelectContact,
}) => {
  const [contacts, setContacts] = useState<TelegramContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'online' | 'add'>('all');

  // Add Contact Form State
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [addingContact, setAddingContact] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/contacts');
      const data = await res.json();
      if (data.success && Array.isArray(data.contacts)) {
        setContacts(data.contacts);

        // Dynamically fetch and resolve avatars via GramJS getProfilePhotos endpoint
        data.contacts.forEach((contact: TelegramContact) => {
          if (!contact.photo && contact.id) {
            fetch(`/api/profile_photos?peer_id=${encodeURIComponent(contact.id)}&limit=1`)
              .then((r) => r.json())
              .then((resData) => {
                if (resData.success && (resData.photo_url || resData.photo_path)) {
                  setContacts((prev) =>
                    prev.map((item) =>
                      item.id === contact.id
                        ? { ...item, photo: resData.photo_url || resData.photo_path }
                        : item
                    )
                  );
                }
              })
              .catch(() => {});
          }
        });
      }
    } catch (e) {
      console.error('Error fetching contacts:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchContacts();
      setSuccessMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFirstName.trim() && !newUsername.trim() && !newPhone.trim()) return;

    setAddingContact(true);
    try {
      const res = await fetch('/api/contacts/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: newFirstName.trim(),
          last_name: newLastName.trim(),
          phone: newPhone.trim(),
          username: newUsername.trim(),
        }),
      });
      const data = await res.json();
      if (data.success && data.contact) {
        setContacts((prev) => [data.contact, ...prev]);
        setSuccessMsg('✅ تمت إضافة جهة الاتصال بنجاح إلى حساب تليجرام');
        setNewFirstName('');
        setNewLastName('');
        setNewPhone('');
        setNewUsername('');
        setTimeout(() => {
          setActiveTab('all');
          setSuccessMsg('');
        }, 1200);
      }
    } catch (err) {
      console.error('Error adding contact:', err);
    } finally {
      setAddingContact(false);
    }
  };

  const handleInvite = () => {
    const inviteText = 'انضم إلي على تليجرام للتواصل الآمن والسريع!';
    if (navigator.share) {
      navigator.share({
        title: 'تليجرام ويب',
        text: inviteText,
        url: window.location.origin,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${inviteText} ${window.location.origin}`);
      alert('📋 تم نسخ رابط الدعوة إلى الحافظة بنجاح!');
    }
  };

  const filteredContacts = contacts.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const nameMatch = (c.name || '').toLowerCase().includes(q);
    const userMatch = (c.username || '').toLowerCase().includes(q);
    const phoneMatch = (c.phone || '').toLowerCase().includes(q);
    return nameMatch || userMatch || phoneMatch;
  }).filter((c) => {
    if (activeTab === 'online') return c.is_online || c.status === 'online';
    return true;
  });

  const onlineCount = contacts.filter((c) => c.is_online || c.status === 'online').length;

  return (
    <div className="fixed inset-0 z-[2600] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="bg-zinc-950 border border-zinc-800 text-zinc-100 flex flex-col rounded-2xl shadow-2xl w-full max-w-md h-[80vh] max-h-[680px] overflow-hidden font-['Cairo',sans-serif]">
        
        {/* Header */}
        <div className="p-4 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold flex items-center gap-2">
                <span>جهات الاتصال</span>
                <span className="text-[10px] bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded-full font-bold">
                  {contacts.length}
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                {onlineCount} متصل الآن عبر سحابة تليجرام
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={fetchContacts}
              className={`p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-all ${loading ? 'animate-spin' : ''}`}
              title="تحديث القائمة"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-all"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs & Search */}
        <div className="p-3 bg-zinc-900/50 border-b border-zinc-800 space-y-2.5">
          <div className="flex bg-zinc-900 rounded-xl p-1 border border-zinc-800/80">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'all'
                  ? 'bg-sky-600 text-white shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              الكل ({contacts.length})
            </button>
            <button
              onClick={() => setActiveTab('online')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'online'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              متصل الآن ({onlineCount})
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                activeTab === 'add'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>إضافة</span>
            </button>
          </div>

          {activeTab !== 'add' && (
            <div className="relative">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="بحث بالاسم، المعرف (@username)، أو الهاتف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pr-9 pl-4 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {activeTab === 'add' ? (
            <form onSubmit={handleAddContact} className="p-3 space-y-3">
              <div className="text-xs font-bold text-zinc-300 mb-2">
                إضافة جهة اتصال جديدة إلى حسابك في تليجرام:
              </div>

              {successMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center">
                  {successMsg}
                </div>
              )}

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">الاسم الأول *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: د. أحمد"
                  value={newFirstName}
                  onChange={(e) => setNewFirstName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">اسم العائلة (اختياري)</label>
                <input
                  type="text"
                  placeholder="مثال: السالم"
                  value={newLastName}
                  onChange={(e) => setNewLastName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">رقم الهاتف الدولي</label>
                <input
                  type="text"
                  placeholder="+964 770 123 4567"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-sky-500 dir-ltr text-right"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">اسم المستخدم (@username)</label>
                <input
                  type="text"
                  placeholder="@ahmed_salem"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-sky-500 dir-ltr text-right"
                />
              </div>

              <button
                type="submit"
                disabled={addingContact}
                className="w-full mt-3 bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20 transition-all disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{addingContact ? 'جاري الحفظ بالسحابة...' : 'حفظ جهة الاتصال'}</span>
              </button>
            </form>
          ) : (
            <>
              {filteredContacts.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 space-y-3">
                  <Users className="w-10 h-10 mx-auto opacity-30" />
                  <p className="text-xs">لم يتم العثور على جهات اتصال مطابقة</p>
                </div>
              ) : (
                filteredContacts.map((contact) => {
                  const isOnline = contact.is_online || contact.status === 'online';
                  return (
                    <div
                      key={contact.id}
                      onClick={() => {
                        onSelectContact(contact);
                        onClose();
                      }}
                      className="p-2.5 rounded-xl hover:bg-zinc-900/90 flex items-center justify-between cursor-pointer transition-all border border-transparent hover:border-zinc-800 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-600 to-blue-700 text-white flex items-center justify-center font-bold text-sm shadow">
                            {contact.photo ? (
                              <img
                                src={contact.photo}
                                alt=""
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              (contact.name || 'C')[0]
                            )}
                          </div>
                          {isOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-zinc-950 rounded-full" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="text-xs font-bold text-zinc-100 group-hover:text-sky-400 transition-colors truncate">
                            {contact.name}
                          </div>
                          <div className="text-[11px] text-zinc-400 truncate flex items-center gap-2">
                            {contact.username && (
                              <span className="text-sky-400/80 font-mono">{contact.username}</span>
                            )}
                            <span className={isOnline ? 'text-emerald-400 font-semibold' : 'text-zinc-500'}>
                              {contact.status_text || (isOnline ? 'متصل الآن' : 'آخر ظهور قريباً')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                        <button
                          className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500 hover:text-white transition-all"
                          title="بدء محادثة فورية"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>

        {/* Footer Invite Friends */}
        <div className="p-3 bg-zinc-900/90 border-t border-zinc-800 flex items-center justify-between">
          <button
            onClick={handleInvite}
            className="w-full py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center justify-center gap-2 transition-all"
          >
            <Share2 className="w-3.5 h-3.5 text-sky-400" />
            <span>دعوة أصدقاء إلى تليجرام (Invite)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
