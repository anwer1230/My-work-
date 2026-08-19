import React from 'react';
import { Users, Shield, ShieldCheck, X } from 'lucide-react';
import { ChatMember } from '../types';
import { ChatAvatar } from './ChatAvatar';

interface MembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: ChatMember[];
}

export const MembersModal: React.FC<MembersModalProps> = ({
  isOpen,
  onClose,
  members,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative text-slate-100 max-h-[80vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4 text-sky-400">
          <Users className="w-6 h-6" />
          <h3 className="font-bold text-sm">أعضاء المجموعة ومشرفوها</h3>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {members.map((m, idx) => (
            <div
              key={m.id || m.user_id || idx}
              className="p-2.5 bg-slate-800/80 rounded-2xl border border-slate-700/50 flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <ChatAvatar
                  title={m.name}
                  avatar={m.avatar}
                  size="sm"
                />
                <div>
                  <div className="font-semibold text-xs text-slate-100">{m.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{m.username || '@user'}</div>
                </div>
              </div>

              <div className="text-[10px] font-bold px-2 py-0.5 rounded-full font-sans">
                {(m.role === 'owner' || m.role === 'creator') && (
                  <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Shield className="w-3 h-3" /> المالك
                  </span>
                )}
                {(m.role === 'administrator' || m.role === 'admin') && (
                  <span className="bg-sky-500/20 text-sky-400 border border-sky-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> مشرف
                  </span>
                )}
                {m.role === 'member' && (
                  <span className="text-slate-400 font-normal">عضو</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
