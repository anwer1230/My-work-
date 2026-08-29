import React, { useState } from 'react';
import { useTelegram } from '../../context/TelegramContext';
import { ChatListHeader } from './ChatListHeader';
import { FolderBar } from './FolderBar';
import { ChatListItem } from './ChatListItem';
import { StoriesBar } from './StoriesBar';
import {
  Bot,
  Radio,
  Users,
  MessageSquare,
  Globe,
  Edit3,
  RefreshCw,
  Plus,
  Lock,
  Megaphone,
} from 'lucide-react';
import { usePullToRefresh, useEdgeSwipeDrawer } from '../../hooks/useTouchGestures';
import { messagesController } from '../../core/MessagesController';

export const Sidebar: React.FC = () => {
  const {
    chats,
    messages,
    activeChatId,
    setActiveChatId,
    activeFolderId,
    folders,
    searchQuery,
    setSearchQuery,
    settings,
    setIsDrawerOpen,
    setActiveModal,
    syncCloudData,
    isSyncing,
    showToast,
  } = useTelegram();

  const isArabic = settings.language === 'ar';
  const isSearching = !!searchQuery.trim();
  const q = searchQuery.toLowerCase().trim();

  // Edge Swipe to open drawer (DrKLO gesture)
  useEdgeSwipeDrawer(() => {
    setIsDrawerOpen(true);
  }, isArabic);

  // Pull to refresh cloud sync
  const { pullProgress, isRefreshing, pullHandlers } = usePullToRefresh(async () => {
    try {
      await syncCloudData();
      showToast(isArabic ? 'تم تحديث البيانات السحابية' : 'Cloud sync completed', '☁️');
    } catch {
      showToast(isArabic ? 'فشل التحديث السحابي' : 'Sync failed', '⚠️');
    }
  });

  // Grouped search categories for search overlay
  const matchingChats = chats.filter((chat) => {
    if (!isSearching) return true;
    return (
      chat.title.toLowerCase().includes(q) ||
      chat.username?.toLowerCase().includes(q) ||
      chat.lastMessage?.text?.toLowerCase().includes(q) ||
      chat.draft?.toLowerCase().includes(q)
    );
  });
  const matchingBots = matchingChats.filter((c) => c.type === 'bot');
  const matchingChannelsAndGroups = matchingChats.filter(
    (c) => c.type === 'channel' || c.type === 'group'
  );
  const matchingPrivateChats = matchingChats.filter(
    (c) => c.type === 'private' || c.type === 'saved' || c.isSecret
  );

  // Search inside all messages
  const matchingMessagesList: {
    chatId: string;
    chatTitle: string;
    chatAvatar: string;
    msgId: string;
    text: string;
    date: string;
  }[] = [];

  if (isSearching) {
    Object.entries(messages).forEach(([cId, msgList]) => {
      const parentChat = chats.find((c) => c.id === cId);
      const list = Array.isArray(msgList) ? msgList : [];
      list.forEach((m) => {
        if (m.text && m.text.toLowerCase().includes(q)) {
          matchingMessagesList.push({
            chatId: cId,
            chatTitle: parentChat?.title || m.senderName || 'Chat',
            chatAvatar: parentChat?.avatar || m.senderAvatar || '',
            msgId: m.id,
            text: m.text,
            date: m.timestamp,
          });
        }
      });
    });
  }

  // Exact DrKLO MessagesController & DialogsAdapter sorting algorithm
  const sortedChats = messagesController.sortDialogs(
    chats,
    isSearching ? 'all' : activeFolderId,
    searchQuery
  );

  return (
    <div
      id="tg-sidebar"
      className={`relative w-full md:w-80 lg:w-96 flex flex-col h-full border-r select-none shrink-0 ${
        activeChatId ? 'hidden md:flex' : 'flex'
      }`}
      style={{
        backgroundColor: 'var(--tg-theme-sidebar)',
        borderColor: 'var(--tg-theme-border)',
      }}
    >
      {/* Header & Search */}
      <ChatListHeader />

      {/* Cloud Sync Activity Indicator Bar */}
      {isSyncing && (
        <div className="flex items-center justify-center gap-2 py-1 px-3 bg-sky-500/15 border-b border-sky-500/20 text-sky-400 text-xs font-semibold animate-pulse">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>{isArabic ? 'جاري المزامنة مع سحابة تيليجرام...' : 'Updating Telegram cloud...'}</span>
        </div>
      )}

      {/* Stories Bar (2026 Telegram Stories Engine) */}
      {!isSearching && <StoriesBar />}

      {/* Folders Tab Bar - Only when not actively searching */}
      {!isSearching && <FolderBar />}

      {/* Pull-to-refresh Visual Indicator (Telegram Android Spinner) */}
      {(pullProgress > 0 || isRefreshing) && (
        <div
          className="flex items-center justify-center py-2 bg-black/20 border-b border-white/5 transition-all overflow-hidden"
          style={{ height: `${Math.max(pullProgress * 44, isRefreshing ? 40 : 0)}px` }}
        >
          <div className="w-8 h-8 rounded-full bg-[#2481cc] text-white flex items-center justify-center shadow-lg">
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
              style={{
                transform: isRefreshing ? undefined : `rotate(${pullProgress * 360}deg)`,
              }}
            />
          </div>
        </div>
      )}

      {/* Chat List Scrollable Feed */}
      <div
        {...pullHandlers}
        className="flex-1 overflow-y-auto divide-y divide-white/5 py-1"
      >
        {isSearching ? (
          <div className="space-y-3 p-1">
            {/* Bots Category */}
            {matchingBots.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold text-sky-400 uppercase tracking-wider">
                  <Bot className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'البوتات (Bots)' : 'Bots'}</span>
                </div>
                {matchingBots.map((chat) => (
                  <ChatListItem key={chat.id} chat={chat} isActive={activeChatId === chat.id} />
                ))}
              </div>
            )}

            {/* Channels & Groups Category */}
            {matchingChannelsAndGroups.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                  <Radio className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'القنوات والمجموعات' : 'Channels & Groups'}</span>
                </div>
                {matchingChannelsAndGroups.map((chat) => (
                  <ChatListItem key={chat.id} chat={chat} isActive={activeChatId === chat.id} />
                ))}
              </div>
            )}

            {/* Private & Saved Messages */}
            {matchingPrivateChats.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                  <Users className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'المحادثات المباشرة' : 'Chats & Contacts'}</span>
                </div>
                {matchingPrivateChats.map((chat) => (
                  <ChatListItem key={chat.id} chat={chat} isActive={activeChatId === chat.id} />
                ))}
              </div>
            )}

            {/* Matching Messages */}
            {matchingMessagesList.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold text-purple-400 uppercase tracking-wider">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'الرسائل المطابقة' : 'Matching Messages'} ({matchingMessagesList.length})</span>
                </div>
                <div className="space-y-1 px-1">
                  {matchingMessagesList.slice(0, 8).map((m) => (
                    <button
                      key={m.msgId}
                      onClick={() => {
                        setActiveChatId(m.chatId);
                      }}
                      className="w-full p-2 rounded-xl hover:bg-white/5 text-left rtl:text-right flex items-start gap-2.5 transition-colors"
                    >
                      {m.chatAvatar ? (
                        <img
                          src={m.chatAvatar}
                          alt=""
                          className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-[#2481cc] text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {m.chatTitle.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-sky-400 truncate">{m.chatTitle}</span>
                          <span className="text-[10px] text-gray-500">{m.date}</span>
                        </div>
                        <p className="text-xs text-gray-300 truncate mt-0.5">{m.text}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {matchingChats.length === 0 && matchingMessagesList.length === 0 && (
              <div className="p-8 text-center text-xs text-gray-400 flex flex-col items-center gap-2">
                <Globe className="w-8 h-8 text-gray-500 opacity-50" />
                <span>{isArabic ? 'لم يتم العثور على أي نتائج مطابقة في سحابة تيليجرام' : 'No matching results found in Telegram cloud'}</span>
              </div>
            )}
          </div>
        ) : sortedChats.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400">
            {isArabic ? 'لم يتم العثور على محادثات' : 'No chats found'}
          </div>
        ) : (
          sortedChats.map((chat) => (
            <ChatListItem key={chat.id} chat={chat} isActive={activeChatId === chat.id} />
          ))
        )}
      </div>

      {/* Floating Action Button (FAB) - Classic Telegram Android Pencil / New Chat */}
      <button
        id="tg-fab-new-chat"
        onClick={() => setActiveModal('new-chat')}
        className="absolute bottom-5 right-5 rtl:right-auto rtl:left-5 w-14 h-14 rounded-full bg-[#2481cc] hover:bg-[#1f70b3] active:scale-90 text-white flex items-center justify-center shadow-2xl shadow-sky-950/80 transition-all duration-200 z-30 group cursor-pointer"
        title={isArabic ? 'محادثة جديدة' : 'New Message'}
        style={{
          boxShadow: '0 8px 24px rgba(36, 129, 204, 0.45), 0 2px 6px rgba(0,0,0,0.3)',
        }}
      >
        <Edit3 className="w-6 h-6 group-hover:rotate-12 transition-transform duration-200" />
      </button>
    </div>
  );
};
