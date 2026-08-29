/**
 * StoriesController.ts - org.telegram.messenger.StoriesController
 * Direct TypeScript translation of DrKLO/Telegram Android architecture
 */

import { Story } from '../../types';
import { NotificationCenter } from '../NotificationCenter';
import { ConnectionsManager } from '../ConnectionsManager';

export class StoriesController {
  private static instances = new Map<number, StoriesController>();
  private currentAccount: number;
  public storiesEnabled: boolean = true;
  public storyQualityFull: boolean = true;
  private storiesByPeer = new Map<string, Story[]>();

  public static getInstance(account: number = 0): StoriesController {
    if (!StoriesController.instances.has(account)) {
      StoriesController.instances.set(account, new StoriesController(account));
    }
    return StoriesController.instances.get(account)!;
  }

  private constructor(account: number) {
    this.currentAccount = account;
  }

  public loadAllStories(force: boolean = false): void {
    if (!this.storiesEnabled) return;
    NotificationCenter.getInstance(this.currentAccount).postNotificationName(
      NotificationCenter.storiesUpdated
    );
  }

  public getStoriesForPeer(peerId: string): Story[] {
    return this.storiesByPeer.get(peerId) || [];
  }

  public setStoriesForPeer(peerId: string, stories: Story[]): void {
    this.storiesByPeer.set(peerId, stories);
    NotificationCenter.getInstance(this.currentAccount).postNotificationName(
      NotificationCenter.storiesUpdated
    );
  }
}

export const storiesController = StoriesController.getInstance();
