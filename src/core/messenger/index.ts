/**
 * index.ts - org.telegram.messenger core exports
 * Direct TypeScript translation of DrKLO/Telegram Android architecture
 */

export * from './AccountInstance';
export * from './UserConfig';
export * from './AuthTokensHelper';
export * from './LoginController';
export * from './ContactsController';
export * from './SendMessagesHelper';
export * from './SecretChatHelper';
export * from './FileLoader';
export * from './DialogsController';
export * from './TwoStepVerificationController';
export * from './PrivacySettingsController';
export * from './SRPHelper';
export * from './MediaDataController';
export * from './MediaController';
export * from './StoriesController';
export * from './TopicsController';
export * from './DownloadController';

// Re-export core modules corresponding to org.telegram.messenger.*
export { notificationsController, NotificationsController } from '../NotificationsController';
export { messagesController, MessagesController } from '../MessagesController';
export { notificationCenter, NotificationCenter } from '../NotificationCenter';
export { messagesStorage, MessagesStorage } from '../MessagesStorage';
export { MessageObject, type MessageEntity } from '../MessageObject';
export { OpenTelegramLink } from '../OpenTelegramLink';
export { AndroidUtilities } from '../AndroidUtilities';
export { themeController, ThemeController } from '../ThemeController';
export { TLRPC } from '../TLRPC';
export { connectionsManager, ConnectionsManager } from '../ConnectionsManager';
