export type ChatType = 'direct' | 'group' | 'channel' | 'bot' | 'saved';

export interface User {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  avatarColor?: string;
  phone?: string;
  bio?: string;
  status: 'online' | 'offline' | 'last seen recently' | 'last seen 5m ago' | 'bot';
  isVerified?: boolean;
  isPremium?: boolean;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  voters: string[]; // user IDs
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  isAnonymous: boolean;
  allowsMultipleAnswers: boolean;
  isQuiz?: boolean;
  correctOptionId?: string;
  explanation?: string;
  totalVotes: number;
}

export interface MediaAttachment {
  type: 'photo' | 'video' | 'voice' | 'audio' | 'document' | 'sticker';
  url: string;
  fileName?: string;
  fileSize?: string;
  duration?: number; // for audio/voice in seconds
  waveform?: number[]; // for voice notes
  thumbnail?: string;
  width?: number;
  height?: number;
}

export interface Reaction {
  emoji: string;
  count: number;
  users: string[]; // user IDs who reacted
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: string; // ISO or formatted
  isOutgoing: boolean;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  replyTo?: {
    id: string;
    senderName: string;
    text: string;
  };
  forwardFrom?: {
    name: string;
    isChannel?: boolean;
  };
  attachments?: MediaAttachment[];
  poll?: Poll;
  reactions?: Reaction[];
  isPinned?: boolean;
  isEdited?: boolean;
  views?: number;
  commentsCount?: number;
  inlineButtons?: {
    text: string;
    callbackData?: string;
    url?: string;
  }[][];
}

export interface Chat {
  id: string;
  type: ChatType;
  title: string;
  username?: string;
  avatar?: string;
  avatarColor?: string;
  about?: string;
  membersCount?: number;
  isVerified?: boolean;
  isMuted?: boolean;
  isPinned?: boolean;
  unreadCount?: number;
  draft?: string;
  lastMessage?: Message;
  members?: User[];
  isOnline?: boolean;
  customFolderIds?: string[];
  typing?: string; // name of typing user or null
  last_system_activity?: number;
  has_system_activity?: boolean;
  lastSystemActivity?: number;
  hasRecentSystemActivity?: boolean;
}

export interface ChatFolder {
  id: string;
  name: string;
  icon: string;
  filterType: 'all' | 'personal' | 'groups' | 'channels' | 'bots' | 'unread' | 'custom';
}

export type ThemeMode = 'dark' | 'telegram' | 'midnight' | 'emerald' | 'sunset' | 'light';

export interface AppSettings {
  theme: ThemeMode;
  fontSize: number;
  bubbleRadius: number;
  soundEffects: boolean;
  animations: boolean;
  sendOnEnter: boolean;
  wallpaper: string;
  activeLanguage: string;
}

export interface StoryItem {
  id: string;
  mediaUrl: string;
  mediaType: 'photo' | 'video';
  timestamp: string;
  caption?: string;
  viewsCount?: number;
  reactionsCount?: number;
}

export interface UserStory {
  id: string;
  user: User;
  isViewed: boolean;
  isMyStory?: boolean;
  stories: StoryItem[];
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  username?: string;
  avatar?: string;
  avatarColor?: string;
  status: 'online' | 'offline' | 'last seen recently';
}

export interface CallHistoryItem {
  id: string;
  user: User;
  type: 'audio' | 'video';
  direction: 'incoming' | 'outgoing' | 'missed';
  timestamp: string;
  duration?: string;
}

export interface CallSession {
  id: string;
  chatId: string;
  user: User;
  type: 'audio' | 'video';
  status: 'calling' | 'connected' | 'ended';
  startedAt?: number;
  duration: number;
  isMuted: boolean;
  isVideoOn: boolean;
  isSpeaker: boolean;
  emojiKey: string[]; // 4 emoji E2E encryption key
}

