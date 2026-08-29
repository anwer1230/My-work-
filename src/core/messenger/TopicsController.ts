/**
 * TopicsController.ts - org.telegram.messenger.TopicsController
 * Direct TypeScript translation of DrKLO/Telegram Android architecture
 */

import { NotificationCenter } from '../NotificationCenter';
import { ConnectionsManager } from '../ConnectionsManager';

export interface ForumTopic {
  id: number;
  title: string;
  iconColor: number;
  iconEmojiId?: string;
  topMessageId: number;
  unreadCount: number;
  closed?: boolean;
  pinned?: boolean;
}

export class TopicsController {
  private static instances = new Map<number, TopicsController>();
  private currentAccount: number;
  private topicsByChat = new Map<string, ForumTopic[]>();

  public static getInstance(account: number = 0): TopicsController {
    if (!TopicsController.instances.has(account)) {
      TopicsController.instances.set(account, new TopicsController(account));
    }
    return TopicsController.instances.get(account)!;
  }

  private constructor(account: number) {
    this.currentAccount = account;
  }

  public loadTopics(chatId: string, force: boolean = false): void {
    NotificationCenter.getInstance(this.currentAccount).postNotificationName(
      NotificationCenter.topicsDidLoaded,
      chatId
    );
  }

  public getTopics(chatId: string): ForumTopic[] {
    return this.topicsByChat.get(chatId) || [];
  }

  public setTopics(chatId: string, topics: ForumTopic[]): void {
    this.topicsByChat.set(chatId, topics);
    NotificationCenter.getInstance(this.currentAccount).postNotificationName(
      NotificationCenter.topicsDidLoaded,
      chatId
    );
  }
}

export const topicsController = TopicsController.getInstance();
