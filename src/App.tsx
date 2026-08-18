
import { TranslateBar } from './components/TranslateBar';
import { InstallAppModal } from './components/InstallAppModal';
import { TelegramStarsModal } from './components/TelegramStarsModal';
import { SavedMessagesModal } from './components/SavedMessagesModal';
import { TelegramBusinessModal } from './components/TelegramBusinessModal';
import { ViewOnceMediaModal } from './components/ViewOnceMediaModal';
import { ReactionPicker } from './components/ReactionPicker';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AutomationAIModal, AutomationTab } from './components/AutomationAIModal';
import { SettingsModal } from './components/SettingsModal';
import { VoiceCallModal } from './components/VoiceCallModal';
import { ContactsModal } from './components/ContactsModal';
import { AddAccountModal } from './components/AddAccountModal';
import { AdminActionsModal } from './components/AdminActionsModal';
import { BottomNavBar, BottomNavTab } from './components/BottomNavBar';
import { AIGuardianModal } from './components/AIGuardianModal';
import { EnhancedPollModal } from './components/EnhancedPollModal';
import { MarkdownViewerModal } from './components/MarkdownViewerModal';
import { StoryViewerModal } from './components/StoryViewerModal';
import { ChatAvatar } from './components/ChatAvatar';
import { TelegramLinkModal } from './components/TelegramLinkModal';
import { TelegramNotificationBanner, TelegramNotificationItem } from './components/TelegramNotificationBanner';
import { TelegramUnreadBadge } from './components/TelegramUnreadBadge';
import { PwaInstallBanner } from './components/PwaInstallBanner';
import { TelegramApkInstallModal } from './components/TelegramApkInstallModal';
import { MTProtoSyncModal } from './components/MTProtoSyncModal';
import { ArchiveSyncModal } from './components/ArchiveSyncModal';
import { ActiveSessionsModal } from './components/ActiveSessionsModal';
import { AcademicModal } from './components/AcademicModal';
import { LinkFinderModal } from './components/LinkFinderModal';
import { ChatThemeModal } from './components/ChatThemeModal';
import { SyncBackupModal } from './components/SyncBackupModal';
import { playTelegramIncomingSound, getPeerColor, getPeerInitials } from './utils/telegramPeerUtils';
import { UserProfile, TelegramAccount, TelegramStory } from './types';
import { SystemMessageItem } from './components/SystemMessageItem';
import {
  showPushNotification,
  speakAlertTTS,
  handleIncomingSystemEvent,
  requestNotificationPermission,
  getNotificationPermissionStatus,
  isNotificationSupported,
} from './lib/notificationService';
import {
  saveCachedChats,
  getCachedChats,
  saveCachedMessages,
  getCachedMessages,
  getAllCachedMessages,
  saveCachedPinnedMessages,
  getCachedPinnedMessages,
  saveCachedUserProfile,
  getCachedUserProfile,
  getLastSyncTimestamp,
  clearStorageCache,
  getStorageCacheSummary,
} from './lib/storageCache';
import { syncEngine, telegramSyncEngine, SyncState } from './lib/sync';
import { indexedDbService } from './lib/indexedDbService';
import { sortChatsWithLastActivePriority, isGroupChat } from './utils/chatSorting';
import { initialUserProfile, initialChats, initialMessagesMap, initialFolders } from './data/mockInitialData';
import './system-messages.css';

// ── TYPES ───────────────────────────────────────────────────────────────────
interface Reaction {
  emoji: string;
  count: number;
  mine: boolean;
}

interface MessageItem {
  id: string | number;
  chat_id?: string | number;
  sender_id?: string | number;
  sender_name?: string;
  out?: boolean;
  from_me?: boolean;
  text?: string;
  media?: string | null;
  type?: 'text' | 'photo' | 'document' | 'voice' | 'audio' | 'system';
  is_system?: boolean;
  system_type?: string;
  duration?: number;
  date?: number;
  status?: 'sending' | 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  reactions?: Reaction[];
  edited?: boolean;
  reply_to?: {
    id: string | number;
    sender_name?: string;
    text?: string;
  };
  fwd_from?: string;
}

interface ChatItem {
  id: string | number;
  name: string;
  title?: string;
  lastMsg?: string;
  lastMsgDate?: number;
  unread?: number;
  pinned?: boolean;
  muted?: boolean;
  archived?: boolean;
  type?: 'private' | 'group' | 'supergroup' | 'channel' | 'bot' | 'secret';
  photo?: string | null;
  avatar?: string | null;
  isOut?: boolean;
  username?: string;
  bio?: string;
  phone?: string;
  last_system_activity?: number;
  has_system_activity?: boolean;
}

interface UserProfileData {
  id?: string | number;
  user_id?: string | number;
  name?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  phone?: string;
  bio?: string;
  photo?: string | null;
  is_online?: boolean;
  has_2fa?: boolean;
}

interface PinnedMsgData {
  id: string | number;
  text: string;
  sender_name?: string;
}

interface AttachmentItem {
  id: string;
  file: File;
  previewUrl: string;
  type: 'image' | 'document';
  name: string;
}

const COUNTRY_CODES = [
  { code: '+964', country: 'العراق (Iraq)', flag: '🇮🇶' },
  { code: '+966', country: 'السعودية (Saudi Arabia)', flag: '🇸🇦' },
  { code: '+20', country: 'مصر (Egypt)', flag: '🇪🇬' },
  { code: '+971', country: 'الإمارات (UAE)', flag: '🇦🇪' },
  { code: '+962', country: 'الأردن (Jordan)', flag: '🇯🇴' },
  { code: '+965', country: 'الكويت (Kuwait)', flag: '🇰🇼' },
  { code: '+974', country: 'قطر (Qatar)', flag: '🇶🇦' },
  { code: '+968', country: 'عُمان (Oman)', flag: '🇴🇲' },
  { code: '+973', country: 'البحرين (Bahrain)', flag: '🇧🇭' },
  { code: '+961', country: 'لبنان (Lebanon)', flag: '🇱🇧' },
  { code: '+963', country: 'سوريا (Syria)', flag: '🇸🇾' },
  { code: '+970', country: 'فلسطين (Palestine)', flag: '🇵🇸' },
  { code: '+212', country: 'المغرب (Morocco)', flag: '🇲🇦' },
  { code: '+213', country: 'الجزائر (Algeria)', flag: '🇩🇿' },
  { code: '+216', country: 'تونس (Tunisia)', flag: '🇹🇳' },
  { code: '+218', country: 'ليبيا (Libya)', flag: '🇱🇾' },
  { code: '+249', country: 'السودان (Sudan)', flag: '🇸🇩' },
  { code: '+967', country: 'اليمن (Yemen)', flag: '🇾🇪' },
  { code: '+90', country: 'تركيا (Turkey)', flag: '🇹🇷' },
  { code: '+1', country: 'أمريكا / كندا (USA/Canada)', flag: '🇺🇸' },
  { code: '+44', country: 'المملكة المتحدة (UK)', flag: '🇬🇧' },
  { code: '+49', country: 'ألمانيا (Germany)', flag: '🇩🇪' },
];

const AV_COLORS = ['#e17055', '#6c5ce7', '#00b894', '#0984e3', '#fdcb6e', '#e84393', '#00cec9', '#a29bfe', '#fd79a8', '#55efc4'];

function avatarColor(id: string | number | undefined): string {
  const num = Math.abs(parseInt(String(id || '0'), 10) || 0);
  return AV_COLORS[num % AV_COLORS.length];
}

function initials(name: string | undefined): string {
  const clean = (name || '?').trim().split(/\s+/);
  if (clean.length > 1 && clean[0] && clean[clean.length - 1]) {
    return (clean[0][0] + clean[clean.length - 1][0]).toUpperCase();
  }
  return (name || '?').slice(0, 2).toUpperCase();
}

function fmtTime(ts?: number): string {
  if (!ts) return '';
  const d = new Date(ts * 1000);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  const diff = (now.getTime() - d.getTime()) / 864e5;
  if (diff < 7) {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
  }
  return d.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
}

function fmtMsgTime(ts?: number): string {
  if (!ts) return '';
  return new Date(ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function fmtDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export function getChatDisplayName(
  chat: { title?: string; name?: string; type?: string; first_name?: string; last_name?: string; username?: string; is_group?: boolean; is_channel?: boolean } | null | undefined,
  lang: string = 'ar'
): string {
  if (!chat) return '';
  const isGroupOrChannel =
    chat.type === 'group' ||
    chat.type === 'channel' ||
    chat.type === 'supergroup' ||
    Boolean(chat.is_group) ||
    Boolean(chat.is_channel);

  // Prioritize 'title' field for groups and channels to ensure group/channel names display accurately
  if (isGroupOrChannel) {
    if (chat.title && chat.title.trim()) return chat.title.trim();
    if (chat.name && chat.name.trim() && chat.name !== 'محادثة تليجرام' && chat.name !== 'Telegram Chat' && chat.name !== 'مستخدم تليجرام') {
      return chat.name.trim();
    }
    if (chat.username) {
      return chat.username.startsWith('@') ? chat.username : `@${chat.username}`;
    }
    return chat.type === 'channel' || chat.is_channel
      ? (lang === 'ar' ? 'قناة عامة' : 'Telegram Channel')
      : (lang === 'ar' ? 'مجموعة تليجرام' : 'Telegram Group');
  }

  // Direct / User chats
  if (chat.name && chat.name.trim() && chat.name !== 'محادثة تليجرام' && chat.name !== 'مستخدم تليجرام') {
    return chat.name.trim();
  }
  if (chat.title && chat.title.trim()) return chat.title.trim();
  if (chat.first_name) {
    return `${chat.first_name} ${chat.last_name || ''}`.trim();
  }
  if (chat.username) {
    return chat.username.startsWith('@') ? chat.username : `@${chat.username}`;
  }
  return lang === 'ar' ? 'محادثة تليجرام' : 'Telegram Chat';
}

export function renderFormattedMessageText(text: string, onOpenTelegramLink?: (urlOrUsername: string) => void) {
  if (!text) return null;

  // Split lines to detect blockquotes and code blocks
  const lines = text.split('\n');
  const renderedElements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];

  lines.forEach((line, lineIdx) => {
    // Check code fence ```
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // close code block
        const fullCode = codeBlockContent.join('\n');
        renderedElements.push(
          <div key={`codeblock-${lineIdx}`} className="msg-code-block">
            <pre><code>{fullCode}</code></pre>
          </div>
        );
        codeBlockContent = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      return;
    }

    // Check Blockquote (> Quote or » Quote)
    const isQuote = line.startsWith('>') || line.startsWith('»');
    const lineContent = isQuote ? line.replace(/^[>»]\s?/, '') : line;

    // Parse inline tokens: spoilers ||...||, bold **...**, italic *...*, code `...`, strike ~~...~~, links, mentions @..., hashtags #...
    const parseInlineTokens = (raw: string, keyPrefix: string): React.ReactNode[] => {
      const tokenRegex = /(\|\|.+?\|\||`[^`\n]+`|\*\*.+?\*\*|__(.+?)__|~~.+?~~|\*.+?\*|https?:\/\/[^\s<]+|www\.[^\s<]+|t\.me\/[^\s<]+|tg:\/\/[^\s<]+|@[a-zA-Z0-9_]{4,32}|#[a-zA-Z0-9_\u0600-\u06FF]+)/g;
      const tokens = raw.split(tokenRegex);

      return tokens.map((part, pIdx) => {
        if (!part) return null;
        const subKey = `${keyPrefix}-${pIdx}`;

        // Spoiler: ||text||
        if (part.startsWith('||') && part.endsWith('||') && part.length > 4) {
          const content = part.slice(2, -2);
          return (
            <span
              key={subKey}
              className="tg-spoiler"
              title="انقر لإظهار المحتوى المخفي"
              onClick={(e) => {
                e.stopPropagation();
                e.currentTarget.classList.toggle('revealed');
              }}
            >
              {content}
            </span>
          );
        }

        // Inline Code: `code`
        if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
          return <code key={subKey}>{part.slice(1, -1)}</code>;
        }

        // Bold: **text**
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
          return <strong key={subKey} className="font-bold">{part.slice(2, -2)}</strong>;
        }

        // Strikethrough: ~~text~~
        if (part.startsWith('~~') && part.endsWith('~~') && part.length > 4) {
          return <s key={subKey} className="line-through opacity-75">{part.slice(2, -2)}</s>;
        }

        // Italic: *text* or __text__
        if ((part.startsWith('*') && part.endsWith('*') && part.length > 2) || (part.startsWith('__') && part.endsWith('__') && part.length > 4)) {
          const content = part.startsWith('__') ? part.slice(2, -2) : part.slice(1, -1);
          return <em key={subKey} className="italic">{content}</em>;
        }

        // Telegram Link (t.me, telegram.me, tg://) - Official in-app Telegram Resolution
        const isTelegramLink = part.match(/^(https?:\/\/)?(www\.)?(t\.me|telegram\.me)\//i) || part.startsWith('tg://');
        if (isTelegramLink) {
          let fullUrl = part;
          if (!fullUrl.startsWith('http') && !fullUrl.startsWith('tg://')) {
            fullUrl = `https://${fullUrl}`;
          }
          return (
            <span
              key={subKey}
              className="msg-link cursor-pointer hover:underline text-[#2481cc] font-medium"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onOpenTelegramLink) {
                  onOpenTelegramLink(fullUrl);
                }
              }}
              title="انقر للانضمام أو فتح المحادثة داخل تطبيق تليجرام"
            >
              {part}
            </span>
          );
        }

        // Standard External Web URL / Link
        if (part.match(/^(https?:\/\/|www\.)/i)) {
          let href = part;
          if (part.startsWith('www.')) href = `https://${part}`;
          return (
            <a
              key={subKey}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="msg-link"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </a>
          );
        }

        // Mention @username - Official in-app Profile / Chat Resolution
        if (part.startsWith('@') && part.length >= 4) {
          return (
            <span
              key={subKey}
              className="msg-mention cursor-pointer hover:underline"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onOpenTelegramLink) {
                  onOpenTelegramLink(part);
                }
              }}
              title={`عرض ملف ${part} أو بدء محادثة`}
            >
              {part}
            </span>
          );
        }

        // Hashtag #tag
        if (part.startsWith('#') && part.length >= 2) {
          return (
            <span
              key={subKey}
              className="msg-hashtag"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </span>
          );
        }

        return part;
      });
    };

    const parsedLine = parseInlineTokens(lineContent, `l-${lineIdx}`);

    if (isQuote) {
      renderedElements.push(
        <div key={`quote-${lineIdx}`} className="msg-blockquote">
          {parsedLine}
        </div>
      );
    } else {
      renderedElements.push(
        <React.Fragment key={`frag-${lineIdx}`}>
          {lineIdx > 0 && renderedElements.length > 0 && <br />}
          {parsedLine}
        </React.Fragment>
      );
    }
  });

  // If codeblock remained open
  if (inCodeBlock && codeBlockContent.length > 0) {
    renderedElements.push(
      <div key="codeblock-end" className="msg-code-block">
        <pre><code>{codeBlockContent.join('\n')}</code></pre>
      </div>
    );
  }

  return <>{renderedElements}</>;
}

const EMOJI_CATS = [
  { icon: '😀', label: 'Smileys', emojis: ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','🥴','😵','💫','🤯','🤠','🥳','🥸','😎','🤓','🧐','😕','😟','🙁','😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👾','🤖','😺','😸','😹','😻','😼','😽','🙀','😿','😾'] },
  { icon: '👋', label: 'People', emojis: ['👋','🤚','🖐️','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','🦾','🦿','🦵','🦶','👂','🦻','👃','🧠','🫀','🫁','🦷','🦴','👀','👁️','👅','👄','💋','👶','🧒','👦','👧','🧑','👱','👨','🧔','👩','🧓','👴','👵','🙍','🙎','🙅','🙆','💁','🙋','🧏','🙇','🤦','🤷'] },
  { icon: '🐶', label: 'Animals', emojis: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🙈','🙉','🙊','🐔','🐧','🐦','🐤','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🪱','🐛','🦋','🐌','🐞','🐜','🪰','🪲','🪳','🦟','🦗','🕷️','🦂','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🦍','🦧','🐘','🦛','🦏','🐪','🐫','🦒','🦘','🦬','🐃','🐂','🐄','🐎','🐖','🐏','🐑','🦙','🐐','🦌','🐕','🐩','🦮','🐕‍🦺','🐈','🐈‍⬛','🐓','🦃','🦚','🦜','🦢','🕊️','🐇','🦝','🦨','🦡','🦫','🦦','🦥','🐿️','🦔'] },
  { icon: '🍎', label: 'Food', emojis: ['🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🍆','🥑','🫑','🥦','🥬','🥒','🌶️','🫒','🌽','🥕','🧄','🧅','🥔','🍠','🫘','🥜','🍞','🥐','🥖','🫓','🥨','🧀','🥚','🍳','🧈','🥞','🧇','🥓','🥩','🍗','🍖','🦴','🌭','🍔','🍟','🍕','🫔','🌮','🌯','🫙','🥙','🧆','🍜','🍲','🫕','🍛','🍣','🍱','🥟','🦪','🍤','🍙','🍚','🍘','🍥','🥮','🍢','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','🌰'] },
  { icon: '⚽', label: 'Activities', emojis: ['⚽','🏀','🏈','⚾','🥎','🎾','🏐','🥏','🎱','🏓','🏸','🏒','🏑','🥍','🏏','🪃','🥅','⛳','🪁','🏹','🎣','🤿','🥊','🥋','🎽','🛹','🛼','🛷','⛸️','🥌','🎿','⛷️','🏂','🪂','🏋️','🤼','🤸','⛹️','🤺','🏇','🧘','🏄','🚣','🧗','🚴','🏆','🥇','🥈','🥉','🏅','🎖️','🏵️','🎗️','🎫','🎟️','🎪','🤹','🎭','🎨','🎬','🎤','🎧','🎼','🎹','🥁','🪘','🎷','🎺','🎸','🪕','🎻','🎲','♟️','🎯','🎳','🎮','🎰','🧩'] },
  { icon: '❤️', label: 'Symbols', emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❤️‍🔥','❤️‍🩹','💕','💞','💓','💗','💖','💘','💝','💟','☮️','✝️','☪️','🕉️','✡️','🔯','🕎','☯️','☦️','🛐','⛎','♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓','🆔','⚛️','🉑','☢️','☣️','📴','📳','🈶','🈚','🈸','🈺','🈷️','✴️','🆚','💮','🉐','㊙️','㊗️','🈴','🈵','🈹','🈲','🅰️','🅱️','🆎','🆑','🅾️','🆘','❌','⭕','🛑','⛔','📛','🚫','💯','💢','♨️','🚷','🚯','🚳','🚱','🔞','📵','🚭','❗','❕','❓','❔','‼️','⁉️','🔅','🔆','🔱','⚜️','🔰','♻️','✅','❇️','✳️','❎','🌐','💠','Ⓜ️','🌀','💤','🏧','🚾','♿','🅿️','🛗','🈳','🈹','🚺','🚹','🚼','⚠️','🔔','🔕','🎵','🎶','🎼','🎤','📢','📣','📯'] }
];

export default function App() {
  // ── APP STATE ─────────────────────────────────────────────────────────────
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Auth State
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [authStep, setAuthStep] = useState<'phone' | 'code' | 'password'>('phone');
  const [selectedCountryCode, setSelectedCountryCode] = useState('+964');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [phoneCodeHash, setPhoneCodeHash] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [password2FA, setPassword2FA] = useState('');
  const [show2FAPassword, setShow2FAPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(60);

  // Network / Offline State
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // User Profile (Initialized from localStorage cache or initialUserProfile)
  const [currentUser, setCurrentUser] = useState<UserProfileData | null>(() => {
    const cached = getCachedUserProfile();
    return cached && cached.name ? cached : (initialUserProfile as any);
  });

  // Chats & Messages (Instantly rendered from localStorage cache or initial mock data)
  const [chats, setChats] = useState<ChatItem[]>(() => {
    const cached = getCachedChats();
    return cached && cached.length > 0 ? cached : (initialChats as any);
  });
  const [currentChatId, setCurrentChatId] = useState<string | number | null>(1002);
  const [messages, setMessages] = useState<Record<string | number, MessageItem[]>>(() => {
    const cached = getAllCachedMessages();
    return Object.keys(cached).length > 0 ? cached : (initialMessagesMap as any);
  });
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  // Merged Advanced Feature States
  const [starsModalOpen, setStarsModalOpen] = useState(false);
  const [savedMessagesModalOpen, setSavedMessagesModalOpen] = useState(false);
  const [businessModalOpen, setBusinessModalOpen] = useState(false);
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [translateBarOpen, setTranslateBarOpen] = useState(false);
  const [translatedMessages, setTranslatedMessages] = useState<Record<string | number, string>>({});
  const [transcriptions, setTranscriptions] = useState<Record<string | number, { loading: boolean; text?: string }>>({});
  const [viewOnceMedia, setViewOnceMedia] = useState<{
    isOpen: boolean;
    url: string;
    type?: 'photo' | 'video';
    senderName?: string;
    ttl?: number;
  } | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Pinned Messages & Drafts Stores (Initialized from localStorage cache)
  const [pinnedMessages, setPinnedMessages] = useState<Record<string, PinnedMsgData | null>>(() => getCachedPinnedMessages());
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  // Attachments Previews
  const [pendingAttachments, setPendingAttachments] = useState<AttachmentItem[]>([]);

  // Voice Recording Engine State
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceDuration, setVoiceDuration] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState<string | number | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const msgsAreaRef = useRef<HTMLDivElement | null>(null);

  // Selection mode
  const [selMode, setSelMode] = useState(false);
  const [selSet, setSelSet] = useState<Set<string | number>>(new Set());

  // Reply bar
  const [replyMsg, setReplyMsg] = useState<{ id: string | number; text: string; sender: string } | null>(null);

  // Search in chat overlay
  const [searchInChatOpen, setSearchInChatOpen] = useState(false);
  const [inChatSearchQuery, setInChatSearchQuery] = useState('');
  const [inChatSearchResults, setInChatSearchResults] = useState<MessageItem[]>([]);
  const [searchIdx, setSearchIdx] = useState(0);

  // Emoji picker
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [selectedEmojiCat, setSelectedEmojiCat] = useState(0);
  const [emojiSearchTerm, setEmojiSearchTerm] = useState('');

  // Attach menu
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);

  // Lightbox
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  // Profile Panel
  const [profilePanelOpen, setProfilePanelOpen] = useState(false);
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);

  // Forward Modal
  const [fwdModalOpen, setFwdModalOpen] = useState(false);
  const [fwdMsgId, setFwdMsgId] = useState<string | number | null>(null);
  const [fwdSearchQuery, setFwdSearchQuery] = useState('');

  // Reaction Picker
  const [reactPicker, setReactPicker] = useState<{ x: number; y: number; msgId: string | number } | null>(null);

  // Context Menu
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; items: Array<{ icon?: string; label?: string; danger?: boolean; sep?: boolean; fn?: () => void }> } | null>(null);

  // Scroll to bottom button
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  // Automation & Tools Suite State
  const [automationModalOpen, setAutomationModalOpen] = useState(false);
  const [automationActiveTab, setAutomationActiveTab] = useState<AutomationTab>('batches');
  const [automationDropdownOpen, setAutomationDropdownOpen] = useState(true);

  // Real Drawer Modals State
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [apkInstallModalOpen, setApkInstallModalOpen] = useState(false);
  const [voiceCallModalOpen, setVoiceCallModalOpen] = useState(false);
  const [contactsModalOpen, setContactsModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [aiGuardianModalOpen, setAiGuardianModalOpen] = useState(false);
  const [enhancedPollModalOpen, setEnhancedPollModalOpen] = useState(false);
  const [markdownModalOpen, setMarkdownModalOpen] = useState(false);
  const [mtprotoSyncModalOpen, setMtprotoSyncModalOpen] = useState(false);
  const [archiveSyncModalOpen, setArchiveSyncModalOpen] = useState(false);
  const [activeSessionsModalOpen, setActiveSessionsModalOpen] = useState(false);
  const [academicModalOpen, setAcademicModalOpen] = useState(false);
  const [linkFinderModalOpen, setLinkFinderModalOpen] = useState(false);
  const [chatThemeModalOpen, setChatThemeModalOpen] = useState(false);
  const [syncBackupModalOpen, setSyncBackupModalOpen] = useState(false);
  const [chatWallpaper, setChatWallpaper] = useState<string>('');
  const [markdownDocData, setMarkdownDocData] = useState<{ title: string; content: string }>({
    title: 'Telegram Android 12.x Features',
    content: `# Telegram Android 12.x Release Notes\n\n## Modern Redesign & AI Guardian\n- **Bottom Navigation Bar**: 1-Tap swift switching between Chats, Contacts, Automation, and Settings.\n- **AI Guardian 12.x**: Smart automated group moderation, spam & crypto scam filtering.\n- **Collapsible Quotes & Markdown Reader**: Fast reading with syntax highlighting.\n- **Enhanced Polls**: Interactive voting with attached links.\n\n\`\`\`json\n{\n  "version": "12.8.2",\n  "status": "ready"\n}\n\`\`\``,
  });
  const [activeBottomNav, setActiveBottomNav] = useState<BottomNavTab>('chats');
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [inAppNotif, setInAppNotif] = useState<TelegramNotificationItem | null>(null);

  // Telegram Stories 12.x State
  const [storyViewerOpen, setStoryViewerOpen] = useState(false);
  const [storyViewerIndex, setStoryViewerIndex] = useState(0);
  const [storiesList, setStoriesList] = useState<TelegramStory[]>([
    {
      id: 'story_official',
      user_id: 'telegram',
      user_name: 'Telegram News',
      user_avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
      media_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
      caption: '🚀 تحديث تليجرام 12.x مع دعم كامل لحارس المجموعات الذكي والشريط السفلي السريع!',
      views_count: 1420,
      reactions_count: 245,
      is_viewed: false,
      date: 'منذ ساعتين',
    },
    {
      id: 'story_enjaz',
      user_id: 'enjaz_center',
      user_name: 'مركز إنجاز الأكاديمي',
      user_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      media_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
      caption: '🎓 نظام الأتمتة المتقدم وتصنيف الروابط والبحوث الأكاديمية متاح الآن بكفاءة عالية.',
      views_count: 890,
      reactions_count: 180,
      is_viewed: false,
      date: 'منذ 4 ساعات',
    },
  ]);

  // Chat Filter Category Tabs State
  const [chatFilterTab, setChatFilterTab] = useState<'all' | 'unread' | 'channels' | 'groups' | 'bots'>('all');
  const [chatHdrMenuOpen, setChatHdrMenuOpen] = useState(false);

  // Multi-Account Management State
  const [accountsDropdownOpen, setAccountsDropdownOpen] = useState(false);
  const [addAccountModalOpen, setAddAccountModalOpen] = useState(false);

  // Official In-App Telegram Link & Group Join Modal
  const [telegramLinkModalUrl, setTelegramLinkModalUrl] = useState<string | null>(null);

  // Peer Avatar Cache for GramJS Profile Photos
  const [avatarMap, setAvatarMap] = useState<Record<string, string>>({});

  const fetchPeerAvatar = async (peerId: string | number) => {
    const pStr = String(peerId).trim();
    if (!pStr || avatarMap[pStr]) return avatarMap[pStr];
    try {
      const res = await fetch(`/api/profile_photos?peer_id=${encodeURIComponent(pStr)}&limit=1`);
      const data = await res.json();
      if (data.success && (data.photo_url || data.photo_path)) {
        const photo = data.photo_url || data.photo_path;
        setAvatarMap((prev) => ({ ...prev, [pStr]: photo }));
        setChats((prev) =>
          prev.map((c) => (String(c.id) === pStr ? { ...c, photo } : c))
        );
        return photo;
      }
    } catch (_) {}
    return null;
  };
  // ── TELEGRAM ANDROID BACK BUTTON & NAVIGATION STACK HANDLER ─────────────
  const lightboxSrcRef = useRef(lightboxSrc);
  lightboxSrcRef.current = lightboxSrc;

  const storyViewerOpenRef = useRef(storyViewerOpen);
  storyViewerOpenRef.current = storyViewerOpen;

  const profilePanelOpenRef = useRef(profilePanelOpen);
  profilePanelOpenRef.current = profilePanelOpen;

  const drawerOpenRef = useRef(drawerOpen);
  drawerOpenRef.current = drawerOpen;

  const settingsModalOpenRef = useRef(settingsModalOpen);
  settingsModalOpenRef.current = settingsModalOpen;

  const voiceCallModalOpenRef = useRef(voiceCallModalOpen);
  voiceCallModalOpenRef.current = voiceCallModalOpen;

  const contactsModalOpenRef = useRef(contactsModalOpen);
  contactsModalOpenRef.current = contactsModalOpen;

  const adminModalOpenRef = useRef(adminModalOpen);
  adminModalOpenRef.current = adminModalOpen;

  const aiGuardianModalOpenRef = useRef(aiGuardianModalOpen);
  aiGuardianModalOpenRef.current = aiGuardianModalOpen;

  const enhancedPollModalOpenRef = useRef(enhancedPollModalOpen);
  enhancedPollModalOpenRef.current = enhancedPollModalOpen;

  const markdownModalOpenRef = useRef(markdownModalOpen);
  markdownModalOpenRef.current = markdownModalOpen;

  const automationModalOpenRef = useRef(automationModalOpen);
  automationModalOpenRef.current = automationModalOpen;

  const addAccountModalOpenRef = useRef(addAccountModalOpen);
  addAccountModalOpenRef.current = addAccountModalOpen;

  const attachMenuOpenRef = useRef(attachMenuOpen);
  attachMenuOpenRef.current = attachMenuOpen;

  const emojiPickerOpenRef = useRef(emojiPickerOpen);
  emojiPickerOpenRef.current = emojiPickerOpen;

  const searchInChatOpenRef = useRef(searchInChatOpen);
  searchInChatOpenRef.current = searchInChatOpen;

  const fwdModalOpenRef = useRef(fwdModalOpen);
  fwdModalOpenRef.current = fwdModalOpen;

  const selModeRef = useRef(selMode);
  selModeRef.current = selMode;

  const ctxMenuRef = useRef(ctxMenu);
  ctxMenuRef.current = ctxMenu;

  const reactPickerRef = useRef(reactPicker);
  reactPickerRef.current = reactPicker;

  const chatHdrMenuOpenRef = useRef(chatHdrMenuOpen);
  chatHdrMenuOpenRef.current = chatHdrMenuOpen;

  const accountsDropdownOpenRef = useRef(accountsDropdownOpen);
  accountsDropdownOpenRef.current = accountsDropdownOpen;

  const currentChatIdRef = useRef(currentChatId);
  currentChatIdRef.current = currentChatId;

  const lastBackPressRef = useRef<number>(0);

  // Push history state whenever navigating into sub-views/modals
  const pushNavState = (type: string, id?: string | number) => {
    try {
      window.history.pushState({ type, id, t: Date.now() }, '');
    } catch (_) {}
  };

  // Helper openers that automatically manage the navigation history stack
  const openSettingsModal = () => {
    pushNavState('modal', 'settings');
    setSettingsModalOpen(true);
    setDrawerOpen(false);
  };

  const openContactsModal = () => {
    pushNavState('modal', 'contacts');
    setContactsModalOpen(true);
    setDrawerOpen(false);
  };

  const openVoiceCallModal = () => {
    pushNavState('modal', 'voice_call');
    setVoiceCallModalOpen(true);
    setDrawerOpen(false);
  };

  const openAdminModal = () => {
    pushNavState('modal', 'admin');
    setAdminModalOpen(true);
    setDrawerOpen(false);
  };

  const openAiGuardianModal = () => {
    pushNavState('modal', 'ai_guardian');
    setAiGuardianModalOpen(true);
    setDrawerOpen(false);
  };

  const openEnhancedPollModal = () => {
    pushNavState('modal', 'enhanced_poll');
    setEnhancedPollModalOpen(true);
    setDrawerOpen(false);
  };

  const openMarkdownModal = (docData?: { title: string; content: string }) => {
    if (docData) setMarkdownDocData(docData);
    pushNavState('modal', 'markdown');
    setMarkdownModalOpen(true);
    setDrawerOpen(false);
  };

  const openAddAccountModal = () => {
    pushNavState('modal', 'add_account');
    setAddAccountModalOpen(true);
    setAccountsDropdownOpen(false);
  };

  const openStoryViewerModal = (index = 0) => {
    pushNavState('modal', 'story_viewer');
    setStoryViewerIndex(index);
    setStoryViewerOpen(true);
  };

  const openLightboxModal = (src: string) => {
    pushNavState('lightbox', src);
    setLightboxSrc(src);
  };

  const openForwardModal = (msgId: string | number) => {
    pushNavState('modal', 'forward');
    setFwdMsgId(msgId);
    setFwdModalOpen(true);
  };

  const openInChatSearch = () => {
    pushNavState('in_chat_search');
    setSearchInChatOpen(true);
  };

  const openDrawerModal = () => {
    pushNavState('drawer');
    setDrawerOpen(true);
  };

  const handleOpenTelegramLink = (rawTarget: string) => {
    if (!rawTarget) return;
    const target = rawTarget.trim();

    // 1. Check if target corresponds to a public username or chat title in existing chats
    const cleanHandle = target
      .replace(/^(https?:\/\/)?(www\.)?(t\.me|telegram\.me)\//i, '')
      .replace(/^tg:\/\/resolve\?domain=/i, '')
      .replace(/^@/, '')
      .toLowerCase();

    const isInvite = target.includes('+') || target.includes('joinchat') || target.includes('tg://join');

    if (!isInvite && cleanHandle) {
      const foundChat = chats.find(
        (c) =>
          (c.username && c.username.replace('@', '').toLowerCase() === cleanHandle) ||
          (c.title && c.title.toLowerCase() === cleanHandle) ||
          (c.name && c.name.toLowerCase() === cleanHandle) ||
          String(c.id) === cleanHandle
      );

      if (foundChat) {
        selectChat(foundChat.id);
        showToast(
          lang === 'ar'
            ? `تم فتح ${getChatDisplayName(foundChat, lang)}`
            : `Opened ${getChatDisplayName(foundChat, lang)}`
        );
        return;
      }
    }

    // 2. Open official in-app Telegram Link / Join Modal
    pushNavState('modal', 'telegram_link');
    setTelegramLinkModalUrl(target);
  };

  useEffect(() => {
    try {
      if (!window.history.state) {
        window.history.replaceState({ type: 'root' }, '');
      }
    } catch (_) {}

    const handlePopState = (e: PopStateEvent) => {
      // 1. Lightbox
      if (lightboxSrcRef.current) {
        setLightboxSrc(null);
        return;
      }

      // 2. Context Menu & Popup Pickers
      if (ctxMenuRef.current || reactPickerRef.current || chatHdrMenuOpenRef.current || accountsDropdownOpenRef.current) {
        setCtxMenu(null);
        setReactPicker(null);
        setChatHdrMenuOpen(false);
        setAccountsDropdownOpen(false);
        return;
      }

      // 3. Story Viewer
      if (storyViewerOpenRef.current) {
        setStoryViewerOpen(false);
        return;
      }

      // 4. Selection mode in messages
      if (selModeRef.current) {
        setSelMode(false);
        setSelSet(new Set());
        return;
      }

      // 5. Forward modal
      if (fwdModalOpenRef.current) {
        setFwdModalOpen(false);
        setFwdMsgId(null);
        return;
      }

      // 6. In-chat search
      if (searchInChatOpenRef.current) {
        setSearchInChatOpen(false);
        return;
      }

      // 7. Emoji / Attach popups
      if (emojiPickerOpenRef.current) {
        setEmojiPickerOpen(false);
        return;
      }
      if (attachMenuOpenRef.current) {
        setAttachMenuOpen(false);
        return;
      }

      // 8. Dialog Modals
      if (settingsModalOpenRef.current) {
        setSettingsModalOpen(false);
        return;
      }
      if (voiceCallModalOpenRef.current) {
        setVoiceCallModalOpen(false);
        return;
      }
      if (contactsModalOpenRef.current) {
        setContactsModalOpen(false);
        return;
      }
      if (adminModalOpenRef.current) {
        setAdminModalOpen(false);
        return;
      }
      if (aiGuardianModalOpenRef.current) {
        setAiGuardianModalOpen(false);
        return;
      }
      if (enhancedPollModalOpenRef.current) {
        setEnhancedPollModalOpen(false);
        return;
      }
      if (markdownModalOpenRef.current) {
        setMarkdownModalOpen(false);
        return;
      }
      if (automationModalOpenRef.current) {
        setAutomationModalOpen(false);
        return;
      }
      if (addAccountModalOpenRef.current) {
        setAddAccountModalOpen(false);
        return;
      }

      // 9. Profile Panel
      if (profilePanelOpenRef.current) {
        setProfilePanelOpen(false);
        return;
      }

      // 10. Drawer
      if (drawerOpenRef.current) {
        setDrawerOpen(false);
        return;
      }

      // 11. Active Chat View (return back to chat list)
      if (currentChatIdRef.current !== null) {
        setCurrentChatId(null);
        setSearchInChatOpen(false);
        setReplyMsg(null);
        setPendingAttachments([]);
        return;
      }

      // 12. Main Chat List Root Guard (Prevents accidental app exit in PWA / mobile browser)
      const now = Date.now();
      if (now - lastBackPressRef.current < 2000) {
        // Double-tap back within 2 seconds: Allow natural exit
      } else {
        lastBackPressRef.current = now;
        // Re-push root state to prevent exiting the PWA
        try {
          window.history.pushState({ type: 'root' }, '');
        } catch (_) {}
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const [accountsList, setAccountsList] = useState<TelegramAccount[]>([
    {
      id: 'acc_main',
      phone: '+967 779 123 456',
      first_name: 'أنور سيف',
      username: 'anwer1230',
      session_name: 'الحساب الرئيسي',
      status: 'connected',
      has_2fa: true,
      is_active: true,
      created_at: new Date().toISOString(),
      last_sync: 'الآن',
      stats: { sent: 142, errors: 0, received: 580 }
    }
  ]);

  // Load Accounts from Server / LocalStorage
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch('/api/accounts');
        const data = await res.json();
        if (data.success && Array.isArray(data.accounts) && data.accounts.length > 0) {
          setAccountsList(data.accounts);
          const active = data.accounts.find((a: TelegramAccount) => a.is_active) || data.accounts[0];
          if (active && (!currentUser || currentUser.name === 'مستخدم تليجرام')) {
            setCurrentUser((prev: any) => ({
              ...prev,
              id: active.id,
              name: active.first_name || active.session_name || 'مستخدم تليجرام',
              first_name: active.first_name,
              username: active.username,
              phone: active.phone,
              has_2fa: active.has_2fa,
              is_online: true,
            }));
          }
        }
      } catch (err) {
        // Fallback local accounts preserved
      }
    };
    fetchAccounts();
  }, []);

  const handleSwitchAccount = async (account: TelegramAccount) => {
    try {
      await fetch('/api/accounts/switch_active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: account.id })
      }).catch(() => {});
    } catch (_) {}

    setAccountsList((prev) =>
      prev.map((a) => ({
        ...a,
        is_active: a.id === account.id
      }))
    );

    setCurrentUser((prev: any) => ({
      ...prev,
      id: account.id,
      name: account.first_name || account.session_name || 'مستخدم تليجرام',
      first_name: account.first_name,
      username: account.username,
      phone: account.phone,
      has_2fa: account.has_2fa,
      is_online: true,
    }));

    setAccountsDropdownOpen(false);
    showToast(lang === 'ar' ? `تم التبديل إلى: ${account.first_name || account.phone}` : `Switched to: ${account.first_name || account.phone}`);
  };

  const handleAddAccount = (newAcc: TelegramAccount) => {
    setAccountsList((prev) => {
      const updated = prev.map((a) => ({ ...a, is_active: false }));
      return [...updated, { ...newAcc, is_active: true }];
    });

    setCurrentUser((prev: any) => ({
      ...prev,
      id: newAcc.id,
      name: newAcc.first_name || newAcc.session_name || 'حساب جديد',
      first_name: newAcc.first_name,
      username: newAcc.username,
      phone: newAcc.phone,
      has_2fa: newAcc.has_2fa,
      is_online: true,
    }));

    setAccountsDropdownOpen(false);
    showToast(lang === 'ar' ? `تمت إضافة وتفعيل الحساب: ${newAcc.first_name || newAcc.phone}` : `Account added & activated: ${newAcc.first_name || newAcc.phone}`);
  };

  const openAutomationSuite = (tab: AutomationTab = 'batches') => {
    setAutomationActiveTab(tab);
    setAutomationModalOpen(true);
    setDrawerOpen(false);
    pushNavState('modal', 'automation');
  };

  const handleEnableNotifications = async () => {
    const perm = await requestNotificationPermission();
    setNotifPermission(perm);
    if (perm === 'granted') {
      showToast(lang === 'ar' ? 'تم تفعيل إشعارات تليجرام الفورية بنجاح 🔔' : 'Push notifications enabled 🔔');
      showPushNotification(lang === 'ar' ? 'تليجرام ويب 🚀' : 'Telegram Web 🚀', {
        body: lang === 'ar' ? 'الإشعارات الفورية مفعلة وجاهزة لتنبيهك بكل الرسائل وأحداث النظام.' : 'Push notifications are active.',
      });
    } else {
      showToast(lang === 'ar' ? 'تم رفض إذن الإشعارات من المتصفح' : 'Notifications permission denied');
    }
  };

  const handleTriggerAdminAction = async (actionData: {
    action_type: string;
    user_name: string;
    is_me: boolean;
    custom_text?: string;
  }) => {
    if (!currentChatId) return;
    try {
      const res = await fetch(`/api/chats/${encodeURIComponent(String(currentChatId))}/admin/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actionData),
      });
      const data = await res.json();
      if (data.success) {
        const nowSec = Math.floor(Date.now() / 1000);
        const sysText = data.message?.text || data.system_message?.message || actionData.custom_text || actionData.action_type;
        setChats((prev) => {
          const updated = prev.map((c) => {
            if (String(c.id) === String(currentChatId)) {
              return {
                ...c,
                lastMsg: sysText,
                lastMsgDate: nowSec,
                last_system_activity: nowSec,
                has_system_activity: true,
              };
            }
            return c;
          });
          const sorted = sortChatsWithLastActivePriority(updated);
          saveCachedChats(sorted);
          return sorted;
        });
        showToast(lang === 'ar' ? `تم تنفيذ الإجراء: ${sysText}` : 'Action executed');
      } else {
        showToast(data.error || 'Failed to execute action');
      }
    } catch (e: any) {
      showToast(e.message || 'Error triggering action');
    }
  };

  const handleTestPushNotification = async () => {
    if (notifPermission !== 'granted') {
      const p = await requestNotificationPermission();
      setNotifPermission(p);
      if (p !== 'granted') {
        showToast(lang === 'ar' ? 'يرجى السماح بالإشعارات في المتصفح أولاً' : 'Please allow notifications in browser');
        return;
      }
    }

    try {
      await fetch('/api/test_push_notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: lang === 'ar' ? '🛡️ إشعار تليجرام الفوري' : '🛡️ Telegram Push Notification',
          body: lang === 'ar' ? 'تم اختبار وتأكيد عمل نظام الإشعارات الفورية بنجاح!' : 'Push notifications are working smoothly!',
          chat_id: currentChatId || undefined,
        }),
      });
    } catch (_) {
      showPushNotification(lang === 'ar' ? '🛡️ إشعار تليجرام الفوري' : '🛡️ Telegram Push', {
        body: lang === 'ar' ? 'تم استلام الإشعار المحلي في المتصفح بنجاح!' : 'Notification received successfully!',
        chat_id: currentChatId || undefined,
      });
    }
  };

  const handleSimulateIncomingMessage = async (simType: 'group' | 'channel' | 'private' = 'group') => {
    let target = chats.find(c => simType === 'group' ? (c.type === 'group' || c.type === 'supergroup') : simType === 'channel' ? c.type === 'channel' : c.type === 'private');
    if (!target && chats.length > 0) target = chats[0];

    try {
      const res = await fetch('/api/telegram/simulate-incoming', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: target ? target.id : 1002,
          text: simType === 'group'
            ? 'السلام عليكم، تم مراجعة واعتماد التقرير البحثي للأطروحة بنجاح 🎓✅'
            : simType === 'channel'
            ? '🚀 تحديث رسمي: تم إطلاق ميزة المزامنة الفورية وقراءة الإشعارات عالية الدقة!'
            : 'مرحباً يا أنور، تفضل بمراجعة الملف والمراجع المرفقة.',
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(lang === 'ar' ? '🔔 تم استلام رسالة وإشعار فوري وتفعيل التنبيه الصوتي بنجاح!' : 'Simulated incoming message & notification received!');
      }
    } catch (e: any) {
      showToast(e.message || 'Error simulating message');
    }
  };

  const openCurrentUserProfile = async () => {
    setDrawerOpen(false);
    try {
      const res = await fetch('/api/user/info');
      const data = await res.json();
      if (data.success) {
        setProfileData({
          id: data.id || currentUser?.id || 'me',
          name: data.name || currentUser?.name || 'مستخدم تليجرام',
          first_name: data.first_name || currentUser?.first_name,
          last_name: data.last_name || currentUser?.last_name,
          username: data.username || currentUser?.username,
          phone: data.phone || currentUser?.phone,
          bio: data.bio || currentUser?.bio || (lang === 'ar' ? 'مطور ومدير مركز سرعة إنجاز الأكاديمي 🚀' : 'Telegram user'),
          photo: data.photo || currentUser?.photo,
          is_online: true,
        });
      }
    } catch (e) {
      if (currentUser) setProfileData(currentUser);
    }
    setSettingsModalOpen(true);
  };

  const openSavedMessages = () => {
    setDrawerOpen(false);
    const selfChatId = 'saved_messages';
    const existing = chats.find(
      (c) => String(c.id) === selfChatId || (c.type === 'private' && (c.title || c.name || '').includes('الرسائل المحفوظة'))
    );
    if (!existing) {
      const savedChat: ChatItem = {
        id: selfChatId,
        name: lang === 'ar' ? 'الرسائل المحفوظة' : 'Saved Messages',
        type: 'private',
        username: currentUser?.username || 'me',
        bio: lang === 'ar' ? 'مساحة تخزين سحابية خاصة بك لحفظ الرسائل والوسائط والروابط' : 'Your personal cloud storage',
        phone: currentUser?.phone,
        lastMsg: lang === 'ar' ? 'سحابة تليجرام للتخزين والملاحظات ☁️' : 'Telegram Cloud Storage ☁️',
        lastMsgDate: Date.now(),
        unread: 0,
        pinned: true,
      };
      setChats((prev) => [savedChat, ...prev]);
    }
    setCurrentChatId(selfChatId);
    showToast(lang === 'ar' ? 'تم فتح الرسائل المحفوظة (Self-Chat)' : 'Opened Saved Messages');
  };

  const handleSelectContact = (contact: any) => {
    const targetId = contact.id;
    const existing = chats.find((c) => String(c.id) === String(targetId));
    if (!existing) {
      const newChat: ChatItem = {
        id: targetId,
        name: contact.name,
        photo: contact.photo || null,
        type: 'private',
        phone: contact.phone,
        username: contact.username ? contact.username.replace('@', '') : undefined,
        bio: contact.status_text || (lang === 'ar' ? 'جهة اتصال موثقة' : 'Telegram contact'),
        lastMsg: '',
        lastMsgDate: Date.now(),
        unread: 0,
      };
      setChats((prev) => [newChat, ...prev]);
    }
    setCurrentChatId(targetId);
    setContactsModalOpen(false);
    showToast(lang === 'ar' ? `بدء المحادثة مع ${contact.name}` : `Started chat with ${contact.name}`);
  };

  // ── MOBILE BACK BUTTON / HISTORY NAVIGATION MANAGER ─────────────────────────
  const stateRef = useRef({
    lightboxSrc,
    ctxMenu,
    reactPicker,
    emojiPickerOpen,
    attachMenuOpen,
    fwdModalOpen,
    searchInChatOpen,
    profilePanelOpen,
    automationModalOpen,
    settingsModalOpen,
    voiceCallModalOpen,
    contactsModalOpen,
    addAccountModalOpen,
    drawerOpen,
    currentChatId,
  });

  useEffect(() => {
    stateRef.current = {
      lightboxSrc,
      ctxMenu,
      reactPicker,
      emojiPickerOpen,
      attachMenuOpen,
      fwdModalOpen,
      searchInChatOpen,
      profilePanelOpen,
      automationModalOpen,
      settingsModalOpen,
      voiceCallModalOpen,
      contactsModalOpen,
      addAccountModalOpen,
      drawerOpen,
      currentChatId,
    };
  }, [
    lightboxSrc,
    ctxMenu,
    reactPicker,
    emojiPickerOpen,
    attachMenuOpen,
    fwdModalOpen,
    searchInChatOpen,
    profilePanelOpen,
    automationModalOpen,
    settingsModalOpen,
    voiceCallModalOpen,
    contactsModalOpen,
    addAccountModalOpen,
    drawerOpen,
    currentChatId,
  ]);

  // Track each overlay/view change to push a history state
  const prevViewSignatureRef = useRef<string>('');
  useEffect(() => {
    const activeSignature = [
      currentChatId ? `chat:${currentChatId}` : '',
      drawerOpen ? 'drawer' : '',
      automationModalOpen ? 'automation' : '',
      settingsModalOpen ? 'settings' : '',
      voiceCallModalOpen ? 'call' : '',
      contactsModalOpen ? 'contacts' : '',
      addAccountModalOpen ? 'add_account' : '',
      profilePanelOpen ? 'profile' : '',
      fwdModalOpen ? 'fwd' : '',
      searchInChatOpen ? 'search' : '',
      lightboxSrc ? 'lightbox' : '',
      emojiPickerOpen ? 'emoji' : '',
      attachMenuOpen ? 'attach' : '',
    ].filter(Boolean).join('|');

    if (activeSignature && activeSignature !== prevViewSignatureRef.current) {
      window.history.pushState({ tgApp: 'view', sig: activeSignature }, '');
    }
    prevViewSignatureRef.current = activeSignature;
  }, [
    currentChatId,
    drawerOpen,
    automationModalOpen,
    settingsModalOpen,
    voiceCallModalOpen,
    contactsModalOpen,
    addAccountModalOpen,
    profilePanelOpen,
    fwdModalOpen,
    searchInChatOpen,
    lightboxSrc,
    emojiPickerOpen,
    attachMenuOpen,
  ]);

  useEffect(() => {
    // Initial root history state
    try {
      window.history.replaceState({ tgApp: 'root' }, '');
    } catch (_) {}

    const handlePopState = () => {
      const s = stateRef.current;

      // Unwind in order of topmost floating layer down to active chat
      if (s.lightboxSrc) {
        setLightboxSrc(null);
      } else if (s.ctxMenu) {
        setCtxMenu(null);
      } else if (s.reactPicker) {
        setReactPicker(null);
      } else if (s.emojiPickerOpen) {
        setEmojiPickerOpen(false);
      } else if (s.attachMenuOpen) {
        setAttachMenuOpen(false);
      } else if (s.fwdModalOpen) {
        setFwdModalOpen(false);
      } else if (s.searchInChatOpen) {
        setSearchInChatOpen(false);
      } else if (s.addAccountModalOpen) {
        setAddAccountModalOpen(false);
      } else if (s.automationModalOpen) {
        setAutomationModalOpen(false);
      } else if (s.settingsModalOpen) {
        setSettingsModalOpen(false);
      } else if (s.voiceCallModalOpen) {
        setVoiceCallModalOpen(false);
      } else if (s.contactsModalOpen) {
        setContactsModalOpen(false);
      } else if (s.profilePanelOpen) {
        setProfilePanelOpen(false);
      } else if (s.drawerOpen) {
        setDrawerOpen(false);
      } else if (s.currentChatId) {
        setCurrentChatId(null);
        setSearchInChatOpen(false);
        setReplyMsg(null);
        setPendingAttachments([]);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const voiceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const resendTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ── TOAST NOTIFICATION ────────────────────────────────────────────────────
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // ── RTL & LANGUAGE ENGINE ─────────────────────────────────────────────────
  const setAppLanguage = (newLang: 'ar' | 'en') => {
    setLang(newLang);
    const html = document.documentElement;
    if (newLang === 'ar') {
      html.setAttribute('lang', 'ar');
      html.setAttribute('dir', 'rtl');
    } else {
      html.setAttribute('lang', 'en');
      html.setAttribute('dir', 'ltr');
    }
    localStorage.setItem('tg_lang', newLang);
  };

  useEffect(() => {
    const savedLang = (localStorage.getItem('tg_lang') as 'ar' | 'en') || 'ar';
    setAppLanguage(savedLang);
  }, []);

  // ── THEME INITIALIZATION ──────────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem('tg_theme') as 'light' | 'dark' | null;
    const initialTheme = saved || 'light';
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme === 'dark' ? 'dark' : '');
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next === 'dark' ? 'dark' : '');
    localStorage.setItem('tg_theme', next);
  };

  // ── NETWORK STATUS & OFFLINE EVENT LISTENERS ──────────────────────────────
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast(lang === 'ar' ? '🟢 تم استعادة الاتصال - جاري المزامنة السحابية مع تليجرام' : '🟢 Back online - Syncing with Telegram Cloud');
      if (isLoggedIn) {
        syncEngine.syncNow();
        if (currentChatId) {
          selectChat(currentChatId);
        }
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      showToast(lang === 'ar' ? '📡 انقطع الاتصال - يتم عرض الرسائل والمحادثات من الذاكرة المحلية (Offline)' : '📡 Offline mode - Displaying cached messages & chats');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [lang, isLoggedIn, currentChatId]);

  // ── DEDICATED TELEGRAM SYNC ENGINE (STARTUP, PERIODIC & FOREGROUND) ───────
  useEffect(() => {
    if (!isLoggedIn) {
      syncEngine.stop();
      return;
    }

    // Subscribe to chat updates from syncEngine
    const unsubscribeChats = syncEngine.onChats((updatedChats) => {
      if (Array.isArray(updatedChats) && updatedChats.length > 0) {
        const mapped: ChatItem[] = updatedChats.map((c: any) => {
          const chatType = c.is_channel ? 'channel' : c.is_group ? 'group' : c.type || 'private';
          const resolvedName = getChatDisplayName({ ...c, type: chatType }, lang);
          return {
            id: c.id,
            name: resolvedName,
            title: c.title || (chatType === 'group' || chatType === 'channel' ? resolvedName : c.title || c.name),
            lastMsg: c.last_message?.text || c.last_msg || '',
            lastMsgDate: c.last_message?.date || c.date || Math.floor(Date.now() / 1000),
            unread: c.unread_count || c.unread || 0,
            pinned: c.pinned || c.is_pinned || false,
            muted: c.is_muted || false,
            archived: c.is_archived || false,
            type: chatType,
            photo: c.photo || c.avatar || null,
            isOut: c.last_message?.out || c.last_message?.from_me || false,
            username: c.username,
            bio: c.description,
          };
        });

        setChats((prev) => {
          // Merge while preserving local active states if needed
          return mapped;
        });

        // Resolve avatars for chats missing photos
        mapped.forEach((c) => {
          if (!c.photo && c.id) {
            fetchPeerAvatar(c.id);
          }
        });
      }
    });

    // Start sync engine (triggers immediately on startup and polls every 15s)
    syncEngine.start({
      intervalMs: 15000,
    });

    return () => {
      unsubscribeChats();
      syncEngine.stop();
    };
  }, [isLoggedIn, lang]);

  // ── AUTOMATIC LOCALSTORAGE CACHE PERSISTENCE ──────────────────────────────
  useEffect(() => {
    if (chats && chats.length > 0) {
      saveCachedChats(chats);
    }
  }, [chats]);

  useEffect(() => {
    if (currentUser) {
      saveCachedUserProfile(currentUser);
    }
  }, [currentUser]);

  useEffect(() => {
    if (pinnedMessages && Object.keys(pinnedMessages).length > 0) {
      saveCachedPinnedMessages(pinnedMessages);
    }
  }, [pinnedMessages]);

  useEffect(() => {
    Object.keys(messages).forEach((cid) => {
      const msgList = messages[cid];
      if (msgList && msgList.length > 0) {
        saveCachedMessages(cid, msgList);
      }
    });
  }, [messages]);

  // ── INITIAL SESSION CHECK & AUTO-LOGIN ─────────────────────────────────────
  const fetchActualProfilePhoto = async () => {
    try {
      const res = await fetch('/api/user/info');
      const data = await res.json();
      if (data.success) {
        setCurrentUser((prev: any) => {
          const updated = {
            ...(prev || {}),
            id: data.id || data.user_id,
            first_name: data.first_name || prev?.first_name,
            last_name: data.last_name || prev?.last_name,
            name: data.name || prev?.name,
            username: data.username || prev?.username,
            phone: data.phone || prev?.phone,
            photo: data.photo || prev?.photo,
            bio: data.bio || prev?.bio,
          };
          saveCachedUserProfile(updated);
          return updated;
        });
      }
    } catch (err) {
      console.log('Fetching actual profile photo failed:', err);
    }
  };

  useEffect(() => {
    async function checkAuth() {
      // 1. Telegram Android Optimistic Immediate Hydration (0ms)
      const cachedUser = getCachedUserProfile();
      const cachedChats = getCachedChats();
      const savedSession = localStorage.getItem('tg_session');

      if (cachedUser) {
        setCurrentUser(cachedUser);
        setIsLoggedIn(true);
        setIsCheckingAuth(false);
      }

      if (cachedChats && cachedChats.length > 0) {
        setChats(cachedChats);
      }

      // If we have cached state, don't block the UI with full-screen loading
      if (savedSession || cachedUser) {
        setIsCheckingAuth(false);
      } else {
        setIsCheckingAuth(true);
      }

      // Start the official fast sync engine in background
      telegramSyncEngine.start({
        onChatsUpdated: (updatedChats) => {
          if (updatedChats && updatedChats.length > 0) {
            setChats((prev) => {
              // Merge preserving local state
              const map = new Map();
              prev.forEach((c) => map.set(String(c.id), c));
              updatedChats.forEach((c) => map.set(String(c.id), { ...map.get(String(c.id)), ...c }));
              return Array.from(map.values());
            });
          }
        },
      });

      // 2. Silent Background MTProto Session Validation
      if (savedSession) {
        try {
          const res = await fetch('/api/auth/restore-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session: savedSession }),
          });
          const data = await res.json();
          if (data.success) {
            setIsLoggedIn(true);
            setCurrentUser(data.user);
            saveCachedUserProfile(data.user);
            if (data.dialogs && data.dialogs.length > 0) {
              setChats(data.dialogs);
              saveCachedChats(data.dialogs);
            } else {
              loadChats();
            }
            fetchActualProfilePhoto();
            setIsCheckingAuth(false);
            return;
          } else {
            console.warn('Saved Telegram session is no longer valid:', data.error);
            if (!cachedUser) {
              localStorage.removeItem('tg_session');
            }
          }
        } catch (e) {
          console.log('Saved session restore network fallback to cached:', e);
        }
      }

      // Check server status in background
      try {
        const r = await fetch('/api/auth/status');
        const d = await r.json();
        if (d.success && d.authenticated) {
          setIsLoggedIn(true);
          if (d.user) {
            setCurrentUser(d.user);
            saveCachedUserProfile(d.user);
          }
          loadChats();
          fetchActualProfilePhoto();
        } else {
          setIsLoggedIn(true);
          if (!currentUser) {
            setCurrentUser(initialUserProfile as any);
          }
        }
      } catch (e) {
        setIsLoggedIn(true);
        if (!currentUser) {
          setCurrentUser(initialUserProfile as any);
        }
      } finally {
        setIsCheckingAuth(false);
      }
    }

    checkAuth();
  }, []);

  // ── RESEND CODE TIMER ─────────────────────────────────────────────────────
  useEffect(() => {
    if (authStep === 'code' && resendTimer > 0) {
      resendTimerRef.current = setTimeout(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (resendTimerRef.current) clearTimeout(resendTimerRef.current);
    };
  }, [authStep, resendTimer]);

  // ── AUTH ACTIONS ──────────────────────────────────────────────────────────
  const handleSendCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError(null);

    const fullPhone = `${selectedCountryCode}${phoneDigits.replace(/[\s-]/g, '')}`;
    if (!phoneDigits || phoneDigits.trim().length < 4) {
      setAuthError(lang === 'ar' ? 'يرجى إدخال رقم هاتف صحيح' : 'Please enter a valid phone number');
      return;
    }

    setAuthLoading(true);
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone }),
      });
      const data = await res.json();
      if (data.success) {
        setPhoneCodeHash(data.phoneCodeHash || '');
        setAuthStep('code');
        setResendTimer(60);
        showToast(lang === 'ar' ? 'تم إرسال كود التحقق من خوادم تليجرام' : 'Verification code sent via Telegram');
      } else {
        setAuthError(data.error || (lang === 'ar' ? 'تعذر إرسال كود التحقق' : 'Failed to send code'));
      }
    } catch (err: any) {
      setAuthError(lang === 'ar' ? 'حدث خطأ في الاتصال بالخادم' : 'Connection error');
    }
    setAuthLoading(false);
  };

  const handleVerifyCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError(null);

    if (!smsCode || smsCode.trim().length < 4) {
      setAuthError(lang === 'ar' ? 'يرجى إدخال رمز التحقق المكون من 5 أرقام' : 'Please enter the 5-digit verification code');
      return;
    }

    const fullPhone = `${selectedCountryCode}${phoneDigits.replace(/[\s-]/g, '')}`;
    setAuthLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: fullPhone,
          code: smsCode.trim(),
          phoneCodeHash: phoneCodeHash,
        }),
      });
      const data = await res.json();

      if (data.status === 'wait_password' || data.error === 'SESSION_PASSWORD_NEEDED') {
        setAuthStep('password');
        setAuthLoading(false);
        return;
      }

      if (data.success) {
        if (data.session) {
          localStorage.setItem('tg_session', data.session);
        }
        setIsLoggedIn(true);
        setCurrentUser(data.user);
        if (data.dialogs && data.dialogs.length > 0) {
          setChats(data.dialogs);
        } else {
          loadChats();
        }
        fetchActualProfilePhoto();
        showToast(lang === 'ar' ? 'تم تسجيل الدخول ومزامنة سحابة تليجرام بنجاح!' : 'Logged in and synced with Telegram Cloud!');
      } else {
        setAuthError(data.error || (lang === 'ar' ? 'رمز التحقق غير صحيح' : 'Invalid verification code'));
      }
    } catch (err) {
      setAuthError(lang === 'ar' ? 'فشل التحقق من الكود' : 'Verification failed');
    }
    setAuthLoading(false);
  };

  const handleVerify2FA = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError(null);

    if (!password2FA) {
      setAuthError(lang === 'ar' ? 'يرجى إدخال كلمة المرور السحابية' : 'Please enter your 2FA password');
      return;
    }

    const fullPhone = `${selectedCountryCode}${phoneDigits.replace(/[\s-]/g, '')}`;
    setAuthLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: fullPhone,
          password: password2FA,
        }),
      });
      const data = await res.json();

      if (data.success) {
        if (data.session) {
          localStorage.setItem('tg_session', data.session);
        }
        setIsLoggedIn(true);
        setCurrentUser(data.user);
        if (data.dialogs && data.dialogs.length > 0) {
          setChats(data.dialogs);
        } else {
          loadChats();
        }
        fetchActualProfilePhoto();
        showToast(lang === 'ar' ? 'تم تسجيل الدخول بنجاح!' : 'Logged in successfully!');
      } else {
        setAuthError(data.error || (lang === 'ar' ? 'كلمة المرور غير صحيحة' : 'Invalid 2FA password'));
      }
    } catch (err) {
      setAuthError(lang === 'ar' ? 'فشل التحقق من كلمة المرور' : 'Password verification failed');
    }
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    if (!confirm(lang === 'ar' ? 'هل أنت متأكد من تسجيل الخروج من حساب تليجرام الحقيقي؟' : 'Are you sure you want to sign out?')) {
      return;
    }

    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}

    localStorage.removeItem('tg_session');
    clearStorageCache();
    setIsLoggedIn(false);
    setAuthStep('phone');
    setPhoneDigits('');
    setSmsCode('');
    setPassword2FA('');
    setCurrentUser(null);
    setChats([]);
    setMessages({});
    setCurrentChatId(null);
    setDrawerOpen(false);
    showToast(lang === 'ar' ? 'تم تسجيل الخروج بنجاح' : 'Signed out successfully');
  };

  // ── SSE REAL-TIME SYNCHRONIZATION ──────────────────────────────────────────
  useEffect(() => {
    if (!isLoggedIn) return;

    loadDrafts();

    const es = new EventSource('/api/events');
    es.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const { type, data } = payload;

        if (type === 'new_message' || type === 'new_incoming_message') {
          const msg = data.message || data;
          const rawCid = String(msg.chat_id || data.chat_id);
          const cid = rawCid.replace('-100', '').replace('-', '');
          const isOut = !!msg.is_outgoing || !!msg.out || !!msg.from_me;

          setMessages((prev) => {
            const list = prev[cid] || [];
            if (list.some((m) => String(m.id) === String(msg.id))) return prev;
            const updatedList: MessageItem[] = [
              ...list,
              {
                id: msg.id || `m_${Date.now()}`,
                chat_id: cid,
                sender_id: msg.sender_id,
                sender_name: msg.sender_name,
                out: isOut,
                from_me: isOut,
                text: msg.content?.text || msg.text,
                media: msg.content?.filePath || msg.media,
                type: msg.content?.type || msg.type || (msg.is_system ? 'system' : msg.media ? 'photo' : 'text'),
                is_system: !!msg.is_system,
                system_type: msg.system_type,
                duration: msg.content?.duration || msg.duration,
                date: typeof msg.date === 'string' ? Math.floor(new Date(msg.date).getTime() / 1000) : (msg.date || Math.floor(Date.now() / 1000)),
                status: msg.status || (isOut ? 'sent' : undefined),
                reactions: msg.reactions || [],
              },
            ];
            saveCachedMessages(cid, updatedList);
            return {
              ...prev,
              [cid]: updatedList,
            };
          });

          // update last message in chat list and re-order chats (DrKLO/Telegram MessagesController logic)
          setChats((prev) => {
            let targetChat: ChatItem | undefined;
            const updatedChats = prev.map((c) => {
              if (String(c.id) === cid || String(c.id) === rawCid) {
                const isCurrent = String(currentChatId) === cid;
                targetChat = {
                  ...c,
                  lastMsg: msg.content?.text || msg.text || (msg.content?.type === 'voice' ? '🎤 تسجيل صوتي' : msg.content?.type === 'photo' ? '📷 صورة' : '[وسائط]'),
                  lastMsgDate: Math.floor(Date.now() / 1000),
                  unread: isCurrent ? 0 : (c.unread || 0) + (isOut ? 0 : 1),
                };
                return targetChat;
              }
              return c;
            });

            // Sort with last-active priority for groups
            const sorted = sortChatsWithLastActivePriority(updatedChats);

            saveCachedChats(sorted);

            // If incoming from another chat and not muted, trigger real Telegram in-app notification & chime
            if (!isOut && String(currentChatId) !== cid && (!targetChat?.muted)) {
              playTelegramIncomingSound();
              setInAppNotif({
                id: String(msg.id || Date.now()),
                chat_id: cid,
                title: targetChat?.title || targetChat?.name || msg.sender_name || 'تليجرام',
                sender_name: msg.sender_name,
                sender_avatar: msg.sender_avatar,
                chat_avatar: targetChat?.photo || targetChat?.avatar,
                text: msg.content?.text || msg.text || (msg.content?.type === 'voice' ? '🎤 تسجيل صوتي' : msg.content?.type === 'photo' ? '📷 صورة' : 'رسالة جديدة'),
                chat_type: targetChat?.type,
                is_group: targetChat?.type === 'group' || targetChat?.type === 'supergroup',
                is_channel: targetChat?.type === 'channel',
                date: Math.floor(Date.now() / 1000),
              });
            }

            return sorted;
          });

          if (String(currentChatId) === cid) {
            setTimeout(scrollBottom, 50);
          } else if (!isOut) {
            // Trigger desktop/mobile Push Notification for incoming message
            showPushNotification(msg.sender_name || 'تليجرام', {
              body: msg.content?.text || msg.text || 'رسالة جديدة واردة',
              chat_id: cid,
              icon: msg.sender_avatar || 'https://telegram.org/img/t_logo.png',
              tag: `msg_${cid}_${Date.now()}`,
              onClick: () => selectChat(cid),
            });
          }
        } else if (type === 'system_message') {
          const sysData = data;
          const rawCid = String(sysData.chat_id);
          const cid = rawCid.replace('-100', '').replace('-', '');

          const sysMsgItem: MessageItem = {
            id: `sys_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            chat_id: cid,
            sender_id: 'system',
            sender_name: 'النظام',
            out: false,
            from_me: !!sysData.is_me,
            text: sysData.message,
            type: 'system',
            is_system: true,
            system_type: sysData.type,
            date: sysData.date || Math.floor(Date.now() / 1000),
          };

          setMessages((prev) => {
            const updated = [...(prev[cid] || []), sysMsgItem];
            saveCachedMessages(cid, updated);
            return {
              ...prev,
              [cid]: updated,
            };
          });

          setChats((prev) => {
            const updated = prev.map((c) => {
              if (String(c.id) === cid || String(c.id) === rawCid) {
                const nowSec = sysData.date || Math.floor(Date.now() / 1000);
                return {
                  ...c,
                  lastMsg: sysData.message,
                  lastMsgDate: nowSec,
                  last_system_activity: nowSec,
                  has_system_activity: true,
                };
              }
              return c;
            });
            const sorted = sortChatsWithLastActivePriority(updated);
            saveCachedChats(sorted);
            return sorted;
          });

          if (String(currentChatId) === cid) {
            setTimeout(scrollBottom, 50);
          }

          // Trigger System Push Notification
          handleIncomingSystemEvent(sysData, currentChatId, (targetId) => selectChat(targetId));
        } else if (type === 'notification') {
          if (data.chat_id && String(currentChatId) !== String(data.chat_id)) {
            playTelegramIncomingSound();
            setInAppNotif({
              id: `notif_${Date.now()}`,
              chat_id: data.chat_id,
              title: data.title || data.chat_title || 'إشعار تليجرام',
              sender_name: data.sender_name,
              sender_avatar: data.sender_avatar,
              chat_avatar: data.chat_avatar,
              text: data.body || data.text || '',
              chat_type: data.chat_type,
              is_group: data.is_group,
              is_channel: data.is_channel,
              date: Math.floor(Date.now() / 1000),
            });
          }
          showPushNotification(data.title || '🔔 إشعار تليجرام', {
            body: data.body || '',
            chat_id: data.chat_id,
            icon: data.chat_avatar || data.sender_avatar || 'https://telegram.org/img/t_logo.png',
            tag: `notif_${Date.now()}`,
            onClick: () => {
              if (data.chat_id) selectChat(data.chat_id);
            },
          });
        } else if (type === 'message_status') {
          const { chat_id, message_id, status } = data;
          const rawCid = String(chat_id);
          const cid = rawCid.replace('-100', '').replace('-', '');
          setMessages((prev) => {
            const list = prev[cid] || prev[rawCid] || [];
            const updated = list.map((m) =>
              String(m.id) === String(message_id) || (m.out && m.status !== 'read' && !message_id)
                ? { ...m, status }
                : m
            );
            saveCachedMessages(cid, updated);
            return {
              ...prev,
              [cid]: updated,
              ...(cid !== rawCid ? { [rawCid]: updated } : {}),
            };
          });
        } else if (type === 'messages_read' || type === 'read_receipt') {
          const rawCid = String(data.chat_id || data);
          const cid = rawCid.replace('-100', '').replace('-', '');
          setMessages((prev) => {
            const list = prev[cid] || prev[rawCid] || [];
            const updated = list.map((m) => (m.out ? { ...m, status: 'read' as const } : m));
            saveCachedMessages(cid, updated);
            return {
              ...prev,
              [cid]: updated,
              ...(cid !== rawCid ? { [rawCid]: updated } : {}),
            };
          });
          setChats((prev) => {
            const updated = prev.map((c) =>
              String(c.id) === cid || String(c.id) === rawCid ? { ...c, unread: 0 } : c
            );
            saveCachedChats(updated);
            return updated;
          });
        } else if (type === 'typing') {
          if (String(data.chat_id) === String(currentChatId)) {
            setPartnerTyping(true);
            setTimeout(() => setPartnerTyping(false), 3000);
          }
        } else if (type === 'updateChat') {
          if (data && data.id) {
            setChats((prev) => {
              const existingIdx = prev.findIndex((c) => String(c.id) === String(data.id));
              if (existingIdx !== -1) {
                const updated = [...prev];
                updated[existingIdx] = {
                  ...updated[existingIdx],
                  lastMsg: data.last_message?.content?.text || data.last_message?.text || updated[existingIdx].lastMsg,
                  unread: data.unread_count !== undefined ? data.unread_count : updated[existingIdx].unread,
                };
                return updated;
              } else {
                return [
                  {
                    id: data.id,
                    name: data.title || 'محادثة',
                    title: data.title || 'محادثة',
                    lastMsg: data.last_message?.content?.text || '',
                    lastMsgDate: Math.floor(Date.now() / 1000),
                    unread: data.unread_count || 1,
                    pinned: !!data.is_pinned,
                    muted: false,
                    archived: false,
                    type: data.type || 'bot',
                    photo: data.avatar || null,
                    isOut: false,
                  },
                  ...prev,
                ];
              }
            });
          }
        } else if (type === 'watchword_alert' || (type === 'new_alert' && data.type === 'watchword')) {
          playTelegramIncomingSound();
          const targetCid = data.chatId || data.alert_data?.chat_id || 1001;
          const word = data.word || data.alert_data?.keyword || 'مراقبة';
          const chatTitle = data.chatTitle || data.alert_data?.group_title || 'مجموعة تليجرام';
          const fullText = data.text || data.alert_data?.full_text || '';
          const sender = data.senderName || data.alert_data?.sender_name || 'عضو';

          // Trigger Arabic Text-To-Speech (TTS) Voice Notification
          speakAlertTTS(`تنبيه رادار: تم رصد كلمة ${word} في مجموعة ${chatTitle}`);

          // Update active group system activity
          setChats((prev) => {
            const nowSec = Math.floor(Date.now() / 1000);
            const updated = prev.map((c) => {
              if (String(c.id) === String(targetCid) || (c.type === 'group' && c.title === chatTitle)) {
                return {
                  ...c,
                  last_system_activity: nowSec,
                  has_system_activity: true,
                };
              }
              return c;
            });
            const sorted = sortChatsWithLastActivePriority(updated);
            saveCachedChats(sorted);
            return sorted;
          });

          setInAppNotif({
            id: `ww_${Date.now()}`,
            chat_id: targetCid,
            title: `🚨 رادار المراقبة: "${word}"`,
            sender_name: 'الرسائل المحفوظة',
            text: `المصدر: ${chatTitle} | ${sender}: "${fullText.substring(0, 75)}"`,
            chat_type: 'saved',
            date: Math.floor(Date.now() / 1000),
          });

          showPushNotification(`🚨 رصد كلمة مراقبة: ${word}`, {
            body: `في ${chatTitle} | ${sender}: ${fullText.substring(0, 90)}`,
            chat_id: targetCid,
            icon: 'https://telegram.org/img/t_logo.png',
            tag: data.tag || `ww_${data.alert_data?.chat_id || 'g'}_${data.alert_data?.msg_id || Date.now()}`,
            vibrate: [200, 100, 200],
            actions: [
              { action: 'reply', title: 'رد سريع ✍️' },
              { action: 'open', title: 'فتح الرسالة 🚀' }
            ],
            data: data.alert_data,
            onClick: () => selectChat(targetCid),
          });
        } else if (type === 'bulk_send_report' || (type === 'new_alert' && data.type === 'bulk_send_report')) {
          playTelegramIncomingSound();
          showToast(data.title || '📊 تم إصدار تقرير الإرسال بنجاح في الرسائل المحفوظة');
          setInAppNotif({
            id: `rep_${Date.now()}`,
            chat_id: 1001,
            title: data.title || '📊 تقرير ما بعد الإرسال',
            sender_name: 'الرسائل المحفوظة',
            text: data.body || 'تم إيداع التقرير الإحصائي الشامل وقوائم المجموعات في الرسائل المحفوظة',
            chat_type: 'saved',
            date: Math.floor(Date.now() / 1000),
          });
          showPushNotification(data.title || '📊 تقرير ما بعد الإرسال', {
            body: data.body || 'انقر لمراجعة تقرير الإرسال والإحصائيات في الرسائل المحفوظة',
            chat_id: 1001,
            icon: 'https://telegram.org/img/t_logo.png',
            tag: data.tag || `rep_${Date.now()}`,
            vibrate: [200, 100, 200],
            actions: [
              { action: 'open', title: 'فتح المحفوظات 📥' }
            ],
            onClick: () => selectChat(1001),
          });
        } else if (type === 'batch_edited') {
          showToast(`📝 تم تعديل الدفعة بنجاح (${data.success || 1} رسالة)`);
        } else if (type === 'batch_deleted') {
          showToast(`🗑️ تم حذف الدفعة بنجاح (${data.success || 1} رسالة)`);
        } else if (type === 'updateChats') {
          if (Array.isArray(data)) {
            const mappedChats = data.map((c: any) => {
              const chatType = c.is_channel ? 'channel' : c.is_group ? 'group' : c.type || 'private';
              const resolvedName = getChatDisplayName({ ...c, type: chatType }, lang);
              return {
                id: c.id,
                name: resolvedName,
                title: c.title || (chatType === 'group' || chatType === 'channel' ? resolvedName : c.title || c.name),
                lastMsg: c.last_message?.text || c.last_msg || '',
                lastMsgDate: c.last_message?.date || c.date || Math.floor(Date.now() / 1000),
                unread: c.unread_count || c.unread || 0,
                pinned: c.pinned || c.is_pinned || false,
                muted: c.is_muted || false,
                archived: c.is_archived || false,
                type: chatType,
                photo: c.photo || c.avatar || null,
                isOut: c.last_message?.out || c.last_message?.from_me || false,
                username: c.username,
                bio: c.description,
              };
            });
            setChats(mappedChats);
            saveCachedChats(mappedChats);
          }
        }
      } catch (e) {}
    };

    return () => {
      es.close();
    };
  }, [isLoggedIn, currentChatId]);

  // ── LOAD REAL CHATS & DRAFTS (IndexedDB + Cloud Sync) ──────────────────────
  const loadDrafts = async () => {
    try {
      // 1. Load local drafts from IndexedDB (offline & persistent across sessions)
      const idbDrafts = await indexedDbService.getAllDrafts().catch(() => ({}));
      const mergedDrafts: Record<string, string> = {};
      Object.keys(idbDrafts).forEach((cid) => {
        if (idbDrafts[cid]?.text) {
          mergedDrafts[cid] = idbDrafts[cid].text;
        }
      });

      // 2. Fetch server cloud drafts and merge
      const r = await fetch('/api/drafts');
      const d = await r.json();
      if (d.success && d.drafts) {
        Object.keys(d.drafts).forEach((cid) => {
          if (d.drafts[cid]) {
            mergedDrafts[cid] = d.drafts[cid];
            // Sync cloud draft back to IndexedDB
            indexedDbService.saveDraft(cid, d.drafts[cid]).catch(() => {});
          }
        });
      }
      setDrafts(mergedDrafts);
    } catch (e) {
      console.warn('[Drafts] Error loading drafts:', e);
    }
  };

  // Helper to persist draft locally to IndexedDB & sync to cloud
  const handleDraftChange = (text: string) => {
    setInputText(text);
    if (!currentChatId) return;
    const cid = String(currentChatId);
    setDrafts((prev) => ({ ...prev, [cid]: text }));

    // Persist immediately to IndexedDB
    indexedDbService.saveDraft(cid, text).catch((err) => {
      console.warn('[IndexedDB] Failed to save draft:', err);
    });

    // Sync cloud draft with debounce
    syncEngine.saveCloudDraft(cid, text).catch(() => {});
  };

  const loadChats = async () => {
    setLoadingChats(true);
    try {
      const r = await fetch('/api/chats');
      const d = await r.json();
      if (d.success && d.chats) {
        const mapped: ChatItem[] = d.chats.map((c: any) => {
          const chatType = c.is_channel ? 'channel' : c.is_group ? 'group' : c.type || 'private';
          const resolvedName = getChatDisplayName({ ...c, type: chatType }, lang);
          return {
            id: c.id,
            name: resolvedName,
            title: c.title || (chatType === 'group' || chatType === 'channel' ? resolvedName : c.title || c.name),
            lastMsg: c.last_message?.text || c.last_msg || '',
            lastMsgDate: c.last_message?.date || c.date || Math.floor(Date.now() / 1000),
            unread: c.unread_count || c.unread || 0,
            pinned: c.pinned || c.is_pinned || false,
            muted: c.is_muted || false,
            archived: c.is_archived || false,
            type: chatType,
            photo: c.photo || c.avatar || null,
            isOut: c.last_message?.out || c.last_message?.from_me || false,
            username: c.username,
            bio: c.description,
          };
        });
        setChats(mapped);
        saveCachedChats(mapped); // Save to LocalStorage cache

        // Dynamically fetch and resolve avatars via GramJS getProfilePhotos
        mapped.forEach((c) => {
          if (!c.photo && c.id) {
            fetchPeerAvatar(c.id);
          }
        });
      }
    } catch (e) {
      console.warn('[Offline Cache] Failed to fetch fresh chats, using cached chats:', e);
      const cached = getCachedChats();
      if (cached && cached.length > 0) {
        setChats(cached);
      } else {
        showToast(lang === 'ar' ? 'تعذر جلب المحادثات (وضع عدم الاتصال)' : 'Failed to fetch chats (Offline)');
      }
    }
    setLoadingChats(false);
  };

  // ── SELECT CHAT ───────────────────────────────────────────────────────────
  const selectChat = async (id: string | number) => {
    if (currentChatId && currentChatId !== id && inputText.trim()) {
      setDrafts((prev) => ({ ...prev, [String(currentChatId)]: inputText }));
    }

    pushNavState('chat', id);
    setCurrentChatId(id);
    setChats((prev) => {
      const updated = prev.map((c) => (String(c.id) === String(id) ? { ...c, unread: 0 } : c));
      saveCachedChats(updated);
      return updated;
    });
    setSearchInChatOpen(false);
    setReplyMsg(null);
    setPendingAttachments([]);

    // ⚡ Instant Cache Loading: Render messages immediately from localStorage before network response
    const cachedMsgs = getCachedMessages(id);
    if (cachedMsgs && cachedMsgs.length > 0) {
      setMessages((prev) => ({
        ...prev,
        [id]: cachedMsgs,
      }));
    }

    // Mark chat messages as read on server & trigger real-time read receipt
    try {
      fetch(`/api/chats/${id}/read`, { method: 'POST' }).catch(() => {});
    } catch (e) {}

    // Check and dynamically resolve avatar for active chat
    const targetChat = chats.find((c) => String(c.id) === String(id));
    if (targetChat && !targetChat.photo) {
      fetchPeerAvatar(id);
    }

    const existingDraft = drafts[String(id)] || '';
    setInputText(existingDraft);

    // Fetch pinned message
    try {
      const pinRes = await fetch(`/api/chats/${id}/pin-message`);
      const pinData = await pinRes.json();
      if (pinData.success && pinData.pinned_message) {
        setPinnedMessages((prev) => {
          const updated = { ...prev, [String(id)]: pinData.pinned_message };
          saveCachedPinnedMessages(updated);
          return updated;
        });
      }
    } catch (e) {}

    // Fetch real chat messages from Telegram MTProto
    setLoadingMessages(true);
    try {
      const r = await fetch(`/api/chats/${id}/messages`);
      const d = await r.json();
      if (d.success && d.messages) {
        const fetchedMsgs: MessageItem[] = d.messages.map((m: any) => ({
          ...m,
          type: m.type || (m.media ? (m.media.includes('blob:') || m.media.includes('.mp3') ? 'voice' : 'photo') : 'text'),
        }));
        setMessages((prev) => ({
          ...prev,
          [id]: fetchedMsgs,
        }));
        saveCachedMessages(id, fetchedMsgs); // Persist updated message history to localStorage
      }
    } catch (e) {
      console.warn('[Offline Cache] Failed to sync messages from MTProto, displaying cached messages:', e);
      if (!cachedMsgs || cachedMsgs.length === 0) {
        showToast(lang === 'ar' ? 'عرض الرسائل من الذاكرة المحلية (Offline)' : 'Viewing cached messages (Offline)');
      }
    }
    setLoadingMessages(false);

    setTimeout(scrollBottom, 100);
  };

  const closeChat = () => {
    setCurrentChatId(null);
    setSearchInChatOpen(false);
    setReplyMsg(null);
    setPendingAttachments([]);
  };

  const scrollBottom = () => {
    if (msgsAreaRef.current) {
      msgsAreaRef.current.scrollTo({
        top: msgsAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  // ── SEND MESSAGE ──────────────────────────────────────────────────────────
  const sendMessage = async () => {
    const text = inputText.trim();
    if ((!text && pendingAttachments.length === 0) || !currentChatId) return;

    const cid = currentChatId;
    const now = Math.floor(Date.now() / 1000);

    // If attachments exist, send them
    if (pendingAttachments.length > 0) {
      for (const att of pendingAttachments) {
        const attMsg: MessageItem = {
          id: `att_msg_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
          chat_id: cid,
          media: att.previewUrl,
          type: att.type === 'image' ? 'photo' : 'document',
          text: att.type === 'document' ? `📄 ${att.name}` : undefined,
          date: now,
          status: 'sent',
          out: true,
          from_me: true,
          sender_id: currentUser?.id || 'me',
          sender_name: currentUser?.name || (lang === 'ar' ? 'أنت' : 'You'),
        };

        setMessages((prev) => ({
          ...prev,
          [cid]: [...(prev[cid] || []), attMsg],
        }));
      }
      setPendingAttachments([]);
    }

    if (text) {
      setInputText('');
      if (cid) {
        setDrafts((prev) => {
          const next = { ...prev };
          delete next[String(cid)];
          return next;
        });
        indexedDbService.deleteDraft(cid).catch(() => {});
        syncEngine.saveCloudDraft(cid, '').catch(() => {});
      }
      const tmpId = `tmp_${Date.now()}`;
      const optimisticMsg: MessageItem = {
        id: tmpId,
        chat_id: cid,
        text: text,
        type: 'text',
        date: now,
        status: 'sent',
        out: true,
        from_me: true,
        sender_id: currentUser?.id || 'me',
        sender_name: currentUser?.name || (lang === 'ar' ? 'أنت' : 'You'),
        reply_to: replyMsg ? { id: replyMsg.id, sender_name: replyMsg.sender, text: replyMsg.text } : undefined,
      };

      setMessages((prev) => ({
        ...prev,
        [cid]: [...(prev[cid] || []), optimisticMsg],
      }));

      setChats((prev) =>
        prev.map((c) =>
          String(c.id) === String(cid)
            ? { ...c, lastMsg: text, lastMsgDate: now, isOut: true }
            : c
        )
      );

      setReplyMsg(null);
      setTimeout(scrollBottom, 50);

      // Send to Telegram Cloud MTProto API
      try {
        const res = await fetch('/api/messages/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: cid,
            text: text,
          }),
        });
        const data = await res.json();
        if (!data.success) {
          showToast(data.error || (lang === 'ar' ? 'فشل إرسال الرسالة إلى تليجرام' : 'Failed to send to Telegram'));
        }
      } catch (e) {
        showToast(lang === 'ar' ? 'تعذر إرسال الرسالة' : 'Message send error');
      }
    }
  };

  // ── VOICE RECORDING ENGINE ────────────────────────────────────────────────
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);

        if (voiceDuration >= 1 && currentChatId) {
          const now = Math.floor(Date.now() / 1000);
          const voiceMsg: MessageItem = {
            id: `voice_${Date.now()}`,
            chat_id: currentChatId,
            media: audioUrl,
            type: 'voice',
            duration: voiceDuration,
            date: now,
            status: 'sent',
            out: true,
            from_me: true,
            sender_id: currentUser?.id || 'me',
            sender_name: currentUser?.name || (lang === 'ar' ? 'أنت' : 'You'),
          };

          setMessages((prev) => ({
            ...prev,
            [currentChatId]: [...(prev[currentChatId] || []), voiceMsg],
          }));

          setChats((prev) =>
            prev.map((c) =>
              String(c.id) === String(currentChatId)
                ? { ...c, lastMsg: lang === 'ar' ? '🎤 تسجيل صوتي' : '🎤 Voice message', lastMsgDate: now, isOut: true }
                : c
            )
          );
          setTimeout(scrollBottom, 50);
        }

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecordingVoice(true);
      setVoiceDuration(0);

      voiceTimerRef.current = setInterval(() => {
        setVoiceDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      showToast(lang === 'ar' ? 'تعذر الوصول إلى الميكروفون' : 'Microphone access denied');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecordingVoice) {
      mediaRecorderRef.current.stop();
      setIsRecordingVoice(false);
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    }
  };

  const cancelVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecordingVoice) {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
      setIsRecordingVoice(false);
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
      showToast(lang === 'ar' ? 'تم إلغاء التسجيل الصوتي' : 'Voice recording cancelled');
    }
  };

  const togglePlayAudio = (msgId: string | number, url?: string | null) => {
    if (!url) return;

    if (playingAudioId === msgId) {
      currentAudioRef.current?.pause();
      setPlayingAudioId(null);
      return;
    }

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
    }

    const audio = new Audio(url);
    currentAudioRef.current = audio;
    setPlayingAudioId(msgId);

    audio.play().catch(() => setPlayingAudioId(null));
    audio.onended = () => setPlayingAudioId(null);
    audio.onerror = () => setPlayingAudioId(null);
  };

  // ── ATTACHMENT HANDLERS ───────────────────────────────────────────────────
  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'document') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAtts: AttachmentItem[] = Array.from(files).map((f) => ({
      id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      file: f,
      previewUrl: URL.createObjectURL(f),
      type: type,
      name: f.name,
    }));

    setPendingAttachments((prev) => [...prev, ...newAtts]);
    setAttachMenuOpen(false);
    e.target.value = '';
  };

  const removeAttachment = (id: string) => {
    setPendingAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // ── PIN MESSAGE HANDLERS ──────────────────────────────────────────────────
  const pinMessage = async (msg: MessageItem) => {
    if (!currentChatId) return;
    const cid = String(currentChatId);
    const pinPayload: PinnedMsgData = {
      id: msg.id,
      text: msg.text || (msg.type === 'voice' ? '🎤 تسجيل صوتي' : '[وسائط]'),
      sender_name: msg.sender_name,
    };

    setPinnedMessages((prev) => ({ ...prev, [cid]: pinPayload }));
    showToast(lang === 'ar' ? 'تم تثبيت الرسالة بنجاح' : 'Message pinned');

    try {
      await fetch(`/api/chats/${cid}/pin-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pinPayload),
      });
    } catch (e) {}
  };

  const unpinMessage = async () => {
    if (!currentChatId) return;
    const cid = String(currentChatId);
    setPinnedMessages((prev) => ({ ...prev, [cid]: null }));
    showToast(lang === 'ar' ? 'تم إلغاء تثبيت الرسالة' : 'Message unpinned');

    try {
      await fetch(`/api/chats/${cid}/pin-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: null, text: '' }),
      });
    } catch (e) {}
  };

  const scrollToMessage = (msgId: string | number) => {
    const el = document.getElementById(`msg-${msgId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.style.transition = 'background-color 0.4s ease';
      el.style.backgroundColor = 'rgba(42,171,238,.35)';
      setTimeout(() => {
        el.style.backgroundColor = '';
      }, 1400);
    }
  };

  // ── CONTEXT MENU & REACTIONS ──────────────────────────────────────────────
  const showMsgCtx = (e: React.MouseEvent, m: MessageItem) => {
    e.preventDefault();
    e.stopPropagation();

    const items = [
      {
        icon: 'fa-reply',
        label: lang === 'ar' ? 'رد' : 'Reply',
        fn: () => setReplyMsg({ id: m.id, text: m.text || '', sender: m.sender_name || 'User' }),
      },
      {
        icon: 'fa-copy',
        label: lang === 'ar' ? 'نسخ النص' : 'Copy Text',
        fn: () => {
          if (m.text) {
            navigator.clipboard.writeText(m.text);
            showToast(lang === 'ar' ? 'تم نسخ النص' : 'Text copied');
          }
        },
      },
      {
        icon: 'fa-thumbtack',
        label: lang === 'ar' ? 'تثبيت الرسالة' : 'Pin Message',
        fn: () => pinMessage(m),
      },
      {
        icon: 'fa-share',
        label: lang === 'ar' ? 'توجيه' : 'Forward',
        fn: () => {
          openForwardModal(m.id);
        },
      },
      { sep: true },
      {
        icon: 'fa-trash',
        label: lang === 'ar' ? 'حذف' : 'Delete',
        danger: true,
        fn: () => {
          if (currentChatId) {
            setMessages((prev) => ({
              ...prev,
              [currentChatId]: (prev[currentChatId] || []).filter((item) => item.id !== m.id),
            }));
            showToast(lang === 'ar' ? 'تم حذف الرسالة' : 'Message deleted');
          }
        },
      },
    ];

    setCtxMenu({ x: e.clientX, y: e.clientY, items });
  };

  const showChatCtx = (e: React.MouseEvent, c: ChatItem) => {
    e.preventDefault();
    e.stopPropagation();

    const items = [
      {
        icon: 'fa-thumbtack',
        label: c.pinned ? (lang === 'ar' ? 'إلغاء التثبيت' : 'Unpin') : (lang === 'ar' ? 'تثبيت' : 'Pin'),
        fn: () => {
          setChats((prev) =>
            prev.map((item) => (item.id === c.id ? { ...item, pinned: !item.pinned } : item))
          );
          showToast(c.pinned ? (lang === 'ar' ? 'تم إلغاء التثبيت' : 'Unpinned') : (lang === 'ar' ? 'تم التثبيت' : 'Pinned'));
        },
      },
      {
        icon: 'fa-bell-slash',
        label: c.muted ? (lang === 'ar' ? 'إلغاء الكتم' : 'Unmute') : (lang === 'ar' ? 'كتم الإشعارات' : 'Mute'),
        fn: () => {
          setChats((prev) =>
            prev.map((item) => (item.id === c.id ? { ...item, muted: !item.muted } : item))
          );
          showToast(c.muted ? (lang === 'ar' ? 'تم تفعيل الصوت' : 'Unmuted') : (lang === 'ar' ? 'تم كتم الصوت' : 'Muted'));
        },
      },
      {
        icon: 'fa-archive',
        label: c.archived ? (lang === 'ar' ? 'إلغاء الأرشفة' : 'Unarchive') : (lang === 'ar' ? 'أرشفة' : 'Archive'),
        fn: () => {
          setChats((prev) =>
            prev.map((item) => (item.id === c.id ? { ...item, archived: !item.archived } : item))
          );
          showToast(c.archived ? (lang === 'ar' ? 'تمت استعادة المحادثة' : 'Unarchived') : (lang === 'ar' ? 'تمت الأرشفة' : 'Archived'));
        },
      },
    ];

    setCtxMenu({ x: e.clientX, y: e.clientY, items });
  };

  const sendReaction = (emoji: string, msgId: string | number) => {
    if (!currentChatId) return;
    setMessages((prev) => {
      const list = prev[currentChatId] || [];
      return {
        ...prev,
        [currentChatId]: list.map((m) => {
          if (m.id !== msgId) return m;
          const reactions = m.reactions ? [...m.reactions] : [];
          const existing = reactions.find((r) => r.emoji === emoji);
          if (existing) {
            existing.count += existing.mine ? -1 : 1;
            existing.mine = !existing.mine;
          } else {
            reactions.push({ emoji, count: 1, mine: true });
          }
          return { ...m, reactions: reactions.filter((r) => r.count > 0) };
        }),
      };
    });
    setReactPicker(null);
  };

  const executeForward = (targetChatId: string | number) => {
    if (!fwdMsgId || !currentChatId) return;

    const sourceMsg = (messages[currentChatId] || []).find((m) => m.id === fwdMsgId);
    if (sourceMsg) {
      const now = Math.floor(Date.now() / 1000);
      const fwdMsg: MessageItem = {
        id: `fwd_${Date.now()}`,
        chat_id: targetChatId,
        text: sourceMsg.text,
        media: sourceMsg.media,
        type: sourceMsg.type,
        fwd_from: sourceMsg.sender_name || 'Telegram User',
        date: now,
        out: true,
        from_me: true,
        sender_id: currentUser?.id || 'me',
        sender_name: currentUser?.name || 'You',
      };

      setMessages((prev) => ({
        ...prev,
        [targetChatId]: [...(prev[targetChatId] || []), fwdMsg],
      }));

      setChats((prev) =>
        prev.map((c) =>
          c.id === targetChatId
            ? { ...c, lastMsg: sourceMsg.text || '[وسائط]', lastMsgDate: now, isOut: true }
            : c
        )
      );

      showToast(lang === 'ar' ? 'تم توجيه الرسالة بنجاح' : 'Message forwarded');
    }

    setFwdModalOpen(false);
    setFwdMsgId(null);
  };

  const openProfile = (chat: ChatItem) => {
    const resolvedName = getChatDisplayName(chat, lang);
    setProfileData({
      id: chat.id,
      name: resolvedName || chat.name,
      username: chat.username,
      bio: chat.bio || (lang === 'ar' ? 'حساب تليجرام رسمي وموثق' : 'Telegram account'),
      phone: chat.phone,
      photo: chat.photo,
      is_online: true,
    });
    pushNavState('profile', chat.id);
    setProfilePanelOpen(true);
  };

  // Close menus on outside click
  useEffect(() => {
    const handleGlobalClick = () => {
      setCtxMenu(null);
      setReactPicker(null);
      setAttachMenuOpen(false);
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const currentChat = chats.find((c) => String(c.id) === String(currentChatId));
  const currentChatMsgs = currentChatId ? messages[currentChatId] || [] : [];
  const pinnedData = currentChatId ? pinnedMessages[String(currentChatId)] : null;

  // ── GROUPED MESSAGES ENGINE (BUBBLE GROUPING) ─────────────────────────────
  // Merges consecutive messages from the same sender into a single cohesive, space-saving Bubble Group
  const groupedMessages = useMemo(() => {
    if (!currentChatMsgs || currentChatMsgs.length === 0) return [];
    interface MsgGroupItem {
      id: string;
      isSystem: boolean;
      systemMsg?: MessageItem;
      isOut: boolean;
      sender_id?: string | number;
      sender_name?: string;
      sender_avatar?: string | null;
      sender_username?: string | null;
      messages: MessageItem[];
    }
    const groups: MsgGroupItem[] = [];

    currentChatMsgs.forEach((msg) => {
      const isSys = !!(msg.is_system || msg.type === 'system' || msg.sender_id === 'system');
      if (isSys) {
        groups.push({
          id: `sys-${msg.id}`,
          isSystem: true,
          systemMsg: msg,
          isOut: !!(msg.out || msg.from_me),
          messages: [msg],
        });
        return;
      }

      const isOut = !!(msg.out || msg.from_me);
      const senderId = msg.sender_id || (isOut ? (currentUser?.id || 'me') : (currentChat?.id || 'other'));
      const fallbackSenderName = isOut
        ? (currentUser?.name || (lang === 'ar' ? 'أنا' : 'You'))
        : (currentChat ? getChatDisplayName(currentChat, lang) : (lang === 'ar' ? 'مستخدم' : 'User'));
      const senderName = msg.sender_name || fallbackSenderName;
      const senderAvatar = (msg as any).sender_avatar || (msg as any).photo || null;
      const senderUsername = (msg as any).sender_username || null;

      const lastGroup = groups[groups.length - 1];
      const lastMsg = lastGroup && lastGroup.messages[lastGroup.messages.length - 1];
      const timeDiff = lastMsg && msg.date && lastMsg.date ? Math.abs(msg.date - lastMsg.date) : 0;

      // Group consecutive messages from same sender within 10 minutes
      const canGroup =
        lastGroup &&
        !lastGroup.isSystem &&
        lastGroup.isOut === isOut &&
        String(lastGroup.sender_id) === String(senderId) &&
        timeDiff <= 600;

      if (canGroup) {
        lastGroup.messages.push(msg);
        if (!lastGroup.sender_avatar && senderAvatar) {
          lastGroup.sender_avatar = senderAvatar;
        }
        if (!lastGroup.sender_username && senderUsername) {
          lastGroup.sender_username = senderUsername;
        }
      } else {
        groups.push({
          id: `group-${msg.id}`,
          isSystem: false,
          isOut,
          sender_id: senderId,
          sender_name: senderName,
          sender_avatar: senderAvatar,
          sender_username: senderUsername,
          messages: [msg],
        });
      }
    });

    return groups;
  }, [currentChatMsgs, currentUser, currentChat, lang]);

  const filteredChats = chats.filter((c) => {
    // Filter by tab
    if (chatFilterTab === 'unread' && (!c.unread || c.unread === 0)) return false;
    if (chatFilterTab === 'channels' && c.type !== 'channel') return false;
    if (chatFilterTab === 'groups' && c.type !== 'group') return false;
    if (chatFilterTab === 'bots' && c.type !== 'bot' && !(c.username && c.username.toLowerCase().endsWith('bot'))) return false;

    // Filter by search query
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const resolvedName = getChatDisplayName(c, lang).toLowerCase();
    const nameStr = (c.name || '').toLowerCase();
    const titleStr = (c.title || '').toLowerCase();
    const userStr = (c.username || '').toLowerCase();
    const msgStr = (c.lastMsg || '').toLowerCase();
    return resolvedName.includes(q) || nameStr.includes(q) || titleStr.includes(q) || userStr.includes(q) || msgStr.includes(q);
  });

  // Enhanced Telegram chat list ordering with 'last-active' priority for group chats:
  // 1. Pinned conversations pinned to top
  // 2. Active groups with recent system activity (admin actions, member events, radar alerts) appear at the top
  // 3. Most recent active conversations sorted descending by effective activity timestamp
  const sortedAndFilteredChats = useMemo(() => {
    return sortChatsWithLastActivePriority(filteredChats, messages);
  }, [filteredChats, messages]);

  // Calculate chat category counts for filter tabs
  const chatCounts = {
    all: chats.length,
    unread: chats.filter((c) => c.unread && c.unread > 0).length,
    channels: chats.filter((c) => c.type === 'channel').length,
    groups: chats.filter((c) => c.type === 'group').length,
    bots: chats.filter((c) => c.type === 'bot' || (c.username && c.username.toLowerCase().endsWith('bot'))).length,
  };

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER: LOADING SCREEN
  // ══════════════════════════════════════════════════════════════════════════
  if (isCheckingAuth) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main, #0e1621)', flexDirection: 'column', gap: 16 }}>
        <div style={{ width: 68, height: 68, borderRadius: '50%', background: '#2481cc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 32, boxShadow: '0 8px 24px rgba(36,129,204,.4)' }}>
          <i className="fab fa-telegram-plane" />
        </div>
        <div style={{ color: '#fff', fontSize: 16, fontWeight: 600 }}>
          {lang === 'ar' ? 'جاري الاتصال بخوادم تليجرام السحابية...' : 'Connecting to Telegram Cloud...'}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <div className="dot" style={{ background: '#2481cc', width: 8, height: 8, borderRadius: '50%' }} />
          <div className="dot" style={{ background: '#2481cc', width: 8, height: 8, borderRadius: '50%' }} />
          <div className="dot" style={{ background: '#2481cc', width: 8, height: 8, borderRadius: '50%' }} />
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER: AUTHENTIC TELEGRAM LOGIN SCREEN (WHEN NOT LOGGED IN)
  // ══════════════════════════════════════════════════════════════════════════
  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: '100vh', width: '100vw', background: 'var(--bg-main, #0e1621)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        {toastMessage && <div className="tg-toast show">{toastMessage}</div>}

        <div style={{ width: '100%', maxWidth: 420, background: 'var(--surface, #17212b)', borderRadius: 16, padding: '36px 32px', boxShadow: '0 12px 36px rgba(0,0,0,.35)', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid var(--border, #242f3d)' }}>
          {/* Logo */}
          <div style={{ width: 84, height: 84, borderRadius: '50%', background: '#2481cc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 42, marginBottom: 20, boxShadow: '0 8px 24px rgba(36,129,204,.35)' }}>
            <i className="fab fa-telegram-plane" />
          </div>

          {/* STEP 1: PHONE NUMBER INPUT */}
          {authStep === 'phone' && (
            <form onSubmit={handleSendCode} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text, #fff)', marginBottom: 8, textAlign: 'center' }}>
                {lang === 'ar' ? 'تسجيل الدخول إلى تليجرام' : 'Sign in to Telegram'}
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text2, #7f91a4)', textAlign: 'center', marginBottom: 24, lineHeight: 1.6 }}>
                {lang === 'ar'
                  ? 'يرجى تأكيد رمز الدولة وإدخال رقم هاتفك لتسجيل الدخول الفعلي وجلب محادثاتك الحقيقية من خوادم تليجرام (MTProto).'
                  : 'Please confirm your country code and enter your phone number to fetch your real Telegram chats via MTProto.'}
              </p>

              {authError && (
                <div style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'rgba(235,87,87,.15)', border: '1px solid rgba(235,87,87,.3)', color: '#ff6b6b', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>
                  {authError}
                </div>
              )}

              {/* Country Selector */}
              <div style={{ width: '100%', marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text2, #7f91a4)', marginBottom: 6 }}>
                  {lang === 'ar' ? 'الدولة / الدولة والرمز' : 'Country'}
                </label>
                <select
                  value={selectedCountryCode}
                  onChange={(e) => setSelectedCountryCode(e.target.value)}
                  style={{ width: '100%', height: 46, padding: '0 12px', background: 'var(--surface2, #242f3d)', border: '1px solid var(--border, #2b3a4a)', borderRadius: 10, color: 'var(--text, #fff)', fontSize: 14, outline: 'none' }}
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.country} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Phone Input */}
              <div style={{ width: '100%', marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text2, #7f91a4)', marginBottom: 6 }}>
                  {lang === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    readOnly
                    value={selectedCountryCode}
                    style={{ width: 75, height: 46, padding: '0 8px', textAlign: 'center', background: 'var(--surface2, #242f3d)', border: '1px solid var(--border, #2b3a4a)', borderRadius: 10, color: '#2481cc', fontWeight: 600, fontSize: 14, outline: 'none' }}
                  />
                  <input
                    type="tel"
                    placeholder="770 123 4567"
                    value={phoneDigits}
                    onChange={(e) => setPhoneDigits(e.target.value)}
                    dir="ltr"
                    autoFocus
                    style={{ flex: 1, height: 46, padding: '0 14px', background: 'var(--surface2, #242f3d)', border: '1px solid var(--border, #2b3a4a)', borderRadius: 10, color: 'var(--text, #fff)', fontSize: 15, outline: 'none' }}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={authLoading}
                style={{ width: '100%', height: 46, background: '#2481cc', border: 'none', borderRadius: 10, color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', transition: 'all .2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {authLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin" /> {lang === 'ar' ? 'جاري الإرسال...' : 'Sending Code...'}
                  </>
                ) : (
                  lang === 'ar' ? 'التالي' : 'Next'
                )}
              </button>

              {/* Language Switcher */}
              <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setAppLanguage('ar')}
                  style={{ background: 'none', border: 'none', color: lang === 'ar' ? '#2481cc' : 'var(--text2, #7f91a4)', fontSize: 13, cursor: 'pointer', fontWeight: lang === 'ar' ? 700 : 400 }}
                >
                  العربية
                </button>
                <span style={{ color: 'var(--text2, #7f91a4)' }}>|</span>
                <button
                  type="button"
                  onClick={() => setAppLanguage('en')}
                  style={{ background: 'none', border: 'none', color: lang === 'en' ? '#2481cc' : 'var(--text2, #7f91a4)', fontSize: 13, cursor: 'pointer', fontWeight: lang === 'en' ? 700 : 400 }}
                >
                  English
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: CODE VERIFICATION INPUT */}
          {authStep === 'code' && (
            <form onSubmit={handleVerifyCode} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text, #fff)', marginBottom: 8, textAlign: 'center' }}>
                {lang === 'ar' ? 'أدخل رمز التحقق' : 'Enter Verification Code'}
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text2, #7f91a4)', textAlign: 'center', marginBottom: 12, lineHeight: 1.6 }}>
                {lang === 'ar'
                  ? `أرسلنا رمز التحقق إلى حساب تليجرام الخاص بك على الرقم ${selectedCountryCode} ${phoneDigits}`
                  : `We sent a verification code to Telegram on ${selectedCountryCode} ${phoneDigits}`}
              </p>

              <button
                type="button"
                onClick={() => {
                  setAuthStep('phone');
                  setSmsCode('');
                  setAuthError(null);
                }}
                style={{ background: 'none', border: 'none', color: '#2481cc', fontSize: 13, cursor: 'pointer', marginBottom: 20 }}
              >
                {lang === 'ar' ? '✏️ تعديل رقم الهاتف' : '✏️ Edit phone number'}
              </button>

              {authError && (
                <div style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'rgba(235,87,87,.15)', border: '1px solid rgba(235,87,87,.3)', color: '#ff6b6b', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>
                  {authError}
                </div>
              )}

              {/* Code Input */}
              <div style={{ width: '100%', marginBottom: 20 }}>
                <input
                  type="text"
                  placeholder="1 2 3 4 5"
                  value={smsCode}
                  onChange={(e) => setSmsCode(e.target.value)}
                  maxLength={6}
                  autoFocus
                  dir="ltr"
                  style={{ width: '100%', height: 50, padding: '0 16px', textAlign: 'center', letterSpacing: 8, fontSize: 22, fontWeight: 700, background: 'var(--surface2, #242f3d)', border: '1px solid var(--border, #2b3a4a)', borderRadius: 10, color: 'var(--text, #fff)', outline: 'none' }}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={authLoading}
                style={{ width: '100%', height: 46, background: '#2481cc', border: 'none', borderRadius: 10, color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', transition: 'all .2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}
              >
                {authLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin" /> {lang === 'ar' ? 'جاري التحقق...' : 'Verifying...'}
                  </>
                ) : (
                  lang === 'ar' ? 'تأكيد الرمز' : 'Verify Code'
                )}
              </button>

              {/* Resend Code Button */}
              <div style={{ fontSize: 13, color: 'var(--text2, #7f91a4)' }}>
                {resendTimer > 0 ? (
                  <span>
                    {lang === 'ar' ? `إعادة إرسال الرمز خلال ${resendTimer} ثانية` : `Resend code in ${resendTimer}s`}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendCode}
                    style={{ background: 'none', border: 'none', color: '#2481cc', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}
                  >
                    {lang === 'ar' ? 'إعادة إرسال كود التحقق الآن' : 'Resend code now'}
                  </button>
                )}
              </div>
            </form>
          )}

          {/* STEP 3: 2FA PASSWORD INPUT */}
          {authStep === 'password' && (
            <form onSubmit={handleVerify2FA} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text, #fff)', marginBottom: 8, textAlign: 'center' }}>
                {lang === 'ar' ? 'التحقق بخطوتين (2FA)' : 'Two-Step Verification'}
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text2, #7f91a4)', textAlign: 'center', marginBottom: 20, lineHeight: 1.6 }}>
                {lang === 'ar'
                  ? 'حسابك محمي بكلمة مرور سحابية. يرجى إدخالها لإتمام تسجيل الدخول.'
                  : 'Your account is protected by a 2FA cloud password. Please enter it to finish logging in.'}
              </p>

              {authError && (
                <div style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'rgba(235,87,87,.15)', border: '1px solid rgba(235,87,87,.3)', color: '#ff6b6b', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>
                  {authError}
                </div>
              )}

              {/* Password Input */}
              <div style={{ width: '100%', marginBottom: 20, position: 'relative' }}>
                <input
                  type={show2FAPassword ? 'text' : 'password'}
                  placeholder={lang === 'ar' ? 'أدخل كلمة المرور السحابية' : 'Enter 2FA Password'}
                  value={password2FA}
                  onChange={(e) => setPassword2FA(e.target.value)}
                  autoFocus
                  style={{ width: '100%', height: 46, padding: '0 40px 0 14px', background: 'var(--surface2, #242f3d)', border: '1px solid var(--border, #2b3a4a)', borderRadius: 10, color: 'var(--text, #fff)', fontSize: 15, outline: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => setShow2FAPassword(!show2FAPassword)}
                  style={{ position: 'absolute', [lang === 'ar' ? 'left' : 'right']: 12, top: 14, background: 'none', border: 'none', color: 'var(--text2, #7f91a4)', cursor: 'pointer' }}
                >
                  <i className={`fas ${show2FAPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={authLoading}
                style={{ width: '100%', height: 46, background: '#2481cc', border: 'none', borderRadius: 10, color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', transition: 'all .2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {authLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin" /> {lang === 'ar' ? 'جاري التحقق...' : 'Verifying...'}
                  </>
                ) : (
                  lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER: MAIN TELEGRAM APP INTERFACE (WHEN AUTHENTICATED)
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="tg-app">
      {toastMessage && <div className="tg-toast show">{toastMessage}</div>}

      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={(e) => handleFileAttach(e, 'document')}
        multiple
      />
      <input
        type="file"
        ref={imgInputRef}
        accept="image/*,video/*"
        style={{ display: 'none' }}
        onChange={(e) => handleFileAttach(e, 'image')}
        multiple
      />

      {/* ══ DRAWER BACKDROP & DRAWER ══ */}
      <div
        className={`drawer-backdrop ${drawerOpen ? 'open' : ''}`}
        onClick={() => setDrawerOpen(false)}
      />
      <div className={`drawer ${drawerOpen ? 'open' : ''}`} id="drawer">
        {/* 1. رأس القائمة (Profile Header with Multi-Account Switcher) */}
        <div
          className="drawer-hdr"
          style={{ position: 'relative', cursor: 'pointer' }}
          onClick={openCurrentUserProfile}
          title={lang === 'ar' ? 'عرض وتعديل الملف الشخصي' : 'View & Edit Profile'}
        >
          <div
            className="drawer-avatar"
            style={{ background: avatarColor(currentUser?.id || 1) }}
          >
            {currentUser?.photo ? (
              <img src={currentUser.photo} alt="" />
            ) : (
              initials(currentUser?.name || currentUser?.first_name || 'TG')
            )}
          </div>
          <div className="drawer-name">
            {currentUser?.name || `${currentUser?.first_name || ''} ${currentUser?.last_name || ''}`.trim() || 'مستخدم تليجرام'}
          </div>
          <div className="drawer-phone">
            {currentUser?.phone || (currentUser?.username ? `@${currentUser.username}` : 'متصل بالسحابة')}
          </div>

          {/* Account Switcher Chevron Button */}
          <div
            className="drawer-accounts-toggle"
            title={lang === 'ar' ? 'التبديل بين الحسابات وإضافة حساب' : 'Switch & Add Accounts'}
            onClick={(e) => {
              e.stopPropagation();
              setAccountsDropdownOpen(!accountsDropdownOpen);
            }}
          >
            <i
              className={`fas ${accountsDropdownOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`}
              style={{ fontSize: 13 }}
            />
          </div>
        </div>

        {/* Multi-Accounts Dropdown List */}
        {accountsDropdownOpen && (
          <div className="drawer-accounts-list">
            {accountsList.map((acc) => {
              const isActive = acc.is_active || String(acc.id) === String(currentUser?.id);
              return (
                <div
                  key={acc.id}
                  className={`drawer-account-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleSwitchAccount(acc)}
                >
                  <div
                    className="drawer-account-avatar"
                    style={{ background: avatarColor(acc.id) }}
                  >
                    {initials(acc.first_name || acc.session_name || 'TG')}
                  </div>
                  <div className="drawer-account-info">
                    <div className="drawer-account-name">
                      {acc.first_name || acc.session_name}
                    </div>
                    <div className="drawer-account-phone">
                      {acc.phone || (acc.username ? `@${acc.username}` : 'متصل')}
                    </div>
                  </div>
                  {isActive && (
                    <div className="drawer-account-check">
                      <i className="fas fa-check-circle" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* + Add Account Button */}
            <div
              className="drawer-account-add"
              onClick={openAddAccountModal}
            >
              <div className="add-icon">
                <i className="fas fa-plus" />
              </div>
              <span>{lang === 'ar' ? 'إضافة حساب جديد' : 'Add Account'}</span>
            </div>
          </div>
        )}

        <div className="drawer-items">
          {/* 2. الرسائل المحفوظة (Saved Messages) */}
          <div className="drawer-item" onClick={openSavedMessages}>
            <i className="fas fa-bookmark" style={{ color: '#2481cc' }} />
            <span>{lang === 'ar' ? 'الرسائل المحفوظة' : 'Saved Messages'}</span>
          </div>

          {/* 3. جهات الاتصال (Contacts) */}
          <div
            className="drawer-item"
            onClick={openContactsModal}
          >
            <i className="fas fa-user-friends" style={{ color: '#00b0ff' }} />
            <span>{lang === 'ar' ? 'جهات الاتصال' : 'Contacts'}</span>
          </div>

          {/* 4. المكالمات (Calls) */}
          <div
            className="drawer-item"
            onClick={openVoiceCallModal}
          >
            <i className="fas fa-phone-alt" style={{ color: '#00e676' }} />
            <span>{lang === 'ar' ? 'المكالمات' : 'Calls'}</span>
          </div>

          {/* 5. الإعدادات (Settings) */}
          <div
            className="drawer-item"
            onClick={openSettingsModal}
          >
            <i className="fas fa-cog" style={{ color: '#ffb300' }} />
            <span>{lang === 'ar' ? 'الإعدادات' : 'Settings'}</span>
          </div>

          {/* 6. زر الوضع الليلي (Night Mode Switcher) */}
          <div className="drawer-item" onClick={toggleTheme}>
            <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`} style={{ color: '#7c4dff' }} />
            <span>
              {lang === 'ar'
                ? theme === 'dark'
                  ? 'الوضع النهاري (Light)'
                  : 'الوضع الليلي (Dark)'
                : theme === 'dark'
                ? 'Light Mode'
                : 'Night Mode'}
            </span>
          </div>

          <div className="drawer-sep" />

          {/* Collapsible Section: Automation Suite (Enjaz Tools) */}
          <div
            style={{
              margin: '6px 10px',
              borderRadius: 12,
              background: 'rgba(36, 129, 204, 0.08)',
              border: '1px solid rgba(36, 129, 204, 0.2)',
              overflow: 'hidden',
            }}
          >
            <div
              onClick={() => setAutomationDropdownOpen(!automationDropdownOpen)}
              style={{
                padding: '9px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                background: 'rgba(36, 129, 204, 0.12)',
                userSelect: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="fas fa-sparkles" style={{ color: '#ffb300', fontSize: 13 }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text, #fff)' }}>
                  {lang === 'ar' ? 'الوظائف والأتمتة' : 'Automation Suite'}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    background: '#2481cc',
                    color: '#fff',
                    padding: '1px 6px',
                    borderRadius: 10,
                    fontWeight: 700,
                  }}
                >
                  11
                </span>
              </div>
              <i
                className={`fas ${automationDropdownOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`}
                style={{ fontSize: 11, color: 'var(--text2, #7f91a4)' }}
              />
            </div>

            {automationDropdownOpen && (
              <div style={{ padding: '4px 6px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div
                  className="drawer-item-compact"
                  style={{ color: '#ffb300' }}
                  onClick={() => openAutomationSuite('send_monitor')}
                >
                  <i className="fas fa-paper-plane" />
                  <span>{lang === 'ar' ? 'المراقبة والإرسال' : 'Send & Monitor'}</span>
                </div>

                <div
                  className="drawer-item-compact"
                  style={{ color: '#29b6f6' }}
                  onClick={() => openAutomationSuite('batches')}
                >
                  <i className="fas fa-envelope-open-text" />
                  <span>{lang === 'ar' ? 'رسائلي والدفعات' : 'My Messages'}</span>
                </div>

                <div
                  className="drawer-item-compact"
                  style={{ color: '#00e5ff', background: 'rgba(0, 229, 255, 0.08)' }}
                  onClick={() => openAutomationSuite('link_scraper')}
                >
                  <i className="fas fa-search-dollar" />
                  <span>{lang === 'ar' ? 'فحص وفرز الروابط' : 'Link Search'}</span>
                  <span className="compact-badge" style={{ background: 'rgba(0, 229, 255, 0.2)', color: '#00e5ff' }}>
                    {lang === 'ar' ? 'جديد 🔍' : 'New'}
                  </span>
                </div>

                <div
                  className="drawer-item-compact"
                  style={{ color: '#00e676' }}
                  onClick={() => openAutomationSuite('autojoin')}
                >
                  <i className="fas fa-bolt" />
                  <span>{lang === 'ar' ? 'الانضمام التلقائي' : 'Auto Join'}</span>
                </div>

                <div
                  className="drawer-item-compact"
                  style={{ color: '#ab47bc' }}
                  onClick={() => openAutomationSuite('links')}
                >
                  <i className="fas fa-bookmark" />
                  <span>{lang === 'ar' ? 'الروابط المحفوظة' : 'Saved Links'}</span>
                </div>

                <div
                  className="drawer-item-compact"
                  style={{ color: '#ff5252' }}
                  onClick={() => openAutomationSuite('autoreply')}
                >
                  <i className="fas fa-robot" />
                  <span>{lang === 'ar' ? 'الردود التلقائية' : 'Auto Replies'}</span>
                </div>

                <div
                  className="drawer-item-compact"
                  style={{ color: '#7c4dff' }}
                  onClick={() => openAutomationSuite('rotating')}
                >
                  <i className="fas fa-sync-alt" />
                  <span>{lang === 'ar' ? 'النشر المتسلسل' : 'Rotating Send'}</span>
                </div>

                <div
                  className="drawer-item-compact"
                  style={{ color: '#ffd54f' }}
                  onClick={() => openAutomationSuite('learning')}
                >
                  <i className="fas fa-brain" />
                  <span>{lang === 'ar' ? 'التعلم الذكي' : 'Smart Learning'}</span>
                  <span className="compact-badge" style={{ background: 'rgba(255, 213, 79, 0.2)', color: '#ffd54f' }}>
                    AI
                  </span>
                </div>

                <div
                  className="drawer-item-compact"
                  style={{ color: '#26a69a' }}
                  onClick={() => openAutomationSuite('academic')}
                >
                  <i className="fas fa-graduation-cap" />
                  <span>{lang === 'ar' ? 'التحليل الأكاديمي' : 'Academic Tools'}</span>
                </div>

                <div
                  className="drawer-item-compact"
                  style={{ color: '#ec407a' }}
                  onClick={() => openAutomationSuite('formatter')}
                >
                  <i className="fas fa-file-signature" />
                  <span>{lang === 'ar' ? 'منسق المستندات' : 'Doc Formatter'}</span>
                </div>
              </div>
            )}
          </div>

          <div className="drawer-sep" />

          {/* MTProto 2.0 Data Centers & PTS Sync */}
          <div
            className="drawer-item"
            onClick={() => {
              setDrawerOpen(false);
              setMtprotoSyncModalOpen(true);
            }}
          >
            <i className="fas fa-network-wired" style={{ color: '#00e5ff' }} />
            <span>{lang === 'ar' ? 'مزامنة مراكز البيانات (MTProto 2.0)' : 'MTProto 2.0 DC Sync'}</span>
          </div>

          {/* Scheduled Cloud Archiving */}
          <div
            className="drawer-item"
            onClick={() => {
              setDrawerOpen(false);
              setArchiveSyncModalOpen(true);
            }}
          >
            <i className="fas fa-archive" style={{ color: '#38bdf8' }} />
            <span>{lang === 'ar' ? 'الأرشفة السحابية المجدولة' : 'Cloud Scheduled Archiving'}</span>
          </div>

          {/* Active Devices & Sessions */}
          <div
            className="drawer-item"
            onClick={() => {
              setDrawerOpen(false);
              setActiveSessionsModalOpen(true);
            }}
          >
            <i className="fas fa-laptop" style={{ color: '#10b981' }} />
            <span>{lang === 'ar' ? 'الأجهزة والجلسات النشطة' : 'Active Sessions & Devices'}</span>
          </div>

          {/* Quick Academic Formatter */}
          <div
            className="drawer-item"
            onClick={() => {
              setDrawerOpen(false);
              setAcademicModalOpen(true);
            }}
          >
            <i className="fas fa-graduation-cap" style={{ color: '#f59e0b' }} />
            <span>{lang === 'ar' ? 'التنسيق والخدمات الأكاديمية' : 'Academic Formatter & Services'}</span>
          </div>

          {/* Channel & Link Finder */}
          <div
            className="drawer-item"
            onClick={() => {
              setDrawerOpen(false);
              setLinkFinderModalOpen(true);
            }}
          >
            <i className="fas fa-compass" style={{ color: '#a855f7' }} />
            <span>{lang === 'ar' ? 'دليل ومستكشف القنوات والمراجع' : 'Channel & Link Finder'}</span>
          </div>

          {/* Chat Theme & Wallpaper Customizer */}
          <div
            className="drawer-item"
            onClick={() => {
              setDrawerOpen(false);
              setChatThemeModalOpen(true);
            }}
          >
            <i className="fas fa-palette" style={{ color: '#ec4899' }} />
            <span>{lang === 'ar' ? 'تخصيص ثيم وخلفية الدردشة' : 'Chat Wallpaper & Theme'}</span>
          </div>

          {/* Full System Backup & Sync */}
          <div
            className="drawer-item"
            onClick={() => {
              setDrawerOpen(false);
              setSyncBackupModalOpen(true);
            }}
          >
            <i className="fas fa-cloud-download-alt" style={{ color: '#6366f1' }} />
            <span>{lang === 'ar' ? 'النسخ الاحتياطي السحابي (Backup)' : 'Cloud Backup & Restore'}</span>
          </div>

          {/* Push Notifications Toggle */}
          <div
            className="drawer-item"
            onClick={handleEnableNotifications}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <i className="fas fa-bell" style={{ color: notifPermission === 'granted' ? '#10b981' : '#f59e0b' }} />
              <span>{lang === 'ar' ? 'إشعارات المتصفح (Web Push)' : 'Browser Push Notifications'}</span>
            </div>
            <span
              style={{
                fontSize: 11,
                padding: '2px 8px',
                borderRadius: 12,
                background: notifPermission === 'granted' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: notifPermission === 'granted' ? '#10b981' : '#f59e0b',
                fontWeight: 600,
              }}
            >
              {notifPermission === 'granted' ? (lang === 'ar' ? 'مفعلة' : 'Active') : (lang === 'ar' ? 'تفعيل' : 'Enable')}
            </span>
          </div>

          {/* Admin & System Messages Tool */}
          <div
            className="drawer-item"
            onClick={openAdminModal}
          >
            <i className="fas fa-shield-alt" style={{ color: '#38bdf8' }} />
            <span>{lang === 'ar' ? 'إجراءات المشرفين والنظام' : 'Admin & System Events'}</span>
          </div>

          {/* AI Guardian 12.x Group Protection */}
          <div
            className="drawer-item"
            onClick={openAiGuardianModal}
          >
            <i className="fas fa-robot" style={{ color: '#ec4899' }} />
            <span>{lang === 'ar' ? '🛡️ حارس الذكاء الاصطناعي (AI Guardian 12.x)' : '🛡️ AI Guardian Moderation (12.x)'}</span>
          </div>

          {/* Markdown In-App Document Viewer */}
          <div
            className="drawer-item"
            onClick={() => openMarkdownModal()}
          >
            <i className="fas fa-file-code" style={{ color: '#a855f7' }} />
            <span>{lang === 'ar' ? '📄 عارض مستندات Markdown المدمج' : '📄 In-App Markdown Viewer'}</span>
          </div>

          {/* Enhanced Polls */}
          <div
            className="drawer-item"
            onClick={openEnhancedPollModal}
          >
            <i className="fas fa-poll" style={{ color: '#f59e0b' }} />
            <span>{lang === 'ar' ? '📊 استطلاعات رأي متقدمة (Enhanced Polls)' : '📊 Enhanced Polls with Links'}</span>
          </div>

          {/* Native PWA Application Installer */}
          <div
            className="drawer-item"
            style={{ color: '#38bdf8' }}
            onClick={() => {
              setDrawerOpen(false);
              if ((window as any).__triggerPwaInstall) {
                (window as any).__triggerPwaInstall();
              } else {
                showToast(lang === 'ar' ? '📲 اضغط على خيارات المتصفح (⋮) ثم اختر "تثبيت التطبيق"' : 'Open browser menu (⋮) and select "Install App"');
              }
            }}
          >
            <i className="fas fa-download" style={{ color: '#38bdf8' }} />
            <span>{lang === 'ar' ? '📱 تثبيت التطبيق مباشرةً (Install App)' : '📱 Install App'}</span>
          </div>

          {/* Local Storage Offline Cache Status */}
          <div
            className="drawer-item"
            onClick={() => {
              const summary = getStorageCacheSummary();
              showToast(
                lang === 'ar'
                  ? `📦 الذاكرة المؤقتة: ${summary.chatsCount} محادثة، ${summary.cachedChatsWithMessages} محادثة مع رسائل مخزنة (آخر مزامنة: ${summary.lastSyncFormatted})`
                  : `📦 Local Cache: ${summary.chatsCount} chats, ${summary.cachedChatsWithMessages} chats with cached messages (Last sync: ${summary.lastSyncFormatted})`
              );
            }}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <i className="fas fa-database" style={{ color: '#a855f7' }} />
              <span>{lang === 'ar' ? 'الذاكرة المحلية (Offline Cache)' : 'Local Storage Cache'}</span>
            </div>
            <span
              style={{
                fontSize: 10,
                padding: '2px 6px',
                borderRadius: 10,
                background: 'rgba(168, 85, 247, 0.15)',
                color: '#a855f7',
                fontWeight: 600,
              }}
            >
              {chats.length} {lang === 'ar' ? 'محادثة' : 'chats'}
            </span>
          </div>

          <div
            className="drawer-item"
            onClick={() => {
              setAppLanguage(lang === 'ar' ? 'en' : 'ar');
              showToast(lang === 'ar' ? 'Switched to English' : 'تم التحويل إلى العربية');
            }}
          >
            <i className="fas fa-language" />
            {lang === 'ar' ? 'اللغة: العربية (English)' : 'Language: English (العربية)'}
          </div>

          <div className="drawer-sep" />

          <div className="drawer-item danger" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt" /> {lang === 'ar' ? 'تسجيل الخروج' : 'Log Out'}
          </div>
        </div>
      </div>

      {/* ══ LEFT COLUMN (CHATS LIST) ══ */}
      <div className={`left-col ${currentChatId ? 'has-active-chat' : ''}`} id="leftCol">
        {/* Selection Bar */}
        <div className={`sel-bar ${selMode ? 'show' : ''}`} id="selBar">
          <button onClick={() => { setSelMode(false); setSelSet(new Set()); }}>
            <i className="fas fa-times" />
          </button>
          <span className="sel-count">
            {selSet.size} {lang === 'ar' ? 'محدد' : 'selected'}
          </span>
        </div>

        {/* Left Header */}
        <div className="left-hdr">
          <button className="menu-btn" onClick={openDrawerModal} title="القائمة">
            <i className="fas fa-bars" />
          </button>
          <div className="search-wrap">
            <i className="fas fa-search s-icon" />
            <input
              type="text"
              placeholder={lang === 'ar' ? 'بحث في محادثات تليجرام...' : 'Search chats...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
            />
          </div>
          <button
            className="menu-btn"
            style={{ color: '#00e5ff', marginLeft: 4, marginRight: 4 }}
            onClick={() => openAutomationSuite('link_scraper')}
            title={lang === 'ar' ? 'فحص وفرز الروابط واستخراجها' : 'Link Search & Classifier'}
          >
            <i className="fas fa-search-dollar" />
          </button>
          <button
            className="menu-btn"
            style={{ color: '#10b981' }}
            onClick={() => openAutomationSuite('batches')}
            title={lang === 'ar' ? 'أدوات الأتمتة المتقدمة (Enjaz Suite)' : 'Automation Suite'}
          >
            <i className="fas fa-rocket" />
          </button>
          <button
            className="menu-btn"
            style={{ color: '#38bdf8' }}
            onClick={() => {
              if ((window as any).__triggerPwaInstall) {
                (window as any).__triggerPwaInstall();
              } else {
                showToast(lang === 'ar' ? '📲 اضغط على خيارات المتصفح (⋮) ثم اختر "تثبيت التطبيق"' : 'Open browser menu (⋮) and select "Install App"');
              }
            }}
            title={lang === 'ar' ? 'تثبيت التطبيق على جهازك' : 'Install App'}
          >
            <i className="fas fa-download" />
          </button>
          <button
            className="menu-btn"
            style={{ color: '#f59e0b', marginLeft: 2 }}
            onClick={() => handleSimulateIncomingMessage('group')}
            title={lang === 'ar' ? 'اختبار استقبال رسالة وإشعار فوري' : 'Test Incoming Message & Notification'}
          >
            <i className="fas fa-bell" />
          </button>
        </div>

        {/* Telegram 12.x Stories Bar (قصص تليجرام) */}
        <div className="stories-bar">
          {/* My Story (Add Story Button) */}
          <div
            className="story-item"
            onClick={() => openStoryViewerModal(0)}
            title={lang === 'ar' ? 'إضافة قصة جديدة' : 'Add Story'}
          >
            <div className="story-avatar-wrap my-story">
              <div className="story-avatar-inner">
                {currentUser?.photo ? (
                  <img src={currentUser.photo} alt="" />
                ) : (
                  <span>{initials(currentUser?.name || 'ME')}</span>
                )}
              </div>
              <div className="story-add-badge">
                <i className="fas fa-plus" />
              </div>
            </div>
            <span className="story-name">{lang === 'ar' ? 'قصتي' : 'My Story'}</span>
          </div>

          {/* Stories from contacts & channels */}
          {storiesList.map((story, idx) => (
            <div
              key={story.id}
              className="story-item"
              onClick={() => openStoryViewerModal(idx)}
              title={story.user_name}
            >
              <div className={`story-avatar-wrap ${story.is_viewed ? 'viewed' : ''}`}>
                <div className="story-avatar-inner">
                  {story.user_avatar ? (
                    <img src={story.user_avatar} alt="" />
                  ) : (
                    <span>{initials(story.user_name)}</span>
                  )}
                </div>
              </div>
              <span className="story-name">{story.user_name}</span>
            </div>
          ))}
        </div>

        {/* Chat Categories Filter Chips (الكل، غير مقروءة، قنوات، مجموعات، بوتات) */}
        <div className="chat-filter-chips">
          <button
            className={`filter-chip ${chatFilterTab === 'all' ? 'active' : ''}`}
            onClick={() => setChatFilterTab('all')}
          >
            <span>{lang === 'ar' ? 'الكل' : 'All'}</span>
            <span className="chip-count">{chatCounts.all}</span>
          </button>

          <button
            className={`filter-chip ${chatFilterTab === 'unread' ? 'active' : ''}`}
            onClick={() => setChatFilterTab('unread')}
          >
            <span>{lang === 'ar' ? 'غير مقروءة' : 'Unread'}</span>
            {chatCounts.unread > 0 && <span className="chip-count">{chatCounts.unread}</span>}
          </button>

          <button
            className={`filter-chip ${chatFilterTab === 'channels' ? 'active' : ''}`}
            onClick={() => setChatFilterTab('channels')}
          >
            <span>{lang === 'ar' ? 'القنوات' : 'Channels'}</span>
            {chatCounts.channels > 0 && <span className="chip-count">{chatCounts.channels}</span>}
          </button>

          <button
            className={`filter-chip ${chatFilterTab === 'groups' ? 'active' : ''}`}
            onClick={() => setChatFilterTab('groups')}
          >
            <span>{lang === 'ar' ? 'المجموعات' : 'Groups'}</span>
            {chatCounts.groups > 0 && <span className="chip-count">{chatCounts.groups}</span>}
          </button>

          <button
            className={`filter-chip ${chatFilterTab === 'bots' ? 'active' : ''}`}
            onClick={() => setChatFilterTab('bots')}
          >
            <span>{lang === 'ar' ? 'البوتات' : 'Bots'}</span>
            {chatCounts.bots > 0 && <span className="chip-count">{chatCounts.bots}</span>}
          </button>
        </div>

        {/* Floating Action Button (FAB - رسالة جديدة / جهات الاتصال) */}
        <button
          className="telegram-fab"
          onClick={openContactsModal}
          title={lang === 'ar' ? 'محادثة جديدة' : 'New Chat'}
        >
          <i className="fas fa-pen" />
        </button>

        {/* Offline Cache Status Banner */}
        {!isOnline && (
          <div
            style={{
              background: 'rgba(234, 179, 8, 0.12)',
              borderBottom: '1px solid rgba(234, 179, 8, 0.25)',
              padding: '6px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 12,
              color: '#eab308',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="fas fa-wifi-slash" />
              <span>{lang === 'ar' ? 'وضع عدم الاتصال: عرض الذاكرة المحلية' : 'Offline: Showing cached messages'}</span>
            </div>
            <span style={{ fontSize: 10, opacity: 0.85, background: 'rgba(234, 179, 8, 0.2)', padding: '2px 6px', borderRadius: 6 }}>
              localStorage
            </span>
          </div>
        )}

        {/* Chat List */}
        <div className="chat-list" id="chatList">
          {loadingChats ? (
            <div className="list-loader">
              <div className="dot" />
              <div className="dot" />
              <div className="dot" />
            </div>
          ) : sortedAndFilteredChats.length === 0 ? (
            <div className="list-empty" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text2)' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', fontSize: 24, color: 'var(--text2)' }}>
                <i className="fas fa-comments" />
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
                {searchQuery ? (lang === 'ar' ? 'لا توجد نتائج مطابقة' : 'No matching results') : (lang === 'ar' ? 'لا توجد محادثات' : 'No chats yet')}
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                {lang === 'ar' ? 'محادثاتك الفعلية على خوادم تليجرام تظهر هنا فور وصولها.' : 'Your real Telegram dialogs will appear here once loaded.'}
              </div>
            </div>
          ) : (
            sortedAndFilteredChats.map((c) => {
              const isActive = String(c.id) === String(currentChatId);
              const chatDraft = drafts[String(c.id)];

              const displayName = getChatDisplayName(c, lang);

              return (
                <div
                  key={c.id}
                  className={`chat-item fade-in ${isActive ? 'active' : ''}`}
                  onClick={() => selectChat(c.id)}
                  onContextMenu={(e) => showChatCtx(e, c)}
                >
                  <div className="shrink-0 flex items-center justify-center">
                    <ChatAvatar
                      id={c.id}
                      title={displayName}
                      photo={c.photo || avatarMap[String(c.id)]}
                      avatar={c.photo || avatarMap[String(c.id)]}
                      username={c.username}
                      type={c.type}
                      size="xl"
                      isOnline={c.type === 'private'}
                      isVerified={c.id === 1001 || c.id === 1002 || c.id === 1003 || c.id === 1007}
                    />
                  </div>

                  <div className="chat-info">
                    <div className="chat-top">
                      <div className="chat-name flex items-center gap-1 min-w-0">
                        <span className="truncate">{displayName}</span>
                        {isGroupChat(c as any) && (c.has_system_activity || (c.last_system_activity && c.last_system_activity > 0)) && (
                          <span
                            className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[10px] font-bold shrink-0"
                            style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' }}
                            title={lang === 'ar' ? 'أحدث نشاط إداري / نظام' : 'Recent system activity'}
                          >
                            <i className="fas fa-bolt" style={{ fontSize: 9 }} />
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {c.isOut && (
                          <span
                            className="chat-check font-bold text-xs"
                            style={{ color: (c as any).isRead !== false ? '#3390ec' : 'var(--text3, #8e8e93)' }}
                            title={(c as any).isRead !== false ? 'تمت القراءة' : 'تم الإرسال'}
                          >
                            {(c as any).isRead !== false ? '✓✓' : '✓'}
                          </span>
                        )}
                        <div className="chat-time">{fmtTime(c.lastMsgDate)}</div>
                      </div>
                    </div>
                    <div className="chat-bot">
                      <div className="chat-msg">
                        {chatDraft ? (
                          <span>
                            <span className="draft-badge">{lang === 'ar' ? 'مسودة: ' : 'Draft: '}</span>
                            {chatDraft}
                          </span>
                        ) : (
                          <>
                            {c.isOut && <span style={{ color: 'var(--text2)' }}>{lang === 'ar' ? 'أنت: ' : 'You: '}</span>}
                            {c.lastMsg || (lang === 'ar' ? 'محادثة جديدة' : 'New chat')}
                          </>
                        )}
                      </div>
                      <div className="chat-icons">
                        <TelegramUnreadBadge
                          unread={c.unread}
                          isMuted={c.muted}
                          isPinned={c.pinned}
                          hasUnreadMark={!c.unread && (c as any).has_unread_mark}
                          unreadMentions={(c as any).unread_mentions || (c as any).unread_mentions_count || 0}
                          unreadReactions={(c as any).unread_reactions}
                          size="md"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Telegram 12.x Modern Bottom Navigation Bar */}
        <BottomNavBar
          activeTab={activeBottomNav}
          onSelectTab={(tab) => {
            setActiveBottomNav(tab);
            if (tab === 'contacts') openContactsModal();
            else if (tab === 'automation') openAutomationSuite('batches');
            else if (tab === 'settings') openSettingsModal();
          }}
          unreadTotal={chats.reduce((acc, c) => acc + (c.unread || 0), 0)}
          lang={lang}
        />
      </div>

      {/* ══ RIGHT COLUMN (ACTIVE CHAT) ══ */}
      <div className={`right-col ${currentChatId ? 'active-chat-open' : 'no-active-chat'}`} id="rightCol">
        {!currentChatId ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <i className="fab fa-telegram-plane" />
            </div>
            <h3>{lang === 'ar' ? 'تليجرام ويب' : 'Telegram Web'}</h3>
            <p>{lang === 'ar' ? 'اختر محادثة من القائمة لبدء المراسلة الحقيقية عبر خوادم تليجرام السحابية.' : 'Select a chat from the sidebar to start messaging via Telegram Cloud.'}</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            {(() => {
              const activeDisplayName = getChatDisplayName(currentChat, lang);
              return (
                <div className="chat-hdr">
                  <button className="back-btn" onClick={closeChat}>
                    <i className="fas fa-arrow-right" />
                  </button>

                  <div
                    className="hdr-avatar shrink-0 cursor-pointer flex items-center justify-center"
                    onClick={() => currentChat && openProfile(currentChat)}
                  >
                    <ChatAvatar
                      id={currentChat?.id}
                      title={activeDisplayName || 'Telegram'}
                      photo={currentChat?.photo || (currentChat?.id ? avatarMap[String(currentChat.id)] : undefined)}
                      avatar={currentChat?.photo || (currentChat?.id ? avatarMap[String(currentChat.id)] : undefined)}
                      username={currentChat?.username}
                      type={currentChat?.type}
                      size="md"
                      isOnline={currentChat?.type === 'private'}
                      isVerified={currentChat?.id === 1001 || currentChat?.id === 1002 || currentChat?.id === 1003 || currentChat?.id === 1007}
                    />
                  </div>

                  <div className="hdr-info" onClick={() => currentChat && openProfile(currentChat)}>
                    <div className="hdr-title">{activeDisplayName || (lang === 'ar' ? 'محادثة' : 'Chat')}</div>
                    <div className="hdr-sub">
                      {partnerTyping ? (
                        <span style={{ color: 'var(--tg-blue)' }}>{lang === 'ar' ? 'يكتب الآن...' : 'typing...'}</span>
                      ) : currentChat?.type === 'channel' ? (
                        lang === 'ar' ? 'قناة عامة' : 'channel'
                      ) : currentChat?.type === 'group' ? (
                        lang === 'ar' ? 'مجموعة تليجرام' : 'group'
                      ) : (
                        lang === 'ar' ? 'متصل الآن' : 'online'
                      )}
                    </div>
                  </div>

                  <div className="hdr-actions">
                    {/* Voice Call Button (Direct on header for private chats) */}
                    {currentChat?.type === 'private' && (
                      <button
                        className="icon-btn"
                        onClick={openVoiceCallModal}
                        title={lang === 'ar' ? 'مكالمة صوتية' : 'Voice Call'}
                        style={{ color: '#00e676' }}
                      >
                        <i className="fas fa-phone" />
                      </button>
                    )}

                    {/* Search in chat */}
                    <button
                      className="icon-btn"
                      onClick={openInChatSearch}
                      title={lang === 'ar' ? 'بحث في المحادثة' : 'Search in chat'}
                    >
                      <i className="fas fa-search" />
                    </button>

                    {/* 3-Dots More Options Menu */}
                    <button
                      className="icon-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setChatHdrMenuOpen(!chatHdrMenuOpen);
                      }}
                      title={lang === 'ar' ? 'المزيد من الخيارات' : 'More Options'}
                    >
                      <i className="fas fa-ellipsis-v" />
                    </button>

                    {/* Chat Header Dropdown Menu */}
                    {chatHdrMenuOpen && (
                      <div
                        className="chat-hdr-menu-dropdown"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div
                          className="chat-hdr-menu-item"
                          onClick={() => {
                            setChatHdrMenuOpen(false);
                            if (currentChat) openProfile(currentChat);
                          }}
                        >
                          <i className="fas fa-info-circle" style={{ color: '#2AABEE' }} />
                          <span>{lang === 'ar' ? 'معلومات المحادثة والملف' : 'Chat Info'}</span>
                        </div>

                        {/* Voice & Video Calls */}
                        <div
                          className="chat-hdr-menu-item"
                          onClick={() => {
                            setChatHdrMenuOpen(false);
                            openVoiceCallModal();
                          }}
                        >
                          <i className="fas fa-phone-alt" style={{ color: '#00e676' }} />
                          <span>{lang === 'ar' ? 'مكالمة صوتية وفيديو' : 'Voice & Video Call'}</span>
                        </div>

                        {/* AI Guardian Trigger for Groups & Channels */}
                        {(currentChat?.type === 'group' || currentChat?.type === 'channel') && (
                          <div
                            className="chat-hdr-menu-item"
                            onClick={() => {
                              setChatHdrMenuOpen(false);
                              openAiGuardianModal();
                            }}
                          >
                            <i className="fas fa-robot" style={{ color: '#ec4899' }} />
                            <span>{lang === 'ar' ? 'حارس الذكاء الاصطناعي والمشرف الآلي' : 'AI Guardian Protection'}</span>
                          </div>
                        )}

                        <div
                          className="chat-hdr-menu-item"
                          onClick={() => {
                            setChatHdrMenuOpen(false);
                            openEnhancedPollModal();
                          }}
                        >
                          <i className="fas fa-poll" style={{ color: '#f59e0b' }} />
                          <span>{lang === 'ar' ? 'استطلاع رأي متقدم' : 'Create Poll'}</span>
                        </div>

                        <div
                          className="chat-hdr-menu-item"
                          onClick={() => {
                            setChatHdrMenuOpen(false);
                            openMarkdownModal();
                          }}
                        >
                          <i className="fas fa-file-code" style={{ color: '#a855f7' }} />
                          <span>{lang === 'ar' ? 'عارض مستندات Markdown' : 'Markdown Reader'}</span>
                        </div>

                        <div
                          className="chat-hdr-menu-item"
                          onClick={() => {
                            setChatHdrMenuOpen(false);
                            if (currentChatId) {
                              setChats((prev) =>
                                prev.map((c) =>
                                  String(c.id) === String(currentChatId) ? { ...c, muted: !c.muted } : c
                                )
                              );
                              showToast(
                                lang === 'ar'
                                  ? (currentChat?.muted ? 'تم تفعيل التنبيهات' : 'تم كتم التنبيهات')
                                  : (currentChat?.muted ? 'Unmuted' : 'Muted')
                              );
                            }
                          }}
                        >
                          <i className={`fas ${currentChat?.muted ? 'fa-bell' : 'fa-bell-slash'}`} />
                          <span>
                            {currentChat?.muted
                              ? (lang === 'ar' ? 'إلغاء كتم التنبيهات' : 'Unmute')
                              : (lang === 'ar' ? 'كتم التنبيهات' : 'Mute')}
                          </span>
                        </div>

                        <div
                          className="chat-hdr-menu-item"
                          onClick={() => {
                            setChatHdrMenuOpen(false);
                            setSearchInChatOpen(true);
                          }}
                        >
                          <i className="fas fa-search" />
                          <span>{lang === 'ar' ? 'بحث في الرسائل' : 'Search Messages'}</span>
                        </div>

                        <div
                          className="chat-hdr-menu-item"
                          onClick={() => {
                            setChatHdrMenuOpen(false);
                            setAdminModalOpen(true);
                          }}
                        >
                          <i className="fas fa-shield-alt" style={{ color: '#38bdf8' }} />
                          <span>{lang === 'ar' ? 'لوحة المشرفين والنظام' : 'Admin Actions'}</span>
                        </div>

                        <div
                          className="chat-hdr-menu-item"
                          onClick={() => {
                            setChatHdrMenuOpen(false);
                            openAutomationSuite('link_scraper');
                          }}
                        >
                          <i className="fas fa-search-dollar" style={{ color: '#00e5ff' }} />
                          <span>{lang === 'ar' ? 'فحص وتصنيف روابط المحادثة' : 'Scrape Links'}</span>
                        </div>

                        <div
                          className="chat-hdr-menu-item danger"
                          onClick={() => {
                            setChatHdrMenuOpen(false);
                            if (currentChatId) {
                              setMessages((prev) => ({ ...prev, [currentChatId]: [] }));
                              showToast(lang === 'ar' ? 'تم مسح سجل المحادثة محلياً' : 'History cleared');
                            }
                          }}
                        >
                          <i className="fas fa-trash-alt" />
                          <span>{lang === 'ar' ? 'مسح سجل الرسائل' : 'Clear History'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* In-Chat Search Overlay */}
            {searchInChatOpen && (
              <div className="in-chat-search-bar" style={{ padding: '8px 16px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <i className="fas fa-search" style={{ color: 'var(--text2)' }} />
                <input
                  type="text"
                  placeholder={lang === 'ar' ? 'بحث في الرسائل...' : 'Search messages...'}
                  value={inChatSearchQuery}
                  onChange={(e) => {
                    setInChatSearchQuery(e.target.value);
                    if (!e.target.value.trim()) {
                      setInChatSearchResults([]);
                    } else {
                      const res = currentChatMsgs.filter((m) =>
                        m.text && m.text.toLowerCase().includes(e.target.value.toLowerCase())
                      );
                      setInChatSearchResults(res);
                    }
                  }}
                  autoFocus
                  style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text)', outline: 'none', fontSize: 14 }}
                />
                <button
                  className="icon-btn"
                  onClick={() => {
                    setSearchInChatOpen(false);
                    setInChatSearchQuery('');
                    setInChatSearchResults([]);
                  }}
                >
                  <i className="fas fa-times" />
                </button>
              </div>
            )}

            {/* Pinned Message Bar */}
            {pinnedData && (
              <div
                className="pinned-message-bar"
                onClick={() => scrollToMessage(pinnedData.id)}
              >
                <i className="fas fa-thumbtack pin-badge-icon" />
                <div className="pinned-info">
                  <div className="pinned-title">
                    {lang === 'ar' ? 'رسالة مثبتة' : 'Pinned Message'} {pinnedData.sender_name && `• ${pinnedData.sender_name}`}
                  </div>
                  <div className="pinned-preview">{pinnedData.text}</div>
                </div>
                <button
                  className="unpin-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    unpinMessage();
                  }}
                  title={lang === 'ar' ? 'إلغاء التثبيت' : 'Unpin'}
                >
                  <i className="fas fa-times" />
                </button>
              </div>
            )}

            {/* Messages Area */}
            <div className="msgs-area custom-scrollbar" ref={msgsAreaRef} id="msgsArea">
              {loadingMessages ? (
                <div className="list-loader" style={{ margin: 'auto' }}>
                  <div className="dot" />
                  <div className="dot" />
                  <div className="dot" />
                </div>
              ) : currentChatMsgs.length === 0 ? (
                <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text2)', padding: 30 }}>
                  <div style={{ fontSize: 14 }}>{lang === 'ar' ? 'لا توجد رسائل سابقة. ابدأ المحادثة الآن!' : 'No messages yet. Send a message to start!'}</div>
                </div>
              ) : (
                groupedMessages.map((group) => {
                  if (group.isSystem && group.systemMsg) {
                    const sm = group.systemMsg;
                    return (
                      <SystemMessageItem
                        key={sm.id}
                        text={sm.text || 'إشعار نظام'}
                        type={sm.system_type as any}
                        date={sm.date}
                        isMe={group.isOut}
                      />
                    );
                  }

                  const isOut = group.isOut;
                  const isGroupOrChannel = currentChat?.type === 'group' || currentChat?.type === 'supergroup' || currentChat?.type === 'channel';
                  const senderDisplayName = group.sender_name || (currentChat ? getChatDisplayName(currentChat, lang) : (lang === 'ar' ? 'مستخدم' : 'User'));

                  return (
                    <div
                      key={group.id}
                      className={`msg-row grouped-row ${isOut ? 'out' : 'in'} ${group.messages.length > 1 ? 'has-multiple' : ''}`}
                    >
                      {/* SENDER AVATAR (Official Telegram: displayed beside incoming message bubble) */}
                      {!isOut && (
                        <div
                          className="msg-avatar-col shrink-0 cursor-pointer transition-transform hover:scale-105"
                          onClick={() => {
                            setProfileData({
                              id: group.sender_id || 'peer',
                              name: senderDisplayName,
                              username: group.sender_username || (isGroupOrChannel ? undefined : currentChat?.username),
                              bio: lang === 'ar' ? 'حساب تليجرام رسمي' : 'Telegram account',
                              photo: group.sender_avatar || avatarMap[String(group.sender_id)] || (currentChat && !isGroupOrChannel ? currentChat.photo : undefined),
                              is_online: true,
                            });
                            pushNavState('profile', group.sender_id || 'peer');
                            setProfilePanelOpen(true);
                          }}
                        >
                          <ChatAvatar
                            id={group.sender_id}
                            title={senderDisplayName}
                            photo={group.sender_avatar || avatarMap[String(group.sender_id)] || (currentChat && !isGroupOrChannel ? currentChat.photo : undefined)}
                            avatar={group.sender_avatar || avatarMap[String(group.sender_id)] || (currentChat && !isGroupOrChannel ? currentChat.photo : undefined)}
                            username={group.sender_username || (isGroupOrChannel ? undefined : currentChat?.username)}
                            type={isGroupOrChannel ? 'private' : currentChat?.type}
                            size="sm"
                          />
                        </div>
                      )}

                      <div className={`bubble unified-group ${isOut ? 'out' : 'in'} ${group.messages.length > 1 ? 'is-grouped' : ''}`}>
                        {/* Group Sender Name in groups/channels or when distinct name exists */}
                        {!isOut && (isGroupOrChannel || (group.sender_name && group.sender_name !== currentChat?.title)) && (
                          <div
                            className="group-sender-header cursor-pointer hover:underline"
                            style={{ color: getPeerColor(group.sender_id || senderDisplayName).color }}
                            onClick={() => {
                              setProfileData({
                                id: group.sender_id || 'peer',
                                name: senderDisplayName,
                                username: group.sender_username || (isGroupOrChannel ? undefined : currentChat?.username),
                                bio: lang === 'ar' ? 'حساب تليجرام رسمي' : 'Telegram account',
                                photo: group.sender_avatar || avatarMap[String(group.sender_id)] || (currentChat && !isGroupOrChannel ? currentChat.photo : undefined),
                                is_online: true,
                              });
                              pushNavState('profile', group.sender_id || 'peer');
                              setProfilePanelOpen(true);
                            }}
                          >
                            {senderDisplayName}
                          </div>
                        )}

                        {/* Sub-messages inside the unified bubble */}
                        {group.messages.map((m, idx) => {
                          const isPhoto = m.type === 'photo' || (m.media && (m.media.endsWith('.jpg') || m.media.endsWith('.png') || m.media.startsWith('data:image') || m.media.startsWith('blob:')));
                          const isVoice = m.type === 'voice' || (m.media && (m.media.endsWith('.mp3') || m.media.endsWith('.webm') || m.media.endsWith('.ogg')));
                          const isPlaying = playingAudioId === m.id;

                          return (
                            <div
                              key={m.id}
                              id={`msg-${m.id}`}
                              className={`sub-msg-item ${idx > 0 ? 'sub-msg-followup' : 'sub-msg-first'}`}
                              onContextMenu={(e) => showMsgCtx(e, m)}
                            >
                              {idx > 0 && <div className="sub-msg-divider" />}

                              {/* Reply Info */}
                              {m.reply_to && (
                                <div
                                  className="reply-preview"
                                  onClick={() => m.reply_to?.id && scrollToMessage(m.reply_to.id)}
                                >
                                  <div className="reply-author">{m.reply_to.sender_name || 'Telegram'}</div>
                                  <div className="reply-text">{m.reply_to.text}</div>
                                </div>
                              )}

                              {/* Forward Info */}
                              {m.fwd_from && (
                                <div className="forward-preview">
                                  <i className="fas fa-share" /> {lang === 'ar' ? `محولة من ${m.fwd_from}` : `Forwarded from ${m.fwd_from}`}
                                </div>
                              )}

                              {/* Photo Media */}
                              {isPhoto && m.media && (
                                <div
                                  className="msg-media-container"
                                  onClick={() => openLightboxModal(m.media || '')}
                                >
                                  <img src={m.media} alt="" className="msg-media-img" />
                                </div>
                              )}

                              {/* Voice Player */}
                              {isVoice && (
                                <div className="voice-player-bubble">
                                  <button
                                    className="voice-play-btn"
                                    onClick={() => togglePlayAudio(m.id, m.media)}
                                  >
                                    <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`} />
                                  </button>
                                  <div className="voice-wave-container">
                                    <div className="voice-wave-bars">
                                      {[30, 60, 40, 80, 50, 90, 45, 75, 60, 30, 85, 40, 60, 70, 45].map((h, i) => (
                                        <div
                                          key={i}
                                          className="voice-bar"
                                          style={{
                                            height: `${h}%`,
                                            background: isPlaying ? 'var(--tg-blue)' : 'var(--text2)',
                                          }}
                                        />
                                      ))}
                                    </div>
                                    <div className="voice-duration">
                                      {fmtDuration(m.duration || 12)}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Message Content & Inline Metadata */}
                              <div className="sub-msg-body">
                                {m.text && (
                                  <div className="msg-text">
                                    {renderFormattedMessageText(m.text, handleOpenTelegramLink)}
                                  </div>
                                )}

                                {/* Message Meta (Time & Status Checkmarks) */}
                                <div className="msg-meta">
                                  <span className="msg-time">{fmtMsgTime(m.date)}</span>
                                  {isOut && (
                                    <span
                                      className={`msg-status ${m.status || 'read'}`}
                                      title={
                                        m.status === 'pending' || m.status === 'sending'
                                          ? (lang === 'ar' ? 'جاري الإرسال...' : 'Sending...')
                                          : m.status === 'sent'
                                          ? (lang === 'ar' ? 'تم الإرسال (علامة صح واحدة ✓)' : 'Sent (single checkmark ✓)')
                                          : m.status === 'delivered'
                                          ? (lang === 'ar' ? 'تم التسليم (علامتا صح رمادية ✓✓)' : 'Delivered (double checkmark ✓✓)')
                                          : (lang === 'ar' ? 'تمت القراءة (علامتا صح زرقاء ✓✓)' : 'Read (blue double checkmark ✓✓)')
                                      }
                                    >
                                      {m.status === 'pending' || m.status === 'sending' ? (
                                        <i className="fas fa-clock check-icon check-pending" style={{ fontSize: '10px' }} />
                                      ) : m.status === 'sent' ? (
                                        <i className="fas fa-check check-icon check-sent" style={{ fontSize: '11px', color: 'var(--delivered, #8D969D)' }} />
                                      ) : m.status === 'delivered' ? (
                                        <i className="fas fa-check-double check-icon check-delivered" style={{ fontSize: '12px', color: 'var(--delivered, #8D969D)' }} />
                                      ) : (
                                        <i className="fas fa-check-double check-icon check-read animate-read-receipt" style={{ fontSize: '12px', color: 'var(--read, #2AABEE)' }} />
                                      )}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Reactions */}
                              {m.reactions && m.reactions.length > 0 && (
                                <div className="reactions-container">
                                  {m.reactions.map((r, i) => (
                                    <span
                                      key={i}
                                      className={`reaction-pill ${r.mine ? 'active' : ''}`}
                                      onClick={() => sendReaction(r.emoji, m.id)}
                                    >
                                      {r.emoji} {r.count}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Attachments Preview Bar */}
            {pendingAttachments.length > 0 && (
              <div className="attachments-preview-bar">
                {pendingAttachments.map((att) => (
                  <div key={att.id} className="preview-item">
                    {att.type === 'image' ? (
                      <img src={att.previewUrl} alt={att.name} />
                    ) : (
                      <div className="doc-preview">
                        <i className="fas fa-file-alt" />
                      </div>
                    )}
                    <button
                      className="remove-att-btn"
                      onClick={() => removeAttachment(att.id)}
                    >
                      <i className="fas fa-times" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Reply Bar */}
            {replyMsg && (
              <div className="reply-bar">
                <i className="fas fa-reply reply-bar-icon" />
                <div className="reply-bar-info">
                  <div className="reply-bar-author">{replyMsg.sender}</div>
                  <div className="reply-bar-text">{replyMsg.text}</div>
                </div>
                <button className="reply-bar-close" onClick={() => setReplyMsg(null)}>
                  <i className="fas fa-times" />
                </button>
              </div>
            )}

            {/* Input Bar */}
            <div className="input-bar">
              {/* Voice Recording Active Bar */}
              {isRecordingVoice ? (
                <div className="voice-recording-bar">
                  <div className="rec-dot" />
                  <span className="rec-timer">{fmtDuration(voiceDuration)}</span>
                  <div className="rec-wave">
                    {[20, 50, 80, 40, 70, 90, 60, 30, 80, 50].map((h, i) => (
                      <div
                        key={i}
                        className="voice-bar pulse"
                        style={{ height: `${h}%`, background: '#ff6b6b' }}
                      />
                    ))}
                  </div>
                  <button className="cancel-rec-btn" onClick={cancelVoiceRecording}>
                    <i className="fas fa-trash" />
                  </button>
                  <button className="stop-rec-btn" onClick={stopVoiceRecording}>
                    <i className="fas fa-paper-plane" />
                  </button>
                </div>
              ) : (
                <>
                  {/* Telegram Style Message Input Capsule */}
                  <div className="input-wrap">
                    {/* Emoji / Smile Button */}
                    <button
                      className="capsule-btn emoji-btn"
                      onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}
                      title={lang === 'ar' ? 'رموز تعبيرية' : 'Emoji'}
                    >
                      <i className="far fa-smile" />
                    </button>

                    {/* Text Input Area */}
                    <textarea
                      ref={inputRef}
                      className="msg-input"
                      placeholder={lang === 'ar' ? 'اكتب رسالة...' : 'Write a message...'}
                      value={inputText}
                      rows={1}
                      onChange={(e) => handleDraftChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    />

                    {/* Attach Button & Menu inside capsule */}
                    <div className="attach-wrap">
                      <button
                        className="capsule-btn attach-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAttachMenuOpen(!attachMenuOpen);
                        }}
                        title={lang === 'ar' ? 'إرفاق ملف' : 'Attach'}
                      >
                        <i className="fas fa-paperclip" />
                      </button>

                      {attachMenuOpen && (
                        <div className="attach-menu show" onClick={(e) => e.stopPropagation()}>
                          <div
                            className="attach-item"
                            onClick={() => imgInputRef.current?.click()}
                          >
                            <i className="fas fa-image" style={{ color: '#2481cc' }} />
                            <span>{lang === 'ar' ? 'صورة أو فيديو' : 'Photo or Video'}</span>
                          </div>
                          <div
                            className="attach-item"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <i className="fas fa-file" style={{ color: '#27ae60' }} />
                            <span>{lang === 'ar' ? 'مستند أو ملف' : 'File / Document'}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Send or Voice Button (Round FAB) */}
                  {inputText.trim() || pendingAttachments.length > 0 ? (
                    <button className="send-btn" onClick={sendMessage} title={lang === 'ar' ? 'إرسال' : 'Send'}>
                      <i className="fas fa-paper-plane" />
                    </button>
                  ) : (
                    <button
                      className="mic-btn send-btn"
                      onClick={startVoiceRecording}
                      title={lang === 'ar' ? 'تسجيل رسالة صوتية' : 'Record voice'}
                    >
                      <i className="fas fa-microphone" />
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Emoji Picker Popup */}
            {emojiPickerOpen && (
              <div className="emoji-picker-popup">
                <div className="emoji-cats-bar">
                  {EMOJI_CATS.map((cat, i) => (
                    <button
                      key={i}
                      className={`cat-btn ${selectedEmojiCat === i ? 'active' : ''}`}
                      onClick={() => setSelectedEmojiCat(i)}
                    >
                      {cat.icon}
                    </button>
                  ))}
                </div>
                <div className="emoji-grid custom-scrollbar">
                  {EMOJI_CATS[selectedEmojiCat].emojis.map((emoji) => (
                    <span
                      key={emoji}
                      className="emoji-item"
                      onClick={() => handleDraftChange(inputText + emoji)}
                    >
                      {emoji}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ══ PROFILE MODAL / SIDEBAR ══ */}
      {profilePanelOpen && profileData && (
        <div className="modal-overlay show" onClick={() => setProfilePanelOpen(false)}>
          <div className="fwd-modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="fwd-modal-hdr">
              <h3>{lang === 'ar' ? 'معلومات المحادثة' : 'Chat Info'}</h3>
              <button onClick={() => setProfilePanelOpen(false)}>
                <i className="fas fa-times" />
              </button>
            </div>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                className="chat-avatar"
                style={{
                  width: 80,
                  height: 80,
                  fontSize: 32,
                  background: avatarColor(profileData.id),
                  marginBottom: 16,
                }}
              >
                {profileData.photo ? <img src={profileData.photo} alt="" /> : initials(profileData.name)}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
                {profileData.name}
              </h3>
              {profileData.username && (
                <div style={{ fontSize: 13, color: 'var(--tg-blue)', marginBottom: 16 }}>
                  @{profileData.username}
                </div>
              )}
              {profileData.bio && (
                <div style={{ width: '100%', background: 'var(--surface2)', padding: 14, borderRadius: 10, fontSize: 13, color: 'var(--text2)', marginBottom: 12, lineHeight: 1.5 }}>
                  {profileData.bio}
                </div>
              )}
              {profileData.phone && (
                <div style={{ width: '100%', background: 'var(--surface2)', padding: 14, borderRadius: 10, fontSize: 13, color: 'var(--text2)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{lang === 'ar' ? 'رقم الهاتف:' : 'Phone:'}</span>
                  <span style={{ color: 'var(--text)', fontWeight: 600 }}>{profileData.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══ FORWARD MODAL ══ */}
      {fwdModalOpen && (
        <div className="modal-overlay show" onClick={() => setFwdModalOpen(false)}>
          <div className="fwd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="fwd-modal-hdr">
              <h3>{lang === 'ar' ? 'توجيه الرسالة إلى...' : 'Forward to...'}</h3>
              <button onClick={() => setFwdModalOpen(false)}>
                <i className="fas fa-times" />
              </button>
            </div>
            <div className="fwd-search">
              <input
                type="text"
                placeholder={lang === 'ar' ? 'بحث في المحادثات...' : 'Search chats...'}
                value={fwdSearchQuery}
                onChange={(e) => setFwdSearchQuery(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div className="fwd-list">
              {chats
                .filter((c) => {
                  const resolved = getChatDisplayName(c, lang).toLowerCase();
                  const q = fwdSearchQuery.toLowerCase();
                  return resolved.includes(q) || (c.title || '').toLowerCase().includes(q) || (c.name || '').toLowerCase().includes(q);
                })
                .map((c) => {
                  const resolved = getChatDisplayName(c, lang);
                  return (
                    <div key={c.id} className="fwd-item" onClick={() => executeForward(c.id)}>
                      <div className="fa-avatar" style={{ background: avatarColor(c.id) }}>
                        {c.photo ? <img src={c.photo} alt="" /> : initials(resolved)}
                      </div>
                      <div className="fn">{resolved}</div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* ══ LIGHTBOX ══ */}
      {lightboxSrc && (
        <div className="lightbox open" onClick={() => setLightboxSrc(null)}>
          <button className="lb-close" onClick={() => setLightboxSrc(null)}>
            <i className="fas fa-times" />
          </button>
          <img src={lightboxSrc} alt="" />
        </div>
      )}

      {/* ══ CONTEXT MENU ══ */}
      {ctxMenu && (
        <div
          className="ctx-menu"
          style={{
            top: Math.min(ctxMenu.y, window.innerHeight - 240),
            left: Math.min(ctxMenu.x, window.innerWidth - 200),
          }}
        >
          {ctxMenu.items.map((item, i) =>
            item.sep ? (
              <div key={i} className="ctx-sep" />
            ) : (
              <div
                key={i}
                className={`ctx-item ${item.danger ? 'danger' : ''}`}
                onClick={() => {
                  setCtxMenu(null);
                  item.fn?.();
                }}
              >
                <i className={`fas ${item.icon}`} />
                <span>{item.label}</span>
              </div>
            )
          )}
        </div>
      )}
      {/* ══ AUTOMATION & ENJAZ SUITE MODAL (ALL 11 TOOLS) ══ */}
      <AutomationAIModal
        isOpen={automationModalOpen}
        onClose={() => setAutomationModalOpen(false)}
        initialTab={automationActiveTab}
      />

      {/* ══ SETTINGS MODAL ══ */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        profile={{
          id: String(currentUser?.id || 'me'),
          name: currentUser?.name || `${currentUser?.first_name || ''} ${currentUser?.last_name || ''}`.trim() || 'مستخدم تليجرام',
          first_name: currentUser?.first_name,
          last_name: currentUser?.last_name,
          username: currentUser?.username,
          phone: currentUser?.phone,
          bio: currentUser?.bio,
          photo: currentUser?.photo,
          has_2fa: currentUser?.has_2fa,
        }}
        theme={theme}
        onToggleTheme={toggleTheme}
        onUpdateProfile={(updated) => {
          setCurrentUser((prev: any) => ({
            ...prev,
            ...updated,
          }));
        }}
      />

      {/* ══ VOICE / VIDEO CALL MODAL ══ */}
      <VoiceCallModal
        isOpen={voiceCallModalOpen}
        onClose={() => setVoiceCallModalOpen(false)}
        peerName={currentChat ? getChatDisplayName(currentChat, lang) : (lang === 'ar' ? 'محادثة تليجرام' : 'Telegram Chat')}
        peerAvatar={currentChat?.photo || undefined}
      />

      {/* ══ CONTACTS MODAL ══ */}
      <ContactsModal
        isOpen={contactsModalOpen}
        onClose={() => setContactsModalOpen(false)}
        onSelectContact={handleSelectContact}
      />

      {/* ══ ADD ACCOUNT MODAL ══ */}
      <AddAccountModal
        isOpen={addAccountModalOpen}
        onClose={() => setAddAccountModalOpen(false)}
        onAccountAdded={handleAddAccount}
      />

      {/* ══ ADMIN ACTIONS & SYSTEM EVENTS MODAL ══ */}
      <AdminActionsModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        currentChat={currentChat}
        onTriggerAction={handleTriggerAdminAction}
        onTestNotification={handleTestPushNotification}
        lang={lang}
      />

      {/* ══ AI GUARDIAN MODAL (Telegram 12.x Group Protection) ══ */}
      <AIGuardianModal
        isOpen={aiGuardianModalOpen}
        onClose={() => setAiGuardianModalOpen(false)}
        chatTitle={currentChat ? getChatDisplayName(currentChat, lang) : undefined}
        chatId={currentChat?.id}
        lang={lang}
      />

      {/* ══ ENHANCED POLL MODAL (Polls with Option Links) ══ */}
      <EnhancedPollModal
        isOpen={enhancedPollModalOpen}
        onClose={() => setEnhancedPollModalOpen(false)}
        onCreatePoll={(pollData) => {
          if (!currentChatId) return;
          const newPollMsg: MessageItem = {
            id: `poll_${Date.now()}`,
            chat_id: currentChatId,
            sender_id: currentUser?.id || 'me',
            sender_name: currentUser?.name || 'أنا',
            out: true,
            from_me: true,
            type: 'text',
            text: `📊 ${pollData.question}\n${pollData.options.map((o, i) => `${i + 1}. ${o.text} ${o.linkUrl ? `(${o.linkUrl})` : ''}`).join('\n')}`,
            date: Math.floor(Date.now() / 1000),
          };
          setMessages((prev) => {
            const list = prev[currentChatId] || [];
            return { ...prev, [currentChatId]: [...list, newPollMsg] };
          });
          showToast(lang === 'ar' ? '📊 تم نشر استطلاع الرأي المتقدم بنجاح' : '📊 Enhanced Poll posted successfully');
        }}
        lang={lang}
      />

      {/* ══ IN-APP MARKDOWN VIEWER MODAL ══ */}
      <MarkdownViewerModal
        isOpen={markdownModalOpen}
        onClose={() => setMarkdownModalOpen(false)}
        title={markdownDocData.title}
        content={markdownDocData.content}
        lang={lang}
      />

      {/* ══ TELEGRAM 12.x STORIES VIEWER MODAL ══ */}
      <StoryViewerModal
        isOpen={storyViewerOpen}
        onClose={() => setStoryViewerOpen(false)}
        stories={storiesList}
        initialIndex={storyViewerIndex}
        onAddStory={(newStory) => {
          setStoriesList((prev) => [newStory, ...prev]);
          showToast(lang === 'ar' ? '🎉 تم نشر قصتك بنجاح!' : '🎉 Story posted successfully!');
        }}
      />
      {/* ══ TELEGRAM IN-APP HEADS-UP NOTIFICATION BANNER ══ */}
      <TelegramNotificationBanner
        notification={inAppNotif}
        onOpenChat={(cid) => {
          selectChat(cid);
          setInAppNotif(null);
        }}
        onDismiss={() => setInAppNotif(null)}
        lang={lang}
      />

      {/* ══ OFFICIAL TELEGRAM LINK & JOIN CHAT MODAL ══ */}
      <TelegramLinkModal
        isOpen={Boolean(telegramLinkModalUrl)}
        url={telegramLinkModalUrl}
        onClose={() => setTelegramLinkModalUrl(null)}
        onJoinSuccess={(newChat) => {
          setChats((prev) => {
            const exists = prev.some((c) => String(c.id) === String(newChat.id));
            if (exists) {
              return prev.map((c) => (String(c.id) === String(newChat.id) ? { ...c, ...newChat } : c));
            }
            return [newChat, ...prev];
          });
          selectChat(newChat.id);
          showToast(
            lang === 'ar'
              ? `🎉 تم الانضمام إلى ${newChat.title || 'المجموعة'} بنجاح!`
              : `🎉 Joined ${newChat.title || 'group'} successfully!`
          );
        }}
        lang={lang}
      />
      {/* ══ TELEGRAM DIRECT APK & APP INSTALLER MODAL ══ */}
      <TelegramApkInstallModal
        isOpen={apkInstallModalOpen}
        onClose={() => setApkInstallModalOpen(false)}
      />

      {/* ══ MTPROTO 2.0 DATA CENTERS & PTS SYNC MODAL ══ */}
      <MTProtoSyncModal
        isOpen={mtprotoSyncModalOpen}
        onClose={() => setMtprotoSyncModalOpen(false)}
      />

      {/* ══ SCHEDULED CLOUD ARCHIVING MODAL ══ */}
      <ArchiveSyncModal
        isOpen={archiveSyncModalOpen}
        onClose={() => setArchiveSyncModalOpen(false)}
        archivedCount={chats.filter((c) => (c as any).is_archived).length}
        onTriggerArchiveNow={() => {
          showToast(lang === 'ar' ? '🚀 بدأت عملية الأرشفة السحابية التلقائية...' : 'Cloud archiving process started...');
        }}
      />

      {/* ══ ACTIVE SESSIONS & DEVICES MODAL ══ */}
      <ActiveSessionsModal
        isOpen={activeSessionsModalOpen}
        onClose={() => setActiveSessionsModalOpen(false)}
        onTerminateCurrentSession={() => {
          handleLogout();
        }}
      />

      {/* ══ QUICK ACADEMIC FORMATTER & SERVICES MODAL ══ */}
      <AcademicModal
        isOpen={academicModalOpen}
        onClose={() => setAcademicModalOpen(false)}
      />

      {/* ══ CHANNEL & LINK FINDER MODAL ══ */}
      <LinkFinderModal
        isOpen={linkFinderModalOpen}
        onClose={() => setLinkFinderModalOpen(false)}
      />

      {/* ══ CHAT THEME & WALLPAPER MODAL ══ */}
      <ChatThemeModal
        isOpen={chatThemeModalOpen}
        onClose={() => setChatThemeModalOpen(false)}
        chatTitle={currentChat ? getChatDisplayName(currentChat, lang) : undefined}
        currentWallpaper={chatWallpaper}
        onSelectWallpaper={(url) => {
          setChatWallpaper(url);
          showToast(lang === 'ar' ? '✨ تم تطبيق خلفية وثيم الدردشة بنجاح' : 'Chat theme & wallpaper applied');
        }}
      />

      {/* ══ FULL CLOUD BACKUP & SYNC MODAL ══ */}
      <SyncBackupModal
        isOpen={syncBackupModalOpen}
        onClose={() => setSyncBackupModalOpen(false)}
      />

      {/* ══ NATIVE PWA INSTALL NOTIFICATION BANNER (ONLY IN BROWSER/URL, HIDDEN IN STANDALONE/INSTALLED APP) ══ */}
      <PwaInstallBanner />
    

      {/* ── MERGED ADVANCED MODALS ── */}
      <TelegramStarsModal
        isOpen={starsModalOpen}
        onClose={() => setStarsModalOpen(false)}
        userStars={150}
        onPurchaseStars={(amount) => {
          showToast(`تم شحن ${amount} نجمة بنجاح! ⭐`);
          setStarsModalOpen(false);
        }}
      />

      <SavedMessagesModal
        isOpen={savedMessagesModalOpen}
        onClose={() => setSavedMessagesModalOpen(false)}
        onOpenChat={(chatId) => {
          setCurrentChatId(chatId);
          setSavedMessagesModalOpen(false);
        }}
      />

      <TelegramBusinessModal
        isOpen={businessModalOpen}
        onClose={() => setBusinessModalOpen(false)}
      />

      <InstallAppModal
        isOpen={installModalOpen}
        onClose={() => setInstallModalOpen(false)}
      />

      {viewOnceMedia && viewOnceMedia.isOpen && (
        <ViewOnceMediaModal
          isOpen={viewOnceMedia.isOpen}
          onClose={() => setViewOnceMedia(null)}
          mediaUrl={viewOnceMedia.url}
          mediaType={viewOnceMedia.type || 'photo'}
          senderName={viewOnceMedia.senderName}
          ttl={viewOnceMedia.ttl}
        />
      )}

</div>
  );
}
