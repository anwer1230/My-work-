import React, { useState } from 'react';
import { Pin, ChevronDown, ChevronUp, X, ExternalLink } from 'lucide-react';
import { Message } from '../types';
import { ChatAvatar } from './ChatAvatar';

export interface PinnedMessageItem {
  chat_id: string | number;
  chat_title: string;
  chat_avatar?: string;
  message: Message;
}

interface PinnedMessagesSidebarProps {
  pinnedMessages: PinnedMessageItem[];
  onSelectChat: (chatId: string | number) => void;
  onUnpinMessage?: (chatId: string | number, messageId: string | number) => void;
}

export const PinnedMessagesSidebar: React.FC<PinnedMessagesSidebarProps> = ({
  pinnedMessages,
  onSelectChat,
  onUnpinMessage,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [filterQuery, setFilterQuery] = useState('');

  if (!pinnedMessages || pinnedMessages.length === 0) {
    return null;
  }

  const filteredPinned = pinnedMessages.filter((pm) => {
    if (!filterQuery) return true;
    const text = pm.message.content?.text || pm.message.content?.caption || pm.message.text || '';
    const sender = pm.message.sender_name || '';
    const title = pm.chat_title || '';
    const q = filterQuery.toLowerCase();
    return (
      title.toLowerCase().includes(q) ||
      sender.toLowerCase().includes(q) ||
      text.toLowerCase().includes(q)
    );
  });

  return (
    <div className="mx-2 my-2 bg-slate-900/95 border border-amber-500/40 rounded-xl overflow-hidden shadow-lg transition-all duration-200">
      {/* Header bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-3 py-2 bg-gradient-to-r from-amber-500/15 to-amber-600/5 hover:from-amber-500/25 hover:to-amber-600/15 flex items-center justify-between cursor-pointer transition-colors border-b border-amber-500/20 select-none"
      >
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-amber-500/20 text-amber-400">
            <Pin className="w-3.5 h-3.5 rotate-45 fill-amber-400" />
          </div>
          <span className="text-xs font-bold text-amber-300">الرسائل المثبتة</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold font-mono border border-amber-400/30">
            {pinnedMessages.length}
          </span>
        </div>

        <div className="flex items-center gap-1 text-amber-400">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-amber-400/80" />
          ) : (
            <ChevronDown className="w-4 h-4 text-amber-400/80" />
          )}
        </div>
      </div>

      {/* Expanded List Body */}
      {isExpanded && (
        <div className="bg-slate-950/70 p-1.5 space-y-1">
          {pinnedMessages.length > 3 && (
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="تصفية الرسائل المثبتة..."
              className="w-full text-xs px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 mb-1"
            />
          )}

          <div className="max-h-56 overflow-y-auto space-y-1 pr-0.5 custom-scrollbar">
            {filteredPinned.length === 0 ? (
              <div className="text-center py-3 text-xs text-slate-500">
                لا توجد نتائج مطابقة
              </div>
            ) : (
              filteredPinned.map((pm) => {
                const text =
                  pm.message.content?.type === 'text'
                    ? pm.message.content.text
                    : pm.message.content?.caption || pm.message.text || `[${(pm.message.content?.type || 'MESSAGE').toUpperCase()}]`;

                return (
                  <div
                    key={`pinned_${pm.chat_id}_${pm.message.id}`}
                    onClick={() => onSelectChat(pm.chat_id)}
                    className="group relative p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800/90 border border-slate-800/80 hover:border-amber-500/40 cursor-pointer transition-all flex items-start justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      {/* Chat Title Badge */}
                      <div className="flex items-center gap-1.5 mb-1">
                        <ChatAvatar
                          title={pm.chat_title}
                          avatar={pm.chat_avatar}
                          size="xs"
                        />
                        <span className="text-[11px] font-bold text-sky-300 truncate max-w-[140px]">
                          {pm.chat_title}
                        </span>
                        <ExternalLink className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mr-auto" />
                      </div>

                      {/* Message Sender and Content */}
                      <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed font-sans dir-auto">
                        <span className="text-amber-400 font-medium font-mono text-[10px]">
                          {pm.message.sender_name}:{' '}
                        </span>
                        {text}
                      </p>

                      {/* Timestamp */}
                      <div className="mt-1 flex items-center justify-between text-[9px] text-slate-500">
                        <span>
                          {new Date(pm.message.date).toLocaleTimeString('ar-SA', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Unpin Action */}
                    {onUnpinMessage && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUnpinMessage(pm.chat_id, pm.message.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-700/80 rounded transition-all shrink-0 mt-0.5"
                        title="إلغاء تثبيت هذه الرسالة"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
