import React, { useState } from 'react';
import { X, Users, Megaphone, UserPlus, Sparkles, Check } from 'lucide-react';
import { ChatType } from '../../types/telegram';

interface NewChatModalProps {
  isOpen: boolean;
  type: 'group' | 'channel' | 'direct';
  onClose: () => void;
  onCreate: (data: {
    title: string;
    username?: string;
    about?: string;
    type: ChatType;
  }) => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  isOpen,
  type,
  onClose,
  onCreate,
}) => {
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [about, setAbout] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreate({
      title: title.trim(),
      username: username.trim() ? username.trim().replace(/^@/, '') : undefined,
      about: about.trim() || undefined,
      type: type === 'group' ? 'group' : type === 'channel' ? 'channel' : 'direct',
    });

    setTitle('');
    setUsername('');
    setAbout('');
    onClose();
  };

  const getTitle = () => {
    switch (type) {
      case 'group': return 'New Group';
      case 'channel': return 'New Channel';
      case 'direct': return 'New Message / Contact';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'group': return <Users className="w-6 h-6 text-emerald-400" />;
      case 'channel': return <Megaphone className="w-6 h-6 text-purple-400" />;
      case 'direct': return <UserPlus className="w-6 h-6 text-sky-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-neutral-800 rounded-xl">
              {getIcon()}
            </div>
            <h3 className="font-semibold text-neutral-100 text-base">{getTitle()}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
              {type === 'direct' ? 'Contact Name' : type === 'group' ? 'Group Name' : 'Channel Name'} *
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder={type === 'group' ? 'e.g. Design Systems Team' : type === 'channel' ? 'e.g. Tech Alpha Alerts' : 'e.g. Sarah Connor'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
              Username (optional public link)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-neutral-500 text-sm">@</span>
              <input
                type="text"
                placeholder="my_custom_channel"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-sky-500 rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-neutral-100 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
              Description / Bio
            </label>
            <textarea
              rows={3}
              placeholder="What is this chat about?"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 focus:outline-hidden resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-5 py-2 text-sm font-medium bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white rounded-xl shadow-lg shadow-sky-500/20 flex items-center gap-2 transition-colors"
            >
              <Check className="w-4 h-4" />
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
