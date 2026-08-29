export type ChatType = 'private' | 'group' | 'channel' | 'bot' | 'saved';

export interface User {
  id: string;
  name: string;
  username?: string;
  phone?: string;
  avatar: string;
  isOnline: boolean;
  lastSeen?: string;
  bio?: string;
  isVerified?: boolean;
  isBot?: boolean;
  isPremium?: boolean;
  premiumBadges?: string[];
  sessionString?: string;
}

export interface ProfileUserInfo {
  id: string;
  name: string;
  username?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  isVerified?: boolean;
  isBot?: boolean;
  isOnline?: boolean;
  lastSeen?: string;
  isPremium?: boolean;
  sourceChatId?: string;
  sourceChatTitle?: string;
}

export interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption?: string;
  timestamp: string;
  expiresAt: number;
  viewsCount: number;
  isViewed: boolean;
  isMyStory?: boolean;
}

export interface Reaction {
  emoji: string;
  count: number;
  users: string[]; // user IDs who reacted
  isLottie?: boolean;
}

export interface ReplyInfo {
  messageId: string;
  senderName: string;
  textSnippet: string;
  mediaType?: 'photo' | 'audio' | 'document' | 'video';
}

export interface ForwardInfo {
  fromChatName: string;
  fromChatId?: string;
  originalDate?: string;
}

export interface MessageMedia {
  type: 'photo' | 'video' | 'audio' | 'voice' | 'document' | 'sticker' | 'poll' | 'video_note';
  url?: string;
  fileName?: string;
  fileSize?: string;
  duration?: number; // for audio/voice in seconds
  waveform?: number[]; // waveform amplitudes (0..100)
  aspectRatio?: number;
  isLottie?: boolean;
  lottieData?: any;
  stickerId?: string;
  packName?: string;
  pollData?: {
    question: string;
    options: { id: string; text: string; votes: number; voters: string[] }[];
    totalVotes: number;
    isClosed?: boolean;
    isMultipleAnswers?: boolean;
  };
}

export interface LinkPreviewData {
  url: string;
  displayUrl: string;
  siteName?: string;
  title: string;
  description?: string;
  image?: string;
  type?: 'telegram_channel' | 'telegram_message' | 'telegram_invite' | 'article' | 'video' | 'website';
  channelUsername?: string;
  memberCount?: number;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  senderUsername?: string;
  senderRole?: 'owner' | 'admin' | 'member' | 'restricted' | 'banned';
  senderRank?: string;
  text: string;
  timestamp: string; // e.g. "10:42 AM"
  date: string; // e.g. "2026-08-19"
  isOutgoing: boolean;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'error';
  media?: MessageMedia;
  replyTo?: ReplyInfo;
  forwardedFrom?: ForwardInfo;
  reactions?: Reaction[];
  isPinned?: boolean;
  isEdited?: boolean;
  views?: number;
  linkPreview?: LinkPreviewData;
  isSecret?: boolean;
  ttlSeconds?: number;
  expiresAt?: number;
  rawDate?: number;
  epoch?: number;
}

export interface Chat {
  id: string;
  type: ChatType;
  title: string;
  username?: string;
  avatar: string;
  isVerified?: boolean;
  isMuted?: boolean;
  isPinned?: boolean;
  pinnedIndex?: number;
  isArchived?: boolean;
  adminOnly?: boolean;
  unreadCount: number;
  isMember?: boolean;
  pinnedMessageId?: string;
  lastMessage?: {
    id: string;
    senderName?: string;
    text: string;
    timestamp: string;
    isOutgoing: boolean;
    status?: 'sending' | 'sent' | 'delivered' | 'read';
    mediaType?: string;
  };
  memberCount?: number;
  onlineCount?: number;
  description?: string;
  inviteLink?: string;
  folderIds?: string[];
  customWallpaper?: string;
  draft?: string;
  draftTimestamp?: string;
  isRestricted?: boolean;
  restrictionReason?: string;
  requiresCaptcha?: boolean;
  captchaQuestion?: string;
  captchaAnswer?: string;
  captchaOptions?: string[];
  isCaptchaSolved?: boolean;
  isReadOnly?: boolean;
  slowModeSeconds?: number;
  // Secret Chat Specifics
  isSecret?: boolean;
  ttlSeconds?: number;
  secretFingerprint?: string;
}

export interface Folder {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  chatTypes?: ChatType[];
  includedChatIds?: string[];
  unreadCount?: number;
}

export interface TelegramApiConfig {
  apiId: string;
  apiHash: string;
  dcId: number;
  dcIp: string;
  port: number;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  sessionString: string;
  mtprotoVersion: string;
  pingMs: number;
}

export type SettingsSubPage =
  | 'main'
  | 'account'
  | 'plus_settings'
  | 'theme_coloring'
  | 'chat_settings'
  | 'privacy_security'
  | 'privacy_control'
  | 'two_step_verification'
  | 'passcode_lock'
  | 'auto_delete'
  | 'sessions'
  | 'blocked_users'
  | 'notifications_sounds'
  | 'data_storage'
  | 'folders'
  | 'devices'
  | 'power_saving'
  | 'language'
  | 'themes_browser'
  | 'faq'
  | 'features'
  | 'apk_installer'
  | 'support_group'
  | 'stories'
  | 'premium';

export interface AppSettings {
  theme: 'dark' | 'light' | 'night' | 'day';
  accentColor: string;
  fontSize: number; // 12 .. 30
  language: 'ar' | 'en';
  sendByEnter: boolean;
  soundEffects: boolean;
  autoDownloadMedia: boolean;
  chatWallpaper: string;
  bubbleCornerRadius?: number;
  chatListViewMode?: 'two_lines' | 'three_lines';
  appIcon?: string;
  autoNightMode?: boolean;
  inAppBrowser?: boolean;
  powerSavingThreshold?: number;
  enableAnimations?: boolean;
  swipeAction?: string;
  showTranslateButton?: boolean;
  inAppSounds?: boolean;
  inAppVibrate?: boolean;
  inAppPreview?: boolean;
  inChatSounds?: boolean;
  inAppPop?: boolean;
  autoDownloadMobile?: boolean;
  autoDownloadWifi?: boolean;
  autoDownloadRoaming?: boolean;
  streamingEnabled?: boolean;
  callDataSaving?: string;
  plusThemeEnabled?: boolean;
  useSQLiteMMAP?: boolean;
  biometricLock?: boolean;
}

export interface ActiveCall {
  chatId: string;
  chatTitle: string;
  chatAvatar: string;
  isVideo: boolean;
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing?: boolean;
  isNoiseSuppressed?: boolean;
  duration: number;
  status: 'calling' | 'connected' | 'ended';
  encryptionEmojis: [string, string, string, string];
  audioLevel?: number;
}

export interface ToastItem {
  id: string;
  text: string;
  icon?: string;
}

export interface ChatContextMenu {
  chatId: string;
  x: number;
  y: number;
}

export interface MessageContextMenu {
  message: Message;
  x: number;
  y: number;
}

export type NotificationCategory =
  | 'message'
  | 'channel_post'
  | 'mention'
  | 'reply'
  | 'call'
  | 'system_security'
  | 'reaction'
  | 'pinned'
  | 'keyword_alert';

export interface InAppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  avatar?: string;
  chatId?: string;
  chatTitle?: string;
  chatUsername?: string;
  messageId?: string;
  senderId?: string;
  senderName?: string;
  senderUsername?: string;
  timestamp: string;
  isSilent?: boolean;
  isPinned?: boolean;
  replyAction?: boolean;
  keyword?: string;
  messageText?: string;
}

export interface UserAccount {
  id: string;
  user: User;
  settings: AppSettings;
  chats: Chat[];
  messages: Record<string, Message[]>;
  unreadCount?: number;
  isActive?: boolean;
  sessionString?: string;
}

export interface CapturedLink {
  id: string;
  url: string;
  sourceChatId?: string;
  source_chat_id?: string;
  sourceChatTitle?: string;
  source_chat?: string;
  source_link?: string;
  sourceSenderName?: string;
  sender?: string;
  detectedAt?: string;
  detected_at?: string;
  type?: 'telegram_channel' | 'telegram_group' | 'telegram_invite' | 'external';
  extractedTitle?: string;
  chat_title?: string;
  memberCount?: number;
  joined: boolean;
  joinedAt?: string;
  autoJoined?: boolean;
  status: 'valid' | 'invalid' | 'joined' | 'already' | 'pending' | 'failed' | 'joining' | 'already_member' | 'expired';
  status_text?: string;
  join_status?: string;
  username?: string;
  creation_date?: string;
  country?: string;
}

// 1. Sender & Scheduler Types
export type ProtectionMode = 'salam' | 'skip' | 'smart_clean' | 'permanent_clean' | 'disabled';

export interface SenderBatch {
  id: string;
  text: string;
  images: string[];
  targetChats: { id: string; title: string; type: ChatType; status: 'sent' | 'failed' | 'skipped' | 'protected'; messageId?: string; error?: string }[];
  protectionMode: ProtectionMode;
  isScheduled: boolean;
  intervalMinutes?: number;
  durationHours?: number;
  createdAt: string;
  sentAt: string;
  totalSuccess: number;
  totalFailed: number;
  status: 'completed' | 'running' | 'paused' | 'stopped';
}

// 2. Monitor Types
export interface MonitorConfig {
  isEnabled: boolean;
  keywords: string[];
  sendAlertsToSavedMessages: boolean;
  browserPushAlerts: boolean;
  intervalMinutes?: number;
  durationHours?: number;
  startedAt?: string;
}

export interface MonitorAlert {
  id: string;
  keyword: string;
  sourceChatId: string;
  sourceChatTitle: string;
  senderName: string;
  messageText: string;
  timestamp: string;
}

// 3. My Messages (Batch Log)
export interface MyMessagesBatch {
  id: string;
  text: string;
  hasImages: boolean;
  imagesCount: number;
  groupsCount: number;
  targets: { chatId: string; chatTitle: string; messageId: string }[];
  date: string;
  timestamp: string;
}

// 4. Auto Joiner Advanced
export interface AutoJoinerTask {
  id: string;
  url: string;
  type: 'public' | 'private' | 'username';
  extractedFromText?: string;
  status: 'pending' | 'joining' | 'joined' | 'already_member' | 'invalid' | 'banned' | 'rate_limited';
  errorReason?: string;
  processedAt?: string;
}

// 5. Auto Responder
export interface AutoReplyRule {
  id: string;
  keyword: string;
  replyText: string;
  matchType: 'exact' | 'contains' | 'regex';
  scope: 'all' | 'private' | 'groups';
  isEnabled: boolean;
  timesTriggered: number;
  lastTriggeredAt?: string;
}

// 6. Smart AI Learn (Groq LLM)
export interface SmartAiService {
  id: string;
  name: string;
  description: string;
  keywords: string[];
}

export interface SmartAiPattern {
  id: string;
  triggerContext: string;
  recommendedReply: string;
  learnedDate: string;
  isAccepted: boolean;
}

// 7. Live Link Discover & Instant Auto-Join
export interface LiveDiscoveredLink {
  id: string;
  url: string;
  sourceChatTitle: string;
  sourceChatId: string;
  senderName: string;
  timestamp: string;
  status: 'pending' | 'joining' | 'joined' | 'failed' | 'already_member' | 'expired';
  failReason?: string;
  autoJoined: boolean;
}

// 8. Protocol Buffers & Diagnostics Types
export { GoogleProtobuf } from './core/ProtobufCodec';

