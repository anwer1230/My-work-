// ==========================================
// TELEGRAM CORE TYPES
// ==========================================

export type ChatType = 'direct' | 'group' | 'supergroup' | 'channel' | 'bot' | 'saved' | 'secret' | 'private';

export interface ReactionItem {
  emoji: string;
  count: number;
  users?: string[];
  mine?: boolean;
}

export interface InlineKeyboardButton {
  text: string;
  url?: string;
  callback_data?: string;
}

export interface MessageContent {
  type: 'text' | 'photo' | 'video' | 'audio' | 'voice' | 'document' | 'sticker' | 'location' | 'contact' | 'poll' | 'video_note';
  text?: string;
  caption?: string;
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  duration?: number;
  width?: number;
  height?: number;
  mimeType?: string;
  waveform?: number[];
  pollQuestion?: string;
  pollOptions?: { text: string; votes: number }[];
  poll?: any;
}

export interface Message {
  id: string | number;
  chat_id: string | number;
  sender_id: string | number;
  sender_name?: string;
  sender_avatar?: string;
  is_outgoing?: boolean;
  is_pinned?: boolean;
  is_edited?: boolean;
  edit_date?: number;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed' | 'queued' | 'pending';
  read_at?: number | string | null;
  date: string | number;
  content?: MessageContent;
  text?: string;
  from_me?: boolean;
  out?: boolean;
  reactions?: ReactionItem[];
  reply_to_msg_id?: string | number;
  reply_to?: {
    id: string | number;
    sender_name?: string;
    text?: string;
  };
  reply_markup?: InlineKeyboardButton[][] | { rows?: InlineKeyboardButton[][] } | any;
  ttl?: number;
  views?: number;
  forwards?: number;
  effect?: string;
  is_silent?: boolean;
  forward_from?: string;
}

export interface Chat {
  id: string | number;
  type: ChatType;
  title: string;
  name?: string;
  avatar?: string;
  photo?: string;
  unread_count?: number;
  last_message?: Message | null;
  lastMsg?: string;
  lastMsgDate?: number;
  is_pinned?: boolean;
  is_muted?: boolean;
  is_archived?: boolean;
  folder_id?: string;
  folder_ids?: string[];
  is_online?: boolean;
  is_verified?: boolean;
  is_scam?: boolean;
  members_count?: number;
  custom_theme?: string;
  bio?: string;
  phone?: string;
  username?: string;
  status?: string;
  about?: string;
  typing_user?: string;
}

export interface ChatFolder {
  id: string;
  title: string;
  icon?: string;
  chat_ids: Array<string | number>;
  color?: string;
  filter_types?: string[];
}

export interface UserProfile {
  id: string | number;
  uid?: string | number;
  first_name?: string;
  last_name?: string;
  name?: string;
  phone?: string;
  username?: string;
  bio?: string;
  photo?: string | null;
  is_premium?: boolean;
  two_factor_enabled?: boolean;
  has_2fa?: boolean;
  hint_2fa?: string;
  recovery_email?: string;
  sessions?: ActiveSession[];
  language?: string;
  theme?: string;
  is_online?: boolean;
}

export interface ActiveSession {
  id: string;
  device_name: string;
  ip: string;
  location: string;
  last_active: string;
  is_current: boolean;
  app_version: string;
  platform?: 'mobile' | 'desktop' | 'web';
}

export interface ChatMember {
  id?: string | number;
  user_id: string | number;
  name: string;
  username?: string;
  role: 'creator' | 'admin' | 'member' | 'owner' | 'administrator';
  custom_title?: string;
  joined_date: string;
  avatar?: string;
  is_bot?: boolean;
}

export interface TelegramStory {
  id: string;
  user_id: string | number;
  user_name: string;
  user_avatar: string;
  media_url: string;
  caption?: string;
  created_at?: string;
  date?: string;
  expires_at?: string;
  views_count: number;
  reactions_count?: number;
  is_viewed?: boolean;
  media_type?: 'photo' | 'video';
}

export interface SystemUpdateStatus {
  available?: boolean;
  has_update?: boolean;
  version?: string;
  current?: string;
  latest?: string;
  changelog?: string[];
  mandatory?: boolean;
  message?: string;
}

// ==========================================
// AUTOMATION & TOOLS ENGINE TYPES (ENJAZ PRO)
// ==========================================

export type SanitizeMode = 'salam' | 'skip' | 'smart' | 'always' | 'off';
export type SendType = 'manual' | 'scheduled';

export interface WelcomeMessageSettings {
  enabled: boolean;
  message: string;
  trigger_on_open_chat: boolean;
  trigger_on_first_message: boolean;
  trigger_on_any_message: boolean;
  cooldown_hours: number;
  simulate_typing: boolean;
  delay_seconds: number;
}

export interface WelcomedUserRecord {
  id: string;
  user_id: string;
  user_name?: string;
  phone?: string;
  trigger_type: 'open_chat' | 'incoming_message';
  timestamp: string;
  message_sent: string;
  status: 'sent' | 'failed';
}

export interface TelegramSettings {
  message: string;
  groups: string[];
  watch_words: string[];
  interval_seconds: number;
  send_type: SendType;
  schedule_duration_hours: number;
  sanitize_mode: SanitizeMode;
  smart_required_messages: number;
  last_scheduled_send?: number;
  auto_reply_enabled?: boolean;
  auto_replies?: AutoReplyRule[];
  learning_active_private?: boolean;
  learning_active_group?: boolean;
  rotating_messages?: string[];
  rotating_groups?: string[];
  rotating_interval?: number;
  welcome_message?: WelcomeMessageSettings;
}

export type WhatsAppSettings = TelegramSettings;

export interface BatchEntry {
  group: string;
  msg_id: string;
  phone?: string;
  status?: string;
}

export interface SentBatch {
  id: string;
  text: string;
  has_media: boolean;
  sent_at: string;
  edited_at?: string;
  sent_count: number;
  group_count: number;
  entries: BatchEntry[];
  groups?: Array<{ title: string; username: string }>;
}

export interface AutoReplyRule {
  keyword: string;
  reply: string;
  scope: 'all' | 'private' | 'groups';
  match: 'contains' | 'exact' | 'regex';
  used_count?: number;
  last_used?: string;
}

export interface SavedLink {
  id: string;
  url: string;
  title: string;
  category: string;
  date_saved: string;
  source: string;
  notes?: string;
}

export interface AutoJoinItem {
  idx: number;
  total: number;
  url: string;
  status: 'processing' | 'success' | 'failed' | 'already';
  reason: string;
}

export interface AutoJoinProgressEvent {
  idx: number;
  total: number;
  url: string;
  status: 'processing' | 'success' | 'failed' | 'already';
  reason: string;
  counts: {
    success: number;
    fail: number;
    already: number;
    done: number;
    total: number;
  };
}

export interface LearningService {
  description: string;
  keywords: string[];
  price_range?: string;
  time_range?: string;
}

export interface UnknownRequest {
  text: string;
  sender: string;
  sender_id: string;
  time: string;
  chat_id: string;
}

export interface StatsResult {
  count: number;
  sum: number;
  mean: number;
  median: number;
  mode: number;
  std: number;
  variance: number;
  min: number;
  max: number;
  range: number;
  q1: number;
  q3: number;
  iqr: number;
  skewness: number;
  kurtosis: number;
}

export interface ActivityLog {
  id: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

export interface AcademicAnalysisResult {
  stats: Record<string, any>;
  histogram_bars?: Array<{ label: string; value: number; height: number }>;
  summary: string;
}

export interface LogUpdate {
  message: string;
  timestamp?: string;
  type?: 'info' | 'success' | 'error' | 'warning';
}

export interface AccountProxyConfig {
  enabled: boolean;
  type: 'socks5' | 'http' | 'https';
  host: string;
  port: number;
  username?: string;
  password?: string;
}

export interface TelegramAccount {
  id: string;
  phone: string;
  session_name: string;
  session_string?: string;
  api_id?: number;
  api_hash?: string;
  username?: string;
  first_name?: string;
  status: 'connected' | 'disconnected' | 'connecting' | '2fa_needed' | 'flood_wait' | 'error';
  flood_wait_seconds?: number;
  has_2fa: boolean;
  proxy?: AccountProxyConfig;
  is_active: boolean;
  created_at: string;
  last_sync: string;
  stats: {
    sent: number;
    errors: number;
    received: number;
  };
}

export interface MultiAccountBroadcastResult {
  account_id: string;
  phone: string;
  session_name: string;
  status: 'success' | 'failed' | 'flood_wait';
  message: string;
  error?: string;
  wait_seconds?: number;
}

export interface ScrapedLinkTypeWrapper {
  id: string;
}

export type ScrapedLinkType = 'telegram' | 'whatsapp' | 'other';
export type LinkVerifyStatus = 'valid' | 'invalid' | 'checking' | 'unverified';

export interface ScrapedLinkItem {
  id: string;
  url: string;
  type: ScrapedLinkType;
  source_chat_id: string;
  source_title: string;
  source_type: 'group' | 'channel' | 'private' | 'unknown';
  sender_name?: string;
  timestamp: string;
  message_snippet?: string;
  status?: LinkVerifyStatus;
  notes?: string;
}

export type ScrapeTimeRange = '24_hours' | '7_days' | '10_days' | '30_days' | 'all' | 'custom';

export interface LinkScrapeProgressEvent {
  scanned_chats: number;
  total_chats: number;
  current_chat_title: string;
  found_total: number;
  found_tg: number;
  found_wa: number;
  found_other: number;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error';
  new_link?: ScrapedLinkItem;
}

export interface LiveCapturedLinkItem {
  id: string;
  url: string;
  type: 'telegram' | 'whatsapp' | 'other';
  action_taken: 'joined_telegram' | 'saved_whatsapp' | 'saved_other' | 'failed';
  source_chat_id?: string;
  source_title: string;
  sender_name: string;
  timestamp: string;
  status_text: string;
  original_message?: string;
}

export interface LiveMonitorState {
  is_active: boolean;
  total_captured: number;
  joined_telegram_count: number;
  saved_whatsapp_count: number;
  captured_links: LiveCapturedLinkItem[];
}
