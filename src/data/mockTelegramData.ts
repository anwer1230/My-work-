import { Chat, Folder, Message, TelegramApiConfig, User, UserAccount } from '../types';

export const CURRENT_USER: User = {
  id: '',
  name: '',
  username: '',
  phone: '',
  avatar: '',
  isOnline: false,
  bio: '',
  isVerified: false,
  isPremium: false,
};

export const DEFAULT_TELEGRAM_API_CONFIG: TelegramApiConfig = {
  apiId: '22043994',
  apiHash: '56f64582b363d367280db96586b97801',
  dcId: 4,
  dcIp: '149.154.167.91',
  port: 443,
  connectionStatus: 'connected',
  sessionString: '',
  mtprotoVersion: 'MTProto 2.0 (Layer 184 - Android)',
  pingMs: 24,
};

export const DEFAULT_FOLDERS: Folder[] = [
  { id: 'all', name: 'All Chats', nameAr: 'كل المحادثات', icon: 'Folder' },
  { id: 'personal', name: 'Personal', nameAr: 'شخصي', icon: 'User', chatTypes: ['private', 'saved'] },
  { id: 'channels', name: 'Channels', nameAr: 'قنوات', icon: 'Megaphone', chatTypes: ['channel'] },
  { id: 'groups', name: 'Groups', nameAr: 'مجموعات', icon: 'Users', chatTypes: ['group'] },
];

export const INITIAL_CHATS: Chat[] = [];

export const INITIAL_MESSAGES: Record<string, Message[]> = {};

export const TELEGRAM_STICKERS = [
  { id: 'st_duck_1', name: 'Duck Thumbs Up', emoji: '👍', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f44d/512.webp' },
  { id: 'st_duck_2', name: 'Party Popper', emoji: '🎉', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f389/512.webp' },
  { id: 'st_cat_1', name: 'Cool Face', emoji: '😎', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f60e/512.webp' },
  { id: 'st_cat_2', name: 'Red Heart', emoji: '❤️', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/2764_fe0f/512.webp' },
];

export const POPULAR_REACTIONS = ['👍', '❤️', '🔥', '🎉', '👏', '😍', '🤔', '⚡', '💯', '🚀'];

export const DEFAULT_ACCOUNTS: UserAccount[] = [];

