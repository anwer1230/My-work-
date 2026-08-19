import React, { useState } from 'react';
import { 
  X, 
  Phone, 
  PhoneIncoming, 
  PhoneOutgoing, 
  PhoneMissed, 
  Video, 
  Plus, 
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { CallHistoryItem, User } from '../../types/telegram';
import { Language, translations } from '../../utils/i18n';

interface CallsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartCall: (targetUser: User, type: 'audio' | 'video') => void;
  lang: Language;
}

export const INITIAL_CALL_HISTORY: CallHistoryItem[] = [
  {
    id: 'call-1',
    user: {
      id: 'elena_rostova',
      name: 'Elena Rostova',
      username: 'elena_r',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      status: 'online',
    },
    type: 'audio',
    direction: 'incoming',
    timestamp: 'Today, 14:20',
    duration: '4:12',
  },
  {
    id: 'call-2',
    user: {
      id: 'durov',
      name: 'Pavel Durov',
      username: 'durov',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      status: 'offline',
      isVerified: true,
    },
    type: 'video',
    direction: 'outgoing',
    timestamp: 'Yesterday, 19:45',
    duration: '12:05',
  },
  {
    id: 'call-3',
    user: {
      id: 'sarah_chen',
      name: 'Sarah Chen',
      username: 'sarah_c',
      avatarColor: 'from-emerald-500 to-teal-700',
      status: 'online',
    },
    type: 'audio',
    direction: 'missed',
    timestamp: 'Aug 12',
  },
];

export const CallsModal: React.FC<CallsModalProps> = ({
  isOpen,
  onClose,
  onStartCall,
  lang,
}) => {
  const [callHistory, setCallHistory] = useState<CallHistoryItem[]>(INITIAL_CALL_HISTORY);
  const t = translations[lang];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div 
        dir={lang === 'ar' ? 'rtl' : 'ltr'} 
        className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh] animate-in zoom-in-95"
      >
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-neutral-100 text-base">{t.calls}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Calls List */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-800/50 custom-scrollbar p-2">
          {callHistory.map((item) => (
            <div
              key={item.id}
              className="p-3 flex items-center justify-between hover:bg-neutral-800/50 rounded-2xl transition-colors"
            >
              <div className="flex items-center gap-3">
                {item.user.avatar ? (
                  <img
                    src={item.user.avatar}
                    alt={item.user.name}
                    className="w-11 h-11 rounded-full object-cover ring-1 ring-neutral-800"
                  />
                ) : (
                  <div className={`w-11 h-11 rounded-full bg-gradient-to-tr ${item.user.avatarColor || 'from-sky-500 to-indigo-600'} text-white font-bold text-sm flex items-center justify-center`}>
                    {item.user.name.charAt(0)}
                  </div>
                )}

                <div>
                  <div className="font-semibold text-xs text-neutral-100">{item.user.name}</div>
                  <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 mt-0.5">
                    {item.direction === 'incoming' && <PhoneIncoming className="w-3.5 h-3.5 text-emerald-400" />}
                    {item.direction === 'outgoing' && <PhoneOutgoing className="w-3.5 h-3.5 text-sky-400" />}
                    {item.direction === 'missed' && <PhoneMissed className="w-3.5 h-3.5 text-rose-400" />}
                    <span>{item.timestamp}</span>
                    {item.duration && <span className="text-neutral-500 font-mono">({item.duration})</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    onStartCall(item.user, 'audio');
                    onClose();
                  }}
                  className="p-2 text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 rounded-full transition-colors"
                  title="Audio Call"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    onStartCall(item.user, 'video');
                    onClose();
                  }}
                  className="p-2 text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-full transition-colors"
                  title="Video Call"
                >
                  <Video className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
